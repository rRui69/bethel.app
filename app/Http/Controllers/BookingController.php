<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\RequestMessage;
use App\Models\RequestPayment;
use App\Models\SacramentRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class BookingController extends Controller
{
    // ── Blade page ─────────────────────────────────────────────
    public function page()
    {
        return view('parishioner.my-bookings');
    }

    // ── API: list own requests ─────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = SacramentRequest::where('user_id', Auth::id())
            ->with([
                'parish:id,name,city',
                'assignedClergy:id,title,first_name,last_name',
                // FIX: Do NOT use 'latestPayment:columns' shorthand with latestOfMany()
                // The ofMany self-join needs aggregate columns the shorthand strips out → QueryException.
                'latestPayment',
            ])
            // FIX: Replace N+1 per-booking message queries with a single withCount aggregate.
            // Previously: $req->messages()->whereHas(...)->count() inside map() = N separate queries.
            // Now: one SQL COUNT subquery per row, all resolved in a single round-trip.
            ->withCount([
                'messages as unread_messages' => fn ($q) => $q
                    ->where('read_by_parishioner', false)
                    ->join('users as msg_senders', 'request_messages.sender_id', '=', 'msg_senders.id')
                    ->whereIn('msg_senders.role', ['super_admin', 'parish_admin', 'helpdesk']),
            ]);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $bookings = $query->orderByDesc('created_at')
            ->get()
            ->map(fn ($req) => [
                'id'              => $req->id,
                'sacrament_type'  => $req->sacrament_type,
                'preferred_date'  => $req->preferred_date?->format('F d, Y') ?? 'N/A',
                'preferred_time'  => $req->preferred_time ?? '—',
                'participants'    => $req->participants,
                'status'          => strtolower($req->status),
                'clergy_status'   => $req->clergy_status ?? 'unassigned',
                'payment_status'  => $req->latestPayment?->status ?? $req->payment_status ?? 'unpaid',
                'parish'          => $req->parish?->name ?? '—',
                'parish_city'     => $req->parish?->city ?? '—',
                'assigned_clergy' => $req->assignedClergy?->full_name,
                'submitted_at'    => $req->created_at->format('M d, Y'),
                'has_payment'     => $req->latestPayment !== null,
                'unread_messages' => (int) ($req->unread_messages ?? 0),
            ]);

        return response()->json($bookings);
    }

    // ── API: detail of single booking ─────────────────────────
    public function show(SacramentRequest $sacramentRequest): JsonResponse
    {
        // Only owner can view
        if ($sacramentRequest->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $sacramentRequest->load([
            'parish:id,name,city',
            'assignedClergy:id,title,first_name,last_name',
            'latestPayment',
        ]);

        $payment = $sacramentRequest->latestPayment;

        return response()->json([
            'id'             => $sacramentRequest->id,
            'sacrament_type' => $sacramentRequest->sacrament_type,
            'preferred_date' => $sacramentRequest->preferred_date?->format('F d, Y') ?? 'N/A',
            'preferred_time' => $sacramentRequest->preferred_time ?? '—',
            'participants'   => $sacramentRequest->participants,
            'status'         => strtolower($sacramentRequest->status),
            'admin_notes'    => $sacramentRequest->admin_notes,
            'clergy_status'  => $sacramentRequest->clergy_status ?? 'unassigned',
            'payment_status' => $payment?->status ?? $sacramentRequest->payment_status ?? 'unpaid',
            'parish'         => $sacramentRequest->parish?->name ?? '—',
            'parish_city'    => $sacramentRequest->parish?->city ?? '—',
            'details'        => $sacramentRequest->details ?? [],
            'submitted_at'   => $sacramentRequest->created_at->format('F d, Y g:i A'),

            'assigned_clergy' => $sacramentRequest->assignedClergy ? [
                'id'   => $sacramentRequest->assignedClergy->id,
                'name' => $sacramentRequest->assignedClergy->full_name,
            ] : null,

            'payment' => $payment ? [
                'id'         => $payment->id,
                'method'     => $payment->method,
                'amount'     => $payment->amount,
                'status'     => $payment->status,
                // proof_path may be a full Cloudinary https:// URL (production)
                // or a relative local path like "payments/file.jpg" (dev).
                'proof_url'  => $payment->proof_path
                                    ? (str_starts_with($payment->proof_path, 'http')
                                        ? $payment->proof_path
                                        : Storage::disk('public')->url($payment->proof_path))
                                    : null,
                'admin_notes'=> $payment->admin_notes,
                'submitted'  => $payment->created_at->format('M d, Y'),
            ] : null,
        ]);
    }

    // ── API: upload payment proof ──────────────────────────────
    public function submitPayment(Request $request, SacramentRequest $sacramentRequest): JsonResponse
    {
        if ($sacramentRequest->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'method' => 'required|in:gcash,bank_transfer,cash,other',
            'amount' => 'nullable|numeric|min:0|max:99999',
            'proof'  => 'required|file|mimes:jpg,jpeg,png,webp,pdf|max:5120', // 5MB
        ]);

        // Store proof
        // In production (Railway), local storage is ephemeral — files are wiped on every restart.
        // We use Cloudinary when the env is configured and the package is installed.
        // Locally (dev), falls back to local disk — no Cloudinary package needed.
        $useCloudinary = config('app.env') !== 'local'
            && env('CLOUDINARY_URL')
            && class_exists(\CloudinaryLabs\CloudinaryLaravel\CloudinaryEngine::class);

        if ($useCloudinary) {
            $uploaded = cloudinary()->upload($request->file('proof')->getRealPath(), [
                'folder'        => 'bethel_app/payments',
                'resource_type' => 'auto',
            ]);
            $path     = $uploaded->getSecurePath();
            $proofUrl = $path;
        } else {
            $path     = $request->file('proof')->store('payments', 'public');
            $proofUrl = Storage::disk('public')->url($path);
        }

        // Upsert — replace if previously rejected, create if first time
        $existing = $sacramentRequest->latestPayment;
        if ($existing && in_array($existing->status, ['rejected', 'submitted'])) {
            $existing->update([
                'method'     => $validated['method'],
                'amount'     => $validated['amount'] ?? null,
                'proof_path' => $path,
                'status'     => 'submitted',
                'admin_notes'=> null,
                'verified_at'=> null,
                'verified_by'=> null,
            ]);
            $payment = $existing;
        } else {
            $payment = RequestPayment::create([
                'sacrament_request_id' => $sacramentRequest->id,
                'user_id'              => Auth::id(),
                'method'               => $validated['method'],
                'amount'               => $validated['amount'] ?? null,
                'proof_path'           => $path,
                'status'               => 'submitted',
            ]);
        }

        $sacramentRequest->update(['payment_status' => 'submitted']);

        // Notify admins
        try {
            $adminIds = \App\Models\User::whereIn('role', ['super_admin', 'parish_admin'])->pluck('id');
            $name     = Auth::user()->full_name;
            $msgs     = $adminIds->map(fn ($id) => [
                'user_id'         => $id,
                'message'         => "{$name} submitted payment proof for a {$sacramentRequest->sacrament_type} request.",
                'type'            => 'payment_submitted',
                'is_read'         => false,
                'notifiable_type' => SacramentRequest::class,
                'notifiable_id'   => $sacramentRequest->id,
                'created_at'      => now(),
                'updated_at'      => now(),
            ])->toArray();
            if (!empty($msgs)) Notification::insert($msgs);
        } catch (\Throwable $e) {
            Log::warning('submitPayment: notification failed', ['error' => $e->getMessage()]);
        }

        return response()->json([
            'payment_status' => 'submitted',
            'proof_url'      => $proofUrl,
        ], 201);
    }

    // ── API: clergy confirms/declines ─────────────────────────
    public function respondClergy(Request $request, SacramentRequest $sacramentRequest): JsonResponse
    {
        // Only the assigned clergy's linked user account can respond
        if ($sacramentRequest->user_id !== Auth::id()) {
            // Also allow if auth user email matches assigned clergy email
            $clergy = $sacramentRequest->assignedClergy;
            $user   = Auth::user();
            if (!$clergy || $clergy->email !== $user->email) {
                return response()->json(['message' => 'Forbidden.'], 403);
            }
        }

        $validated = $request->validate([
            'response' => 'required|in:confirmed,declined',
        ]);

        $sacramentRequest->update(['clergy_status' => $validated['response']]);

        // Notify admins
        try {
            $clergy    = $sacramentRequest->assignedClergy;
            $clergyName = $clergy?->full_name ?? Auth::user()->full_name;
            $adminIds   = \App\Models\User::whereIn('role', ['super_admin', 'parish_admin'])->pluck('id');
            $msgs       = $adminIds->map(fn ($id) => [
                'user_id'         => $id,
                'message'         => "{$clergyName} has {$validated['response']} the assignment for a {$sacramentRequest->sacrament_type} request.",
                'type'            => 'clergy_response',
                'is_read'         => false,
                'notifiable_type' => SacramentRequest::class,
                'notifiable_id'   => $sacramentRequest->id,
                'created_at'      => now(),
                'updated_at'      => now(),
            ])->toArray();
            if (!empty($msgs)) Notification::insert($msgs);
        } catch (\Throwable $e) {
            Log::warning('respondClergy: notification failed', ['error' => $e->getMessage()]);
        }

        return response()->json(['clergy_status' => $validated['response']]);
    }

    // ── API: get messages ──────────────────────────────────────
    public function messages(SacramentRequest $sacramentRequest): JsonResponse
    {
        if ($sacramentRequest->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        // Mark admin messages as read
        $sacramentRequest->messages()
            ->where('read_by_parishioner', false)
            ->whereHas('sender', fn ($q) => $q->whereIn('role', ['super_admin', 'parish_admin', 'helpdesk']))
            ->update(['read_by_parishioner' => true]);

        $messages = $sacramentRequest->messages()
            ->with('sender:id,first_name,last_name,role')
            ->get()
            ->map(fn ($m) => [
                'id'        => $m->id,
                'body'      => $m->body,
                'sender'    => $m->sender?->full_name ?? 'Unknown',
                'role'      => $m->sender?->role ?? 'unknown',
                'sender_id' => $m->sender_id,
                'time'      => $m->created_at->format('M d, g:i A'),
                'is_mine'   => $m->sender_id === Auth::id(),
            ]);

        return response()->json($messages);
    }

    // ── API: send message ──────────────────────────────────────
    public function sendMessage(Request $request, SacramentRequest $sacramentRequest): JsonResponse
    {
        if ($sacramentRequest->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $message = RequestMessage::create([
            'sacrament_request_id' => $sacramentRequest->id,
            'sender_id'            => Auth::id(),
            'body'                 => $validated['body'],
            'read_by_admin'        => false,
            'read_by_parishioner'  => true,
        ]);

        // Notify admins
        try {
            $name     = Auth::user()->full_name;
            $adminIds = \App\Models\User::whereIn('role', ['super_admin', 'parish_admin'])->pluck('id');
            $msgs     = $adminIds->map(fn ($id) => [
                'user_id'         => $id,
                'message'         => "{$name} sent a message about their {$sacramentRequest->sacrament_type} request.",
                'type'            => 'message',
                'is_read'         => false,
                'notifiable_type' => SacramentRequest::class,
                'notifiable_id'   => $sacramentRequest->id,
                'created_at'      => now(),
                'updated_at'      => now(),
            ])->toArray();
            if (!empty($msgs)) Notification::insert($msgs);
        } catch (\Throwable $e) {
            Log::warning('sendMessage parishioner: notification failed', ['error' => $e->getMessage()]);
        }

        $message->load('sender:id,first_name,last_name,role');

        return response()->json([
            'id'        => $message->id,
            'body'      => $message->body,
            'sender'    => $message->sender?->full_name,
            'role'      => $message->sender?->role,
            'sender_id' => $message->sender_id,
            'time'      => $message->created_at->format('M d, g:i A'),
            'is_mine'   => true,
        ], 201);
    }

    // ── API: notifications ─────────────────────────────────────
    public function notifications(): JsonResponse
    {
        $notes = \App\Models\Notification::where('user_id', Auth::id())
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn ($n) => [
                'id'         => $n->id,
                'message'    => $n->message,
                'type'       => $n->type,
                'is_read'    => (bool) $n->is_read,
                'link_id'    => $n->notifiable_id,
                'time'       => $n->created_at->diffForHumans(),
            ]);

        $unread = \App\Models\Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->count();

        return response()->json(['notifications' => $notes, 'unread' => $unread]);
    }

    public function markNotificationsRead(): JsonResponse
    {
        \App\Models\Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['ok' => true]);
    }
}