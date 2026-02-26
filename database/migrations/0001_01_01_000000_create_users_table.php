<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // ── Credentials ───────────────────────────────────────────
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->string('password');
            $table->rememberToken();
            $table->enum('role', ['super_admin', 'parish_admin', 'clergymen', 'parishioner'])
                  ->default('parishioner');

            // ── Account Status ────────────────────────────────────────
            $table->enum('account_status', ['Active', 'Inactive', 'Suspended'])
                  ->default('Active');

            // ── Personal Info ─────────────────────────────────────────
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->date('birth_date');
            $table->enum('gender', ['Male', 'Female', 'Prefer not to say']);

            // ── Contact ───────────────────────────────────────────────
            // FIX: was unsignedBigInteger — phone numbers need strings
            // to support leading zeros, +63 prefix, dashes, etc.
            $table->string('phone', 20);

            $table->string('country')->default('Philippines');
            $table->string('province')->nullable();
            $table->string('city');
            $table->string('barangay');
            $table->string('street_address')->nullable();
            $table->string('zip_code', 10)->nullable();

            $table->timestamp('email_verified_at')->nullable();
            $table->timestamps();

            // ── Soft Deletes ──────────────────────────────────────────
            $table->softDeletes();

            // ── Indexes ───────────────────────────────────────────────
            // Composite index for most common admin filter: role + status
            $table->index(['role', 'account_status']);
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
