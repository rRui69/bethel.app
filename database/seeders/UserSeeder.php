<?php

namespace Database\Seeders;

use App\Models\Parish;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $demoParishId = Parish::where('name', 'St. Peter Parish')->value('id');

        // ── 1. Diocesan Head IT Administrator (super_admin) ───────────────────
        // Global — not tied to any single parish.
        User::firstOrCreate(
            ['email' => 'admin@bethelapp.com'],
            [
                'username'       => 'superadmin',
                'password'       => Hash::make('Admin@1234'),
                'role'           => 'super_admin',
                'account_status' => 'Active',
                'parish_id'      => null,
                'first_name'     => 'Super',
                'last_name'      => 'Admin',
                'birth_date'     => '1985-01-01',
                'gender'         => 'Male',
                'phone'          => '09000000001',
                'country'        => 'Philippines',
                'city'           => 'Manila',
                'barangay'       => 'Ermita',
            ]
        );

        // ── 2. Ministerial Head IT Administrator (parish_admin) ───────────────
        // Manages users, monitors payments — scoped to their assigned parish.
        User::firstOrCreate(
            ['email' => 'parish.admin@bethelapp.com'],
            [
                'username'       => 'parish.admin',
                'password'       => Hash::make('Admin@1234'),
                'role'           => 'parish_admin',
                'account_status' => 'Active',
                'parish_id'      => $demoParishId,
                'first_name'     => 'Parish',
                'last_name'      => 'Admin',
                'birth_date'     => '1988-06-15',
                'gender'         => 'Male',
                'phone'          => '09000000002',
                'country'        => 'Philippines',
                'city'           => 'Quezon City',
                'barangay'       => 'Holy Spirit',
            ]
        );

        // ── 3. Ministerial IT Helpdesk (parish_helpdesk) ─────────────────────
        // Handles day-to-day scheduling, announcements, sacrament workflows.
        User::firstOrCreate(
            ['email' => 'parish.helpdesk@bethelapp.com'],
            [
                'username'       => 'parish.helpdesk',
                'password'       => Hash::make('Helpdesk@1234'),
                'role'           => 'parish_helpdesk',
                'account_status' => 'Active',
                'parish_id'      => $demoParishId,
                'first_name'     => 'Parish',
                'last_name'      => 'Helpdesk',
                'birth_date'     => '1992-03-20',
                'gender'         => 'Female',
                'phone'          => '09000000003',
                'country'        => 'Philippines',
                'city'           => 'Quezon City',
                'barangay'       => 'Holy Spirit',
            ]
        );

        // ── 4. Sample Parishioners ────────────────────────────────────────────
        $parishioners = [
            ['username' => 'juan.delacruz', 'first_name' => 'Juan',  'last_name' => 'Dela Cruz', 'email' => 'juan@mail.com'],
            ['username' => 'maria.santos',  'first_name' => 'Maria', 'last_name' => 'Santos',    'email' => 'maria@mail.com'],
            ['username' => 'pedro.reyes',   'first_name' => 'Pedro', 'last_name' => 'Reyes',     'email' => 'pedro@mail.com'],
        ];

        foreach ($parishioners as $p) {
            User::firstOrCreate(
                ['email' => $p['email']],
                array_merge($p, [
                    'password'       => Hash::make('Password@123'),
                    'role'           => 'parishioner',
                    'account_status' => 'Active',
                    'parish_id'      => $demoParishId,
                    'birth_date'     => '1995-06-15',
                    'gender'         => 'Male',
                    'phone'          => '09171234567',
                    'country'        => 'Philippines',
                    'city'           => 'Manila',
                    'barangay'       => 'Sampaloc',
                ])
            );
        }
    }
}
