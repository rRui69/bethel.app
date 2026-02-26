<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Clergy extends Model
{
    use HasFactory;
    protected $table = 'clergy';

    protected $fillable = [
        'parish_id', 'first_name', 'middle_name', 'last_name',
        'title', 'status', 'specialization',
        'schedule', 'phone', 'email',
    ];

    protected $casts = [
        'schedule' => 'array',
    ];

    public function parish()
    {
        return $this->belongsTo(Parish::class);
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->title} {$this->first_name} {$this->last_name}";
    }
}