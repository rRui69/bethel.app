<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sacrament_requests', function (Blueprint $table) {
            // Clergy assignment
            $table->unsignedBigInteger('assigned_clergy_id')
                  ->nullable()
                  ->after('sacrament_type_id');
            $table->foreign('assigned_clergy_id')
                  ->references('id')->on('clergy')
                  ->nullOnDelete();
            // pending | confirmed | declined
            $table->string('clergy_status', 20)->default('unassigned')->after('assigned_clergy_id');

            // Payment
            // unpaid | submitted | verified | rejected
            $table->string('payment_status', 20)->default('unpaid')->after('admin_notes');
        });
    }

    public function down(): void
    {
        Schema::table('sacrament_requests', function (Blueprint $table) {
            $table->dropForeign(['assigned_clergy_id']);
            $table->dropColumn(['assigned_clergy_id', 'clergy_status', 'payment_status']);
        });
    }
};