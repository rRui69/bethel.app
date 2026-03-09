<?php

namespace App\Http\Controllers\Admin;

use App\Models\MassSchedule;
use App\Models\MassScheduleCancellation;
use App\Models\Parish;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MassScheduleController extends AdminBaseController
{
    // ── Blade page ────────────────────────────────────────────────

    public function page()
    {
        $adminData = $this->adminShellData();

        $adminData['parishes'] = Parish::active()
            ->select('id', 'name', 'city')
            ->orderBy('name')
            ->get()
            ->map(fn ($p) => ['id' => $p->id, 'name' => $p->name, 'city' => $p->city])
            ->toArray();

        $adminData['clergy'] = User::where('role', 'clergymen')
            ->where('account_status', 'Active')
            ->with('clergyProfile:user_id,title,parish_id')
            ->orderBy('last_name')
            ->get()
            ->map(fn ($u) => [
                'id'   => $u->id,
                'name' => $u->clergyProfile
                    ? "{$u->clergyProfile->title} {$u->first_name} {$u->last_name}"
                    : $u->full_name,
                'parish_id' => $u->clergyProfile?->parish_id,
            ])
            ->toArray();

        return view('admin.mass-schedules', compact('adminData'));
    }

    // ── API: list ─────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();

        $query = MassSchedule::with([
            'parish:id,name,city',
            'clergy:id,first_name,last_name',
            'clergy.clergyProfile:user_id,title',
        ])->orderBy('day_of_week')->orderBy('start_time');

        // Non-super-admins only see their own parish
        if (! $user->isSuperAdmin()) {
            $query->where('parish_id', $user->parish_id);
        }

        if ($request->filled('parish_id')) {
            $query->where('parish_id', $request->parish_id);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('schedule_type')) {
            $query->where('schedule_type', $request->schedule_type);
        }
        if ($request->boolean('active_only', true)) {
            $query->active();
        }

        $schedules = $query->get()->map(fn ($s) => $this->formatSchedule($s));

        return response()->json($schedules);
    }

    // ── API: store ────────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'parish_id'     => ['required', 'exists:parishes,id'],
            'clergy_id'     => ['nullable', 'exists:users,id'],
            'type'          => ['required', Rule::in(MassSchedule::TYPES)],
            'schedule_type' => ['required', Rule::in(['recurring', 'one_time'])],
            'day_of_week'   => [
                Rule::requiredIf($request->schedule_type === 'recurring'),
                'nullable', 'integer', 'min:0', 'max:6',
            ],
            'specific_date' => [
                Rule::requiredIf($request->schedule_type === 'one_time'),
                'nullable', 'date',
            ],
            'start_time'    => ['required', 'date_format:H:i,H:i:s'],
            'end_time'      => ['nullable', 'date_format:H:i,H:i:s', 'after:start_time'],
            'livestream_url'=> ['nullable', 'url', 'max:500'],
            'is_active'     => ['boolean'],
            'notes'         => ['nullable', 'string', 'max:1000'],
        ]);

        $data['created_by'] = auth()->id();

        // Clear the irrelevant field
        if ($data['schedule_type'] === 'recurring') {
            $data['specific_date'] = null;
        } else {
            $data['day_of_week'] = null;
        }

        $schedule = MassSchedule::create($data);
        $schedule->load(['parish:id,name,city', 'clergy:id,first_name,last_name', 'clergy.clergyProfile:user_id,title']);

        return response()->json($this->formatSchedule($schedule), 201);
    }

    // ── API: show ─────────────────────────────────────────────────

    public function show(MassSchedule $massSchedule): JsonResponse
    {
        $massSchedule->load([
            'parish:id,name,city',
            'clergy:id,first_name,last_name',
            'clergy.clergyProfile:user_id,title',
            'cancellations' => fn ($q) => $q->orderBy('cancelled_date', 'desc')->take(20),
        ]);

        $data              = $this->formatSchedule($massSchedule);
        $data['cancellations'] = $massSchedule->cancellations->map(fn ($c) => [
            'id'             => $c->id,
            'cancelled_date' => $c->cancelled_date->toDateString(),
            'reason'         => $c->reason,
        ])->toArray();

        return response()->json($data);
    }

    // ── API: update ───────────────────────────────────────────────

    public function update(Request $request, MassSchedule $massSchedule): JsonResponse
    {
        $data = $request->validate([
            'parish_id'     => ['sometimes', 'exists:parishes,id'],
            'clergy_id'     => ['nullable', 'exists:users,id'],
            'type'          => ['sometimes', Rule::in(MassSchedule::TYPES)],
            'schedule_type' => ['sometimes', Rule::in(['recurring', 'one_time'])],
            'day_of_week'   => ['nullable', 'integer', 'min:0', 'max:6'],
            'specific_date' => ['nullable', 'date'],
            'start_time'    => ['sometimes', 'date_format:H:i,H:i:s'],
            'end_time'      => ['nullable', 'date_format:H:i,H:i:s'],
            'livestream_url'=> ['nullable', 'url', 'max:500'],
            'is_active'     => ['boolean'],
            'notes'         => ['nullable', 'string', 'max:1000'],
        ]);

        $scheduleType = $data['schedule_type'] ?? $massSchedule->schedule_type;
        if ($scheduleType === 'recurring') {
            $data['specific_date'] = null;
        } else {
            $data['day_of_week'] = null;
        }

        $massSchedule->update($data);
        $massSchedule->load(['parish:id,name,city', 'clergy:id,first_name,last_name', 'clergy.clergyProfile:user_id,title']);

        return response()->json($this->formatSchedule($massSchedule));
    }

    // ── API: destroy ──────────────────────────────────────────────

    public function destroy(MassSchedule $massSchedule): JsonResponse
    {
        $massSchedule->delete();
        return response()->json(['message' => 'Mass schedule deleted.']);
    }

    // ── API: cancel a specific occurrence ────────────────────────

    public function cancel(Request $request, MassSchedule $massSchedule): JsonResponse
    {
        $data = $request->validate([
            'cancelled_date' => ['required', 'date'],
            'reason'         => ['nullable', 'string', 'max:500'],
        ]);

        $data['mass_schedule_id'] = $massSchedule->id;
        $data['cancelled_by']     = auth()->id();

        $cancellation = MassScheduleCancellation::updateOrCreate(
            [
                'mass_schedule_id' => $massSchedule->id,
                'cancelled_date'   => $data['cancelled_date'],
            ],
            ['reason' => $data['reason'] ?? null, 'cancelled_by' => auth()->id()]
        );

        return response()->json([
            'id'             => $cancellation->id,
            'cancelled_date' => $cancellation->cancelled_date->toDateString(),
            'reason'         => $cancellation->reason,
        ], 201);
    }

    // ── API: remove a cancellation ────────────────────────────────

    public function removeCancel(MassSchedule $massSchedule, MassScheduleCancellation $cancellation): JsonResponse
    {
        abort_unless($cancellation->mass_schedule_id === $massSchedule->id, 404);
        $cancellation->delete();
        return response()->json(['message' => 'Cancellation removed.']);
    }

    // ── Private helper ────────────────────────────────────────────

    private function formatSchedule(MassSchedule $s): array
    {
        return [
            'id'             => $s->id,
            'parish_id'      => $s->parish_id,
            'parish'         => $s->parish?->name,
            'parish_city'    => $s->parish?->city,
            'clergy_id'      => $s->clergy_id,
            'celebrant'      => $s->clergy?->titled_name,
            'type'           => $s->type,
            'schedule_type'  => $s->schedule_type,
            'day_of_week'    => $s->day_of_week,
            'day_name'       => $s->day_name,
            'specific_date'  => $s->specific_date?->toDateString(),
            'start_time'     => $s->start_time,
            'end_time'       => $s->end_time,
            'start_time_fmt' => $s->formatted_start_time,
            'end_time_fmt'   => $s->formatted_end_time,
            'livestream_url' => $s->livestream_url,
            'is_active'      => $s->is_active,
            'notes'          => $s->notes,
        ];
    }
}