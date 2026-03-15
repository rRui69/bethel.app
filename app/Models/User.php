<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'parish_id',
        'username', 'email', 'password', 'role', 'account_status',
        'first_name', 'middle_name', 'last_name', 'birth_date', 'gender',
        'phone', 'country', 'province', 'city', 'barangay',
        'street_address', 'zip_code',
        'otp_code', 'otp_expires_at', 'email_verified_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'otp_expires_at'    => 'datetime',
            'birth_date'        => 'date',
            'password'          => 'hashed',
        ];
    }

    // Computed

    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * Display name with ecclesiastical title for clergy.
     * Falls back to full_name for all other roles.
     *
     * NOTE: requires clergyProfile to be loaded for clergy users.
     * Usage:  $user->load('clergyProfile'); echo $user->titled_name;
     */
    public function getTitledNameAttribute(): string
    {
        if (
            $this->role === 'clergymen' &&
            $this->relationLoaded('clergyProfile') &&
            $this->clergyProfile
        ) {
            return "{$this->clergyProfile->title} {$this->first_name} {$this->last_name}";
        }

        return $this->full_name;
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->account_status === 'Active';
    }

    // Scopes

    public function scopeActive($query)
    {
        return $query->where('account_status', 'Active');
    }

    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    // Role Helpers

    public function isSuperAdmin(): bool     { return $this->role === 'super_admin'; }
    public function isParishAdmin(): bool    { return $this->role === 'parish_admin'; }
    public function isParishHelpdesk(): bool { return $this->role === 'parish_helpdesk'; }
    public function isClergymen(): bool      { return $this->role === 'clergymen'; }

    public function isAdmin(): bool
    {
        return in_array($this->role, ['super_admin', 'parish_admin', 'parish_helpdesk', 'clergymen']);
    }

    // Relationships

    /**
     * Ecclesiastical profile — only populated for role = 'clergymen'.
     */
    public function clergyProfile(): HasOne
    {
        return $this->hasOne(ClergyProfile::class);
    }

    public function sacramentRequests(): HasMany
    {
        return $this->hasMany(SacramentRequest::class);
    }

    /**
     * Sacrament requests where this clergy user is the assigned officiant.
     */
    public function clergyAssignments(): HasMany
    {
        return $this->hasMany(SacramentRequest::class, 'assigned_clergy_id');
    }

    public function parish(): BelongsTo
    {
        return $this->belongsTo(Parish::class);
    }
}
