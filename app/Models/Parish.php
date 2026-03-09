<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Parish extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'diocese', 'address', 'barangay',
        'city', 'province', 'country', 'zip_code',
        'phone', 'email', 'status', 'description',
    ];

    // Relationships
    public function clergyProfiles()
    {
        return $this->hasMany(ClergyProfile::class);
    }

    /**
     * @deprecated Use clergyProfiles() — the clergy table no longer exists.
     */
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
        // Once parish_id is added to users table, this becomes:
        // return $this->users()->count();
        return 0; // placeholder until User gets parish_id
    }
}