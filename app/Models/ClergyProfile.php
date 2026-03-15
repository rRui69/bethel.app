<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * ClergyProfile
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
        'custom_title',
        'specialization',
        'bio',
        'image_url',
    ];

    protected $casts = [];

    // Relationships

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parish(): BelongsTo
    {
        return $this->belongsTo(Parish::class);
    }

    // Helpers

    /**
     * Returns the full titled name for display purposes.
     * Ex: "Fr. Miguel Santos"
     */
    public function getTitledNameAttribute(): string
    {
        $user = $this->user;
        if (!$user) return '';
        return "{$this->title} {$user->first_name} {$user->last_name}";
    }
}
