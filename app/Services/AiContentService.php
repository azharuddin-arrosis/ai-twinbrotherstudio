<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiContentService
{
    private string $apiKey;
    private array $models;
    private string $baseUrl;

    public function __construct()
    {
        $this->apiKey = config('services.openai.key', '');
        $this->models = config('services.openai.models', ['gpt-4o-mini']);
        $this->baseUrl = config('services.openai.base_url', 'https://api.openai.com/v1');
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

        foreach ($this->models as $model) {
            try {
                $response = Http::withToken($this->apiKey)
                    ->timeout(90)
                    ->post("{$this->baseUrl}/chat/completions", [
                        'model' => $model,
                        'messages' => [
                            ['role' => 'system', 'content' => $this->systemPrompt()],
                            ['role' => 'user', 'content' => $prompt],
                        ],
                        'response_format' => ['type' => 'json_object'],
                        'temperature' => 0.7,
                        'max_tokens' => 4000,
                    ]);

                // 401 = wrong API key, no point trying other models
                if ($response->status() === 401) {
                    Log::error("AiContentService: unauthorized — check OPENAI_API_KEY");
                    return null;
                }

                if ($response->status() === 429) {
                    Log::warning("AiContentService: model [{$model}] rate limited, trying next");
                    sleep(2);
                    continue;
                }

                if ($response->failed()) {
                    Log::warning("AiContentService: model [{$model}] failed ({$response->status()}), trying next");
                    continue;
                }

                $content = $response->json('choices.0.message.content');
                $data = $this->parseJson($content);

                if (! $this->isValidOutput($data)) {
                    $missing = $this->getMissingFields($data);
                    Log::warning("AiContentService: invalid output from [{$model}], missing: [{$missing}], trying next");
                    continue;
                }

                if (count($this->models) > 1) {
                    Log::info("AiContentService: generated with [{$model}]");
                }

                return $data;

            } catch (\Exception $e) {
                Log::warning("AiContentService: model [{$model}] exception — {$e->getMessage()}, trying next");
                continue;
            }
        }

        Log::error('AiContentService: all models failed for: ' . $rssItem['link']);
        return null;
    }

    public function checkHumanity(string $content): array
    {
        if (empty($this->apiKey)) {
            return ['error' => 'API key not configured.'];
        }

        $text = mb_substr(strip_tags($content), 0, 3000);

        $prompt = <<<PROMPT
Analyze the following article text and evaluate how "human" vs "AI-generated" it sounds.

Return a JSON object with EXACTLY these fields:
{
  "score": <integer 0-100, where 0=fully AI-generated, 100=fully human-written>,
  "category": <"human" if score >= 80, "mixed" if score >= 50, "ai" if score < 50>,
  "issues": ["list specific AI-like patterns found, e.g. 'Repetitive sentence structure', 'Overuse of transition phrases like In conclusion, Furthermore'"],
  "suggestions": ["concrete improvement suggestions to make text sound more human and natural"]
}

TEXT TO ANALYZE:
{$text}
PROMPT;

        foreach ($this->models as $model) {
            try {
                $response = Http::withToken($this->apiKey)
                    ->timeout(60)
                    ->post("{$this->baseUrl}/chat/completions", [
                        'model' => $model,
                        'messages' => [
                            ['role' => 'system', 'content' => 'You are an expert at detecting AI-generated content. Analyze text and return JSON only, no other text.'],
                            ['role' => 'user', 'content' => $prompt],
                        ],
                        'response_format' => ['type' => 'json_object'],
                        'temperature' => 0.3,
                        'max_tokens' => 600,
                    ]);

                if ($response->status() === 401) {
                    return ['error' => 'Unauthorized — check OPENAI_API_KEY'];
                }

                if ($response->failed()) {
                    continue;
                }

                $raw = $response->json('choices.0.message.content');
                $data = $this->parseJson($raw);

                if (! isset($data['score'], $data['category'])) {
                    continue;
                }

                $data['score'] = max(0, min(100, (int) $data['score']));

                return $data;

            } catch (\Exception $e) {
                Log::warning("checkHumanity: model [{$model}] failed — {$e->getMessage()}");
                continue;
            }
        }

        return ['error' => 'All models failed.'];
    }

    public function translateArticle(array $article, string $targetLang): ?array
    {
        if (empty($this->apiKey)) {
            return null;
        }

        $langNames = [
            'pt-BR' => 'Brazilian Portuguese',
            'de'    => 'German',
            'id'    => 'Indonesian',
        ];

        $langName = $langNames[$targetLang] ?? $targetLang;

        $prompt = <<<PROMPT
Translate the following article into {$langName}.

RULES:
- Translate title, excerpt, content, meta_title, and meta_description
- Keep all HTML tags (h2, h3, p, ul, li) intact — only translate the text inside
- Keep proper nouns, brand names, and tool names in English (ChatGPT, Notion, GitHub, etc.)
- Sound natural and fluent — not like a literal word-for-word translation
- Return a JSON object with EXACTLY these fields:
{
  "title": "translated title",
  "excerpt": "translated excerpt (max 200 chars)",
  "content": "translated full HTML content",
  "meta_title": "translated meta title (max 60 chars)",
  "meta_description": "translated meta description (max 155 chars)"
}

SOURCE TITLE: {$article['title']}
SOURCE EXCERPT: {$article['excerpt']}
SOURCE META TITLE: {$article['meta_title']}
SOURCE META DESCRIPTION: {$article['meta_description']}
SOURCE CONTENT:
{$article['content']}
PROMPT;

        foreach ($this->models as $model) {
            try {
                $response = Http::withToken($this->apiKey)
                    ->timeout(120)
                    ->post("{$this->baseUrl}/chat/completions", [
                        'model' => $model,
                        'messages' => [
                            ['role' => 'system', 'content' => "You are a professional translator. Translate articles accurately and naturally into {$langName}. Return JSON only."],
                            ['role' => 'user', 'content' => $prompt],
                        ],
                        'response_format' => ['type' => 'json_object'],
                        'temperature' => 0.3,
                        'max_tokens' => 4000,
                    ]);

                if ($response->status() === 401) {
                    return null;
                }

                if ($response->status() === 429) {
                    sleep(2);
                    continue;
                }

                if ($response->failed()) {
                    continue;
                }

                $content = $response->json('choices.0.message.content');
                $data = $this->parseJson($content);

                if (empty($data['title']) || empty($data['content'])) {
                    continue;
                }

                return $data;

            } catch (\Exception $e) {
                Log::warning("translateArticle: model [{$model}] failed — {$e->getMessage()}");
                continue;
            }
        }

        Log::error("translateArticle: all models failed for lang [{$targetLang}]");
        return null;
    }

    public function rewriteForHumanity(string $content, array $issues): ?string
    {
        if (empty($this->apiKey)) {
            return null;
        }

        $issueList = implode("\n- ", $issues);
        $truncated = mb_substr(strip_tags($content), 0, 3000);

        $prompt = <<<PROMPT
Rewrite the following article content to sound more natural and human-written.

ISSUES TO FIX:
- {$issueList}

RULES:
- Keep the same information and structure (h2/h3 headings, paragraphs, lists)
- Vary sentence length — mix short punchy sentences with longer ones
- Use contractions naturally (it's, you'll, don't, we've)
- Add occasional first-person perspective ("In my experience...", "I've found that...")
- Remove robotic transition phrases like "Furthermore", "In conclusion", "It is worth noting"
- Make it feel like a knowledgeable friend explaining, not a formal report
- Return ONLY the rewritten HTML content, no extra text or explanation

ORIGINAL CONTENT:
{$truncated}
PROMPT;

        foreach ($this->models as $model) {
            try {
                $response = Http::withToken($this->apiKey)
                    ->timeout(90)
                    ->post("{$this->baseUrl}/chat/completions", [
                        'model' => $model,
                        'messages' => [
                            ['role' => 'system', 'content' => 'You are an expert editor who rewrites AI-generated content to sound natural and human. Return only the rewritten HTML content.'],
                            ['role' => 'user', 'content' => $prompt],
                        ],
                        'temperature' => 0.8,
                        'max_tokens' => 4000,
                    ]);

                if ($response->status() === 401) {
                    return null;
                }

                if ($response->status() === 429) {
                    sleep(2);
                    continue;
                }

                if ($response->failed()) {
                    continue;
                }

                $rewritten = trim($response->json('choices.0.message.content') ?? '');

                if (! empty($rewritten)) {
                    return $rewritten;
                }

            } catch (\Exception $e) {
                Log::warning("rewriteForHumanity: model [{$model}] failed — {$e->getMessage()}");
                continue;
            }
        }

        return null;
    }

    private function systemPrompt(): string
    {
        return <<<PROMPT
You are an expert AI content writer for prompt.twinbrotherstudio.com — a website helping everyday users learn how to use AI tools effectively.

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

    private function getMissingFields(?array $data): string
    {
        $required = ['title', 'excerpt', 'content', 'meta_title', 'meta_description', 'category_id'];
        if (! is_array($data)) {
            return 'all (null response)';
        }
        $missing = array_filter($required, fn ($f) => empty($data[$f]));
        return implode(', ', $missing) ?: 'none';
    }

    private function parseJson(?string $content): ?array
    {
        if (empty($content)) {
            return null;
        }

        // Try direct decode first
        $data = json_decode($content, true);
        if (is_array($data) && ! empty($data)) {
            return $data;
        }

        // Extract JSON block from markdown code fences or prose
        if (preg_match('/```(?:json)?\s*(\{.*?\})\s*```/s', $content, $m) ||
            preg_match('/(\{[^{}]*"title"[^{}]*\})/s', $content, $m)) {
            $data = json_decode($m[1], true);
            if (is_array($data)) {
                return $data;
            }
        }

        return null;
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
