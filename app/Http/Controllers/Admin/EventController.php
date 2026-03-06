<?php

namespace App\Http\Controllers\Admin;

use App\Models\Event;
use App\Models\Parish;
use App\Models\Clergy;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Gate;

class EventController extends AdminBaseController
{
    public function page(): \Illuminate\View\View
    {
        $adminData = $this->adminShellData();
        $user = auth()->user();

        // Scope dropdowns based on role
        $parishQuery = Parish::active()->select('id', 'name', 'city')->orderBy('name');
        $clergyQuery = Clergy::where('status', 'Active')->with('parish:id,name')->select('id', 'parish_id', 'title', 'first_name', 'last_name')->orderBy('last_name');

        if (!$user->isSuperAdmin()) {
            $parishQuery->where('id', $user->parish_id);
            $clergyQuery->where('parish_id', $user->parish_id);
        }

        $adminData['parishes'] = $parishQuery->get()->map(fn ($p) => ['id' => $p->id, 'name' => $p->name, 'city' => $p->city])->toArray();
        $adminData['clergy'] = $clergyQuery->get()->map(fn ($c) => ['id' => $c->id, 'name' => $c->full_name, 'parish' => $c->parish?->name])->toArray();

        return view('admin.events', compact('adminData'));
    }

    public function stats(): JsonResponse
    {
        $user = auth()->user();
        $query = Event::regular();

        if (!$user->isSuperAdmin()) {
            $query->where('parish_id', $user->parish_id);
        }

        $counts = $query->selectRaw("
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) AS approved,
            SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN event_date >= CURDATE() THEN 1 ELSE 0 END) AS upcoming
        ")->first();

        return response()->json($counts);
    }

    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $query = Event::regular()
            ->with(['parish:id,name', 'clergy:id,title,first_name,last_name'])
            ->select('id', 'parish_id', 'clergy_id', 'title', 'type', 'event_date', 'start_time', 'end_time', 'location', 'status', 'created_at');

        // SECURITY: Tenant Isolation
        if (!$user->isSuperAdmin()) {
            $query->where('parish_id', $user->parish_id);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }
        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(fn ($q) => $q->where('title', 'like', $term)->orWhere('location', 'like', $term));
        }

        $allowed = ['event_date', 'title', 'type', 'status', 'created_at'];
        $sort = in_array($request->sort, $allowed) ? $request->sort : 'event_date';
        $direction = $request->direction === 'asc' ? 'asc' : 'desc';
        
        $events = $query->orderBy($sort, $direction)
            ->paginate(15)
            ->through(fn ($e) => $this->formatRow($e));

        return response()->json($events);
    }

    public function show(Event $event): JsonResponse
    {
        Gate::authorize('view', $event);
        $event->load(['parish:id,name', 'clergy:id,title,first_name,last_name']);
        return response()->json($this->formatRow($event, true));
    }

    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'parish_id'   => ['required', 'integer', 'exists:parishes,id'],
            'clergy_id'   => ['nullable', 'integer', 'exists:clergy,id'],
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type'        => ['required', Rule::in(Event::REGULAR_TYPES)],
            'event_date'  => ['required', 'date', 'after_or_equal:today'],
            'start_time'  => ['nullable', 'date_format:H:i'],
            'end_time'    => ['nullable', 'date_format:H:i', 'after:start_time'],
            'location'    => ['nullable', 'string', 'max:255'],
            'status'      => ['required', Rule::in(['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'])],
        ]);

        // SECURITY: Force parish_id to the admin's parish to prevent payload spoofing
        if (!$user->isSuperAdmin()) {
            $validated['parish_id'] = $user->parish_id;
        }

        $validated['user_id'] = $user->id; // Track who created it

        $event = Event::create($validated);
        $event->load(['parish:id,name', 'clergy:id,title,first_name,last_name']);

        return response()->json([
            'message' => 'Event created successfully.',
            'event'   => $this->formatRow($event),
        ], 201);
    }

    public function update(Request $request, Event $event): JsonResponse
    {
        Gate::authorize('update', $event);
        $validated = $request->validate([
            'clergy_id'   => ['nullable', 'integer', 'exists:clergy,id'],
            'title'       => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type'        => ['sometimes', Rule::in(Event::REGULAR_TYPES)],
            'event_date'  => ['sometimes', 'date'],
            'start_time'  => ['nullable', 'date_format:H:i'],
            'end_time'    => ['nullable', 'date_format:H:i'],
            'location'    => ['nullable', 'string', 'max:255'],
            'status'      => ['sometimes', Rule::in(['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'])],
        ]);

        $event->update($validated);
        $event->load(['parish:id,name', 'clergy:id,title,first_name,last_name']);

        return response()->json([
            'message' => 'Event updated successfully.',
            'event'   => $this->formatRow($event),
        ]);
    }

    public function destroy(Event $event): JsonResponse
    {
        Gate::authorize('delete', $event);
        $event->delete();
        return response()->json(['message' => 'Event deleted.']);
    }

    private function formatRow(Event $e, bool $withFull = false): array
    {
        $row = [
            'id'          => $e->id,
            'parish_id'   => $e->parish_id,
            'parish'      => $e->parish?->name ?? '—',
            'clergy_id'   => $e->clergy_id,
            'clergy'      => $e->clergy?->full_name ?? 'Unassigned',
            'title'       => $e->title,
            'type'        => $e->type,
            'event_date'  => $e->event_date->format('Y-m-d'),
            'event_date_display' => $e->event_date->format('M d, Y'),
            'start_time'  => $e->start_time ? Carbon::createFromTimeString($e->start_time)->format('g:i A') : null,
            'end_time'    => $e->end_time ? Carbon::createFromTimeString($e->end_time)->format('g:i A') : null,
            'location'    => $e->location,
            'status'      => $e->status,
            'created_at'  => $e->created_at->format('M d, Y'),
        ];

        if ($withFull) {
            $row['description'] = $e->description;
        }

        return $row;
    }
}