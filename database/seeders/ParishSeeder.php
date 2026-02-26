<?php

namespace Database\Seeders;

use App\Models\Parish;
use Illuminate\Database\Seeder;

class ParishSeeder extends Seeder
{
    public function run(): void
    {
        $parishes = [
            [
                'name'        => 'St. Peter Parish',
                'diocese'     => 'Archdiocese of Manila',
                'address'     => '123 Quezon Ave',
                'barangay'    => 'Barangay Holy Spirit',
                'city'        => 'Quezon City',
                'province'    => 'Metro Manila',
                'country'     => 'Philippines',
                'zip_code'    => '1128',
                'phone'       => '02-8123-4567',
                'email'       => 'stpeter@bethelapp.com',
                'status'      => 'Active',
                'description' => 'One of the oldest parishes in Quezon City.',
            ],
            [
                'name'        => 'St. Mary Parish',
                'diocese'     => 'Archdiocese of Manila',
                'address'     => '456 Taft Avenue',
                'barangay'    => 'Barangay 676',
                'city'        => 'Manila',
                'province'    => 'Metro Manila',
                'country'     => 'Philippines',
                'zip_code'    => '1000',
                'phone'       => '02-8234-5678',
                'email'       => 'stmary@bethelapp.com',
                'status'      => 'Active',
                'description' => 'A vibrant parish in the heart of Manila.',
            ],
            [
                'name'        => 'Sacred Heart Parish',
                'diocese'     => 'Diocese of Pasig',
                'address'     => '789 Ayala Avenue',
                'barangay'    => 'Bel-Air',
                'city'        => 'Makati',
                'province'    => 'Metro Manila',
                'country'     => 'Philippines',
                'zip_code'    => '1209',
                'phone'       => '02-8345-6789',
                'email'       => 'sacredheart@bethelapp.com',
                'status'      => 'Active',
                'description' => 'Serving Makati\'s faithful since 1950.',
            ],
            [
                'name'        => 'Sto. Niño Parish',
                'diocese'     => 'Diocese of Pasig',
                'address'     => '321 Ortigas Ave',
                'barangay'    => 'Kapitolyo',
                'city'        => 'Pasig',
                'province'    => 'Metro Manila',
                'country'     => 'Philippines',
                'zip_code'    => '1603',
                'phone'       => '02-8456-7890',
                'email'       => 'stonino@bethelapp.com',
                'status'      => 'Active',
                'description' => 'Home of the Sto. Niño devotion in Pasig.',
            ],
            [
                'name'        => 'St. Joseph Parish',
                'diocese'     => 'Diocese of Paranaque',
                'address'     => '654 C5 Road',
                'barangay'    => 'Ususan',
                'city'        => 'Taguig',
                'province'    => 'Metro Manila',
                'country'     => 'Philippines',
                'zip_code'    => '1630',
                'phone'       => '02-8567-8901',
                'email'       => 'stjoseph@bethelapp.com',
                'status'      => 'Inactive',
                'description' => 'Currently undergoing renovation.',
            ],
            [
                'name'        => 'Our Lady of Peace Parish',
                'diocese'     => 'Diocese of Antipolo',
                'address'     => '987 Sumulong Highway',
                'barangay'    => 'Dela Paz',
                'city'        => 'Antipolo',
                'province'    => 'Rizal',
                'country'     => 'Philippines',
                'zip_code'    => '1870',
                'phone'       => '02-8678-9012',
                'email'       => 'ourladyofpeace@bethelapp.com',
                'status'      => 'Active',
                'description' => 'A pilgrimage parish in the hills of Antipolo.',
            ],
        ];

        foreach ($parishes as $parish) {
            Parish::create($parish);
        }
    }
}