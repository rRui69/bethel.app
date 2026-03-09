<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migrates sacrament_requests.assigned_clergy_id
 * from FK → clergy.id  →  FK → users.id
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sacrament_requests', function (Blueprint $table) {
            // 1. Drop the existing FK constraint pointing at clergy
            $table->dropForeign(['assigned_clergy_id']);

            // 2. Re-add the FK pointing at users.id
            //    nullOnDelete: if the clergy user is deleted, assignment is cleared
            $table->foreign('assigned_clergy_id')
                  ->references('id')
                  ->on('users')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('sacrament_requests', function (Blueprint $table) {
            $table->dropForeign(['assigned_clergy_id']);

            // Restore original FK back to clergy table (rollback scenario)
            $table->foreign('assigned_clergy_id')
                  ->references('id')
                  ->on('clergy')
                  ->nullOnDelete();
        });
    }
};