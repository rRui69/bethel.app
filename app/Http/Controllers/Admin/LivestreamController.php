<?php

namespace App\Http\Controllers\Admin;

use App\Models\Livestream;
use App\Models\Parish;
use App\Services\AgoraTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class LivestreamController extends AdminBaseController
{
    // ── Blade Page ─────────────────────────────────────────────────

    public function page()
    {
        $adminData = $this->adminShellData();
        $user      = auth()->user();

        // super_admin sees all parishes; parish_admin only their own
        $parishQuery = Parish::active()->select('id', 'name', 'city')->orderBy('name');
        if (! $user->isSuperAdmin()) {
            $parishQuery->where('id', $user->parish_id);
        }

        $adminData['parishes'] = $parishQuery->get()
            ->map(fn ($p) => ['id' => $p->id, 'name' => $p->name, 'city' => $p->city])
            ->toArray();

        // Pass App ID to blade so React component can use it directly
        $adminData['agora_app_id'] = config('services.agora.app_id');

        return view('admin.livestreams', compact('adminData'));
    }

    // ── API: Stats ──────────────────────────────────────────────────

    public function stats(): JsonResponse
    {
        $user  = auth()->user();
        $query = Livestream::query();

        if (! $user->isSuperAdmin()) {
            $query->where('parish_id', $user->parish_id);
        }

        $counts = $query->selectRaw("
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'live' THEN 1 ELSE 0 END) AS live_now,
            SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled,
            SUM(CASE WHEN is_archived = 1 THEN 1 ELSE 0 END) AS archived
        ")->first();

        return response()->json($counts);
    }

    // ── API: Index ──────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $user  = auth()->user();
        $query = Livestream::with('creator:id,first_name,last_name')
            ->select('id', 'parish_id', 'created_by', 'title', 'description',
                     'type', 'facebook_url', 'agora_channel',
                     'status', 'started_at', 'ended_at', 'is_archived', 'created_at');

        // ── SECURITY: Tenant Isolation ─────────────────────────────
        if (! $user->isSuperAdmin()) {
            $query->where('parish_id', $user->parish_id);
        }

        // ── Filters ─────────────────────────────────────────────────
        if ($request->filled('parish_id') && $user->isSuperAdmin()) {
            $query->where('parish_id', $request->parish_id);
        }
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }
        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(fn ($q) => $q->where('title', 'like', $term)
                                       ->orWhere('description', 'like', $term));
        }

        $allowed   = ['title', 'status', 'type', 'started_at', 'created_at'];
        $sort      = in_array($request->sort, $allowed) ? $request->sort : 'created_at';
        $direction = $request->direction === 'asc' ? 'asc' : 'desc';

        $streams = $query->orderBy($sort, $direction)
            ->paginate(15)
            ->through(fn ($s) => $this->formatStream($s));

        return response()->json($streams);
    }

    // ── API: Show ───────────────────────────────────────────────────

    public function show(Livestream $livestream): JsonResponse
    {
        $this->authorizeStreamAccess($livestream);

        $livestream->load('creator:id,first_name,last_name');

        return response()->json($this->formatStream($livestream));
    }

    // ── API: Store ──────────────────────────────────────────────────

    public function store(Request $request): JsonResponse
    {
        // SECURITY: Clergymen cannot create livestreams
        $this->denyClergy();

        $user = auth()->user();

        $validated = $request->validate([
            'parish_id'   => ['required', 'exists:parishes,id'],
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'type'        => ['required', Rule::in(['facebook', 'camera'])],

            // Required only when type = facebook
            'facebook_url' => [
                Rule::requiredIf($request->type === 'facebook'),
                'nullable',
                'url',
                'max:500',
                // Must be a Facebook domain link
                function ($attribute, $value, $fail) {
                    if ($value && ! str_contains($value, 'facebook.com')) {
                        $fail('The livestream URL must be a valid Facebook link.');
                    }
                },
            ],
        ]);

        // SECURITY: parish_admin cannot spoof a different parish
        if (! $user->isSuperAdmin()) {
            $validated['parish_id'] = $user->parish_id;
        }

        $validated['created_by'] = $user->id;
        $validated['status']     = 'scheduled';

        // Auto-generate a unique Agora channel name for camera streams
        if ($validated['type'] === 'camera') {
            $validated['agora_channel']  = 'bethel-' . Str::random(10);
            $validated['facebook_url']   = null;
        } else {
            $validated['agora_channel']  = null;
        }

        $stream = Livestream::create($validated);
        $stream->load('creator:id,first_name,last_name');

        return response()->json([
            'message' => 'Livestream created.',
            'data'    => $this->formatStream($stream),
        ], 201);
    }

    // ── API: Update ─────────────────────────────────────────────────

    public function update(Request $request, Livestream $livestream): JsonResponse
    {
        $this->denyClergy();
        $this->authorizeStreamAccess($livestream);

        // Cannot edit a stream that is already live or ended
        if (in_array($livestream->status, ['live', 'ended'])) {
            return response()->json([
                'message' => 'Cannot edit a stream that is already live or has ended.',
            ], 422);
        }

        $validated = $request->validate([
            'title'        => ['sometimes', 'string', 'max:255'],
            'description'  => ['nullable', 'string', 'max:1000'],
            'facebook_url' => [
                'nullable', 'url', 'max:500',
                function ($attribute, $value, $fail) {
                    if ($value && ! str_contains($value, 'facebook.com')) {
                        $fail('The livestream URL must be a valid Facebook link.');
                    }
                },
            ],
        ]);

        $livestream->update($validated);
        $livestream->load('creator:id,first_name,last_name');

        return response()->json([
            'message' => 'Livestream updated.',
            'data'    => $this->formatStream($livestream),
        ]);
    }

    // ── API: Go Live ────────────────────────────────────────────────

    public function start(Livestream $livestream): JsonResponse
    {
        $this->denyClergy();
        $this->authorizeStreamAccess($livestream);

        if ($livestream->status !== 'scheduled') {
            return response()->json([
                'message' => 'Only scheduled streams can be started.',
            ], 422);
        }

        $livestream->update([
            'status'     => 'live',
            'started_at' => now(),
        ]);

        return response()->json([
            'message' => 'Stream is now live.',
            'data'    => $this->formatStream($livestream),
        ]);
    }

    // ── API: End Stream ─────────────────────────────────────────────

    public function end(Livestream $livestream): JsonResponse
    {
        $this->denyClergy();
        $this->authorizeStreamAccess($livestream);

        if ($livestream->status !== 'live') {
            return response()->json([
                'message' => 'Only live streams can be ended.',
            ], 422);
        }

        $livestream->update([
            'status'      => 'ended',
            'ended_at'    => now(),
            'is_archived' => true,
        ]);

        return response()->json([
            'message' => 'Stream ended and archived.',
            'data'    => $this->formatStream($livestream),
        ]);
    }

    // ── API: Toggle Archive Visibility ──────────────────────────────

    public function toggleArchive(Livestream $livestream): JsonResponse
    {
        $this->denyClergy();
        $this->authorizeStreamAccess($livestream);

        if ($livestream->status !== 'ended') {
            return response()->json([
                'message' => 'Only ended streams can have their archive status toggled.',
            ], 422);
        }

        $livestream->update(['is_archived' => ! $livestream->is_archived]);

        return response()->json([
            'message' => $livestream->is_archived ? 'Stream added to archive.' : 'Stream removed from archive.',
            'data'    => $this->formatStream($livestream),
        ]);
    }

    // ── API: Delete ─────────────────────────────────────────────────

    public function destroy(Livestream $livestream): JsonResponse
    {
        $this->denyClergy();
        $this->authorizeStreamAccess($livestream);

        // Block deletion of an active stream
        if ($livestream->status === 'live') {
            return response()->json([
                'message' => 'Cannot delete a stream that is currently live. End it first.',
            ], 422);
        }

        $livestream->delete();

        return response()->json(['message' => 'Livestream deleted.']);
    }

    // ── API: Generate Agora Publisher Token (broadcaster only) ──────

    /**
     * Called by the admin UI right before the broadcaster starts camera.
     * Returns a HOST token — grants publish privileges.
     * Only super_admin and parish_admin can request this.
     */
    public function publisherToken(Request $request): JsonResponse
    {
        $this->denyClergy();

        $request->validate([
            'channel' => ['required', 'string', 'max:64'],
        ]);

        // Verify the channel belongs to a stream this admin owns
        $stream = Livestream::where('agora_channel', $request->channel)
            ->where('type', 'camera')
            ->first();

        if (! $stream) {
            return response()->json(['message' => 'Invalid channel.'], 404);
        }

        $this->authorizeStreamAccess($stream);

        $service = new AgoraTokenService();
        $token   = $service->generatePublisherToken($request->channel, 0);

        return response()->json([
            'token'   => $token,
            'channel' => $request->channel,
            'app_id'  => config('services.agora.app_id'),
        ]);
    }

    // ── Private Helpers ────────────────────────────────────────────

    /**
     * Formats a Livestream model into a consistent API response shape.
     * Mirrors the formatSchedule() pattern in MassScheduleController.
     */
    private function formatStream(Livestream $s): array
    {
        return [
            'id'            => $s->id,
            'parish_id'     => $s->parish_id,
            'title'         => $s->title,
            'description'   => $s->description,
            'type'          => $s->type,
            'facebook_url'  => $s->facebook_url,
            'agora_channel' => $s->agora_channel,
            'status'        => $s->status,
            'is_archived'   => $s->is_archived,
            'started_at'    => $s->started_at?->toIso8601String(),
            'ended_at'      => $s->ended_at?->toIso8601String(),
            'streamed_on'   => $s->streamed_on,     // "March 10, 2026 at 9:00 AM"
            'duration'      => $s->duration,         // "1 hr 23 min"
            'created_at'    => $s->created_at->toIso8601String(),
            'created_by'    => $s->creator?->full_name ?? '—',
        ];
    }

    /**
     * Blocks clergymen from write operations.
     * The 'admin' middleware allows clergymen through, so we gate explicitly.
     */
    private function denyClergy(): void
    {
        if (auth()->user()->isClergymen()) {
            abort(403, 'Clergy members cannot manage livestreams.');
        }
    }

    /**
     * Ensures parish_admin can only access their own parish's streams.
     * super_admin can access any stream.
     */
    private function authorizeStreamAccess(Livestream $stream): void
    {
        $user = auth()->user();

        if (! $user->isSuperAdmin() && $stream->parish_id !== $user->parish_id) {
            abort(403, 'You do not have access to this livestream.');
        }
    }
}