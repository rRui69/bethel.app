<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── ORDER MATTERS — respect foreign key dependencies ──────────────────
        $this->call([
            // 1. Parishes first — UserSeeder needs parish IDs
            \Database\Seeders\ParishSeeder::class,
            // 2. Users (super_admin + demo staff + sample parishioners)
            \Database\Seeders\UserSeeder::class,
            // 3. Parish staff — 1 parish_admin + 1 parish_helpdesk per parish
            \Database\Seeders\StaffSeeder::class,
            // 4. Clergy (depends on parishes)
            \Database\Seeders\ClergySeeder::class,
            // 5. Events (depends on parishes, clergy, users)
            \Database\Seeders\EventSeeder::class,
            // 6. Announcements (depends on parishes, users)
            \Database\Seeders\AnnouncementSeeder::class,
            // 7. Notifications (depends on users, events)
            \Database\Seeders\NotificationSeeder::class,
            // 8. Sacrament Types FIRST — requests depend on this
            \Database\Seeders\SacramentTypeSeeder::class,
            // 9. Sacrament Requests — links to types via sacrament_type_id
            \Database\Seeders\SacramentRequestSeeder::class,
        ]);
    }
}
