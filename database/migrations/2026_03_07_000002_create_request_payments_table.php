<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('request_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sacrament_request_id')
                  ->constrained('sacrament_requests')
                  ->cascadeOnDelete();
            $table->foreignId('user_id')
                  ->constrained()
                  ->cascadeOnDelete();
            // gcash | bank_transfer | cash | other
            $table->string('method', 40)->default('gcash');
            $table->decimal('amount', 10, 2)->nullable();
            // Path to uploaded proof image in storage/app/public/payments/
            $table->string('proof_path')->nullable();
            // unpaid | submitted | verified | rejected
            $table->string('status', 20)->default('submitted');
            $table->text('admin_notes')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()
                  ->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['sacrament_request_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_payments');
    }
};