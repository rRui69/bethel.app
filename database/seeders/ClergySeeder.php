<?php

namespace Database\Seeders;

use App\Models\ClergyProfile;
use App\Models\MassSchedule;
use App\Models\Parish;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * ClergySeeder
 *
 * Creates real User accounts (role = 'clergymen') paired with ClergyProfile records.
 * Also seeds their weekly mass schedules into the mass_schedules table.
 * Must run AFTER UserSeeder and ParishSeeder.
 *
 * Default password for all seeded clergy: Clergy@1234
 */
class ClergySeeder extends Seeder
{
    // Day name → day_of_week integer (0 = Sunday)
    private const DAY_MAP = [
        'Sunday'    => 0,
        'Monday'    => 1,
        'Tuesday'   => 2,
        'Wednesday' => 3,
        'Thursday'  => 4,
        'Friday'    => 5,
        'Saturday'  => 6,
    ];

    // Mass type label → MassSchedule enum value
    private const TYPE_MAP = [
        'Regular Mass'    => 'Regular',
        'Family Mass'     => 'Family',
        'Youth Mass'      => 'Youth',
        'Daily Mass'      => 'Daily',
        'Evening Mass'    => 'Evening',
        'Midday Mass'     => 'Midday',
        'Anticipated Mass'=> 'Anticipated',
        'Pilgrimage Mass' => 'Pilgrimage',
    ];

    public function run(): void
    {
        $parishMap = Parish::pluck('id', 'name');

        $clergy = [
            // ── St. Peter Parish ──────────────────────────────────
            [
                'user' => [
                    'username'  => 'fr.santos',
                    'email'     => 'fr.santos@bethelapp.com',
                    'first_name'=> 'Miguel',
                    'last_name' => 'Santos',
                    'gender'    => 'Male',
                    'phone'     => '09171234567',
                    'parish_id' => $parishMap['St. Peter Parish'],
                ],
                'profile' => [
                    'parish_id'      => $parishMap['St. Peter Parish'],
                    'title'          => 'Fr.',
                    'specialization' => 'Baptism, Marriage',
                ],
                'schedule' => [
                    ['day' => 'Sunday',    'time' => '06:00', 'type' => 'Regular Mass'],
                    ['day' => 'Sunday',    'time' => '09:00', 'type' => 'Family Mass'],
                    ['day' => 'Saturday',  'time' => '06:00', 'type' => 'Regular Mass'],
                    ['day' => 'Wednesday', 'time' => '18:00', 'type' => 'Evening Mass'],
                    ['day' => 'Friday',    'time' => '06:00', 'type' => 'Daily Mass'],
                ],
            ],
            // ── St. Mary Parish ───────────────────────────────────
            [
                'user' => [
                    'username'  => 'fr.reyes',
                    'email'     => 'fr.reyes@bethelapp.com',
                    'first_name'=> 'Antonio',
                    'last_name' => 'Reyes',
                    'gender'    => 'Male',
                    'phone'     => '09182345678',
                    'parish_id' => $parishMap['St. Mary Parish'],
                ],
                'profile' => [
                    'parish_id'      => $parishMap['St. Mary Parish'],
                    'title'          => 'Fr.',
                    'specialization' => 'Confirmation, Confession',
                ],
                'schedule' => [
                    ['day' => 'Sunday',    'time' => '08:00', 'type' => 'Regular Mass'],
                    ['day' => 'Sunday',    'time' => '11:00', 'type' => 'Family Mass'],
                    ['day' => 'Wednesday', 'time' => '06:00', 'type' => 'Daily Mass'],
                    ['day' => 'Thursday',  'time' => '06:00', 'type' => 'Daily Mass'],
                ],
            ],
            // ── Sacred Heart Parish ───────────────────────────────
            [
                'user' => [
                    'username'  => 'fr.cruz',
                    'email'     => 'fr.cruz@bethelapp.com',
                    'first_name'=> 'Roberto',
                    'last_name' => 'Cruz',
                    'gender'    => 'Male',
                    'phone'     => '09193456789',
                    'parish_id' => $parishMap['Sacred Heart Parish'],
                ],
                'profile' => [
                    'parish_id'      => $parishMap['Sacred Heart Parish'],
                    'title'          => 'Fr.',
                    'specialization' => 'Marriage, Anointing',
                ],
                'schedule' => [
                    ['day' => 'Sunday',   'time' => '10:00', 'type' => 'Family Mass'],
                    ['day' => 'Sunday',   'time' => '12:00', 'type' => 'Regular Mass'],
                    ['day' => 'Saturday', 'time' => '17:00', 'type' => 'Anticipated Mass'],
                    ['day' => 'Tuesday',  'time' => '06:00', 'type' => 'Daily Mass'],
                ],
            ],
            // ── Sto. Niño Parish ──────────────────────────────────
            [
                'user' => [
                    'username'  => 'fr.delacruz',
                    'email'     => 'fr.delacruz@bethelapp.com',
                    'first_name'=> 'Eduardo',
                    'last_name' => 'Dela Cruz',
                    'gender'    => 'Male',
                    'phone'     => '09204567890',
                    'parish_id' => $parishMap['Sto. Niño Parish'],
                ],
                'profile' => [
                    'parish_id'      => $parishMap['Sto. Niño Parish'],
                    'title'          => 'Fr.',
                    'specialization' => 'Baptism, First Communion',
                ],
                'schedule' => [
                    ['day' => 'Sunday',   'time' => '07:00', 'type' => 'Regular Mass'],
                    ['day' => 'Sunday',   'time' => '12:00', 'type' => 'Youth Mass'],
                    ['day' => 'Saturday', 'time' => '07:00', 'type' => 'Regular Mass'],
                    ['day' => 'Monday',   'time' => '06:00', 'type' => 'Daily Mass'],
                ],
            ],
            // ── St. Joseph Parish ─────────────────────────────────
            [
                'user' => [
                    'username'  => 'fr.mendoza',
                    'email'     => 'fr.mendoza@bethelapp.com',
                    'first_name'=> 'Carlos',
                    'last_name' => 'Mendoza',
                    'gender'    => 'Male',
                    'phone'     => '09215678901',
                    'parish_id' => $parishMap['St. Joseph Parish'],
                ],
                'profile' => [
                    'parish_id'      => $parishMap['St. Joseph Parish'],
                    'title'          => 'Fr.',
                    'specialization' => 'Baptism, Confession',
                ],
                'schedule' => [
                    ['day' => 'Sunday',   'time' => '08:00', 'type' => 'Regular Mass'],
                    ['day' => 'Sunday',   'time' => '17:00', 'type' => 'Anticipated Mass'],
                    ['day' => 'Friday',   'time' => '06:00', 'type' => 'Daily Mass'],
                ],
            ],
            // ── Our Lady of Peace Parish ──────────────────────────
            [
                'user' => [
                    'username'  => 'fr.villanueva',
                    'email'     => 'fr.villanueva@bethelapp.com',
                    'first_name'=> 'Jose',
                    'last_name' => 'Villanueva',
                    'gender'    => 'Male',
                    'phone'     => '09226789012',
                    'parish_id' => $parishMap['Our Lady of Peace Parish'],
                ],
                'profile' => [
                    'parish_id'      => $parishMap['Our Lady of Peace Parish'],
                    'title'          => 'Fr.',
                    'specialization' => 'Burial, Anointing',
                ],
                'schedule' => [
                    ['day' => 'Sunday',    'time' => '06:00', 'type' => 'Regular Mass'],
                    ['day' => 'Sunday',    'time' => '09:00', 'type' => 'Pilgrimage Mass'],
                    ['day' => 'Saturday',  'time' => '07:00', 'type' => 'Regular Mass'],
                    ['day' => 'Friday',    'time' => '06:00', 'type' => 'Daily Mass'],
                    ['day' => 'Wednesday', 'time' => '12:00', 'type' => 'Midday Mass'],
                ],
            ],
        ];

        // Use first super_admin as created_by for seeded schedules
        $adminId = User::where('role', 'super_admin')->value('id') ?? 1;

        foreach ($clergy as $entry) {
            // Create the user account
            $user = User::create(array_merge($entry['user'], [
                'password'       => Hash::make('Clergy@1234'),
                'role'           => 'clergymen',
                'account_status' => 'Active',
                'country'        => 'Philippines',
                'birth_date'     => '1975-01-01',
                'city'           => 'Olongapo',
                'barangay'       => 'East Tapinac',
                'province'       => 'Zambales',
            ]));

            // Create the clergy profile — no schedule column
            ClergyProfile::create(array_merge($entry['profile'], [
                'user_id' => $user->id,
            ]));

            // Seed mass schedules into the proper table
            foreach ($entry['schedule'] as $slot) {
                MassSchedule::create([
                    'parish_id'     => $entry['profile']['parish_id'],
                    'clergy_id'     => $user->id,
                    'type'          => self::TYPE_MAP[$slot['type']] ?? 'Regular',
                    'schedule_type' => 'recurring',
                    'day_of_week'   => self::DAY_MAP[$slot['day']] ?? 0,
                    'specific_date' => null,
                    'start_time'    => $slot['time'] . ':00',
                    'end_time'      => null,
                    'is_active'     => true,
                    'created_by'    => $adminId,
                ]);
            }
        }
    }
}