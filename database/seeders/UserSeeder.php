<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Ministerial Head IT Administrator
        User::create([
            'username'   => 'superadmin',
            'email'      => 'admin@bethelapp.com',
            'password'   => Hash::make('Admin@1234'),
            'role'       => 'super_admin',
            'first_name' => 'Super',
            'last_name'  => 'Admin',
            'birth_date' => '1985-01-01',
            'gender'     => 'Male',
            'phone'      => '09000000001',
            'country'    => 'Philippines',
            'city'       => 'Manila',
            'barangay'   => 'Ermita',
        ]);

        // Ministerial IT Helpdesk
        User::create([
            'username'   => 'helpdesk',
            'email'      => 'helpdesk@bethelapp.com',
            'password'   => Hash::make('Helpdesk@1234'),
            'role'       => 'parish_admin',
            'first_name' => 'Help',
            'last_name'  => 'Desk',
            'birth_date' => '1990-05-15',
            'gender'     => 'Female',
            'phone'      => '09000000002',
            'country'    => 'Philippines',
            'city'       => 'Quezon City',
            'barangay'   => 'Holy Spirit',
        ]);

        // ── 3. Sample Parishioners
        $parishioners = [
            ['username' => 'juan.delacruz', 'first_name' => 'Juan',  'last_name' => 'Dela Cruz', 'email' => 'juan@mail.com'],
            ['username' => 'maria.santos',  'first_name' => 'Maria', 'last_name' => 'Santos',    'email' => 'maria@mail.com'],
            ['username' => 'pedro.reyes',   'first_name' => 'Pedro', 'last_name' => 'Reyes',     'email' => 'pedro@mail.com'],
        ];

        foreach ($parishioners as $p) {
            User::create(array_merge($p, [
                'password'   => Hash::make('Password@123'),
                'role'       => 'parishioner',
                'birth_date' => '1995-06-15',
                'gender'     => 'Male',
                'phone'      => '09171234567',
                'country'    => 'Philippines',
                'city'       => 'Manila',
                'barangay'   => 'Sampaloc',
            ]));
        }
    }
}