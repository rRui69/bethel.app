<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestPayment extends Model
{
    protected $fillable = [
        'sacrament_request_id', 'user_id', 'method',
        'amount', 'proof_path', 'status', 'admin_notes',
        'verified_at', 'verified_by',
    ];

    protected $casts = [
        'amount'      => 'decimal:2',
        'verified_at' => 'datetime',
    ];

    public function sacramentRequest(): BelongsTo
    {
        return $this->belongsTo(SacramentRequest::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}