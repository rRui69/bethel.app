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
    Schema::create('parishes', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('diocese')->nullable();
        $table->string('address');
        $table->string('barangay');
        $table->string('city');
        $table->string('province')->nullable();
        $table->string('country')->default('Philippines');
        $table->string('zip_code', 10)->nullable();
        $table->string('phone', 20)->nullable();
        $table->string('email')->nullable();
        $table->enum('status', ['Active', 'Inactive'])->default('Active');
        $table->text('description')->nullable();
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parishes');
    }
};
