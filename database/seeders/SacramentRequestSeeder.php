<?php

namespace Database\Seeders;

use App\Models\SacramentRequest;
use App\Models\SacramentType;
use App\Models\User;
use App\Models\Parish;
use Illuminate\Database\Seeder;

class SacramentRequestSeeder extends Seeder
{
    public function run(): void
    {
        // Grab the seeded parishioners
        $juan  = User::where('username', 'juan.delacruz')->first();
        $maria = User::where('username', 'maria.santos')->first();
        $pedro = User::where('username', 'pedro.reyes')->first();

        // Grab parishes
        $stPeter     = Parish::where('name', 'St. Peter Parish')->first();
        $stMary      = Parish::where('name', 'St. Mary Parish')->first();
        $sacredHeart = Parish::where('name', 'Sacred Heart Parish')->first();
        $stoNino     = Parish::where('name', 'Sto. Niño Parish')->first();

        // ── Load sacrament types by slug for proper FK linking ──
        // This is the key fix: sacrament_type_id now points to sacrament_types table
        $types = SacramentType::pluck('id', 'name'); // ['Baptism' => 1, ...]

        $typeId = fn(string $name) => $types[$name] ?? null;

        $requests = [

            // ── Juan Dela Cruz ──────────────────────────────────
            [
                'user_id'           => $juan->id,
                'parish_id'         => $stPeter->id,
                'sacrament_type_id' => $typeId('Baptism'),
                'sacrament_type'    => 'Baptism',
                'preferred_date'    => now()->addDays(10)->toDateString(),
                'preferred_time'    => '09:00',
                'participants'      => 1,
                'status'            => 'pending',
                'admin_notes'       => null,
                'details'           => [
                    'f_bap1' => 'Luis Dela Cruz',
                    'f_bap2' => '2026-01-15',
                    'f_bap3' => 'Juan Dela Cruz',
                    'f_bap4' => 'Ana Garcia',
                    'f_bap5' => 'Roberto Santos',
                    'f_bap6' => 'Elena Reyes',
                ],
            ],
            [
                'user_id'           => $juan->id,
                'parish_id'         => $stPeter->id,
                'sacrament_type_id' => $typeId('Wedding'),
                'sacrament_type'    => 'Wedding',
                'preferred_date'    => now()->addDays(60)->toDateString(),
                'preferred_time'    => '10:00',
                'participants'      => 2,
                'status'            => 'approved',
                'admin_notes'       => 'Venue confirmed. Assigned to Fr. Santos.',
                'details'           => [
                    'f_wed1' => 'Ana Garcia',
                    'f_wed2' => 'Juan Dela Cruz',
                    'f_wed3' => 'Solemn Wedding',
                ],
            ],

            // ── Maria Santos ────────────────────────────────────
            [
                'user_id'           => $maria->id,
                'parish_id'         => $stMary->id,
                'sacrament_type_id' => $typeId('Confirmation'),
                'sacrament_type'    => 'Confirmation',
                'preferred_date'    => now()->addDays(20)->toDateString(),
                'preferred_time'    => '14:00',
                'participants'      => 1,
                'status'            => 'pending',
                'admin_notes'       => null,
                'details'           => [
                    'f_con1' => 'Teresa',
                    'f_con2' => 'Lola Cora Santos',
                ],
            ],
            [
                'user_id'           => $maria->id,
                'parish_id'         => $sacredHeart->id,
                'sacrament_type_id' => $typeId('Anointing of the Sick'),
                'sacrament_type'    => 'Anointing of the Sick',
                'preferred_date'    => now()->addDays(3)->toDateString(),
                'preferred_time'    => '08:00',
                'participants'      => 1,
                'status'            => 'approved',
                'admin_notes'       => 'Home visit confirmed. Deacon assigned.',
                'details'           => [
                    'f_ano1' => 'Lola Carmen Santos',
                    'f_ano2' => '45 Taft Ave, Manila',
                    'f_ano3' => 'Regular — Elderly care',
                    'f_ano4' => 'Recovering from hip surgery.',
                ],
            ],
            [
                'user_id'           => $maria->id,
                'parish_id'         => $stMary->id,
                'sacrament_type_id' => $typeId('Funeral Service'),
                'sacrament_type'    => 'Funeral Service',
                'preferred_date'    => now()->subDays(5)->toDateString(),
                'preferred_time'    => '09:00',
                'participants'      => 30,
                'status'            => 'rejected',
                'admin_notes'       => 'Date conflict with parish mission week. Requested to reschedule.',
                'details'           => [
                    'f_fun1' => 'Roberto Santos',
                    'f_fun2' => now()->subDays(6)->toDateString(),
                    'f_fun3' => 'Funeral Mass',
                    'f_fun4' => 'Manila North Cemetery',
                ],
            ],

            // ── Pedro Reyes ─────────────────────────────────────
            [
                'user_id'           => $pedro->id,
                'parish_id'         => $stoNino->id,
                'sacrament_type_id' => $typeId('Baptism'),
                'sacrament_type'    => 'Baptism',
                'preferred_date'    => now()->addDays(15)->toDateString(),
                'preferred_time'    => '11:00',
                'participants'      => 1,
                'status'            => 'pending',
                'admin_notes'       => null,
                'details'           => [
                    'f_bap1' => 'Sofia Reyes',
                    'f_bap2' => '2026-02-01',
                    'f_bap3' => 'Pedro Reyes',
                    'f_bap4' => 'Rosa Reyes',
                    'f_bap5' => 'Marco Villanueva',
                    'f_bap6' => 'Luz Mercado',
                ],
            ],
            [
                'user_id'           => $pedro->id,
                'parish_id'         => $sacredHeart->id,
                'sacrament_type_id' => $typeId('Blessing'),
                'sacrament_type'    => 'Blessing',
                'preferred_date'    => now()->addDays(7)->toDateString(),
                'preferred_time'    => '10:30',
                'participants'      => 5,
                'status'            => 'approved',
                'admin_notes'       => 'House blessing scheduled. Fr. Miguel assigned.',
                'details'           => [
                    'f_ble1' => 'House Blessing',
                    'f_ble2' => '88 Bel-Air Subdivision, Makati',
                    'f_ble3' => 'New home move-in blessing.',
                ],
            ],
            [
                'user_id'           => $pedro->id,
                'parish_id'         => $stoNino->id,
                'sacrament_type_id' => $typeId('Reconciliation'),
                'sacrament_type'    => 'Reconciliation',
                'preferred_date'    => now()->addDays(2)->toDateString(),
                'preferred_time'    => '15:00',
                'participants'      => 1,
                'status'            => 'pending',
                'admin_notes'       => null,
                'details'           => [
                    'f_rec1' => 'Individual Confession',
                    'f_rec2' => 'Requesting private confession before Easter.',
                ],
            ],
        ];

        foreach ($requests as $data) {
            SacramentRequest::create($data);
        }

        $this->command->info('SacramentRequestSeeder: 8 requests seeded with proper sacrament_type_id links.');
    }
}