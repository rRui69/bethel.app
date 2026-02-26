<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        /**
         * Placeholder data — replace with Eloquent models once DB is set up.
         * Pattern: pass structured arrays; React receives via window.__PAGE_DATA__
         */
        $pageData = [

            'parishes' => [
                ['id' => 1, 'name' => 'St. Peter Parish',       'location' => 'Quezon City'],
                ['id' => 2, 'name' => 'St. Mary Parish',        'location' => 'Manila'],
                ['id' => 3, 'name' => 'Sacred Heart Parish',    'location' => 'Makati'],
                ['id' => 4, 'name' => 'Sto. Niño Parish',       'location' => 'Pasig'],
                ['id' => 5, 'name' => 'St. Joseph Parish',      'location' => 'Taguig'],
                ['id' => 6, 'name' => 'Our Lady of Peace',      'location' => 'Antipolo'],
            ],

            'announcements' => [
                [
                    'id'      => 1,
                    'title'   => 'Holy Week Schedule 2025',
                    'excerpt' => 'Join us for our special Holy Week celebrations. Masses will be held daily from Palm Sunday through Easter Sunday with special rites each evening.',
                    'category'=> 'Liturgy',
                    'parish'  => 'St. Peter Parish',
                    'date'    => '2025-04-13',
                    'image'   => null,
                ],
                [
                    'id'      => 2,
                    'title'   => 'Parish Fiesta: Patron Saint Feast Day',
                    'excerpt' => 'Celebrate with us! Join the procession, mass, and community lunch.',
                    'category'=> 'Community',
                    'parish'  => 'Sacred Heart Parish',
                    'date'    => '2025-04-20',
                    'image'   => null,
                ],
                [
                    'id'      => 3,
                    'title'   => 'Youth Ministry Retreat Registration Open',
                    'excerpt' => 'Registration is now open for the annual youth retreat. Limited slots available.',
                    'category'=> 'Youth',
                    'parish'  => 'St. Mary Parish',
                    'date'    => '2025-04-25',
                    'image'   => null,
                ],
                [
                    'id'      => 4,
                    'title'   => 'Baptism Orientation for New Parents',
                    'excerpt' => 'Mandatory orientation before baptismal scheduling. Couples must attend.',
                    'category'=> 'Parish News',
                    'parish'  => 'St. Joseph Parish',
                    'date'    => '2025-04-28',
                    'image'   => null,
                ],
            ],

            'schedules' => [
                ['day' => 'Sunday',    'time' => '6:00 AM',  'type' => 'Regular Mass', 'parish' => 'St. Peter Parish',    'location' => 'Quezon City',  'celebrant' => 'Fr. Santos'],
                ['day' => 'Sunday',    'time' => '8:00 AM',  'type' => 'Regular Mass', 'parish' => 'St. Mary Parish',     'location' => 'Manila',       'celebrant' => 'Fr. Reyes'],
                ['day' => 'Sunday',    'time' => '10:00 AM', 'type' => 'Family Mass',  'parish' => 'Sacred Heart Parish', 'location' => 'Makati',       'celebrant' => 'Fr. Cruz'],
                ['day' => 'Sunday',    'time' => '12:00 PM', 'type' => 'Youth Mass',   'parish' => 'Sto. Niño Parish',    'location' => 'Pasig',        'celebrant' => 'Fr. Dela Cruz'],
                ['day' => 'Saturday',  'time' => '6:00 AM',  'type' => 'Regular Mass', 'parish' => 'St. Peter Parish',    'location' => 'Quezon City',  'celebrant' => 'Fr. Santos'],
                ['day' => 'Saturday',  'time' => '5:00 PM',  'type' => 'Anticipated',  'parish' => 'Sacred Heart Parish', 'location' => 'Makati',       'celebrant' => 'Fr. Cruz'],
                ['day' => 'Wednesday', 'time' => '6:00 AM',  'type' => 'Daily Mass',   'parish' => 'St. Mary Parish',     'location' => 'Manila',       'celebrant' => 'Fr. Reyes'],
                ['day' => 'Wednesday', 'time' => '6:00 PM',  'type' => 'Evening Mass', 'parish' => 'St. Peter Parish',    'location' => 'Quezon City',  'celebrant' => 'Fr. Santos'],
                ['day' => 'Friday',    'time' => '6:00 AM',  'type' => 'Daily Mass',   'parish' => 'St. Joseph Parish',   'location' => 'Taguig',       'celebrant' => 'Fr. Villanueva'],
            ],

            'events' => [
                [
                    'id'       => 1,
                    'title'    => 'Stations of the Cross',
                    'type'     => 'Liturgy',
                    'date'     => '2025-04-11',
                    'time'     => '5:00 PM',
                    'location' => 'St. Peter Parish, QC',
                    'parish'   => 'St. Peter Parish',
                ],
                [
                    'id'       => 2,
                    'title'    => 'Parish Leadership Summit',
                    'type'     => 'Community',
                    'date'     => '2025-04-19',
                    'time'     => '9:00 AM – 4:00 PM',
                    'location' => 'Sacred Heart Parish Hall, Makati',
                    'parish'   => 'Sacred Heart Parish',
                ],
                [
                    'id'       => 3,
                    'title'    => 'Youth Group Fellowship Night',
                    'type'     => 'Youth',
                    'date'     => '2025-04-26',
                    'time'     => '7:00 PM',
                    'location' => 'St. Mary Parish Hall, Manila',
                    'parish'   => 'St. Mary Parish',
                ],
                [
                    'id'       => 4,
                    'title'    => 'Pre-Baptism Seminar',
                    'type'     => 'Sacramental',
                    'date'     => '2025-04-30',
                    'time'     => '10:00 AM',
                    'location' => 'St. Joseph Parish, Taguig',
                    'parish'   => 'St. Joseph Parish',
                ],
                [
                    'id'       => 5,
                    'title'    => 'Marriage Encounter Weekend',
                    'type'     => 'Sacramental',
                    'date'     => '2025-05-03',
                    'time'     => 'All Day',
                    'location' => 'Our Lady of Peace, Antipolo',
                    'parish'   => 'Our Lady of Peace',
                ],
                [
                    'id'       => 6,
                    'title'    => 'Choir Competition Inter-Parish',
                    'type'     => 'Community',
                    'date'     => '2025-05-10',
                    'time'     => '2:00 PM',
                    'location' => 'Sto. Niño Parish, Pasig',
                    'parish'   => 'Sto. Niño Parish',
                ],
            ],
        ];

        return view('parishioner.home', compact('pageData'));
    }
}