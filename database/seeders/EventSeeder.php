<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Parish;
use App\Models\Clergy;
use App\Models\User;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $parishMap   = Parish::pluck('id', 'name');
        $clergyMap   = Clergy::pluck('id', 'last_name');
        $parishioner = User::where('role', 'parishioner')->first();

        $events = [

            // ══════════════════════════════════════════════════════════════
            // REGULAR EVENTS — shown on the public home page
            // Must be: type IN (Community, Liturgy, Youth) + status=Approved
            // + event_date >= today
            // ══════════════════════════════════════════════════════════════

            // Liturgy
            [
                'parish_id'   => $parishMap['St. Peter Parish'],
                'user_id'     => null,
                'clergy_id'   => $clergyMap['Santos'],
                'title'       => 'Stations of the Cross',
                'description' => 'Weekly Stations of the Cross every Friday during Lent. A meditative walk through the 14 stations.',
                'type'        => 'Liturgy',
                'event_date'  => now()->addDays(3)->toDateString(),
                'start_time'  => '17:00:00',
                'end_time'    => '18:30:00',
                'location'    => 'St. Peter Parish Chapel',
                'status'      => 'Approved',
            ],
            [
                'parish_id'   => $parishMap['Sacred Heart Parish'],
                'user_id'     => null,
                'clergy_id'   => $clergyMap['Cruz'],
                'title'       => 'Eucharistic Adoration Night',
                'description' => 'Monthly all-night Eucharistic adoration open to all parishioners. Bring your prayer intentions.',
                'type'        => 'Liturgy',
                'event_date'  => now()->addDays(7)->toDateString(),
                'start_time'  => '20:00:00',
                'end_time'    => '23:00:00',
                'location'    => 'Sacred Heart Parish Main Church',
                'status'      => 'Approved',
            ],
            [
                'parish_id'   => $parishMap['St. Mary Parish'],
                'user_id'     => null,
                'clergy_id'   => $clergyMap['Reyes'],
                'title'       => 'Penitential Rite & Communal Confession',
                'description' => 'Communal celebration of the Sacrament of Reconciliation. Multiple confessors will be available.',
                'type'        => 'Liturgy',
                'event_date'  => now()->addDays(12)->toDateString(),
                'start_time'  => '16:00:00',
                'end_time'    => '18:00:00',
                'location'    => 'St. Mary Parish',
                'status'      => 'Approved',
            ],

            // Community
            [
                'parish_id'   => $parishMap['Sacred Heart Parish'],
                'user_id'     => null,
                'clergy_id'   => null,
                'title'       => 'Parish Leadership Summit 2025',
                'description' => 'Annual gathering of parish leaders, ministry heads, and volunteers to plan the year ahead.',
                'type'        => 'Community',
                'event_date'  => now()->addDays(10)->toDateString(),
                'start_time'  => '09:00:00',
                'end_time'    => '16:00:00',
                'location'    => 'Sacred Heart Parish Hall',
                'status'      => 'Approved',
            ],
            [
                'parish_id'   => $parishMap['Sto. Niño Parish'],
                'user_id'     => null,
                'clergy_id'   => $clergyMap['Dela Cruz'],
                'title'       => 'Inter-Parish Choir Competition',
                'description' => 'Annual singing competition open to all parish choirs. Categories: Children, Adults, and Mixed.',
                'type'        => 'Community',
                'event_date'  => now()->addDays(21)->toDateString(),
                'start_time'  => '14:00:00',
                'end_time'    => '19:00:00',
                'location'    => 'Sto. Niño Parish Covered Court',
                'status'      => 'Approved',
            ],
            [
                'parish_id'   => $parishMap['Our Lady of Peace Parish'],
                'user_id'     => null,
                'clergy_id'   => null,
                'title'       => 'Pilgrimage to Antipolo Shrine',
                'description' => 'Join the parish pilgrimage to Our Lady of Peace and Good Voyage Shrine. Transportation provided.',
                'type'        => 'Community',
                'event_date'  => now()->addDays(28)->toDateString(),
                'start_time'  => '06:00:00',
                'end_time'    => '17:00:00',
                'location'    => 'Antipolo Shrine, Rizal',
                'status'      => 'Approved',
            ],

            // Youth
            [
                'parish_id'   => $parishMap['St. Mary Parish'],
                'user_id'     => null,
                'clergy_id'   => $clergyMap['Reyes'],
                'title'       => 'Youth Group Fellowship Night',
                'description' => 'Monthly fellowship for the parish youth ministry. Games, worship, and sharing.',
                'type'        => 'Youth',
                'event_date'  => now()->addDays(14)->toDateString(),
                'start_time'  => '19:00:00',
                'end_time'    => '21:00:00',
                'location'    => 'St. Mary Parish Hall',
                'status'      => 'Approved',
            ],
            [
                'parish_id'   => $parishMap['St. Peter Parish'],
                'user_id'     => null,
                'clergy_id'   => $clergyMap['Santos'],
                'title'       => 'Youth Recollection Day',
                'description' => 'A day of prayer and reflection for youth ages 13-25. Theme: "Be Not Afraid."',
                'type'        => 'Youth',
                'event_date'  => now()->addDays(18)->toDateString(),
                'start_time'  => '08:00:00',
                'end_time'    => '17:00:00',
                'location'    => 'St. Peter Parish Hall',
                'status'      => 'Approved',
            ],
            [
                'parish_id'   => $parishMap['Sacred Heart Parish'],
                'user_id'     => null,
                'clergy_id'   => null,
                'title'       => 'Youth Sports Fest — Volleyball & Basketball',
                'description' => 'Inter-barangay youth sports competition. Open to all youth ministry members aged 16–25.',
                'type'        => 'Youth',
                'event_date'  => now()->addDays(35)->toDateString(),
                'start_time'  => '08:00:00',
                'end_time'    => '17:00:00',
                'location'    => 'Sacred Heart Parish Covered Court',
                'status'      => 'Approved',
            ],

            // ══════════════════════════════════════════════════════════════
            // SACRAMENTAL REQUESTS — visible in admin dashboard
            // Not shown on public home page
            // ══════════════════════════════════════════════════════════════

            [
                'parish_id'         => $parishMap['St. Peter Parish'],
                'user_id'           => $parishioner?->id,
                'clergy_id'         => $clergyMap['Santos'],
                'title'             => 'Baptism Request — Baby Juan dela Cruz',
                'description'       => 'Baptism for newborn Juan dela Cruz.',
                'type'              => 'Baptism',
                'event_date'        => now()->addDays(20)->toDateString(),
                'start_time'        => '10:00:00',
                'location'          => 'St. Peter Parish',
                'status'            => 'Pending',
                'sacrament_details' => json_encode([
                    'child_name' => 'Juan dela Cruz',
                    'parents'    => 'Pedro & Maria dela Cruz',
                    'godparents' => ['Jose Rizal', 'Andres Bonifacio'],
                ]),
            ],
            [
                'parish_id'         => $parishMap['Sacred Heart Parish'],
                'user_id'           => $parishioner?->id,
                'clergy_id'         => $clergyMap['Cruz'],
                'title'             => 'Marriage Request — Dela Cruz & Santos',
                'description'       => 'Wedding ceremony for couple.',
                'type'              => 'Marriage',
                'event_date'        => now()->addDays(45)->toDateString(),
                'start_time'        => '09:00:00',
                'location'          => 'Sacred Heart Parish',
                'status'            => 'Pending',
                'sacrament_details' => json_encode([
                    'groom'    => 'Pedro Dela Cruz',
                    'bride'    => 'Ana Santos',
                    'sponsors' => ['Mr. Juan Reyes', 'Mrs. Rosa Garcia'],
                ]),
            ],
            [
                'parish_id'         => $parishMap['St. Mary Parish'],
                'user_id'           => $parishioner?->id,
                'clergy_id'         => $clergyMap['Reyes'],
                'title'             => 'Confirmation Request — Maria Santos',
                'description'       => 'Confirmation sacrament for Maria Santos.',
                'type'              => 'Confirmation',
                'event_date'        => now()->addDays(30)->toDateString(),
                'start_time'        => '14:00:00',
                'location'          => 'St. Mary Parish',
                'status'            => 'Approved',
                'sacrament_details' => json_encode([
                    'candidate' => 'Maria Santos',
                    'sponsor'   => 'Lola Rosa Santos',
                ]),
            ],
            [
                'parish_id'         => $parishMap['Our Lady of Peace Parish'],
                'user_id'           => $parishioner?->id,
                'clergy_id'         => $clergyMap['Villanueva'],
                'title'             => 'Anointing Request — Lolo Jose Reyes',
                'description'       => 'Anointing of the Sick for elderly patient.',
                'type'              => 'Anointing',
                'event_date'        => now()->addDays(3)->toDateString(),
                'start_time'        => '10:00:00',
                'location'          => 'Residence — Antipolo',
                'status'            => 'Pending',
                'sacrament_details' => json_encode([
                    'patient'   => 'Jose Reyes',
                    'condition' => 'Critically ill',
                    'contact'   => '09171234567',
                ]),
            ],
        ];

        foreach ($events as $event) {
            Event::create($event);
        }
    }
}