<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migrates events.clergy_id
 * from FK → clergy.id  →  FK → users.id
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Drop existing FK pointing at clergy
            $table->dropForeign(['clergy_id']);

            // Re-add FK pointing at users.id
            $table->foreign('clergy_id')
                  ->references('id')
                  ->on('users')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropForeign(['clergy_id']);

            $table->foreign('clergy_id')
                  ->references('id')
                  ->on('clergy')
                  ->nullOnDelete();
        });
    }
};