<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class SacramentType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'slug', 'description',
        'icon', 'icon_color', 'icon_bg',
        'is_active', 'sort_order', 'form_schema', 'created_by',
    ];

    protected $casts = [
        'form_schema' => 'array',
        'is_active'   => 'boolean',
        'sort_order'  => 'integer',
    ];

    // ── Auto-generate slug from name ─────────────────────────────
    protected static function booted(): void
    {
        static::creating(function (SacramentType $type) {
            if (empty($type->slug)) {
                $type->slug = static::uniqueSlug($type->name);
            }
        });
    }

    public static function uniqueSlug(string $name, ?int $excludeId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i    = 2;

        while (
            static::where('slug', $slug)
                  ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                  ->exists()
        ) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    // ── Relationships ─────────────────────────────────────────────
    public function requests(): HasMany
    {
        return $this->hasMany(SacramentRequest::class);
    }

    // ── Scopes ────────────────────────────────────────────────────
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order')->orderBy('name');
    }

    // ── Helpers ───────────────────────────────────────────────────
    public function getFieldCountAttribute(): int
    {
        return count($this->form_schema['fields'] ?? []);
    }
}