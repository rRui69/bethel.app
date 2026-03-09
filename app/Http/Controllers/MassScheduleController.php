<?php

namespace App\Http\Controllers;

use App\Models\MassSchedule;
use App\Models\MassScheduleCancellation;
use App\Models\Parish;
use Carbon\Carbon;
use Illuminate\Http\Request;

class MassScheduleController extends Controller
{
    /**
     * Blade page — passes parishes for the filter dropdown.
     */
    public function index()
    {
        $pageData = [
            'parishes' => Parish::active()
                ->select('id', 'name', 'city')
                ->orderBy('name')
                ->get()
                ->map(fn ($p) => ['id' => $p->id, 'name' => $p->name])
                ->toArray(),
        ];

        return view('parishioner.mass-schedule', compact('pageData'));
    }

    /**
     * JSON API consumed by the public React page.
     * Returns schedules grouped by day (0=Sunday … 6=Saturday)
     * for the current week, with cancellations merged in.
     */
    public function public(Request $request)
    {
        $parishId   = $request->integer('parish_id', 0) ?: null;
        $dayFilter  = $request->has('day_of_week') ? (int) $request->day_of_week : null;
        $weekOffset = $request->integer('week_offset', 0);

        // Week window based on offset
        $weekStart = Carbon::now()->startOfWeek(Carbon::SUNDAY)->addWeeks($weekOffset);
        $weekEnd   = $weekStart->copy()->addDays(6)->endOfDay();

        // Map day_of_week (0-6) → date string for this week
        $weekDates = [];
        for ($i = 0; $i < 7; $i++) {
            $weekDates[$i] = $weekStart->copy()->addDays($i)->toDateString();
        }

        // Pre-load all cancellations for this week in one query
        $cancellations = MassScheduleCancellation::whereBetween('cancelled_date', [
            $weekStart->toDateString(),
            $weekEnd->toDateString(),
        ])->get()->groupBy('mass_schedule_id');

        // Build base query
        $query = MassSchedule::active()
            ->with([
                'parish:id,name,city',
                'clergy:id,first_name,last_name',
                'clergy.clergyProfile:user_id,title',
            ])
            ->orderBy('start_time');

        if ($parishId) {
            $query->where('parish_id', $parishId);
        }

        // Include: all recurring + one_time schedules within this week
        $query->where(function ($q) use ($weekStart, $weekEnd) {
            $q->where('schedule_type', 'recurring')
              ->orWhere(function ($q2) use ($weekStart, $weekEnd) {
                  $q2->where('schedule_type', 'one_time')
                     ->whereBetween('specific_date', [
                         $weekStart->toDateString(),
                         $weekEnd->toDateString(),
                     ]);
              });
        });

        $schedules = $query->get();

        // Group into day buckets 0-6
        $grouped = array_fill(0, 7, []);

        foreach ($schedules as $s) {
            $dayIndex = $s->schedule_type === 'recurring'
                ? $s->day_of_week
                : $s->specific_date->dayOfWeek; // Carbon dayOfWeek: 0=Sun

            // Apply day filter if set
            if ($dayFilter !== null && $dayIndex !== $dayFilter) {
                continue;
            }

            $date            = $weekDates[$dayIndex] ?? null;
            $scheduleCancels = $cancellations->get($s->id, collect());
            $cancelEntry     = $scheduleCancels->first(
                fn ($c) => $c->cancelled_date->toDateString() === $date
            );

            $grouped[$dayIndex][] = [
                'id'             => $s->id,
                'type'           => $s->type,
                'schedule_type'  => $s->schedule_type,
                'start_time'     => $s->formatted_start_time,
                'end_time'       => $s->formatted_end_time,
                'start_time_raw' => $s->start_time,
                'parish'         => $s->parish?->name,
                'parish_id'      => $s->parish_id,
                'city'           => $s->parish?->city,
                'celebrant'      => $s->clergy?->titled_name,
                'livestream_url' => $s->livestream_url,
                'is_cancelled'   => $cancelEntry !== null,
                'cancel_reason'  => $cancelEntry?->reason,
                'notes'          => $s->notes,
                '_dateKey'       => $date,
            ];
        }

        return response()->json([
            'days'       => array_values(MassSchedule::DAYS),
            'schedules'  => $grouped,
            'week_start' => $weekStart->toDateString(),
            'week_end'   => $weekEnd->toDateString(),
        ]);
    }
}