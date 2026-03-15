<?php

namespace App\Http\Controllers;

use App\Models\MassSchedule;
use App\Models\Parish;
use App\Models\SacramentRequest;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class PublicClergyController extends Controller
{
    // ── GET /parish/{parish}/clergy/{user} ────────────────────────
    public function show(Parish $parish, User $user)
    {
        $this->guardAccess($parish, $user);

        $pageData = $this->buildPageData($parish, $user);

        return view('parishioner.clergy-profile', compact('pageData'));
    }

    // ── GET /api/public/parish/{parish}/clergy/{user} ─────────────
    public function data(Parish $parish, User $user): JsonResponse
    {
        $this->guardAccess($parish, $user);

        return response()->json($this->buildPageData($parish, $user));
    }

    // ── Guard: parish active, user is active clergy in that parish ─
    private function guardAccess(Parish $parish, User $user): void
    {
        abort_if($parish->status !== 'Active', 404);
        abort_if($user->role !== 'clergymen', 404);
        abort_if($user->account_status !== 'Active', 404);
        abort_if((int) $user->parish_id !== (int) $parish->id, 404);
    }

    // ── Assemble page data ────────────────────────────────────────
    private function buildPageData(Parish $parish, User $user): array
    {
        // Eager-load the profile in one query
        $user->load('clergyProfile:user_id,title,custom_title,specialization,bio,image_url');

        // ── Clergy core ──────────────────────────────────────────
        $clergyData = [
            'id'             => $user->id,
            'name'           => $user->full_name,
            'titled_name'    => $user->titled_name,
            'title'          => $user->clergyProfile?->title ?? '',
            'custom_title'   => $user->clergyProfile?->custom_title ?? '',
            'specialization' => $user->clergyProfile?->specialization ?? '',
            'bio'            => $user->clergyProfile?->bio ?? '',
            'image'          => $user->clergyProfile?->image_url ?? null,
            'age'            => $user->birth_date
                ? Carbon::parse($user->birth_date)->age
                : null,
        ];

        // ── Parish breadcrumb data ───────────────────────────────
        $parishData = [
            'id'   => $parish->id,
            'name' => $parish->name,
        ];

        // ── Mass schedules assigned to this clergy in this parish ─
        // Recurring + one-time; same shape as PublicParishController
        $massSchedules = MassSchedule::active()
            ->where('clergy_id', $user->id)
            ->where('parish_id', $parish->id)
            ->get()
            ->map(fn ($s) => [
                'id'            => $s->id,
                'type'          => $s->type,
                'schedule_type' => $s->schedule_type,
                'day_of_week'   => $s->day_of_week,
                'day_name'      => $s->day_name,
                'specific_date' => $s->specific_date?->toDateString(),
                'start_time'    => $s->formatted_start_time,
                'end_time'      => $s->formatted_end_time,
                'celebrant'     => $user->titled_name,
                'notes'         => $s->notes,
            ])
            ->toArray();

        // ── Sacrament assignments ────────────────────────────────
        // Non-rejected requests where this clergy is the officiant.
        // Projected as calendar events (they have a concrete preferred_date).
        // We show up to 60 days in the past and all future dates so the
        // clergy's history is visible on the calendar.
        $sacramentAssignments = SacramentRequest::where('assigned_clergy_id', $user->id)
            ->whereNotIn('status', ['rejected', 'cancelled'])
            ->whereNotNull('preferred_date')
            ->where('preferred_date', '>=', now()->subDays(60)->toDateString())
            ->with('sacramentType:id,name')
            ->select(
                'id', 'sacrament_type', 'sacrament_type_id',
                'preferred_date', 'preferred_time', 'status'
            )
            ->orderBy('preferred_date')
            ->get()
            ->map(fn ($r) => [
                // Calendar expects: id, title, type, date, time
                'id'    => $r->id,
                'title' => $r->sacramentType?->name ?? $r->sacrament_type ?? 'Sacrament',
                'type'  => $r->sacramentType?->name ?? $r->sacrament_type ?? 'Sacrament',
                'date'  => $r->preferred_date->toDateString(),
                'time'  => $r->preferred_time
                    ? Carbon::createFromTimeString($r->preferred_time)->format('g:i A')
                    : null,
                'status' => $r->status,
            ])
            ->toArray();

        return compact('clergyData', 'parishData', 'massSchedules', 'sacramentAssignments');
    }
}
