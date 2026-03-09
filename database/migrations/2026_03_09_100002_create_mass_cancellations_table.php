<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mass_cancellations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('mass_schedule_id')
                  ->constrained('mass_schedules')
                  ->cascadeOnDelete();

            // The specific calendar date this occurrence is cancelled
            $table->date('cancelled_date');

            // Shown publicly on the mass schedule page
            $table->text('reason')->nullable();

            $table->foreignId('cancelled_by')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->timestamps();

            // A schedule can only be cancelled once per date
            $table->unique(['mass_schedule_id', 'cancelled_date']);

            // Public page queries cancellations by date range
            $table->index('cancelled_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mass_cancellations');
    }
};