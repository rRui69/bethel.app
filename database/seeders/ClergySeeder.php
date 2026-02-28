<?php

namespace Database\Seeders;

use App\Models\Clergy;
use App\Models\Parish;
use Illuminate\Database\Seeder;

class ClergySeeder extends Seeder
{
    public function run(): void
    {
        $parishMap = Parish::pluck('id', 'name');
        $clergy = [
            // St. Peter Parish
            [
                'parish_id'      => $parishMap['St. Peter Parish'],
                'title'          => 'Fr.',
                'first_name'     => 'Miguel',
                'last_name'      => 'Santos',
                'status'         => 'Active',
                'specialization' => 'Baptism, Marriage',
                'phone'          => '09171234567',
                'email'          => 'fr.santos@bethelapp.com',
                'schedule'       => [
                    ['day' => 'Sunday',    'time' => '6:00 AM',  'type' => 'Regular Mass'],
                    ['day' => 'Sunday',    'time' => '9:00 AM',  'type' => 'Family Mass'],
                    ['day' => 'Saturday',  'time' => '6:00 AM',  'type' => 'Regular Mass'],
                    ['day' => 'Wednesday', 'time' => '6:00 PM',  'type' => 'Evening Mass'],
                    ['day' => 'Friday',    'time' => '6:00 AM',  'type' => 'Daily Mass'],
                ],
            ],

            // St. Mary Parish
            [
                'parish_id'      => $parishMap['St. Mary Parish'],
                'title'          => 'Fr.',
                'first_name'     => 'Antonio',
                'last_name'      => 'Reyes',
                'status'         => 'Active',
                'specialization' => 'Confirmation, Confession',
                'phone'          => '09182345678',
                'email'          => 'fr.reyes@bethelapp.com',
                'schedule'       => [
                    ['day' => 'Sunday',    'time' => '8:00 AM',  'type' => 'Regular Mass'],
                    ['day' => 'Sunday',    'time' => '11:00 AM', 'type' => 'Family Mass'],
                    ['day' => 'Wednesday', 'time' => '6:00 AM',  'type' => 'Daily Mass'],
                    ['day' => 'Thursday',  'time' => '6:00 AM',  'type' => 'Daily Mass'],
                ],
            ],

            // Sacred Heart Parish
            [
                'parish_id'      => $parishMap['Sacred Heart Parish'],
                'title'          => 'Fr.',
                'first_name'     => 'Roberto',
                'last_name'      => 'Cruz',
                'status'         => 'Active',
                'specialization' => 'Marriage, Anointing',
                'phone'          => '09193456789',
                'email'          => 'fr.cruz@bethelapp.com',
                'schedule'       => [
                    ['day' => 'Sunday',   'time' => '10:00 AM', 'type' => 'Family Mass'],
                    ['day' => 'Sunday',   'time' => '12:00 PM', 'type' => 'Regular Mass'],
                    ['day' => 'Saturday', 'time' => '5:00 PM',  'type' => 'Anticipated Mass'],
                    ['day' => 'Tuesday',  'time' => '6:00 AM',  'type' => 'Daily Mass'],
                ],
            ],

            // Sto. Niño Parish
            [
                'parish_id'      => $parishMap['Sto. Niño Parish'],
                'title'          => 'Fr.',
                'first_name'     => 'Eduardo',
                'last_name'      => 'Dela Cruz',
                'status'         => 'Active',
                'specialization' => 'Baptism, First Communion',
                'phone'          => '09204567890',
                'email'          => 'fr.delacruz@bethelapp.com',
                'schedule'       => [
                    ['day' => 'Sunday',   'time' => '7:00 AM',  'type' => 'Regular Mass'],
                    ['day' => 'Sunday',   'time' => '12:00 PM', 'type' => 'Youth Mass'],
                    ['day' => 'Saturday', 'time' => '7:00 AM',  'type' => 'Regular Mass'],
                    ['day' => 'Monday',   'time' => '6:00 AM',  'type' => 'Daily Mass'],
                ],
            ],

            // St. Joseph Parish
            [
                'parish_id'      => $parishMap['St. Joseph Parish'],
                'title'          => 'Fr.',
                'first_name'     => 'Carlos',
                'last_name'      => 'Mendoza',
                'status'         => 'Active',
                'specialization' => 'Baptism, Confession',
                'phone'          => '09215678901',
                'email'          => 'fr.mendoza@bethelapp.com',
                'schedule'       => [
                    ['day' => 'Sunday',   'time' => '8:00 AM',  'type' => 'Regular Mass'],
                    ['day' => 'Sunday',   'time' => '5:00 PM',  'type' => 'Anticipated Mass'],
                    ['day' => 'Friday',   'time' => '6:00 AM',  'type' => 'Daily Mass'],
                ],
            ],

            // Our Lady of Peace Parish
            [
                'parish_id'      => $parishMap['Our Lady of Peace Parish'],
                'title'          => 'Fr.',
                'first_name'     => 'Jose',
                'last_name'      => 'Villanueva',
                'status'         => 'Active',
                'specialization' => 'Burial, Anointing',
                'phone'          => '09226789012',
                'email'          => 'fr.villanueva@bethelapp.com',
                'schedule'       => [
                    ['day' => 'Sunday',    'time' => '6:00 AM',  'type' => 'Regular Mass'],
                    ['day' => 'Sunday',    'time' => '9:00 AM',  'type' => 'Pilgrimage Mass'],
                    ['day' => 'Saturday',  'time' => '7:00 AM',  'type' => 'Regular Mass'],
                    ['day' => 'Friday',    'time' => '6:00 AM',  'type' => 'Daily Mass'],
                    ['day' => 'Wednesday', 'time' => '12:00 PM', 'type' => 'Midday Mass'],
                ],
            ],
        ];

        foreach ($clergy as $priest) {
            Clergy::create($priest);
        }
    }
}