<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ClergyProfile
 *
 * Holds ecclesiastical metadata for a User with role = 'clergymen'.
 * Always accessed through the User model:  $user->clergyProfile
 *
 * @property int    $id
 * @property int    $user_id
 * @property int    $parish_id
 * @property string $title
 * @property string|null $specialization
 * @property array|null  $schedule
 */
class ClergyProfile extends Model
{
    use HasFactory;

    protected $table = 'clergy_profiles';

    protected $fillable = [
        'user_id',
        'parish_id',
        'title',
        'specialization',
        // 'schedule' removed — mass slots now live in the mass_schedules table
    ];

    protected $casts = [];

    // ── Relationships ────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parish(): BelongsTo
    {
        return $this->belongsTo(Parish::class);
    }

    // ── Helpers ──────────────────────────────────────────────────

    /**
     * Returns the full titled name for display purposes.
     * Example: "Fr. Miguel Santos"
     */
    public function getTitledNameAttribute(): string
    {
        $user = $this->user;
        if (!$user) return '';
        return "{$this->title} {$user->first_name} {$user->last_name}";
    }
}