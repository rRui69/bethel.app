<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Announcement;
use App\Models\Notification;
use App\Models\User;

abstract class AdminBaseController extends Controller
{
    /**
     * Common shell data injected as window.__ADMIN_DATA__ on every admin page.
     * Keeps sidebar role-visibility, topnav notifications, and badge counts
     * working regardless of which admin page the user lands on.
     */
    protected function adminShellData(): array
    {
        $admin = auth()->user();

        return [
            'admin' => [
                'name'  => $admin->full_name,
                'role'  => $admin->role,
                'label' => match ($admin->role) {
                    'super_admin'  => 'Ministerial Head IT Administrator',
                    'parish_admin' => 'Ministerial IT Helpdesk',
                    'clergymen'    => 'Clergymen',
                    default        => 'Staff',
                },
                'email' => $admin->email,
            ],

            'stats' => [
                'total_parishioners'         => User::where('role', 'parishioner')->count(),
                'pending_sacrament_requests' => Event::sacramental()->pending()->count(),
                'active_events'              => Event::regular()->upcoming()->count(),
                'active_announcements'       => Announcement::published()->count(),
            ],

            // notifiable_type + notifiable_id are passed so the frontend
            // can build the correct redirect URL for each notification
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
                    'notifiable_type'  => $n->notifiable_type,   // e.g. "App\Models\Event"
                    'notifiable_id'    => $n->notifiable_id,     // e.g. 3
                ])
                ->toArray(),

            'parishes' => [], // overridden by DashboardController
        ];
    }
}