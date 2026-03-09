<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MassScheduleCancellation extends Model
{
    protected $fillable = [
        'mass_schedule_id',
        'cancelled_date',
        'reason',
        'cancelled_by',
    ];

    protected $casts = [
        'cancelled_date' => 'date',
    ];

    public function massSchedule(): BelongsTo
    {
        return $this->belongsTo(MassSchedule::class);
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }
}