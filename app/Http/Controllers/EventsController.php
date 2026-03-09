<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Parish;
use Carbon\Carbon;

class EventsController extends Controller
{
    public function index()
    {
        $events = Event::regular()
            ->with(['parish:id,name,city', 'clergy:id,first_name,last_name', 'clergy.clergyProfile:user_id,title'])
            ->where('status', 'Approved')
            ->upcoming()
            ->get()
            ->map(fn ($e) => [
                'id'          => $e->id,
                'title'       => $e->title,
                'description' => $e->description,
                'type'        => $e->type,
                'date'        => $e->event_date->format('Y-m-d'),
                'date_display'=> $e->event_date->format('M d, Y'),
                'day'         => $e->event_date->format('D'),
                'month'       => $e->event_date->format('M'),
                'day_num'     => $e->event_date->format('d'),
                'time'        => $e->start_time
                                    ? Carbon::createFromTimeString($e->start_time)->format('g:i A')
                                    : 'TBA',
                'end_time'    => $e->end_time
                                    ? Carbon::createFromTimeString($e->end_time)->format('g:i A')
                                    : null,
                'location'    => $e->location,
                'parish'      => $e->parish?->name,
                'city'        => $e->parish?->city,
                'celebrant'   => $e->clergy?->titled_name,
            ])
            ->toArray();

        $pageData = [
            'events' => $events,
            'types'  => ['All', 'Community', 'Liturgy', 'Youth'],
        ];

        return view('parishioner.events', compact('pageData'));
    }

    public function show(Event $event)
    {
        abort_unless($event->status === 'Approved' && $event->isRegular(), 404);

        $event->load(['parish:id,name,city', 'clergy:id,first_name,last_name', 'clergy.clergyProfile:user_id,title']);

        $pageData = [
            'event' => [
                'id'           => $event->id,
                'title'        => $event->title,
                'description'  => $event->description,
                'type'         => $event->type,
                'date_display' => $event->event_date->format('F d, Y'),
                'day'          => $event->event_date->format('l'),
                'month'        => $event->event_date->format('M'),
                'day_num'      => $event->event_date->format('d'),
                'time'         => $event->start_time
                                    ? \Carbon\Carbon::createFromTimeString($event->start_time)->format('g:i A')
                                    : null,
                'end_time'     => $event->end_time
                                    ? \Carbon\Carbon::createFromTimeString($event->end_time)->format('g:i A')
                                    : null,
                'location'     => $event->location,
                'parish'       => $event->parish?->name,
                'city'         => $event->parish?->city,
                'celebrant'    => $event->clergy?->titled_name,
            ],
        ];

        return view('parishioner.event-detail', compact('pageData'));
    }
}