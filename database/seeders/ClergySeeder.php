<?php

namespace Database\Seeders;

use App\Models\ClergyProfile;
use App\Models\Parish;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * ClergySeeder
 *
 * Creates real User accounts (role = 'clergymen') paired with ClergyProfile records.
 * Must run AFTER UserSeeder and ParishSeeder.
 *
 * Default password for all seeded clergy: Clergy@1234
 */
class ClergySeeder extends Seeder
{
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
                    'schedule'       => [
                        ['day' => 'Sunday',    'time' => '6:00 AM',  'type' => 'Regular Mass'],
                        ['day' => 'Sunday',    'time' => '9:00 AM',  'type' => 'Family Mass'],
                        ['day' => 'Saturday',  'time' => '6:00 AM',  'type' => 'Regular Mass'],
                        ['day' => 'Wednesday', 'time' => '6:00 PM',  'type' => 'Evening Mass'],
                        ['day' => 'Friday',    'time' => '6:00 AM',  'type' => 'Daily Mass'],
                    ],
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
                    'schedule'       => [
                        ['day' => 'Sunday',    'time' => '8:00 AM',  'type' => 'Regular Mass'],
                        ['day' => 'Sunday',    'time' => '11:00 AM', 'type' => 'Family Mass'],
                        ['day' => 'Wednesday', 'time' => '6:00 AM',  'type' => 'Daily Mass'],
                        ['day' => 'Thursday',  'time' => '6:00 AM',  'type' => 'Daily Mass'],
                    ],
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
                    'schedule'       => [
                        ['day' => 'Sunday',   'time' => '10:00 AM', 'type' => 'Family Mass'],
                        ['day' => 'Sunday',   'time' => '12:00 PM', 'type' => 'Regular Mass'],
                        ['day' => 'Saturday', 'time' => '5:00 PM',  'type' => 'Anticipated Mass'],
                        ['day' => 'Tuesday',  'time' => '6:00 AM',  'type' => 'Daily Mass'],
                    ],
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
                    'schedule'       => [
                        ['day' => 'Sunday',   'time' => '7:00 AM',  'type' => 'Regular Mass'],
                        ['day' => 'Sunday',   'time' => '12:00 PM', 'type' => 'Youth Mass'],
                        ['day' => 'Saturday', 'time' => '7:00 AM',  'type' => 'Regular Mass'],
                        ['day' => 'Monday',   'time' => '6:00 AM',  'type' => 'Daily Mass'],
                    ],
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
                    'schedule'       => [
                        ['day' => 'Sunday',   'time' => '8:00 AM', 'type' => 'Regular Mass'],
                        ['day' => 'Sunday',   'time' => '5:00 PM', 'type' => 'Anticipated Mass'],
                        ['day' => 'Friday',   'time' => '6:00 AM', 'type' => 'Daily Mass'],
                    ],
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
                    'schedule'       => [
                        ['day' => 'Sunday',    'time' => '6:00 AM',  'type' => 'Regular Mass'],
                        ['day' => 'Sunday',    'time' => '9:00 AM',  'type' => 'Pilgrimage Mass'],
                        ['day' => 'Saturday',  'time' => '7:00 AM',  'type' => 'Regular Mass'],
                        ['day' => 'Friday',    'time' => '6:00 AM',  'type' => 'Daily Mass'],
                        ['day' => 'Wednesday', 'time' => '12:00 PM', 'type' => 'Midday Mass'],
                    ],
                ],
            ],
        ];

        foreach ($clergy as $entry) {
            $user = User::create(array_merge($entry['user'], [
                'password'       => Hash::make('Clergy@1234'),
                'role'           => 'clergymen',
                'account_status' => 'Active',
                'country'        => 'Philippines',
                'city'           => 'Olongapo',
                'barangay'       => 'East Tapinac',
                'birth_date'     => '1975-01-01',
            ]));

            ClergyProfile::create(array_merge($entry['profile'], [
                'user_id' => $user->id,
            ]));
        }
    }
}