<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * clergy_profiles
 *
 * Stores the ecclesiastical metadata for Users who have role = 'clergymen'.
 * The actual identity/auth columns (name, email, password, etc.) live in `users`.
 * This table holds the church-specific fields that only apply to clergy.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clergy_profiles', function (Blueprint $table) {
            $table->id();

            // One-to-one with users. Cascade delete so orphan profiles never exist.
            $table->foreignId('user_id')
                  ->unique()
                  ->constrained('users')
                  ->cascadeOnDelete();

            // Parish this clergy member belongs to
            $table->foreignId('parish_id')
                  ->constrained('parishes')
                  ->cascadeOnDelete();

            // Ecclesiastical title
            $table->enum('title', ['Fr.', 'Rev.', 'Msgr.', 'Bp.', 'Cardinal', 'Deacon'])
                  ->default('Fr.');

            // e.g. "Marriage, Baptism" — free text, not normalized intentionally
            $table->string('specialization')->nullable();

            // JSON array of weekly mass schedule blocks:
            // [{ "day": "Sunday", "time": "6:00 AM", "type": "Regular Mass" }, ...]
            $table->json('schedule')->nullable();

            $table->timestamps();

            // Efficient lookups by parish (admin views clergy roster per parish)
            $table->index('parish_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clergy_profiles');
    }
};