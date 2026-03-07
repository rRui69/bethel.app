<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sacrament_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parish_id')->constrained('parishes')->cascadeOnDelete();

            // Link to the admin-defined sacrament type
            $table->foreignId('sacrament_type_id')
                  ->nullable()
                  ->constrained('sacrament_types')
                  ->nullOnDelete();

            // Denormalized name so records survive type deletion
            $table->string('sacrament_type');

            // Fixed fields — always collected on every form
            $table->date('preferred_date')->nullable();
            $table->string('preferred_time', 10)->nullable(); // HH:MM
            $table->unsignedSmallInteger('participants')->default(1);

            // Custom field responses — keyed by field ID from form_schema
            $table->json('details')->nullable();

            $table->string('status', 20)->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('sacrament_type_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sacrament_requests');
    }
};