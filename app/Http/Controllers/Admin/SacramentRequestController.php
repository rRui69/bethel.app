<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\AdminBaseController;
use App\Models\Clergy;
use App\Models\Notification;
use App\Models\RequestMessage;
use App\Models\RequestPayment;
use App\Models\SacramentRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class SacramentRequestController extends AdminBaseController
{
    public function page()
    {
        $adminData = $this->adminShellData();
        return view('admin.sacrament-requests', compact('adminData'));
    }

    public function stats()
    {
        return response()->json([
            'pending'         => SacramentRequest::where('status', 'pending')->count(),
            'payment_pending' => RequestPayment::where('status', 'submitted')->count(),
        ]);
    }

    // ── List with filters ──────────────────────────────────────
    public function index(Request $request)
    {
        $query = SacramentRequest::with([
            'user:id,first_name,last_name,email',
            'assignedClergy:id,title,first_name,last_name',
            'latestPayment',
        ]);

        // Filter by type name
        if ($request->filled('type')) {
            $query->where('sacrament_type', $request->type);
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $sort      = in_array($request->sort, ['created_at', 'sacrament_type', 'status', 'preferred_date'])
                        ? $request->sort : 'created_at';
        $direction = $request->direction === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $direction);

        $requests = $query->paginate($request->input('limit', 10))
            ->through(fn ($req) => [
                'id'              => $req->id,
                'requester_name'  => $req->user?->full_name ?? 'Unknown',
                'requester_email' => $req->user?->email ?? '',
                'sacrament_type'  => $req->sacrament_type,
                'preferred_date'  => $req->preferred_date?->format('M d, Y') ?? 'N/A',
                'status'          => strtolower($req->status),
                'clergy_status'   => $req->clergy_status ?? 'unassigned',
                'payment_status'  => $req->latestPayment?->status ?? $req->payment_status ?? 'unpaid',
                'assigned_clergy' => $req->assignedClergy?->full_name,
                'created_at'      => $req->created_at->format('M d, Y'),
            ]);

        return response()->json($requests);
    }

    // ── Detail ─────────────────────────────────────────────────
    public function show(SacramentRequest $sacramentRequest)
    {
        $sacramentRequest->load([
            'user:id,first_name,last_name,email,phone,city,barangay',
            'parish:id,name,city',
            'assignedClergy:id,title,first_name,last_name,parish_id',
            'latestPayment',
        ]);

        $payment = $sacramentRequest->latestPayment;

        return response()->json([
            'id'              => $sacramentRequest->id,
            'sacrament_type'  => $sacramentRequest->sacrament_type,
            'preferred_date'  => $sacramentRequest->preferred_date
                                    ? $sacramentRequest->preferred_date->format('F d, Y')
                                    : 'Not specified',
            'preferred_time'  => $sacramentRequest->preferred_time ?? '—',
            'participants'    => $sacramentRequest->participants,
            'status'          => strtolower($sacramentRequest->status),
            'admin_notes'     => $sacramentRequest->admin_notes,
            'submitted_at'    => $sacramentRequest->created_at->format('F d, Y g:i A'),
            'details'         => $sacramentRequest->details ?? [],
            'clergy_status'   => $sacramentRequest->clergy_status ?? 'unassigned',
            'payment_status'  => $payment?->status ?? $sacramentRequest->payment_status ?? 'unpaid',

            'requester' => [
                'name'     => $sacramentRequest->user?->full_name ?? 'Unknown',
                'email'    => $sacramentRequest->user?->email ?? '—',
                'phone'    => $sacramentRequest->user?->phone ?? '—',
                'city'     => $sacramentRequest->user?->city ?? '—',
                'barangay' => $sacramentRequest->user?->barangay ?? '—',
            ],

            'parish' => [
                'name' => $sacramentRequest->parish?->name ?? '—',
                'city' => $sacramentRequest->parish?->city ?? '—',
            ],

            'assigned_clergy' => $sacramentRequest->assignedClergy ? [
                'id'   => $sacramentRequest->assignedClergy->id,
                'name' => $sacramentRequest->assignedClergy->full_name,
            ] : null,

            'payment' => $payment ? [
                'id'         => $payment->id,
                'method'     => $payment->method,
                'amount'     => $payment->amount,
                'status'     => $payment->status,
                'proof_url'  => $payment->proof_path
                                    ? Storage::url($payment->proof_path)
                                    : null,
                'submitted'  => $payment->created_at->format('M d, Y g:i A'),
                'admin_notes'=> $payment->admin_notes,
            ] : null,
        ]);
    }

    // ── Update status + notes ──────────────────────────────────
    public function update(Request $request, SacramentRequest $sacramentRequest)
    {
        $validated = $request->validate([
            'status'      => 'required|in:pending,approved,rejected',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $oldStatus = $sacramentRequest->status;

        $sacramentRequest->update([
            'status'      => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? $sacramentRequest->admin_notes,
        ]);

        // Notify parishioner if status changed
        if ($oldStatus !== $validated['status']) {
            $this->notifyParishioner($sacramentRequest, $validated['status']);
        }

        return response()->json([
            'id'          => $sacramentRequest->id,
            'status'      => $sacramentRequest->status,
            'admin_notes' => $sacramentRequest->admin_notes,
        ]);
    }

    // ── Assign clergy ──────────────────────────────────────────
    public function assignClergy(Request $request, SacramentRequest $sacramentRequest)
    {
        $validated = $request->validate([
            'clergy_id' => 'required|integer|exists:clergy,id',
        ]);

        $clergy = Clergy::findOrFail($validated['clergy_id']);

        $sacramentRequest->update([
            'assigned_clergy_id' => $clergy->id,
            'clergy_status'      => 'pending',
        ]);

        // Notify the clergy member (if they have a user account)
        try {
            $clergyUser = User::where('email', $clergy->email)->first();
            if ($clergyUser) {
                Notification::insert([[
                    'user_id'         => $clergyUser->id,
                    'message'         => "You have been assigned to a {$sacramentRequest->sacrament_type} request on "
                                        . optional($sacramentRequest->preferred_date)->format('F d, Y') . '.',
                    'type'            => 'clergy_assignment',
                    'is_read'         => false,
                    'notifiable_type' => SacramentRequest::class,
                    'notifiable_id'   => $sacramentRequest->id,
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ]]);
            }
        } catch (\Throwable $e) {
            Log::warning('assignClergy: notification failed', ['error' => $e->getMessage()]);
        }

        return response()->json([
            'assigned_clergy' => [
                'id'   => $clergy->id,
                'name' => $clergy->full_name,
            ],
            'clergy_status' => 'pending',
        ]);
    }

    // ── Get available clergy list ──────────────────────────────
    public function availableClergy(SacramentRequest $sacramentRequest)
    {
        $clergy = Clergy::where('status', 'active')
            ->select('id', 'title', 'first_name', 'last_name', 'parish_id', 'specialization')
            ->with('parish:id,name')
            ->get()
            ->map(fn ($c) => [
                'id'             => $c->id,
                'name'           => $c->full_name,
                'parish'         => $c->parish?->name ?? '—',
                'specialization' => $c->specialization ?? '—',
            ]);

        return response()->json($clergy);
    }

    // ── Verify payment ─────────────────────────────────────────
    public function verifyPayment(Request $request, SacramentRequest $sacramentRequest)
    {
        $validated = $request->validate([
            'status'      => 'required|in:verified,rejected',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $payment = $sacramentRequest->latestPayment;
        if (!$payment) {
            return response()->json(['message' => 'No payment found.'], 404);
        }

        $payment->update([
            'status'      => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? null,
            'verified_at' => $validated['status'] === 'verified' ? now() : null,
            'verified_by' => $validated['status'] === 'verified' ? Auth::id() : null,
        ]);

        $sacramentRequest->update(['payment_status' => $validated['status']]);

        // Notify parishioner
        try {
            $msg = $validated['status'] === 'verified'
                ? "Your payment for the {$sacramentRequest->sacrament_type} request has been verified."
                : "Your payment for the {$sacramentRequest->sacrament_type} request was not accepted. Please re-submit.";

            Notification::insert([[
                'user_id'         => $sacramentRequest->user_id,
                'message'         => $msg,
                'type'            => 'payment_update',
                'is_read'         => false,
                'notifiable_type' => SacramentRequest::class,
                'notifiable_id'   => $sacramentRequest->id,
                'created_at'      => now(),
                'updated_at'      => now(),
            ]]);
        } catch (\Throwable $e) {
            Log::warning('verifyPayment: notification failed', ['error' => $e->getMessage()]);
        }

        return response()->json(['payment_status' => $validated['status']]);
    }

    // ── Messages: list ─────────────────────────────────────────
    public function messages(SacramentRequest $sacramentRequest)
    {
        // Mark all parishioner messages as read by admin
        $sacramentRequest->messages()
            ->where('read_by_admin', false)
            ->whereHas('sender', fn ($q) => $q->where('role', 'parishioner'))
            ->update(['read_by_admin' => true]);

        $messages = $sacramentRequest->messages()
            ->with('sender:id,first_name,last_name,role')
            ->get()
            ->map(fn ($m) => [
                'id'        => $m->id,
                'body'      => $m->body,
                'image_url' => $m->image_url,
                'sender'    => $m->sender?->full_name ?? 'Unknown',
                'role'      => $m->sender?->role ?? 'unknown',
                'sender_id' => $m->sender_id,
                'time'      => $m->created_at->format('M d, g:i A'),
            ]);

        return response()->json($messages);
    }

    // ── Messages: send ─────────────────────────────────────────
    public function sendMessage(Request $request, SacramentRequest $sacramentRequest)
    {
        $validated = $request->validate([
            'body'      => 'nullable|string|max:2000',
            'image_url' => 'nullable|url|max:1000',
        ]);

        if (empty($validated['body']) && empty($validated['image_url'])) {
            return response()->json(['message' => 'Message or image is required.'], 422);
        }

        $message = RequestMessage::create([
            'sacrament_request_id' => $sacramentRequest->id,
            'sender_id'            => Auth::id(),
            'body'                 => $validated['body'] ?? '',
            'image_url'            => $validated['image_url'] ?? null,
            'read_by_admin'        => true,
            'read_by_parishioner'  => false,
        ]);

        // Notify parishioner
        try {
            Notification::insert([[
                'user_id'         => $sacramentRequest->user_id,
                'message'         => 'Parish staff sent you a message about your '
                                     . $sacramentRequest->sacrament_type . ' request.',
                'type'            => 'message',
                'is_read'         => false,
                'notifiable_type' => SacramentRequest::class,
                'notifiable_id'   => $sacramentRequest->id,
                'created_at'      => now(),
                'updated_at'      => now(),
            ]]);
        } catch (\Throwable $e) {
            Log::warning('sendMessage: notification failed', ['error' => $e->getMessage()]);
        }

        $message->load('sender:id,first_name,last_name,role');

        return response()->json([
            'id'        => $message->id,
            'body'      => $message->body,
            'image_url' => $message->image_url,
            'sender'    => $message->sender?->full_name,
            'role'      => $message->sender?->role,
            'sender_id' => $message->sender_id,
            'time'      => $message->created_at->format('M d, g:i A'),
        ], 201);
    }

    // ── Private: notify parishioner on status change ──────────
    private function notifyParishioner(SacramentRequest $req, string $newStatus): void
    {
        try {
            $map = [
                'approved' => "Your {$req->sacrament_type} request has been approved! Parish staff will contact you shortly.",
                'rejected' => "Your {$req->sacrament_type} request was not approved. Please contact the parish for details.",
            ];
            $message = $map[$newStatus] ?? null;
            if (!$message) return;

            Notification::insert([[
                'user_id'         => $req->user_id,
                'message'         => $message,
                'type'            => 'request_update',
                'is_read'         => false,
                'notifiable_type' => SacramentRequest::class,
                'notifiable_id'   => $req->id,
                'created_at'      => now(),
                'updated_at'      => now(),
            ]]);
        } catch (\Throwable $e) {
            Log::warning('notifyParishioner failed', ['error' => $e->getMessage()]);
        }
    }
}