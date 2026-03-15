<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * BethelApp — Single consolidated migration.
 * Run with: php artisan migrate:fresh --seed
 *
 * Tables (in FK dependency order):
 *   1.  users                    (core auth + profile)
 *   2.  password_reset_tokens
 *   3.  sessions
 *   4.  cache / cache_locks
 *   5.  jobs / job_batches / failed_jobs
 *   6.  parishes
 *   7.  parish_images
 *   8.  clergy_profiles
 *   9.  events
 *   10. announcements
 *   11. notifications
 *   12. sacrament_types
 *   13. sacrament_requests
 *   14. request_payments
 *   15. request_messages
 *   16. mass_schedules
 *   17. mass_cancellations
 *   18. livestreams
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── 1. users ──────────────────────────────────────────────
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parish_id')->nullable();

            // Credentials
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->string('password');
            $table->rememberToken();

            $table->enum('role', [
                'super_admin', 'parish_admin', 'parish_helpdesk', 'clergymen', 'parishioner',
            ])->default('parishioner');

            $table->enum('account_status', ['Active', 'Inactive', 'Suspended'])->default('Active');

            // Personal info
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->date('birth_date');
            $table->enum('gender', ['Male', 'Female', 'Prefer not to say']);

            // Contact
            $table->string('phone', 20);
            $table->string('country')->default('Philippines');
            $table->string('province')->nullable();
            $table->string('city')->nullable();
            $table->string('barangay')->nullable();
            $table->string('street_address')->nullable();
            $table->string('zip_code', 10)->nullable();

            // Auth / verification
            $table->timestamp('email_verified_at')->nullable();
            $table->string('avatar_url')->nullable()->comment('Cloudinary secure_url for profile picture');
            $table->string('otp_code', 20)->nullable();
            $table->timestamp('otp_expires_at')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['role', 'account_status']);
        });

        // ── 2. password_reset_tokens ───────────────────────────────
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // ── 3. sessions ────────────────────────────────────────────
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        // ── 4. cache ───────────────────────────────────────────────
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration')->index();
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration')->index();
        });

        // ── 5. jobs ────────────────────────────────────────────────
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('queue')->index();
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
        });

        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name');
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });

        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });

        // ── 6. parishes ────────────────────────────────────────────
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

        // FK: users → parishes (added after parishes exists)
        Schema::table('users', function (Blueprint $table) {
            $table->foreign('parish_id')->references('id')->on('parishes')->cascadeOnDelete();
        });

        // ── 7. parish_images ───────────────────────────────────────
        Schema::create('parish_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parish_id')->constrained('parishes')->cascadeOnDelete();
            $table->string('image_url');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
            $table->index(['parish_id', 'sort_order']);
        });

        // ── 8. clergy_profiles ─────────────────────────────────────
        Schema::create('clergy_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->foreignId('parish_id')->constrained('parishes')->cascadeOnDelete();

            $table->enum('title', [
                'Fr.', 'Rev.', 'Msgr.', 'Bp.', 'Cardinal', 'Deacon', 'Other',
            ])->default('Fr.');

            $table->string('custom_title', 100)->nullable()
                  ->comment('Free-text position label e.g. Parish Priest, Chaplain');
            $table->string('specialization')->nullable();
            $table->text('bio')->nullable();
            $table->string('image_url')->nullable()->comment('Cloudinary headshot URL');

            $table->timestamps();
            $table->index('parish_id');
        });

        // ── 9. events ──────────────────────────────────────────────
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parish_id')->constrained('parishes')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('clergy_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            $table->enum('type', [
                'Community', 'Liturgy', 'Youth',
                'Baptism', 'Marriage', 'Confirmation', 'Confession',
                'First Communion', 'Anointing', 'Burial',
            ]);

            $table->date('event_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('location')->nullable();

            $table->enum('status', [
                'Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled',
            ])->default('Pending');

            $table->text('rejection_reason')->nullable();
            $table->text('notes')->nullable();
            $table->json('sacrament_details')->nullable();

            $table->timestamps();
        });

        // ── 10. announcements ──────────────────────────────────────
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parish_id')->constrained('parishes')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('title');
            $table->text('body');
            $table->string('excerpt', 300)->nullable();
            $table->enum('category', [
                'Parish News', 'Community', 'Liturgy', 'Youth', 'General',
            ])->default('General');
            $table->string('image_path')->nullable();
            $table->enum('status', ['Draft', 'Published', 'Archived'])->default('Published');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        // ── 11. notifications ──────────────────────────────────────
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('message');
            $table->string('type', 100)->default('info');
            $table->boolean('is_read')->default(false);
            $table->morphs('notifiable');
            $table->timestamps();
            $table->index(['user_id', 'is_read']);
        });

        // ── 12. sacrament_types ────────────────────────────────────
        Schema::create('sacrament_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            $table->string('icon', 40)->default('hands');
            $table->string('icon_color', 20)->default('#1a3c5e');
            $table->string('icon_bg', 20)->default('#dbeafe');

            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->unsignedInteger('min_price')->default(0)
                  ->comment('Minimum base price in whole pesos');

            $table->json('form_schema')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();

            $table->timestamps();
            $table->index(['is_active', 'sort_order']);
        });

        // ── 13. sacrament_requests ─────────────────────────────────
        Schema::create('sacrament_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('parish_id')->constrained('parishes')->cascadeOnDelete();
            $table->foreignId('sacrament_type_id')->nullable()
                  ->constrained('sacrament_types')->nullOnDelete();

            $table->string('sacrament_type');

            // Clergy assignment
            $table->unsignedBigInteger('assigned_clergy_id')->nullable();
            $table->foreign('assigned_clergy_id')->references('id')->on('users')->nullOnDelete();
            $table->string('clergy_status', 20)->default('unassigned');

            $table->date('preferred_date')->nullable();
            $table->string('preferred_time', 10)->nullable();
            $table->unsignedSmallInteger('participants')->default(1);
            $table->json('details')->nullable();

            // VARCHAR(30) to fit cancellation status values
            $table->string('status', 30)->default('pending');
            // Statuses: pending | approved | rejected | cancelled |
            //           cancellation_requested | cancellation_rejected

            $table->text('admin_notes')->nullable();
            $table->string('payment_status', 20)->default('unpaid');
            $table->text('cancellation_reason')->nullable();

            $table->timestamps();
            $table->index(['status', 'created_at']);
            $table->index('sacrament_type_id');
        });

        // ── 14. request_payments ───────────────────────────────────
        Schema::create('request_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sacrament_request_id')
                  ->constrained('sacrament_requests')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('method', 40)->default('gcash');
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('proof_path')->nullable();
            $table->string('status', 20)->default('submitted');
            $table->text('admin_notes')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['sacrament_request_id', 'status']);
        });

        // ── 15. request_messages ───────────────────────────────────
        Schema::create('request_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sacrament_request_id')
                  ->constrained('sacrament_requests')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->string('image_url', 1000)->nullable();
            $table->boolean('read_by_admin')->default(false);
            $table->boolean('read_by_parishioner')->default(false);
            $table->timestamps();
            $table->index(['sacrament_request_id', 'created_at']);
        });

        // ── 16. mass_schedules ─────────────────────────────────────
        Schema::create('mass_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parish_id')->constrained('parishes')->cascadeOnDelete();
            $table->foreignId('clergy_id')->nullable()->constrained('users')->nullOnDelete();

            $table->enum('type', [
                'Regular', 'Family', 'Youth', 'Daily',
                'Evening', 'Midday', 'Anticipated', 'Pilgrimage',
            ])->default('Regular');

            $table->enum('schedule_type', ['recurring', 'one_time'])->default('recurring');
            $table->tinyInteger('day_of_week')->nullable()
                  ->comment('0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat');
            $table->date('specific_date')->nullable();

            $table->time('start_time');
            $table->time('end_time')->nullable();
            $table->string('livestream_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();

            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['parish_id', 'is_active']);
            $table->index(['schedule_type', 'day_of_week']);
            $table->index('specific_date');
        });

        // ── 17. mass_cancellations ─────────────────────────────────
        Schema::create('mass_cancellations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mass_schedule_id')
                  ->constrained('mass_schedules')->cascadeOnDelete();
            $table->date('cancelled_date');
            $table->text('reason')->nullable();
            $table->foreignId('cancelled_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['mass_schedule_id', 'cancelled_date']);
            $table->index('cancelled_date');
        });

        // ── 18. livestreams ────────────────────────────────────────
        Schema::create('livestreams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parish_id')->constrained('parishes')->cascadeOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['facebook', 'camera']);
            $table->string('facebook_url')->nullable();
            $table->string('agora_channel')->nullable();

            $table->enum('status', ['scheduled', 'live', 'ended'])->default('scheduled');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->boolean('is_archived')->default(false);

            $table->timestamps();

            $table->index(['parish_id', 'status']);
            $table->index(['parish_id', 'is_archived']);
            $table->index(['parish_id', 'type']);
        });
    }

    public function down(): void
    {
        // Drop in reverse FK dependency order
        Schema::dropIfExists('livestreams');
        Schema::dropIfExists('mass_cancellations');
        Schema::dropIfExists('mass_schedules');
        Schema::dropIfExists('request_messages');
        Schema::dropIfExists('request_payments');
        Schema::dropIfExists('sacrament_requests');
        Schema::dropIfExists('sacrament_types');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('events');
        Schema::dropIfExists('clergy_profiles');
        Schema::dropIfExists('parish_images');

        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['parish_id']);
        });

        Schema::dropIfExists('parishes');
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};