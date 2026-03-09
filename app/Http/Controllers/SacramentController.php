<?php

namespace App\Http\Controllers;

use App\Models\Parish;
use App\Models\SacramentType;
use App\Models\SacramentRequest;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SacramentController extends Controller
{
    // ── Public: listing page ──────────────────────────────────────
    public function listing()
    {
        $types = SacramentType::active()
            ->select('id', 'name', 'slug', 'description', 'icon', 'icon_color', 'icon_bg')
            ->get()
            ->map(fn ($t) => [
                'id'          => $t->id,
                'name'        => $t->name,
                'slug'        => $t->slug,
                'description' => $t->description,
                'icon'        => $t->icon,
                'icon_color'  => $t->icon_color,
                'icon_bg'     => $t->icon_bg,
                'href'        => "/sacraments/{$t->slug}",
            ])
            ->toArray();

        $pageData = ['sacramentTypes' => $types];

        return view('parishioner.sacraments', compact('pageData'));
    }

    // ── Public: individual form page ──────────────────────────────
    public function form(string $slug)
    {
        $type = SacramentType::where('slug', $slug)
                    ->where('is_active', true)
                    ->firstOrFail();

        $parishes = Parish::active()
            ->select('id', 'name', 'city')
            ->orderBy('name')
            ->get()
            ->map(fn ($p) => [
                'id'   => $p->id,
                'name' => $p->name,
                'city' => $p->city,
            ])
            ->toArray();

        $user    = Auth::user();
        $prefill = $user ? [
            'name'  => $user->full_name,
            'phone' => $user->phone ?? '',
            'email' => $user->email,
        ] : null;

        $pageData = [
            'sacramentType' => [
                'id'          => $type->id,
                'name'        => $type->name,
                'slug'        => $type->slug,
                'description' => $type->description,
                'icon'        => $type->icon,
                'icon_color'  => $type->icon_color,
                'icon_bg'     => $type->icon_bg,
                'form_schema' => $type->form_schema ?? ['fields' => []],
            ],
            'parishes' => $parishes,
            'prefill'  => $prefill,
            'isAuth'   => (bool) $user,
        ];

        return view('parishioner.sacrament-form', compact('pageData'));
    }

    // ── Authenticated: submit request ─────────────────────────────
    public function submit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sacrament_type_id' => 'required|integer|exists:sacrament_types,id',
            'parish_id'         => 'required|integer|exists:parishes,id',
            'preferred_date'    => 'required|date|after_or_equal:today',
            'preferred_time'    => 'required|string|max:10',
            'participants'      => 'required|integer|min:1|max:500',
            // details may contain Cloudinary URLs for file fields (uploaded client-side)
            'details'           => 'nullable|array',
            'details.*'         => 'nullable|string|max:1000',
        ]);

        $type    = SacramentType::findOrFail($validated['sacrament_type_id']);
        $details = $validated['details'] ?? [];

        // ── Save the request ──────────────────────────────────────
        $sacramentRequest = SacramentRequest::create([
            'user_id'           => Auth::id(),
            'parish_id'         => $validated['parish_id'],
            'sacrament_type_id' => $type->id,
            'sacrament_type'    => $type->name,
            'preferred_date'    => $validated['preferred_date'],
            'preferred_time'    => $validated['preferred_time'],
            'participants'      => $validated['participants'],
            'details'           => $details,
            'status'            => 'pending',
        ]);

        // ── Notify admins — non-fatal ─────────────────────────────
        // Wrapped in try/catch so a notification failure never
        // causes a 500 and prevents the user from seeing success.
        try {
            $adminIds      = User::whereIn('role', ['super_admin', 'parish_admin'])->pluck('id');
            $submitterName = Auth::user()->full_name;
            $message       = "{$submitterName} submitted a {$type->name} request.";

            $notifications = $adminIds->map(fn ($adminId) => [
                'user_id'         => $adminId,
                'message'         => $message,
                'type'            => 'sacrament_request',
                'is_read'         => false,
                'notifiable_type' => SacramentRequest::class,
                'notifiable_id'   => $sacramentRequest->id,
                'created_at'      => now(),
                'updated_at'      => now(),
            ])->toArray();

            if (!empty($notifications)) {
                Notification::insert($notifications);
            }
        } catch (\Throwable $e) {
            // Log it but don't fail the request — parishioner already submitted
            Log::warning('SacramentController@submit: notification insert failed', [
                'request_id' => $sacramentRequest->id,
                'error'      => $e->getMessage(),
            ]);
        }

        return response()->json([
            'message'    => 'Your request has been submitted successfully.',
            'request_id' => $sacramentRequest->id,
        ], 201);
    }
}