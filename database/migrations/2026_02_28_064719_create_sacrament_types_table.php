<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sacrament_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // Icon key maps to ICON_MAP.js in the frontend
            $table->string('icon', 40)->default('hands');
            $table->string('icon_color', 20)->default('#1a3c5e');
            $table->string('icon_bg', 20)->default('#dbeafe');

            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);

            // Dynamic form schema: { fields: [...] }
            // Fields here are CUSTOM fields only — fixed fields (name, parish, date,
            // time, participants) are always collected separately on every form.
            $table->json('form_schema')->nullable();

            // Track who built this sacrament type
            $table->unsignedBigInteger('created_by')->nullable();

            $table->timestamps();

            $table->index(['is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sacrament_types');
    }
};