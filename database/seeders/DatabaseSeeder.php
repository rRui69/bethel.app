<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── ORDER MATTERS ──
        $this->call([
            // 1. Users first (no dependencies)
            \Database\Seeders\UserSeeder::class,
            // 2. Parishes (no dependencies)
            \Database\Seeders\ParishSeeder::class,
            // 3. Clergy (depends on parishes)
            \Database\Seeders\ClergySeeder::class,
            // 4. Events (depends on parishes, clergy, users)
            \Database\Seeders\EventSeeder::class,
            // 5. Announcements (depends on parishes, users)
            \Database\Seeders\AnnouncementSeeder::class,
            // 6. Notifications (depends on users, events)
            \Database\Seeders\NotificationSeeder::class,
        ]);
    }
}