<?php

namespace App\Jobs;

use App\Models\Article;
use App\Models\RssSource;
use App\Services\AiContentService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class GenerateArticleFromRssJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;
    public int $timeout = 120;

    public function __construct(
        public readonly array $rssItem,
        public readonly RssSource $source,
    ) {}

    public function handle(AiContentService $ai): void
    {
        try {
            $generated = $ai->generateFromRssItem($this->rssItem);

            if (! $generated) {
                return;
            }

            $slug = Str::slug($generated['title']);
            $baseSlug = $slug;
            $i = 1;

            while (Article::where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . $i++;
            }

            Article::create([
                'category_id' => $this->source->category_id ?? $generated['category_id'],
                'title' => $generated['title'],
                'slug' => $slug,
                'excerpt' => $generated['excerpt'],
                'content' => $generated['content'],
                'meta_title' => $generated['meta_title'],
                'meta_description' => $generated['meta_description'],
                'status' => 'ai_draft',
                'source_type' => 'ai_generated',
                'source_url' => $this->rssItem['link'],
                'source_name' => $this->rssItem['source_name'],
            ]);

            Log::info("Article generated: {$generated['title']}");

        } catch (\Exception $e) {
            Log::error("Article generation failed: {$e->getMessage()} — {$this->rssItem['link']}");
            throw $e;
        }
    }
}
