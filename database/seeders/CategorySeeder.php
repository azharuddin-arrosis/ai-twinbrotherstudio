<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'AI & Automation', 'slug' => 'ai-automation', 'color' => '#6366f1', 'sort_order' => 1,
                'description' => 'Tutorials, guides, and prompts for AI tools and workflow automation.',
                'keywords' => ['ai', 'artificial intelligence', 'chatgpt', 'gpt', 'claude', 'gemini', 'llm', 'machine learning', 'openai', 'anthropic', 'copilot', 'midjourney', 'stable diffusion', 'dall-e', 'prompt', 'generative ai', 'automation', 'n8n', 'zapier'],
            ],
            [
                'name' => 'Productivity & Tools', 'slug' => 'productivity-tools', 'color' => '#0ea5e9', 'sort_order' => 2,
                'description' => 'Apps, workflows, and strategies to get more done in less time.',
                'keywords' => ['productivity', 'workflow', 'notion', 'obsidian', 'todoist', 'time management', 'focus', 'task manager', 'calendar', 'efficiency', 'tool', 'app', 'software'],
            ],
            [
                'name' => 'Design & Creativity', 'slug' => 'design-creativity', 'color' => '#f59e0b', 'sort_order' => 3,
                'description' => 'Canva, Figma, AI art, video, audio, and creative tools for everyone.',
                'keywords' => ['design', 'canva', 'figma', 'ui', 'ux', 'graphic', 'illustration', 'typography', 'color', 'creative', 'video editing', 'animation', 'photoshop', 'adobe'],
            ],
            [
                'name' => 'Writing & Content', 'slug' => 'writing-content', 'color' => '#8b5cf6', 'sort_order' => 4,
                'description' => 'Copywriting, blogging, SEO content, and storytelling techniques.',
                'keywords' => ['writing', 'copywriting', 'content', 'blogging', 'seo', 'storytelling', 'newsletter', 'headline', 'editorial', 'proofreading', 'grammar'],
            ],
            [
                'name' => 'Business & Marketing', 'slug' => 'business-marketing', 'color' => '#10b981', 'sort_order' => 5,
                'description' => 'Side hustles, growth strategies, ads, and social media marketing.',
                'keywords' => ['business', 'marketing', 'startup', 'growth', 'social media', 'ads', 'facebook', 'instagram', 'tiktok', 'email marketing', 'entrepreneur', 'side hustle', 'revenue', 'sales'],
            ],
            [
                'name' => 'Developer Tools', 'slug' => 'developer-tools', 'color' => '#ec4899', 'sort_order' => 6,
                'description' => 'Coding tools, GitHub, VS Code, CLI tricks, and dev workflows.',
                'keywords' => ['developer', 'coding', 'github', 'vscode', 'cli', 'terminal', 'programming', 'open source', 'api', 'devops', 'docker', 'git', 'javascript', 'python'],
            ],
            [
                'name' => 'Learning & Career', 'slug' => 'learning-career', 'color' => '#f97316', 'sort_order' => 7,
                'description' => 'Online courses, upskilling guides, and career development tips.',
                'keywords' => ['learning', 'course', 'skill', 'career', 'job', 'interview', 'resume', 'upskill', 'education', 'certification', 'online learning', 'mentorship'],
            ],
            [
                'name' => 'Tech News', 'slug' => 'tech-news', 'color' => '#14b8a6', 'sort_order' => 8,
                'description' => 'Latest tech news, product launches, and tool reviews simplified.',
                'keywords' => null, // null = ambil semua item tanpa filter
            ],
        ];

        foreach ($categories as $category) {
            Category::updateOrCreate(['slug' => $category['slug']], $category);
        }
    }
}
