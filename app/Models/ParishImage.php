<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParishImage extends Model
{
    use HasFactory;

    protected $fillable = ['parish_id', 'image_url', 'sort_order'];

    public function parish(): BelongsTo
    {
        return $this->belongsTo(Parish::class);
    }
}