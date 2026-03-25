<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Event;
use App\Models\Notification;
use App\Models\SacramentRequest;
use App\Models\User;

abstract class AdminBaseController extends Controller
{
    protected function adminShellData(): array
    {
        $admin = auth()->user();

        // ── Stats: scoped to parish for non-super_admin ───────────────────────
        // super_admin sees diocesan-wide totals; all others see only their parish.
        if ($admin->isSuperAdmin()) {
            $totalParishioners      = User::where('role', 'parishioner')->count();
            $pendingSacraments      = SacramentRequest::where('status', 'pending')->count();
            $activeEvents           = Event::regular()->upcoming()->count();
            $activeAnnouncements    = Announcement::published()->count();
        } else {
            $parishId = $admin->parish_id;

            $totalParishioners   = User::where('role', 'parishioner')
                ->where('parish_id', $parishId)
                ->count();

            $pendingSacraments   = SacramentRequest::where('status', 'pending')
                ->where('parish_id', $parishId)
                ->count();

            $activeEvents        = Event::regular()->upcoming()
                ->where('parish_id', $parishId)
                ->count();

            $activeAnnouncements = Announcement::published()
                ->where('parish_id', $parishId)
                ->count();
        }

        return [
            'admin' => [
                'name'  => $admin->full_name,
                'role'  => $admin->role,
                'label' => match ($admin->role) {
                    'super_admin'      => 'Diocesan Head IT Admin',
                    'parish_admin'     => 'Ministerial Head IT Admin',
                    'parish_helpdesk'  => 'Ministerial IT Helpdesk',
                    'clergymen'        => 'Clergymen',
                    default            => 'Staff',
                },
                'email' => $admin->email,
            ],

            'stats' => [
                'total_parishioners'         => $totalParishioners,
                'pending_sacrament_requests' => $pendingSacraments,
                'active_events'              => $activeEvents,
                'active_announcements'       => $activeAnnouncements,
            ],

            'notifications' => Notification::where('user_id', $admin->id)
                ->latest()
                ->take(10)
                ->get()
                ->map(fn ($n) => [
                    'id'               => $n->id,
                    'message'          => $n->message,
                    'time'             => $n->created_at->diffForHumans(),
                    'read'             => $n->is_read,
                    'type'             => $n->type,
                    'notifiable_type'  => $n->notifiable_type,
                    'notifiable_id'    => $n->notifiable_id,
                ])
                ->toArray(),

            'parishes' => [],
        ];
    }
}
