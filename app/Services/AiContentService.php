<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiContentService
{
    private string $apiKey;
    private string $model;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.openai.key', '');
        $this->model = config('services.openai.model', 'gpt-4o-mini');
        $this->baseUrl = 'https://api.openai.com/v1';
    }

    public function generateFromRssItem(array $rssItem): ?array
    {
        if (empty($this->apiKey)) {
            Log::warning('OpenAI API key not configured. Skipping generation.');
            return null;
        }

        $categories = Category::orderBy('sort_order')->get(['id', 'name'])->toArray();
        $categoryList = collect($categories)->map(fn ($c) => "{$c['id']}: {$c['name']}")->join(', ');

        $prompt = $this->buildPrompt($rssItem, $categoryList);

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(90)
                ->post("{$this->baseUrl}/chat/completions", [
                    'model' => $this->model,
                    'messages' => [
                        ['role' => 'system', 'content' => $this->systemPrompt()],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'response_format' => ['type' => 'json_object'],
                    'temperature' => 0.7,
                    'max_tokens' => 2500,
                ]);

            if ($response->failed()) {
                Log::error('OpenAI API error: ' . $response->body());
                return null;
            }

            $content = $response->json('choices.0.message.content');
            $data = json_decode($content, true);

            if (! $this->isValidOutput($data)) {
                Log::warning('Invalid AI output structure', ['data' => $data]);
                return null;
            }

            return $data;

        } catch (\Exception $e) {
            Log::error('AiContentService error: ' . $e->getMessage());
            return null;
        }
    }

    private function systemPrompt(): string
    {
        return <<<PROMPT
You are an expert AI content writer for AITutorials.com — a website helping everyday users learn how to use AI tools effectively.

Your job is to take a news/article snippet and rewrite it as an original, valuable tutorial-style article in English.

Rules:
- Write for a non-technical audience (everyday users, not developers)
- Focus on practical use cases and actionable tips
- Do NOT copy the source text — rewrite completely in your own words
- Use proper HTML headings (h2, h3), paragraphs, and bullet lists for the content field
- Keep a professional but friendly and accessible tone
- Always return valid JSON matching the exact schema provided
PROMPT;
    }

    private function buildPrompt(array $rssItem, string $categoryList): string
    {
        return <<<PROMPT
Based on this AI news item, write an original tutorial-style article for everyday users.

SOURCE TITLE: {$rssItem['title']}
SOURCE SUMMARY: {$rssItem['description']}
SOURCE URL: {$rssItem['link']}

AVAILABLE CATEGORIES: {$categoryList}

Return a JSON object with EXACTLY these fields:
{
  "title": "Engaging, SEO-friendly article title (max 70 chars)",
  "excerpt": "2-3 sentence summary for article cards (max 200 chars)",
  "content": "Full article in HTML with h2/h3 headings, p tags, ul/ol lists. Min 400 words. No inline styles.",
  "meta_title": "SEO meta title (max 60 chars)",
  "meta_description": "SEO meta description (max 155 chars)",
  "category_id": "ID number from the available categories list (integer)",
  "suggested_tags": ["tag1", "tag2", "tag3"]
}
PROMPT;
    }

    private function isValidOutput(?array $data): bool
    {
        if (! is_array($data)) {
            return false;
        }

        $required = ['title', 'excerpt', 'content', 'meta_title', 'meta_description', 'category_id'];

        foreach ($required as $field) {
            if (empty($data[$field])) {
                return false;
            }
        }

        return true;
    }
}
