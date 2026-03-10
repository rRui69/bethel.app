<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * MassSchedule
 *
 * Represents a single mass slot. Can be recurring (every Sunday 6 AM)
 * or one-time (Christmas Day 10 AM). Cancellations for specific dates
 * are stored in mass_cancellations.
 */
class MassSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'parish_id', 'clergy_id', 'type', 'schedule_type',
        'day_of_week', 'specific_date', 'start_time', 'end_time',
        'livestream_url', 'is_active', 'notes', 'created_by',
    ];

    protected $casts = [
        'day_of_week'   => 'integer',
        'specific_date' => 'date',
        'is_active'     => 'boolean',
    ];

    const DAYS = [
        0 => 'Sunday', 1 => 'Monday', 2 => 'Tuesday',
        3 => 'Wednesday', 4 => 'Thursday', 5 => 'Friday', 6 => 'Saturday',
    ];

    const TYPES = [
        'Regular', 'Family', 'Youth', 'Daily',
        'Evening', 'Midday', 'Anticipated', 'Pilgrimage',
    ];

    // Relationships

    public function parish(): BelongsTo
    {
        return $this->belongsTo(Parish::class);
    }

    public function clergy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'clergy_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function cancellations(): HasMany
    {
        return $this->hasMany(MassScheduleCancellation::class);
    }

    // Accessors

    public function getDayNameAttribute(): string
    {
        return self::DAYS[$this->day_of_week] ?? '';
    }

    public function getFormattedStartTimeAttribute(): string
    {
        return Carbon::createFromTimeString($this->start_time)->format('g:i A');
    }

    public function getFormattedEndTimeAttribute(): ?string
    {
        return $this->end_time
            ? Carbon::createFromTimeString($this->end_time)->format('g:i A')
            : null;
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeRecurring($query)
    {
        return $query->where('schedule_type', 'recurring');
    }

    public function scopeOneTime($query)
    {
        return $query->where('schedule_type', 'one_time');
    }

    public function scopeForParish($query, int $parishId)
    {
        return $query->where('parish_id', $parishId);
    }
}