<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clergy_profiles', function (Blueprint $table) {
            // Short biography shown on the public clergy profile page
            $table->text('bio')->nullable()->after('specialization');

            // Cloudinary secure_url for clergy headshot
            $table->string('image_url')->nullable()->after('bio');
        });
    }

    public function down(): void
    {
        Schema::table('clergy_profiles', function (Blueprint $table) {
            $table->dropColumn(['bio', 'image_url']);
        });
    }
};