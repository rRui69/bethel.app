<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestMessage extends Model
{
    protected $fillable = [
        'sacrament_request_id', 'sender_id',
        'body', 'image_url', 'read_by_admin', 'read_by_parishioner',
    ];

    protected $casts = [
        'read_by_admin'       => 'boolean',
        'read_by_parishioner' => 'boolean',
    ];

    public function sacramentRequest(): BelongsTo
    {
        return $this->belongsTo(SacramentRequest::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}