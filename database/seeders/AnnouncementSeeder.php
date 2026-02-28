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
        $helpdesk  = User::where('role', 'parish_admin')->first();

        $announcements = [

            // Liturgy
            [
                'parish_id'    => $parishMap['St. Peter Parish'],
                'user_id'      => $admin?->id,
                'title'        => 'Holy Week Schedule — Complete Timetable',
                'excerpt'      => 'Full schedule for Palm Sunday, Holy Thursday, Good Friday, and Easter Vigil. All parishioners are warmly invited.',
                'body'         => 'Join us for our special Holy Week celebrations. Masses will be held daily from Palm Sunday through Easter Sunday with special rites each evening. Palm Sunday: 8:00 AM & 10:00 AM. Holy Thursday: 6:00 PM Mass of the Lord\'s Supper. Good Friday: 3:00 PM Commemoration of the Lord\'s Passion. Easter Vigil: 8:00 PM. Easter Sunday: 6:00 AM, 8:00 AM, 10:00 AM, 12:00 PM.',
                'category'     => 'Liturgy',
                'status'       => 'Published',
                'published_at' => now()->subDays(1),
            ],
            [
                'parish_id'    => $parishMap['Sacred Heart Parish'],
                'user_id'      => $helpdesk?->id,
                'title'        => 'Advent Season: Special Evening Masses Begin',
                'excerpt'      => 'Simbang Gabi novena masses start December 16. Join us each evening at 6:00 PM for the traditional Misa de Gallo.',
                'body'         => 'The Advent Season is upon us. Beginning December 16, Sacred Heart Parish will hold the traditional Simbang Gabi — nine consecutive evening masses leading to Christmas. Each mass begins at 6:00 PM and will be followed by community fellowship. All are welcome.',
                'category'     => 'Liturgy',
                'status'       => 'Published',
                'published_at' => now()->subDays(4),
            ],

            // Community
            [
                'parish_id'    => $parishMap['Sacred Heart Parish'],
                'user_id'      => $admin?->id,
                'title'        => 'Parish Fiesta: Patron Saint Feast Day Celebration',
                'excerpt'      => 'Celebrate with us! Join the solemn procession, high mass, and community lunch. Fun activities for all ages.',
                'body'         => 'Celebrate with us during our annual parish fiesta in honor of our Patron Saint! The celebration begins with a solemn procession at 7:00 AM, followed by a solemn high mass at 9:00 AM. A community lunch will be held in the parish hall afterwards. Games and activities for children will be available throughout the day. Everyone is welcome.',
                'category'     => 'Community',
                'status'       => 'Published',
                'published_at' => now()->subDays(5),
            ],
            [
                'parish_id'    => $parishMap['Sto. Niño Parish'],
                'user_id'      => $helpdesk?->id,
                'title'        => 'Inter-Parish Charity Drive: Help Typhoon Victims',
                'excerpt'      => 'Drop off relief goods at any parish office until the end of the month. Every donation counts.',
                'body'         => 'Our diocesan community is rallying together to help families affected by the recent typhoon. Relief goods including canned goods, bottled water, clothing, and hygiene kits are being collected at all parish offices. Drop-off hours are 8:00 AM to 5:00 PM daily. Cash donations may also be given at the parish office. All goods will be distributed by the end of the month.',
                'category'     => 'Community',
                'status'       => 'Published',
                'published_at' => now()->subDays(7),
            ],

            // Youth
            [
                'parish_id'    => $parishMap['St. Mary Parish'],
                'user_id'      => $helpdesk?->id,
                'title'        => 'Youth Ministry Annual Retreat — Registration Now Open',
                'excerpt'      => 'Limited slots available for the 3-day retreat. Theme: "Rooted in Faith." Register at the parish office.',
                'body'         => 'Registration is now open for the St. Mary Parish Youth Ministry Annual Retreat. This year\'s theme is "Rooted in Faith" and will be held over 3 days at the Tagaytay Retreat House. The retreat includes talks, worship, small group sharing, and outdoor team-building activities. Only 40 slots are available. To register, visit the parish office and submit your registration form with a P500 reservation fee. Ages 15–25.',
                'category'     => 'Youth',
                'status'       => 'Published',
                'published_at' => now()->subDays(2),
            ],
            [
                'parish_id'    => $parishMap['Our Lady of Peace Parish'],
                'user_id'      => $admin?->id,
                'title'        => 'Youth Leadership Formation Program — Batch 12',
                'excerpt'      => 'Applications open for the next batch of the Youth Leadership Formation Program. Build your faith and leadership skills.',
                'body'         => 'Our Lady of Peace Parish is now accepting applications for Batch 12 of the Youth Leadership Formation Program (YLFP). The program runs for 6 months and covers Catholic social teaching, servant leadership, community organizing, and spiritual direction. Applicants must be between 18–30 years old and active parish youth members. Submit your application letter and baptismal certificate to the parish office by the end of the month.',
                'category'     => 'Youth',
                'status'       => 'Published',
                'published_at' => now()->subDays(6),
            ],

            // Parish News
            [
                'parish_id'    => $parishMap['St. Joseph Parish'],
                'user_id'      => $admin?->id,
                'title'        => 'Baptism Orientation for New Parents — Monthly Schedule',
                'excerpt'      => 'Mandatory orientation every first Saturday of the month. Bring your baby\'s birth certificate and your marriage certificate.',
                'body'         => 'All parents wishing to schedule a baptism for their child must first attend the mandatory Baptism Orientation Seminar held every first Saturday of the month at 9:00 AM in the parish hall. Please bring the following: child\'s birth certificate (original + photocopy), parents\' marriage certificate (original + photocopy), and a list of chosen godparents with their contact numbers. Baptisms will only be scheduled after orientation is completed.',
                'category'     => 'Parish News',
                'status'       => 'Published',
                'published_at' => now()->subDays(3),
            ],
            [
                'parish_id'    => $parishMap['St. Peter Parish'],
                'user_id'      => $helpdesk?->id,
                'title'        => 'Parish Office New Operating Hours',
                'excerpt'      => 'Effective immediately: the parish office is open Monday to Saturday, 8:00 AM to 5:00 PM. Closed on Sundays.',
                'body'         => 'Please be informed that the parish office has updated its operating hours effective immediately. New hours: Monday to Friday — 8:00 AM to 5:00 PM. Saturday — 8:00 AM to 12:00 PM. Closed on Sundays and holidays. All sacramental requests, document certifications, and inquiries should be filed during these hours. For urgent matters, please contact us via email or through BethelApp.',
                'category'     => 'Parish News',
                'status'       => 'Published',
                'published_at' => now()->subDays(8),
            ],

            // General 
            [
                'parish_id'    => $parishMap['St. Mary Parish'],
                'user_id'      => $admin?->id,
                'title'        => 'BethelApp Now Live — Manage Your Sacraments Online',
                'excerpt'      => 'You can now request baptisms, weddings, and confirmations through BethelApp. Easier, faster, and paperless.',
                'body'         => 'We are pleased to announce that BethelApp is now officially live for all parishioners. Through BethelApp, you can: view mass schedules and parish events, request sacramental services such as baptisms, weddings, and confirmations, receive parish announcements in real time, and submit requirements digitally. Download the app or access it at bethelapp.com. For assistance, visit the parish office or contact the Ministerial IT Helpdesk.',
                'category'     => 'General',
                'status'       => 'Published',
                'published_at' => now()->subDays(10),
            ],
        ];

        foreach ($announcements as $announcement) {
            Announcement::create($announcement);
        }
    }
}