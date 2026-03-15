<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Add avatar_url to users ───────────────────────────
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_url')->nullable()->after('email_verified_at')
                  ->comment('Cloudinary secure_url for profile picture');
        });

        // ── 2. Mark all existing users as email-verified ─────────
        // Users created before the OTP system was introduced have
        // email_verified_at = null which blocks the 'verified' middleware.
        // They were already trusted (created by admins or before the gate existed).
        DB::table('users')
            ->whereNull('email_verified_at')
            ->update(['email_verified_at' => now()]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('avatar_url');
        });
    }
};
