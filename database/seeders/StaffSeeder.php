<?php

namespace Database\Seeders;

use App\Models\Parish;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * StaffSeeder
 *
 * Creates 1 Ministerial Head IT Admin (parish_admin) and
 * 1 Ministerial IT Helpdesk (parish_helpdesk) account for
 * each parish already in the database.
 *
 * Safe to run multiple times — uses firstOrCreate to avoid duplicates.
 *
 * Run individually:  php artisan db:seed --class=StaffSeeder
 */
class StaffSeeder extends Seeder
{
    public function run(): void
    {
        $parishes = Parish::orderBy('id')->get();

        if ($parishes->isEmpty()) {
            $this->command->warn('No parishes found. Run ParishSeeder first.');
            return;
        }

        foreach ($parishes as $parish) {
            $slug = strtolower(preg_replace('/[^a-z0-9]/i', '', $parish->name));

            // ── Ministerial Head IT Admin ─────────────────────────
            User::firstOrCreate(
                ['email' => "admin.{$slug}@bethelapp.com"],
                [
                    'username'        => "admin.{$slug}",
                    'password'        => Hash::make('Admin@1234'),
                    'role'            => 'parish_admin',
                    'account_status'  => 'Active',
                    'first_name'      => 'Admin',
                    'last_name'       => $parish->name,
                    'birth_date'      => '1985-03-10',
                    'gender'          => 'Male',
                    'phone'           => '09100000001',
                    'country'         => 'Philippines',
                    'city'            => $parish->city,
                    'barangay'        => $parish->barangay,
                    'parish_id'       => $parish->id,
                ]
            );

            // ── Ministerial IT Helpdesk ───────────────────────────
            User::firstOrCreate(
                ['email' => "helpdesk.{$slug}@bethelapp.com"],
                [
                    'username'        => "helpdesk.{$slug}",
                    'password'        => Hash::make('Helpdesk@1234'),
                    'role'            => 'parish_helpdesk',
                    'account_status'  => 'Active',
                    'first_name'      => 'Helpdesk',
                    'last_name'       => $parish->name,
                    'birth_date'      => '1990-07-20',
                    'gender'          => 'Female',
                    'phone'           => '09200000002',
                    'country'         => 'Philippines',
                    'city'            => $parish->city,
                    'barangay'        => $parish->barangay,
                    'parish_id'       => $parish->id,
                ]
            );

            $this->command->line(
                "  ✓ <info>{$parish->name}</info> — admin.{$slug} / helpdesk.{$slug}"
            );
        }

        $this->command->info('StaffSeeder complete. Default password: Admin@1234 / Helpdesk@1234');
    }
}
