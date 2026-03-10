<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Livestream
 *
 * Represents a single livestream session scoped to a parish.
 * Supports two stream types:
 *   - facebook : embeds a public Facebook Live or video URL in an iframe
 *   - camera   : broadcasts live from a device camera using Agora.io WebRTC
 *
 * Lifecycle: scheduled → live → ended (→ is_archived = true)
 *
 * Multiple streams can be live simultaneously (e.g. main church + chapel).
 * Each camera stream gets its own isolated Agora channel.
 */
class Livestream extends Model
{
    use HasFactory;

    protected $fillable = [
        'parish_id',
        'created_by',
        'title',
        'description',
        'type',
        'facebook_url',
        'agora_channel',
        'status',
        'started_at',
        'ended_at',
        'is_archived',
    ];

    protected $casts = [
        'started_at'  => 'datetime',
        'ended_at'    => 'datetime',
        'is_archived' => 'boolean',
    ];

    // ── Relationships ──────────────────────────────────────────────

    public function parish(): BelongsTo
    {
        return $this->belongsTo(Parish::class);
    }

    /**
     * The staff member who created this stream.
     * Nullable: user account may be deleted but stream archive must persist.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ── Scopes ────────────────────────────────────────────────────

    /**
     * Streams currently broadcasting.
     * Used by homepage widget and public /livestream page.
     */
    public function scopeLive($query)
    {
        return $query->where('status', 'live');
    }

    /**
     * Streams that have ended and are publicly visible in the archive.
     */
    public function scopeArchived($query)
    {
        return $query->where('is_archived', true)
                     ->orderByDesc('ended_at');
    }

    /**
     * Streams scoped to a specific parish.
     * Mirrors the pattern used in MassSchedule::scopeForParish().
     */
    public function scopeForParish($query, int $parishId)
    {
        return $query->where('parish_id', $parishId);
    }

    /**
     * Only Facebook embed type streams.
     */
    public function scopeFacebook($query)
    {
        return $query->where('type', 'facebook');
    }

    /**
     * Only Agora camera type streams.
     */
    public function scopeCamera($query)
    {
        return $query->where('type', 'camera');
    }

    // ── Accessors ─────────────────────────────────────────────────

    /**
     * Human-readable stream duration once ended.
     * Returns null if stream hasn't ended or timestamps are missing.
     *
     * Usage: $stream->duration  → "1 hr 23 min"
     */
    public function getDurationAttribute(): ?string
    {
        if (! $this->started_at || ! $this->ended_at) {
            return null;
        }

        $minutes = (int) $this->started_at->diffInMinutes($this->ended_at);

        if ($minutes < 60) {
            return "{$minutes} min";
        }

        $hours   = intdiv($minutes, 60);
        $remaining = $minutes % 60;

        return $remaining > 0
            ? "{$hours} hr {$remaining} min"
            : "{$hours} hr";
    }

    /**
     * Formatted start time for archive display.
     * Returns null if stream hasn't started.
     *
     * Usage: $stream->streamed_on → "March 10, 2026 at 9:00 AM"
     */
    public function getStreamedOnAttribute(): ?string
    {
        return $this->started_at
            ? $this->started_at->format('F j, Y \a\t g:i A')
            : null;
    }

    // ── Helpers ───────────────────────────────────────────────────

    /**
     * Whether this stream is a Facebook embed type.
     */
    public function isFacebook(): bool
    {
        return $this->type === 'facebook';
    }

    /**
     * Whether this stream uses Agora camera broadcasting.
     */
    public function isCamera(): bool
    {
        return $this->type === 'camera';
    }

    /**
     * Whether the stream is currently live.
     */
    public function isLive(): bool
    {
        return $this->status === 'live';
    }
}