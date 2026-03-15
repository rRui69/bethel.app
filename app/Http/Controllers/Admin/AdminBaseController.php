<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Announcement;
use App\Models\Notification;
use App\Models\SacramentRequest;
use App\Models\User;

abstract class AdminBaseController extends Controller
{
    protected function adminShellData(): array
    {
        $admin = auth()->user();

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
                'total_parishioners'         => User::where('role', 'parishioner')->count(),
                'pending_sacrament_requests' => SacramentRequest::where('status', 'pending')->count(),
                'active_events'              => Event::regular()->upcoming()->count(),
                'active_announcements'       => Announcement::published()->count(),
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
