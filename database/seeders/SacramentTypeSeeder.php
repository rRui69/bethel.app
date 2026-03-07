<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SacramentTypeSeeder extends Seeder
{
    public function run(): void
    {
        // Idempotent — skip if already seeded
        if (DB::table('sacrament_types')->count() > 0) {
            $this->command->info('SacramentTypeSeeder: already seeded, skipping.');
            return;
        }

        $now = now();

        DB::table('sacrament_types')->insert([

            [
                'name'        => 'Baptism',
                'slug'        => 'baptism',
                'description' => 'Schedule a baptism ceremony',
                'icon'        => 'waterdrop',
                'icon_color'  => '#1a3c5e',
                'icon_bg'     => '#dbeafe',
                'is_active'   => true,
                'sort_order'  => 0,
                'form_schema' => json_encode(['fields' => [
                    ['id' => 'f_bap1', 'type' => 'short_text', 'label' => "Child's Full Name",        'placeholder' => 'As it will appear on the certificate', 'required' => true],
                    ['id' => 'f_bap2', 'type' => 'date',       'label' => "Child's Date of Birth",    'required' => true],
                    ['id' => 'f_bap3', 'type' => 'short_text', 'label' => "Father's Full Name",        'placeholder' => '', 'required' => true],
                    ['id' => 'f_bap4', 'type' => 'short_text', 'label' => "Mother's Full Name",        'placeholder' => '', 'required' => true],
                    ['id' => 'f_bap5', 'type' => 'short_text', 'label' => "Godfather's Name",          'placeholder' => '', 'required' => false],
                    ['id' => 'f_bap6', 'type' => 'short_text', 'label' => "Godmother's Name",          'placeholder' => '', 'required' => false],
                    ['id' => 'f_bap7', 'type' => 'file',       'label' => 'Birth Certificate (PSA)',   'required' => true],
                ]]),
                'created_by' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],

            [
                'name'        => 'Wedding',
                'slug'        => 'wedding',
                'description' => 'Register for a church wedding',
                'icon'        => 'rings',
                'icon_color'  => '#9b1c1c',
                'icon_bg'     => '#fee2e2',
                'is_active'   => true,
                'sort_order'  => 1,
                'form_schema' => json_encode(['fields' => [
                    ['id' => 'f_wed1', 'type' => 'short_text', 'label' => "Bride's Full Name",              'placeholder' => '', 'required' => true],
                    ['id' => 'f_wed2', 'type' => 'short_text', 'label' => "Groom's Full Name",              'placeholder' => '', 'required' => true],
                    ['id' => 'f_wed3', 'type' => 'radio',      'label' => 'Type of Wedding',                'required' => true,  'options' => ['Solemn Wedding', 'Simple Wedding', 'Wedding Anniversary Blessing']],
                    ['id' => 'f_wed4', 'type' => 'file',       'label' => 'Certificate of No Impediment',   'required' => true],
                    ['id' => 'f_wed5', 'type' => 'file',       'label' => 'Baptismal Certificates (Both)',  'required' => true],
                    ['id' => 'f_wed6', 'type' => 'long_text',  'label' => 'Additional Notes',               'placeholder' => 'Any special requests', 'required' => false],
                ]]),
                'created_by' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],

            [
                'name'        => 'Confirmation',
                'slug'        => 'confirmation',
                'description' => 'Register for the Sacrament of Confirmation',
                'icon'        => 'check',
                'icon_color'  => '#065f46',
                'icon_bg'     => '#d1fae5',
                'is_active'   => true,
                'sort_order'  => 2,
                'form_schema' => json_encode(['fields' => [
                    ['id' => 'f_con1', 'type' => 'short_text', 'label' => 'Confirmation Name',   'placeholder' => 'Chosen saint name', 'required' => true],
                    ['id' => 'f_con2', 'type' => 'short_text', 'label' => "Sponsor's Full Name",  'placeholder' => '', 'required' => true],
                    ['id' => 'f_con3', 'type' => 'file',       'label' => 'Baptismal Certificate', 'required' => true],
                ]]),
                'created_by' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],

            [
                'name'        => 'Funeral Service',
                'slug'        => 'funeral-service',
                'description' => 'Schedule a funeral mass or burial service',
                'icon'        => 'candles',
                'icon_color'  => '#1e293b',
                'icon_bg'     => '#f1f5f9',
                'is_active'   => true,
                'sort_order'  => 3,
                'form_schema' => json_encode(['fields' => [
                    ['id' => 'f_fun1', 'type' => 'short_text', 'label' => "Deceased's Full Name",  'placeholder' => '', 'required' => true],
                    ['id' => 'f_fun2', 'type' => 'date',       'label' => 'Date of Death',          'required' => true],
                    ['id' => 'f_fun3', 'type' => 'radio',      'label' => 'Service Type',           'required' => true, 'options' => ['Funeral Mass', 'Graveside Blessing', 'Memorial Mass', 'Vigil Service']],
                    ['id' => 'f_fun4', 'type' => 'short_text', 'label' => 'Cemetery / Burial Location', 'placeholder' => '', 'required' => false],
                    ['id' => 'f_fun5', 'type' => 'file',       'label' => 'Death Certificate',      'required' => true],
                ]]),
                'created_by' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],

            [
                'name'        => 'Anointing of the Sick',
                'slug'        => 'anointing-of-the-sick',
                'description' => 'Request anointing for the ill or elderly',
                'icon'        => 'healing',
                'icon_color'  => '#4a1d96',
                'icon_bg'     => '#ede9fe',
                'is_active'   => true,
                'sort_order'  => 4,
                'form_schema' => json_encode(['fields' => [
                    ['id' => 'f_ano1', 'type' => 'short_text', 'label' => "Patient's Full Name",          'placeholder' => '', 'required' => true],
                    ['id' => 'f_ano2', 'type' => 'short_text', 'label' => "Patient's Location / Hospital", 'placeholder' => 'Room number or address', 'required' => true],
                    ['id' => 'f_ano3', 'type' => 'radio',      'label' => 'Urgency Level',                 'required' => true, 'options' => ['Urgent — Critical condition', 'Soon — Stable but serious', 'Regular — Elderly care']],
                    ['id' => 'f_ano4', 'type' => 'long_text',  'label' => 'Additional Information',        'placeholder' => 'Medical condition or notes', 'required' => false],
                ]]),
                'created_by' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],

            [
                'name'        => 'First Communion',
                'slug'        => 'first-communion',
                'description' => 'Register a child for their first Holy Communion',
                'icon'        => 'bread',
                'icon_color'  => '#1e40af',
                'icon_bg'     => '#e0e7ff',
                'is_active'   => true,
                'sort_order'  => 5,
                'form_schema' => json_encode(['fields' => [
                    ['id' => 'f_fc1', 'type' => 'short_text', 'label' => "Child's Full Name",     'placeholder' => '', 'required' => true],
                    ['id' => 'f_fc2', 'type' => 'date',       'label' => "Child's Date of Birth", 'required' => true],
                    ['id' => 'f_fc3', 'type' => 'checkbox',   'label' => 'Sacraments Already Received', 'required' => false, 'options' => ['Baptism', 'Reconciliation / Confession', 'Catechism Completed']],
                    ['id' => 'f_fc4', 'type' => 'file',       'label' => 'Baptismal Certificate', 'required' => true],
                ]]),
                'created_by' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],

            [
                'name'        => 'Blessing',
                'slug'        => 'blessing',
                'description' => 'Request a house, vehicle, or object blessing',
                'icon'        => 'hands',
                'icon_color'  => '#78350f',
                'icon_bg'     => '#fef3c7',
                'is_active'   => true,
                'sort_order'  => 6,
                'form_schema' => json_encode(['fields' => [
                    ['id' => 'f_ble1', 'type' => 'radio',      'label' => 'Type of Blessing', 'required' => true, 'options' => ['House Blessing', 'Vehicle Blessing', 'Object/Business Blessing', 'Other']],
                    ['id' => 'f_ble2', 'type' => 'short_text', 'label' => 'Address / Location', 'placeholder' => 'Where the blessing will take place', 'required' => true],
                    ['id' => 'f_ble3', 'type' => 'long_text',  'label' => 'Additional Notes',   'placeholder' => 'Any specific requests', 'required' => false],
                ]]),
                'created_by' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],

            [
                'name'        => 'Reconciliation',
                'slug'        => 'reconciliation',
                'description' => 'Schedule a private confession',
                'icon'        => 'chat',
                'icon_color'  => '#065f46',
                'icon_bg'     => '#d1fae5',
                'is_active'   => true,
                'sort_order'  => 7,
                'form_schema' => json_encode(['fields' => [
                    ['id' => 'f_rec1', 'type' => 'radio',     'label' => 'Confession Type', 'required' => true, 'options' => ['Individual Confession', 'Family Confession', 'Communal Penance Service']],
                    ['id' => 'f_rec2', 'type' => 'long_text', 'label' => 'Notes (optional)', 'placeholder' => 'Any special circumstances', 'required' => false],
                ]]),
                'created_by' => null,
                'created_at' => $now,
                'updated_at' => $now,
            ],

        ]);

        $this->command->info('SacramentTypeSeeder: 8 sacrament types seeded.');
    }
}