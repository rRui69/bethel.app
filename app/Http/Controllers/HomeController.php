<?php

namespace App\Http\Controllers;

use App\Models\Parish;
use App\Models\Announcement;
use App\Models\Event;
use App\Models\User;
use App\Models\MassSchedule;
use Carbon\Carbon;

class HomeController extends Controller
{
    public function index()
    {
        // Parishes
        // Active parishes only, ordered by name, for search bar
        $parishes = Parish::active()
            ->select('id', 'name', 'city')
            ->orderBy('name')
            ->get()
            ->map(fn ($p) => [
                'id'       => $p->id,
                'name'     => $p->name,
                'location' => $p->city,
            ])
            ->toArray();

        // Announcements
        // Latest 4 published announcements for home page cards
        $announcements = Announcement::published()
            ->with('parish:id,name')
            ->select('id', 'parish_id', 'title', 'excerpt', 'category', 'image_path', 'published_at')
            ->latest('published_at')
            ->take(4)
            ->get()
            ->map(fn ($a) => [
                'id'       => $a->id,
                'title'    => $a->title,
                'excerpt'  => $a->excerpt,
                'category' => $a->category,
                'parish'   => $a->parish?->name,
                'date'     => $a->published_at?->toDateString(),
                'image'    => $a->image_path,
            ])
            ->toArray();

        // Mass Schedules — today's day + next 2 days, max 5 entries, for homepage widget
        $today     = Carbon::now();
        $todayDow  = $today->dayOfWeek; // 0=Sun

        $schedules = MassSchedule::active()
            ->with([
                'parish:id,name,city',
                'clergy:id,first_name,last_name',
                'clergy.clergyProfile:user_id,title',
            ])
            ->where(function ($q) use ($today, $todayDow) {
                // Recurring: today's day or next two days
                $q->where(function ($r) use ($todayDow) {
                    $r->where('schedule_type', 'recurring')
                      ->whereIn('day_of_week', [
                          $todayDow,
                          ($todayDow + 1) % 7,
                          ($todayDow + 2) % 7,
                      ]);
                })
                // One-time: within the next 3 days
                ->orWhere(function ($r) use ($today) {
                    $r->where('schedule_type', 'one_time')
                      ->whereBetween('specific_date', [
                          $today->toDateString(),
                          $today->copy()->addDays(2)->toDateString(),
                      ]);
                });
            })
            ->orderByRaw("FIELD(schedule_type, 'recurring', 'one_time')")
            ->orderBy('start_time')
            ->take(5)
            ->get()
            ->map(fn ($s) => [
                'day'       => $s->schedule_type === 'recurring'
                    ? $s->day_name
                    : $s->specific_date->format('l'),
                'time'      => $s->formatted_start_time,
                'type'      => $s->type,
                'parish'    => $s->parish?->name ?? '',
                'location'  => $s->parish?->city ?? '',
                'celebrant' => $s->clergy?->titled_name ?? '',
            ])
            ->toArray();

        // Upcoming Events
        // Regular (non-sacramental) approved events, upcoming, max 6
        $events = Event::regular()
            ->with('parish:id,name,city')
            ->where('status', 'Approved')
            ->upcoming()
            ->take(6)
            ->get()
            ->map(fn ($e) => [
                'id'       => $e->id,
                'title'    => $e->title,
                'type'     => $e->type,
                'date'     => $e->event_date->toDateString(),
                'time'     => $e->start_time
                                ? Carbon::createFromTimeString($e->start_time)->format('g:i A')
                                : 'TBA',
                'location' => $e->location ?? $e->parish?->city ?? '',
                'parish'   => $e->parish?->name ?? '',
            ])
            ->toArray();

        $pageData = compact('parishes', 'announcements', 'schedules', 'events');

        return view('parishioner.home', compact('pageData'));
    }
}