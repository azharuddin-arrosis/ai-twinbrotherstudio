<?php

namespace Database\Seeders;

use App\Models\ContactSetting;
use Illuminate\Database\Seeder;

class ContactSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'admin_email', 'label' => 'Admin Email (receives inquiries)', 'value' => 'hello@twinbrotherstudio.com'],
            ['key' => 'whatsapp_number', 'label' => 'WhatsApp Number (with country code)', 'value' => null],
            ['key' => 'linkedin_url', 'label' => 'LinkedIn Profile URL', 'value' => null],
            ['key' => 'instagram_url', 'label' => 'Instagram URL', 'value' => null],
            ['key' => 'twitter_url', 'label' => 'Twitter/X URL', 'value' => null],
            ['key' => 'github_url', 'label' => 'GitHub URL', 'value' => null],
        ];

        foreach ($settings as $setting) {
            ContactSetting::updateOrCreate(['key' => $setting['key']], $setting);
        }
    }
}
