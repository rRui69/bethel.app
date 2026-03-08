<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add image_url column to request_messages for chat image attachments
        Schema::table('request_messages', function (Blueprint $table) {
            $table->string('image_url', 1000)->nullable()->after('body');
        });

        // Fix notifications.type column — was too short for values like 'payment_submitted'
        Schema::table('notifications', function (Blueprint $table) {
            $table->string('type', 100)->change();
        });
    }

    public function down(): void
    {
        Schema::table('request_messages', function (Blueprint $table) {
            $table->dropColumn('image_url');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->string('type', 50)->change();
        });
    }
};