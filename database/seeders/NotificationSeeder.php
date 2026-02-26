<?php

namespace Database\Seeders;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'super_admin')->first();
        if (!$admin) return;

        $notifications = [
            [
                'user_id'         => $admin->id,
                'message'         => 'New sacrament request from St. Peter Parish',
                'type'            => 'request',
                'is_read'         => false,
                'notifiable_type' => 'App\\Models\\Event',
                'notifiable_id'   => 1,
            ],
            [
                'user_id'         => $admin->id,
                'message'         => '3 new parishioners registered today',
                'type'            => 'user',
                'is_read'         => false,
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id'   => 1,
            ],
            [
                'user_id'         => $admin->id,
                'message'         => 'Sacred Heart Parish updated mass schedule',
                'type'            => 'info',
                'is_read'         => true,
                'notifiable_type' => 'App\\Models\\Parish',
                'notifiable_id'   => 3,
            ],
            [
                'user_id'         => $admin->id,
                'message'         => 'Marriage ceremony request pending approval',
                'type'            => 'request',
                'is_read'         => true,
                'notifiable_type' => 'App\\Models\\Event',
                'notifiable_id'   => 2,
            ],
            [
                'user_id'         => $admin->id,
                'message'         => 'System backup completed successfully',
                'type'            => 'system',
                'is_read'         => true,
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id'   => $admin->id,
            ],
        ];

        foreach ($notifications as $notification) {
            Notification::create($notification);
        }
    }
}