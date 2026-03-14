<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Event;
use App\Models\Livestream;
use App\Models\MassSchedule;
use App\Models\Parish;
use App\Models\SacramentRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class PublicParishController extends Controller
{
    // ── GET /parish/{parish} ──────────────────────────────────────
    public function show(Parish $parish)
    {
        abort_if($parish->status !== 'Active', 404);

        $pageData = $this->buildPageData($parish);

        return view('parishioner.parish', compact('pageData'));
    }

    // ── GET /api/public/parish/{parish} ───────────────────────────
    // Available for future AJAX refresh without full page reload.
    public function data(Parish $parish): JsonResponse
    {
        abort_if($parish->status !== 'Active', 404);

        return response()->json($this->buildPageData($parish));
    }

    // ── Private: assemble all data for the parish page ────────────
    private function buildPageData(Parish $parish): array
    {
        // ── Parish core ──────────────────────────────────────────
        $parishData = [
            'id'          => $parish->id,
            'name'        => $parish->name,
            'diocese'     => $parish->diocese,
            'address'     => $parish->full_address,
            'phone'       => $parish->phone,
            'email'       => $parish->email,
            'description' => $parish->description,
            'images'      => $parish->images()
                ->orderBy('sort_order')
                ->pluck('image_url')
                ->toArray(),
        ];

        // ── Announcements ────────────────────────────────────────
        // Latest 20 published announcements for this parish
        $announcements = Announcement::published()
            ->where('parish_id', $parish->id)
            ->select('id', 'title', 'excerpt', 'category', 'image_path', 'published_at')
            ->latest('published_at')
            ->take(20)
            ->get()
            ->map(fn ($a) => [
                'id'       => $a->id,
                'title'    => $a->title,
                'excerpt'  => $a->excerpt,
                'category' => $a->category,
                'image'    => $a->image_path,   // full Cloudinary URL
                'date'     => $a->published_at?->toDateString(),
            ])
            ->toArray();

        // ── Events ───────────────────────────────────────────────
        // Upcoming approved non-sacramental events for this parish
        $events = Event::regular()
            ->where('parish_id', $parish->id)
            ->where('status', 'Approved')
            ->upcoming()
            ->select('id', 'title', 'type', 'event_date', 'start_time', 'end_time', 'location')
            ->take(50)
            ->get()
            ->map(fn ($e) => [
                'id'       => $e->id,
                'title'    => $e->title,
                'type'     => $e->type,
                'date'     => $e->event_date->toDateString(),         // YYYY-MM-DD
                'time'     => $e->start_time
                    ? Carbon::createFromTimeString($e->start_time)->format('g:i A')
                    : null,
                'end_time' => $e->end_time
                    ? Carbon::createFromTimeString($e->end_time)->format('g:i A')
                    : null,
                'location' => $e->location ?? '',
            ])
            ->toArray();

        // ── Mass Schedules ───────────────────────────────────────
        // All active mass schedules for this parish (recurring + one-time).
        // Recurring entries are projected onto calendar dates by the React component.
        $massSchedules = MassSchedule::active()
            ->where('parish_id', $parish->id)
            ->with([
                'clergy:id,first_name,last_name',
                'clergy.clergyProfile:user_id,title',
            ])
            ->get()
            ->map(fn ($s) => [
                'id'            => $s->id,
                'type'          => $s->type,
                'schedule_type' => $s->schedule_type,          // 'recurring' | 'one_time'
                'day_of_week'   => $s->day_of_week,            // 0–6; only for recurring
                'day_name'      => $s->day_name,
                'specific_date' => $s->specific_date?->toDateString(), // only for one_time
                'start_time'    => $s->formatted_start_time,
                'end_time'      => $s->formatted_end_time,
                'clergy_id'     => $s->clergy_id,
                'celebrant'     => $s->clergy?->titled_name ?? '',
                'notes'         => $s->notes,
            ])
            ->toArray();

        // ── Clergy ───────────────────────────────────────────────
        // Active clergy assigned to this parish.
        // age is computed from birth_date (Carbon accessor).
        $clergy = User::where('parish_id', $parish->id)
            ->where('role', 'clergymen')
            ->where('account_status', 'Active')
            ->with('clergyProfile:user_id,title,specialization,bio,image_url')
            ->select('id', 'first_name', 'last_name', 'birth_date')
            ->orderBy('last_name')
            ->get()
            ->map(fn ($u) => [
                'id'             => $u->id,
                'name'           => $u->full_name,
                'titled_name'    => $u->clergyProfile
                    ? "{$u->clergyProfile->title} {$u->full_name}"
                    : $u->full_name,
                'title'          => $u->clergyProfile?->title ?? '',
                'specialization' => $u->clergyProfile?->specialization ?? '',
                'bio'            => $u->clergyProfile?->bio ?? '',
                'image'          => $u->clergyProfile?->image_url ?? null,
                'age'            => $u->birth_date
                    ? Carbon::parse($u->birth_date)->age
                    : null,
            ])
            ->toArray();

        // ── Livestreams ──────────────────────────────────────────
        // Active live streams (global — no parish_id on livestreams yet).
        $livestreams = Livestream::where('status', 'live')
            ->select('id', 'title', 'description', 'type', 'facebook_url', 'agora_channel')
            ->latest('started_at')
            ->get()
            ->map(fn ($s) => [
                'id'            => $s->id,
                'title'         => $s->title,
                'description'   => $s->description,
                'type'          => $s->type,
                'facebook_url'  => $s->facebook_url,
                'agora_channel' => $s->agora_channel,
            ])
            ->toArray();

        return compact(
            'parishData',
            'announcements',
            'events',
            'massSchedules',
            'clergy',
            'livestreams'
        );
    }
}