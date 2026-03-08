<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\SacramentRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InboxController extends Controller
{
    // ── Blade page ─────────────────────────────────────────────
    public function page()
    {
        $user = Auth::user();

        $pageData = [
            'isAuth' => true,
            'authId' => $user->id,
            'user'   => [
                'id'         => $user->id,
                'first_name' => $user->first_name,
                'last_name'  => $user->last_name,
                'email'      => $user->email,
            ],
        ];

        return view('parishioner.inbox', compact('pageData'));
    }

    // ── API: full inbox payload ────────────────────────────────
    // Returns notifications + message threads (bookings with unread messages).
    // Single endpoint so the frontend can load everything in one shot.
    public function index(): JsonResponse
    {
        $userId = Auth::id();

        // ── Notifications ──────────────────────────────────────
        $notifications = Notification::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->limit(40)
            ->get()
            ->map(fn ($n) => [
                'id'            => $n->id,
                'message'       => $n->message,
                'type'          => $n->type,
                'is_read'       => (bool) $n->is_read,
                'link_id'       => $n->notifiable_id,
                'notifiable_type' => $n->notifiable_type,
                'time'          => $n->created_at->diffForHumans(),
                'time_full'     => $n->created_at->format('M d, Y g:i A'),
            ]);

        $unread_notifications = Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();

        // ── Message threads (bookings with ≥1 message) ────────
        $bookings = SacramentRequest::where('user_id', $userId)
            ->with([
                'parish:id,name',
                // Count unread admin messages in one query
            ])
            ->withCount([
                'messages as unread_messages' => fn ($q) => $q
                    ->where('read_by_parishioner', false)
                    ->join('users as msg_senders', 'request_messages.sender_id', '=', 'msg_senders.id')
                    ->whereIn('msg_senders.role', ['super_admin', 'parish_admin', 'helpdesk']),
                'messages as total_messages',
            ])
            ->having('total_messages', '>', 0)
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn ($req) => [
                'id'              => $req->id,
                'sacrament_type'  => $req->sacrament_type,
                'status'          => strtolower($req->status),
                'parish'          => $req->parish?->name ?? '—',
                'submitted_at'    => $req->created_at->format('M d, Y'),
                'unread_messages' => (int) ($req->unread_messages ?? 0),
                'total_messages'  => (int) ($req->total_messages  ?? 0),
            ]);

        return response()->json([
            'notifications'        => $notifications,
            'unread_notifications' => $unread_notifications,
            'threads'              => $bookings,
        ]);
    }

    // ── API: mark single notification read ─────────────────────
    public function markRead(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => 'required|integer',
        ]);

        Notification::where('user_id', Auth::id())
            ->where('id', $validated['id'])
            ->update(['is_read' => true]);

        return response()->json(['ok' => true]);
    }

    // ── API: mark all notifications read ──────────────────────
    public function markAllRead(): JsonResponse
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['ok' => true]);
    }
}