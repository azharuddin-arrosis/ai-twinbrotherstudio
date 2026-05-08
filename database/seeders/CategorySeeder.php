<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'AI Tutorials',       'slug' => 'ai-tutorials',       'color' => '#6366f1', 'sort_order' => 1, 'description' => 'Step-by-step guides to using AI tools effectively.'],
            ['name' => 'AI Tools Review',    'slug' => 'ai-tools-review',    'color' => '#8b5cf6', 'sort_order' => 2, 'description' => 'In-depth reviews and comparisons of AI tools.'],
            ['name' => 'AI for Work',        'slug' => 'ai-for-work',        'color' => '#0ea5e9', 'sort_order' => 3, 'description' => 'Boost productivity with AI in your daily work.'],
            ['name' => 'AI for Creativity', 'slug' => 'ai-for-creativity',  'color' => '#f59e0b', 'sort_order' => 4, 'description' => 'Design, write, and create with AI assistance.'],
            ['name' => 'AI News',            'slug' => 'ai-news',            'color' => '#10b981', 'sort_order' => 5, 'description' => 'Latest AI news and developments, curated and simplified.'],
            ['name' => 'Prompt Library',     'slug' => 'ai-prompt-library',  'color' => '#ef4444', 'sort_order' => 6, 'description' => 'Ready-to-use prompts for every use case.'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
