<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('livestreams', function (Blueprint $table) {
            $table->id();

            // Relationships 
            // Every resource in BethelApp is scoped to a parish.
            // A parish admin can only manage their own parish's streams.
            $table->foreignId('parish_id')
                  ->constrained('parishes')
                  ->cascadeOnDelete();

            // The staff member (super_admin or parish_admin) who created this.
            // Kept even if user is deleted via nullOnDelete so archive records
            // are not lost.
            $table->foreignId('created_by')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();

            // Core Fields
            $table->string('title');
            $table->text('description')->nullable();

            // facebook → embed an existing FB Live/video URL
            // camera   → WebRTC broadcast via Agora.io SDK
            $table->enum('type', ['facebook', 'camera']);

            // Facebook Embed Fields
            // Supports both personal profile links and Facebook Page links.
            // Required when type = 'facebook', null otherwise.
            $table->string('facebook_url')->nullable();

            // Agora Camera Stream Fields 
            // Auto-generated unique channel name: "bethel-{random10}".
            // Used by both the broadcaster (host) and all viewers (audience).
            // Required when type = 'camera', null otherwise.
            $table->string('agora_channel')->nullable();

            // Stream Lifecycle
            // scheduled → created but not yet started
            // live      → currently broadcasting / embed is active
            // ended     → stream is over; may be archived
            $table->enum('status', ['scheduled', 'live', 'ended'])
                  ->default('scheduled');

            // Timestamps for the actual stream window (not row timestamps).
            // Used for archive display ("Streamed on March 10, 2026 at 9:00 AM")
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();

            // Archive
            // When true, the stream appears in the public archive list.
            // Automatically set to true when status transitions to 'ended'.
            // Admin can manually toggle off to suppress from archive.
            $table->boolean('is_archived')->default(false);

            $table->timestamps();

            // Indexes

            // Homepage widget query: WHERE parish_id = ? AND status = 'live'
            // Runs on every homepage load every 30-second
            $table->index(['parish_id', 'status']);

            // Archive page query: WHERE is_archived = true ORDER BY ended_at DESC
            $table->index(['parish_id', 'is_archived']);

            // Admin panel filter by stream type within a parish
            $table->index(['parish_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('livestreams');
    }
};