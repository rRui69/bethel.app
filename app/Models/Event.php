<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Event extends Model
{
    use HasFactory;

    // Sacramental types — used to distinguish requests from regular events
    const SACRAMENTAL_TYPES = [
        'Baptism', 'Marriage', 'Confirmation',
        'Confession', 'First Communion', 'Anointing', 'Burial',
    ];

    const REGULAR_TYPES = ['Community', 'Liturgy', 'Youth'];

    protected $fillable = [
        'parish_id', 'user_id', 'clergy_id',
        'title', 'description', 'type',
        'event_date', 'start_time', 'end_time', 'location',
        'status', 'rejection_reason', 'notes', 'sacrament_details',
    ];

    protected $casts = [
        'event_date'        => 'date',
        'sacrament_details' => 'array',
    ];

    // ── Relationships ──────────────────────────────────────
    public function parish()
    {
        return $this->belongsTo(Parish::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function clergy()
    {
        return $this->belongsTo(Clergy::class);
    }

    // ── Scopes ─────────────────────────────────────────────
    public function scopeSacramental($query)
    {
        return $query->whereIn('type', self::SACRAMENTAL_TYPES);
    }

    public function scopeRegular($query)
    {
        return $query->whereIn('type', self::REGULAR_TYPES);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'Pending');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('event_date', '>=', now()->toDateString())
                     ->orderBy('event_date');
    }

    // ── Helpers ────────────────────────────────────────────
    public function isSacramental(): bool
    {
        return in_array($this->type, self::SACRAMENTAL_TYPES);
    }

    public function isRegular(): bool
    {
        return in_array($this->type, self::REGULAR_TYPES);
    }
}