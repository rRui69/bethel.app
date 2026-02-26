<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();

            // ── Relationships ──────────────────────────────────
            $table->foreignId('parish_id')
                ->constrained('parishes')
                ->cascadeOnDelete();

            // Nullable: regular events have no requestor,
            // sacramental requests always have one
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('clergy_id')
                ->nullable()
                ->constrained('clergy')
                ->nullOnDelete();

            // ── Core Fields ────────────────────────────────────
            $table->string('title');
            $table->text('description')->nullable();

            // Type determines if this is a regular event or sacramental request
            $table->enum('type', [
                // Regular events
                'Community',
                'Liturgy',
                'Youth',
                // Sacramental requests 
                'Baptism',
                'Marriage',
                'Confirmation',
                'Confession',
                'First Communion',
                'Anointing',
                'Burial',
            ]);

            // Scheduling
            $table->date('event_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('location')->nullable();

            // Request Status (for sacramental types)
            // Regular events use 'Approved' by default
            $table->enum('status', [
                'Pending',    // awaiting parish admin review
                'Approved',   // confirmed
                'Rejected',   // denied with reason
                'Completed',  // event/sacrament done
                'Cancelled',  // cancelled by user or admin
            ])->default('Pending');

            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();

            // Sacrament-specific extras 
            $table->json('sacrament_details')->nullable();
            // ex: { "godparents": [...], "sponsor": "...", "certificate_no": "..." }

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
