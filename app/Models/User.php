<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'username', 'email', 'password', 'role', 'account_status',
        'first_name', 'middle_name', 'last_name', 'birth_date', 'gender',
        'phone', 'country', 'province', 'city', 'barangay',
        'street_address', 'zip_code',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'birth_date'        => 'date',
            'password'          => 'hashed',
        ];
    }

    // ── Computed ────────────────────────────────────────────────────
    public function getFullNameAttribute(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    public function getIsActiveAttribute(): bool
    {
        return $this->account_status === 'Active';
    }

    // ── Scopes ──────────────────────────────────────────────────────
    public function scopeActive($query)
    {
        return $query->where('account_status', 'Active');
    }

    public function scopeByRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    // ── Helpers ─────────────────────────────────────────────────────
    public function isSuperAdmin(): bool { return $this->role === 'super_admin'; }
    public function isAdmin(): bool      { return in_array($this->role, ['super_admin', 'parish_admin', 'clergymen']); }
}