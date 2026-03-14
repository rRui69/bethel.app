<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parish_images', function (Blueprint $table) {
            $table->id();

            $table->foreignId('parish_id')
                  ->constrained('parishes')
                  ->cascadeOnDelete();

            // Cloudinary secure_url — stored as-is, no local path
            $table->string('image_url');

            // Lower = first. Admin can reorder via drag-and-drop later.
            $table->unsignedSmallInteger('sort_order')->default(0);

            $table->timestamps();

            // Fast lookup when building parish page
            $table->index(['parish_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parish_images');
    }
};