<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        //  1. Add min_price to sacrament_types
        Schema::table('sacrament_types', function (Blueprint $table) {
            $table->unsignedInteger('min_price')
                  ->default(0)
                  ->after('sort_order')
                  ->comment('Minimum base price in PHP centavos (store as whole pesos for simplicity)');
        });

        //  2. Add cancellation_reason to sacrament_requests
        Schema::table('sacrament_requests', function (Blueprint $table) {
            $table->text('cancellation_reason')->nullable()->after('admin_notes')
                  ->comment('Reason provided when cancelling — required from both sides');
        });

        // ── 3. Widen status column to accommodate new values ──────
        // status is a VARCHAR(20) — new values fit within that limit.
        // New values:
        //   pending_cancellation  — parishioner requested cancellation, awaiting admin
        //   cancelled_approved    — admin approved parishioner cancellation
        //   cancellation_rejected — admin rejected parishioner cancellation request
        //   cancelled_by_admin    — admin directly cancelled
        DB::statement("
            ALTER TABLE sacrament_requests
            MODIFY COLUMN status VARCHAR(30) NOT NULL DEFAULT 'pending'
        ");
    }

    public function down(): void
    {
        Schema::table('sacrament_types', function (Blueprint $table) {
            $table->dropColumn('min_price');
        });

        Schema::table('sacrament_requests', function (Blueprint $table) {
            $table->dropColumn('cancellation_reason');
        });

        DB::statement("
            ALTER TABLE sacrament_requests
            MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending'
        ");
    }
};
