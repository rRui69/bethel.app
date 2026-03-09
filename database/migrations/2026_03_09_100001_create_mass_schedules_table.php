<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mass_schedules', function (Blueprint $table) {
            $table->id();

            $table->foreignId('parish_id')
                  ->constrained('parishes')
                  ->cascadeOnDelete();

            // Nullable: not every mass has an assigned celebrant at creation time
            $table->foreignId('clergy_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            $table->enum('type', [
                'Regular', 'Family', 'Youth', 'Daily',
                'Evening', 'Midday', 'Anticipated', 'Pilgrimage',
            ])->default('Regular');

            // recurring = repeats every week on day_of_week
            // one_time  = single occurrence on specific_date
            $table->enum('schedule_type', ['recurring', 'one_time'])->default('recurring');

            // 0=Sunday … 6=Saturday — populated only for recurring
            $table->tinyInteger('day_of_week')->nullable()
                  ->comment('0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat');

            // Populated only for one_time
            $table->date('specific_date')->nullable();

            $table->time('start_time');
            $table->time('end_time')->nullable();

            $table->string('livestream_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();

            $table->foreignId('created_by')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->timestamps();

            // Composite index — admin grid loads by parish + active
            $table->index(['parish_id', 'is_active']);
            // Public page loads recurring slots by day
            $table->index(['schedule_type', 'day_of_week']);
            // One-time lookup by date
            $table->index('specific_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mass_schedules');
    }
};