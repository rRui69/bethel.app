<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class SacramentRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'parish_id', 'sacrament_type_id', 'sacrament_type',
        'preferred_date', 'preferred_time', 'participants',
        'details', 'status', 'admin_notes',
        'assigned_clergy_id', 'clergy_status', 'payment_status',
    ];

    protected $casts = [
        'preferred_date' => 'date',
        'details'        => 'array',
        'participants'   => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parish(): BelongsTo
    {
        return $this->belongsTo(Parish::class);
    }

    public function sacramentType(): BelongsTo
    {
        return $this->belongsTo(SacramentType::class);
    }

    public function assignedClergy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_clergy_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(RequestPayment::class);
    }

    public function latestPayment(): HasOne
    {
        return $this->hasOne(RequestPayment::class)->latestOfMany();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(RequestMessage::class)->orderBy('created_at');
    }
}