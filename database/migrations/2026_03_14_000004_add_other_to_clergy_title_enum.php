<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            ALTER TABLE clergy_profiles
            MODIFY COLUMN title ENUM(
                'Fr.', 'Rev.', 'Msgr.', 'Bp.', 'Cardinal', 'Deacon', 'Other'
            ) NOT NULL DEFAULT 'Fr.'
        ");
    }

    public function down(): void
    {
        // Remove any rows using 'Other' before reverting
        DB::statement("UPDATE clergy_profiles SET title = 'Fr.' WHERE title = 'Other'");

        DB::statement("
            ALTER TABLE clergy_profiles
            MODIFY COLUMN title ENUM(
                'Fr.', 'Rev.', 'Msgr.', 'Bp.', 'Cardinal', 'Deacon'
            ) NOT NULL DEFAULT 'Fr.'
        ");
    }
};
