<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clergy_profiles', function (Blueprint $table) {
            $table->dropColumn('schedule');
        });
    }

    public function down(): void
    {
        Schema::table('clergy_profiles', function (Blueprint $table) {
            $table->json('schedule')->nullable()->after('specialization');
        });
    }
};