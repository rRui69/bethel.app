<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('request_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sacrament_request_id')
                  ->constrained('sacrament_requests')
                  ->cascadeOnDelete();
            $table->foreignId('sender_id')
                  ->constrained('users')
                  ->cascadeOnDelete();
            $table->text('body');
            // Track read status for the other side
            $table->boolean('read_by_admin')->default(false);
            $table->boolean('read_by_parishioner')->default(false);
            $table->timestamps();

            $table->index(['sacrament_request_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_messages');
    }
};