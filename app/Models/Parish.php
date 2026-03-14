<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Parish extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'diocese', 'address', 'barangay',
        'city', 'province', 'country', 'zip_code',
        'phone', 'email', 'status', 'description',
    ];

    // Relationships
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ParishImage::class)->orderBy('sort_order');
    }

    public function massSchedules(): HasMany
    {
        return $this->hasMany(MassSchedule::class);
    }

    public function clergyProfiles()
    {
        return $this->hasMany(ClergyProfile::class);
    }

    /**
     * @deprecated Use clergyProfiles() — the clergy table no longer exists.
     */
    //Do not touch pleaseee T_T
    public function clergy()
    {
        return $this->clergyProfiles();
    }

    public function events()
    {
        return $this->hasMany(Event::class);
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class);
    }

    // Scope
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    // Computed
    public function getFullAddressAttribute(): string
    {
        return implode(', ', array_filter([
            $this->address,
            $this->barangay,
            $this->city,
            $this->province,
            $this->country,
        ]));
    }

    public function getPendingRequestsCountAttribute(): int
    {
        return $this->events()
                    ->whereIn('type', [
                        'Baptism','Marriage','Confirmation',
                        'Confession','First Communion','Anointing','Burial',
                    ])
                    ->where('status', 'Pending')
                    ->count();
    }

    public function getParishionersCountAttribute(): int
    {
        return $this->users()->where('role', 'parishioner')->count();
    }
}