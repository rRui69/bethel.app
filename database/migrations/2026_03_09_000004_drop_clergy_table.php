<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;  

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('clergy');
    }

    public function down(): void
    {
        // Restore the original clergy table structure for rollback.
        Schema::create('clergy', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parish_id')
                  ->constrained('parishes')
                  ->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('middle_name')->nullable();
            $table->enum('title', ['Fr.', 'Rev.', 'Msgr.', 'Bp.', 'Cardinal', 'Deacon'])
                  ->default('Fr.');
            $table->enum('status', ['Active', 'On Leave', 'Transferred', 'Retired'])
                  ->default('Active');
            $table->string('specialization')->nullable();
            $table->text('schedule')->nullable();
            $table->string('phone', 20)->nullable();
            $table->string('email')->nullable();
            $table->timestamps();
        });
    }
};