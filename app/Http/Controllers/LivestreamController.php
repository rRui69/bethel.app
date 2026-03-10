<?php

namespace App\Http\Controllers;

use App\Models\Livestream;
use App\Services\AgoraTokenService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * LivestreamController (Public)
 *
 * Handles the public-facing livestream page and APIs.
 * No authentication required — viewable by all guests.
 *
 * Counterpart: App\Http\Controllers\Admin\LivestreamController
 */
class LivestreamController extends Controller
{
    // ── Blade Page: /livestream ────────────────────────────────────

    /**
     * Renders the public dedicated livestream page.
     * Passes initial data server-side for zero-flicker load.
     * React component hydrates and polls from there.
     */
    public function index()
    {
        // Active streams — passed as initial props to React
        $activeStreams = Livestream::live()
            ->select('id', 'parish_id', 'title', 'description',
                     'type', 'facebook_url', 'agora_channel', 'started_at')
            ->get()
            ->map(fn ($s) => $this->formatPublicStream($s))
            ->toArray();

        // Archive — paginated, latest first
        $archivedStreams = Livestream::archived()
            ->select('id', 'parish_id', 'title', 'description',
                     'type', 'started_at', 'ended_at')
            ->paginate(12)
            ->through(fn ($s) => $this->formatPublicStream($s));

        $pageData = compact('activeStreams', 'archivedStreams');

        return view('parishioner.livestream', compact('pageData'));
    }

    // ── Public API: Active streams (homepage widget poll) ──────────

    /**
     * Returns all currently live streams across all parishes.
     * Called every 30 seconds by the homepage LivestreamWidget React component.
     *
     * No auth — must be publicly accessible.
     */
    public function active(): JsonResponse
    {
        $streams = Livestream::live()
            ->select('id', 'parish_id', 'title', 'type',
                     'facebook_url', 'agora_channel', 'started_at')
            ->get()
            ->map(fn ($s) => $this->formatPublicStream($s));

        return response()->json($streams);
    }

    // ── Public API: Archive list ───────────────────────────────────

    /**
     * Paginated archive of ended streams.
     * Supports optional parish_id filter for multi-parish setups.
     */
    public function archive(Request $request): JsonResponse
    {
        $query = Livestream::archived()
            ->select('id', 'parish_id', 'title', 'description',
                     'type', 'started_at', 'ended_at');

        if ($request->filled('parish_id')) {
            $query->where('parish_id', $request->parish_id);
        }

        $streams = $query->paginate(12)
            ->through(fn ($s) => $this->formatPublicStream($s));

        return response()->json($streams);
    }

    // ── Public API: Agora Subscriber Token ─────────────────────────

    /**
     * Issues a VIEWER (audience/subscriber) Agora token.
     *
     * This endpoint is intentionally public — guests do not need to log in
     * to watch camera streams. The token only grants join + watch privileges,
     * never publish.
     *
     * Security: validates the channel exists in our DB and is currently live
     * before issuing any token — prevents token farming for arbitrary channels.
     */
    public function subscriberToken(Request $request): JsonResponse
    {
        $request->validate([
            'channel' => ['required', 'string', 'max:64'],
        ]);

        // Only issue tokens for channels that are actually live right now
        $stream = Livestream::live()
            ->where('agora_channel', $request->channel)
            ->where('type', 'camera')
            ->first();

        if (! $stream) {
            return response()->json([
                'message' => 'No active camera stream found for this channel.',
            ], 404);
        }

        $service = new AgoraTokenService();
        $token   = $service->generateSubscriberToken($request->channel, 0);

        return response()->json([
            'token'   => $token,
            'channel' => $request->channel,
            'app_id'  => config('services.agora.app_id'),
        ]);
    }

    // ── Private Helpers ────────────────────────────────────────────

    /**
     * Public-safe stream shape — never exposes internal fields.
     */
    private function formatPublicStream($s): array
    {
        return [
            'id'            => $s->id,
            'title'         => $s->title,
            'description'   => $s->description,
            'type'          => $s->type,
            'facebook_url'  => $s->facebook_url,
            'agora_channel' => $s->agora_channel,
            'streamed_on'   => $s->streamed_on,
            'duration'      => $s->duration,
            'started_at'    => $s->started_at?->toIso8601String(),
            'ended_at'      => $s->ended_at?->toIso8601String(),
        ];
    }
}