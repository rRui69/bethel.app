<?php

namespace Database\Seeders;

use App\Models\SacramentRequest;
use App\Models\User;
use App\Models\Parish;
use Illuminate\Database\Seeder;

class SacramentRequestSeeder extends Seeder
{
    public function run(): void
    {
        // Grab the seeded parishioners by username so IDs don't need to be hardcoded
        $juan  = User::where('username', 'juan.delacruz')->first();
        $maria = User::where('username', 'maria.santos')->first();
        $pedro = User::where('username', 'pedro.reyes')->first();

        // Grab parishes by name
        $stPeter     = Parish::where('name', 'St. Peter Parish')->first();
        $stMary      = Parish::where('name', 'St. Mary Parish')->first();
        $sacredHeart = Parish::where('name', 'Sacred Heart Parish')->first();
        $stoNino     = Parish::where('name', 'Sto. Niño Parish')->first();

        $requests = [

            // ── Juan Dela Cruz ──────────────────────────────────────────
            [
                'user_id'        => $juan->id,
                'parish_id'      => $stPeter->id,
                'sacrament_type' => 'Baptism',
                'preferred_date' => now()->addDays(10)->setTime(9, 0),
                'status'         => 'pending',
                'admin_notes'    => null,
                'details'        => [
                    'child_name'    => 'Luis Dela Cruz',
                    'date_of_birth' => '2026-01-15',
                    'godparents'    => 'Roberto Santos, Elena Reyes',
                    'notes'         => 'First child, requesting morning slot.',
                ],
            ],
            [
                'user_id'        => $juan->id,
                'parish_id'      => $stPeter->id,
                'sacrament_type' => 'Wedding',
                'preferred_date' => now()->addDays(60)->setTime(10, 0),
                'status'         => 'approved',
                'admin_notes'    => 'Venue confirmed. Assigned to Fr. Santos.',
                'details'        => [
                    'bride_name'   => 'Ana Garcia',
                    'groom_name'   => 'Juan Dela Cruz',
                    'sponsors'     => 'Mr. & Mrs. Reyes, Mr. & Mrs. Bautista',
                    'reception'    => 'La Piazza Events Hall, Quezon City',
                ],
            ],

            // ── Maria Santos ────────────────────────────────────────────
            [
                'user_id'        => $maria->id,
                'parish_id'      => $stMary->id,
                'sacrament_type' => 'Confirmation',
                'preferred_date' => now()->addDays(20)->setTime(14, 0),
                'status'         => 'pending',
                'admin_notes'    => null,
                'details'        => [
                    'confirmand_name'  => 'Maria Santos',
                    'sponsor_name'     => 'Lola Cora Santos',
                    'confirmation_name'=> 'Teresa',
                    'notes'            => 'Batch confirmation with school.',
                ],
            ],
            [
                'user_id'        => $maria->id,
                'parish_id'      => $sacredHeart->id,
                'sacrament_type' => 'Anointing of the Sick',
                'preferred_date' => now()->addDays(3)->setTime(8, 0),
                'status'         => 'approved',
                'admin_notes'    => 'Home visit confirmed. Deacon assigned.',
                'details'        => [
                    'patient_name'    => 'Lola Carmen Santos',
                    'patient_age'     => '82',
                    'address'         => '45 Taft Ave, Manila',
                    'contact_person'  => 'Maria Santos',
                    'condition'       => 'Recovering from hip surgery.',
                ],
            ],
            [
                'user_id'        => $maria->id,
                'parish_id'      => $stMary->id,
                'sacrament_type' => 'Funeral Service',
                'preferred_date' => now()->subDays(5)->setTime(9, 0),
                'status'         => 'rejected',
                'admin_notes'    => 'Date conflict with parish mission week. Requested to reschedule.',
                'details'        => [
                    'deceased_name' => 'Roberto Santos',
                    'date_of_death' => now()->subDays(6)->toDateString(),
                    'burial_place'  => 'Manila North Cemetery',
                    'notes'         => 'Family requesting full funeral mass.',
                ],
            ],

            // ── Pedro Reyes ─────────────────────────────────────────────
            [
                'user_id'        => $pedro->id,
                'parish_id'      => $stoNino->id,
                'sacrament_type' => 'Baptism',
                'preferred_date' => now()->addDays(15)->setTime(11, 0),
                'status'         => 'pending',
                'admin_notes'    => null,
                'details'        => [
                    'child_name'    => 'Sofia Reyes',
                    'date_of_birth' => '2026-02-01',
                    'godparents'    => 'Marco Villanueva, Luz Mercado',
                    'notes'         => 'Second child.',
                ],
            ],
            [
                'user_id'        => $pedro->id,
                'parish_id'      => $sacredHeart->id,
                'sacrament_type' => 'Blessing',
                'preferred_date' => now()->addDays(7)->setTime(10, 30),
                'status'         => 'approved',
                'admin_notes'    => 'House blessing scheduled. Fr. Miguel assigned.',
                'details'        => [
                    'type_of_blessing' => 'House Blessing',
                    'address'          => '88 Bel-Air Subdivision, Makati',
                    'occasion'         => 'New home move-in blessing.',
                ],
            ],
            [
                'user_id'        => $pedro->id,
                'parish_id'      => $stoNino->id,
                'sacrament_type' => 'Reconciliation',
                'preferred_date' => now()->addDays(2)->setTime(15, 0),
                'status'         => 'pending',
                'admin_notes'    => null,
                'details'        => [
                    'penitent_name' => 'Pedro Reyes',
                    'notes'         => 'Requesting private confession before Easter.',
                ],
            ],
        ];

        foreach ($requests as $data) {
            SacramentRequest::create($data);
        }
    }
}