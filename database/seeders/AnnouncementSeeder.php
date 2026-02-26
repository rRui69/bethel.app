<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\Parish;
use App\Models\User;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        $parishMap = Parish::pluck('id', 'name');
        $admin     = User::where('role', 'super_admin')->first();

        $announcements = [
            [
                'parish_id'    => $parishMap['St. Peter Parish'],
                'user_id'      => $admin?->id,
                'title'        => 'Holy Week Schedule 2025',
                'excerpt'      => 'Special Holy Week celebrations from Palm Sunday through Easter Sunday.',
                'body'         => 'Join us for our special Holy Week celebrations. Masses will be held daily from Palm Sunday through Easter Sunday with special rites each evening. All parishioners are encouraged to participate.',
                'category'     => 'Liturgy',
                'status'       => 'Published',
                'published_at' => now()->subDays(2),
            ],
            [
                'parish_id'    => $parishMap['Sacred Heart Parish'],
                'user_id'      => $admin?->id,
                'title'        => 'Parish Fiesta: Patron Saint Feast Day',
                'excerpt'      => 'Celebrate with us! Join the procession, mass, and community lunch.',
                'body'         => 'Celebrate with us during our annual parish fiesta! Join the grand procession, solemn high mass, and community lunch. Activities for all ages will be available.',
                'category'     => 'Community',
                'status'       => 'Published',
                'published_at' => now()->subDays(5),
            ],
            [
                'parish_id'    => $parishMap['St. Mary Parish'],
                'user_id'      => $admin?->id,
                'title'        => 'Youth Ministry Retreat Registration Open',
                'excerpt'      => 'Registration is now open for the annual youth retreat. Limited slots available.',
                'body'         => 'Registration is now open for the annual youth retreat happening next month. Limited slots are available. Please register at the parish office or through BethelApp.',
                'category'     => 'Youth',
                'status'       => 'Published',
                'published_at' => now()->subDay(),
            ],
            [
                'parish_id'    => $parishMap['St. Joseph Parish'],
                'user_id'      => $admin?->id,
                'title'        => 'Baptism Orientation for New Parents',
                'excerpt'      => 'Mandatory orientation before baptismal scheduling. Couples must attend.',
                'body'         => 'New parents planning to have their child baptized must first attend our mandatory baptism orientation seminar. Please bring your marriage certificate and child\'s birth certificate.',
                'category'     => 'Parish News',
                'status'       => 'Published',
                'published_at' => now()->subDays(3),
            ],
        ];

        foreach ($announcements as $announcement) {
            Announcement::create($announcement);
        }
    }
}