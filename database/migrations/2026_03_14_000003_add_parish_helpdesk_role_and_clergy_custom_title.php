<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Add parish_helpdesk to the role enum ──────────────────
        // MySQL requires rebuilding the enum definition to add a value.
        DB::statement("
            ALTER TABLE users
            MODIFY COLUMN role ENUM(
                'super_admin',
                'parish_admin',
                'parish_helpdesk',
                'clergymen',
                'parishioner'
            ) NOT NULL DEFAULT 'parishioner'
        ");

        // ── 2. Add custom_title to clergy_profiles ───────────────────
        // Free-text role descriptor e.g. "Parish Priest", "Chaplain"
        // stored alongside the ecclesiastical title dropdown (Fr., Rev. etc.)
        Schema::table('clergy_profiles', function (Blueprint $table) {
            $table->string('custom_title', 100)
                  ->nullable()
                  ->after('title')
                  ->comment('Free-text position label e.g. Parish Priest, Chaplain');
        });
    }

    public function down(): void
    {
        // Remove custom_title from clergy_profiles
        Schema::table('clergy_profiles', function (Blueprint $table) {
            $table->dropColumn('custom_title');
        });

        // Revert role enum (remove parish_helpdesk)
        DB::statement("
            ALTER TABLE users
            MODIFY COLUMN role ENUM(
                'super_admin',
                'parish_admin',
                'clergymen',
                'parishioner'
            ) NOT NULL DEFAULT 'parishioner'
        ");
    }
};