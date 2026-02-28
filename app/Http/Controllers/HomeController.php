<?php

namespace App\Http\Controllers;

use App\Models\Parish;
use App\Models\Announcement;
use App\Models\Event;
use App\Models\Clergy;
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

        // Mass Schedules
        // Pull from clergy schedules
        // Each clergy has array { day, time, type } schedule entries.
        // Attach the parish name for display.
        $schedules = Clergy::with('parish:id,name,city')
            ->where('status', 'Active')
            ->whereNotNull('schedule')
            ->get()
            ->flatMap(function ($clergy) {
                $raw   = $clergy->getRawOriginal('schedule');
                $slots = is_array($clergy->schedule)
                    ? $clergy->schedule
                    : (json_decode($raw, true) ?? []);

                return collect($slots)->map(fn ($slot) => [
                    'day'       => $slot['day']  ?? '',
                    'time'      => $slot['time'] ?? '',
                    'type'      => $slot['type'] ?? 'Regular Mass',
                    'parish'    => $clergy->parish?->name ?? '',
                    'location'  => $clergy->parish?->city ?? '',
                    'celebrant' => $clergy->full_name,
                ]);
            })
            ->values()
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