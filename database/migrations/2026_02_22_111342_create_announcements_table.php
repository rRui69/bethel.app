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
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parish_id')
                ->constrained('parishes')
                ->cascadeOnDelete();
            $table->foreignId('user_id')      // admin who posted it
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->string('title');
            $table->text('body');
            $table->string('excerpt', 300)->nullable();
            $table->enum('category', ['Parish News', 'Community', 'Liturgy', 'Youth', 'General'])
                ->default('General');
            $table->string('image_path')->nullable();
            $table->enum('status', ['Draft', 'Published', 'Archived'])->default('Published');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
