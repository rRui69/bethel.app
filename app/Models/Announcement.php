<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Announcement extends Model
{
    use HasFactory;

    protected $fillable = [
        'parish_id', 'user_id', 'title', 'body',
        'excerpt', 'category', 'image_path',
        'status', 'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    // ── Relationships ──────────────────────────────────────
    public function parish()
    {
        return $this->belongsTo(Parish::class);
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // ── Scopes ─────────────────────────────────────────────
    public function scopePublished($query)
    {
        return $query->where('status', 'Published');
    }
}