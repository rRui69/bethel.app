<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\AdminBaseController;
use App\Models\Notification;
use App\Models\SacramentRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ClergyController extends AdminBaseController
{
    // ── Blade page ─────────────────────────────────────────────────
    public function page()
    {
        // Only clergy (and super_admin for testing) may view this page
        $user = auth()->user();
        if (! in_array($user->role, ['clergymen', 'super_admin'])) {
            abort(403, 'This page is reserved for clergy members.');
        }

        $adminData = $this->adminShellData();

        return view('admin.clergy-dashboard', compact('adminData'));
    }

    // ── API: my assignments ────────────────────────────────────────
    /**
     * Returns all sacrament requests assigned to the logged-in clergy user.
     * Supports optional ?status=pending|confirmed|declined filter.
     */
    public function assignments(Request $request): JsonResponse
    {
        $user = Auth::user();

        $query = SacramentRequest::where('assigned_clergy_id', $user->id)
            ->with([
                'user:id,first_name,last_name,email,phone',
                'parish:id,name,city',
            ])
            ->orderByDesc('preferred_date');

        if ($request->filled('clergy_status') && $request->clergy_status !== 'all') {
            $query->where('clergy_status', $request->clergy_status);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $assignments = $query->get()->map(fn ($req) => [
            'id'             => $req->id,
            'sacrament_type' => $req->sacrament_type,
            'preferred_date' => $req->preferred_date?->format('F d, Y') ?? 'Not set',
            'preferred_time' => $req->preferred_time ?? '—',
            'participants'   => $req->participants,
            'status'         => strtolower($req->status),
            'clergy_status'  => $req->clergy_status ?? 'unassigned',
            'admin_notes'    => $req->admin_notes,
            'parish'         => $req->parish?->name ?? '—',
            'parish_city'    => $req->parish?->city ?? '—',
            'parishioner'    => [
                'name'  => $req->user?->full_name ?? 'Unknown',
                'email' => $req->user?->email ?? '—',
                'phone' => $req->user?->phone ?? '—',
            ],
            'submitted_at'   => $req->created_at->format('M d, Y'),
        ]);

        return response()->json($assignments);
    }

    // ── API: sacramental records (read-only) ───────────────────────
    /**
     * Returns approved/completed sacrament requests this clergy member has officiated.
     * These are read-only records for the clergy member's reference.
     */
    public function records(Request $request): JsonResponse
    {
        $user = Auth::user();

        $records = SacramentRequest::where('assigned_clergy_id', $user->id)
            ->whereIn('status', ['approved'])
            ->with([
                'user:id,first_name,last_name,email,phone,city,barangay',
                'parish:id,name,city',
                'sacramentType:id,form_schema',
                'latestPayment',
            ])
            ->orderByDesc('preferred_date')
            ->get()
            ->map(fn ($req) => [
                'id'             => $req->id,
                'sacrament_type' => $req->sacrament_type,
                'preferred_date' => $req->preferred_date?->format('F d, Y') ?? 'N/A',
                'preferred_time' => $req->preferred_time ?? '—',
                'participants'   => $req->participants,
                'status'         => $req->status,
                'clergy_status'  => $req->clergy_status,
                'payment_status' => $req->latestPayment?->status ?? $req->payment_status ?? 'unpaid',
                'admin_notes'    => $req->admin_notes,
                'details'        => $req->details ?? [],
                // The ordered field schema so the UI can display label → value
                'field_schema'   => $req->sacramentType?->form_schema['fields'] ?? [],
                'parishioner'    => [
                    'name'     => $req->user?->full_name ?? 'Unknown',
                    'email'    => $req->user?->email     ?? '—',
                    'phone'    => $req->user?->phone     ?? '—',
                    'city'     => $req->user?->city      ?? '—',
                    'barangay' => $req->user?->barangay  ?? '—',
                ],
                'parish'         => [
                    'name' => $req->parish?->name ?? '—',
                    'city' => $req->parish?->city ?? '—',
                ],
                'recorded_at'    => $req->updated_at->format('M d, Y'),
            ]);

        return response()->json($records);
    }

    // ── API: respond to assignment ─────────────────────────────────
    /**
     * Clergy confirms or declines their assignment.
     *
     * Security: strict check that `assigned_clergy_id === Auth::id()`.
     * The old email-matching hack in BookingController is eliminated here.
     */
    public function respond(Request $request, SacramentRequest $sacramentRequest): JsonResponse
    {
        $user = Auth::user();

        // Strict ownership: the logged-in user must BE the assigned clergy
        if ((int) $sacramentRequest->assigned_clergy_id !== $user->id) {
            return response()->json(['message' => 'Forbidden. You are not assigned to this request.'], 403);
        }

        // Cannot respond if request is not in a valid state
        if (! in_array($sacramentRequest->clergy_status, ['pending', 'unassigned'])) {
            return response()->json([
                'message' => "Assignment is already '{$sacramentRequest->clergy_status}'. No further response needed.",
            ], 422);
        }

        $validated = $request->validate([
            'response' => 'required|in:confirmed,declined',
        ]);

        $sacramentRequest->update(['clergy_status' => $validated['response']]);

        // Notify admins of the response
        try {
            $user->load('clergyProfile');
            $titledName = $user->titled_name;

            $adminIds = User::whereIn('role', ['super_admin', 'parish_admin'])->pluck('id');

            $msgs = $adminIds->map(fn ($id) => [
                'user_id'         => $id,
                'message'         => "{$titledName} has {$validated['response']} the assignment for a {$sacramentRequest->sacrament_type} request.",
                'type'            => 'clergy_response',
                'is_read'         => false,
                'notifiable_type' => SacramentRequest::class,
                'notifiable_id'   => $sacramentRequest->id,
                'created_at'      => now(),
                'updated_at'      => now(),
            ])->toArray();

            if (! empty($msgs)) {
                Notification::insert($msgs);
            }
        } catch (\Throwable $e) {
            Log::warning('ClergyController::respond — notification failed', ['error' => $e->getMessage()]);
        }

        return response()->json([
            'clergy_status' => $validated['response'],
            'message'       => "Assignment {$validated['response']} successfully.",
        ]);
    }

    // ── API: my profile ───────────────────────────────────────────
    /**
     * Returns the logged-in clergy member's profile + schedule.
     */
    public function myProfile(): JsonResponse
    {
        $user = Auth::user()->load(['clergyProfile.parish:id,name,city']);
        $profile = $user->clergyProfile;

        return response()->json([
            'id'             => $user->id,
            'full_name'      => $user->full_name,
            'titled_name'    => $profile
                ? "{$profile->title} {$user->first_name} {$user->last_name}"
                : $user->full_name,
            'email'          => $user->email,
            'phone'          => $user->phone,
            'title'          => $profile?->title ?? '—',
            'specialization' => $profile?->specialization ?? '—',
            'parish'         => $profile?->parish?->name ?? '—',
            'parish_city'    => $profile?->parish?->city ?? '—',
            'schedule'       => $profile?->schedule ?? [],
        ]);
    }
}