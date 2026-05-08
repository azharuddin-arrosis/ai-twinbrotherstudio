<?php

namespace App\Jobs;

use App\Models\Article;
use App\Models\RssSource;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FetchRssSourceJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;
    public int $timeout = 60;

    private const AI_KEYWORDS = [
        'ai', 'artificial intelligence', 'chatgpt', 'gpt', 'claude', 'gemini',
        'llm', 'machine learning', 'deep learning', 'neural network', 'openai',
        'anthropic', 'google ai', 'microsoft ai', 'copilot', 'midjourney',
        'stable diffusion', 'dall-e', 'prompt', 'generative ai', 'large language',
    ];

    public function __construct(public readonly RssSource $source) {}

    public function handle(): void
    {
        if (! $this->source->is_active) {
            return;
        }

        try {
            $items = $this->fetchFeed();
            $dispatched = 0;

            foreach ($items as $item) {
                if (! $this->isRelevant($item)) {
                    continue;
                }

                if ($this->alreadyExists($item['link'])) {
                    continue;
                }

                GenerateArticleFromRssJob::dispatch($item, $this->source)
                    ->delay(now()->addSeconds($dispatched * 5)); // stagger to avoid API rate limit

                $dispatched++;

                if ($dispatched >= 10) {
                    break; // max 10 articles per fetch
                }
            }

            $this->source->update(['last_fetched_at' => now()]);

            Log::info("RSS fetch complete: {$this->source->name} — {$dispatched} items queued");

        } catch (\Exception $e) {
            Log::error("RSS fetch failed: {$this->source->name} — {$e->getMessage()}");
            throw $e;
        }
    }

    private function fetchFeed(): array
    {
        $response = Http::timeout(30)->get($this->source->url);
        $xml = simplexml_load_string($response->body(), 'SimpleXMLElement', LIBXML_NOCDATA);

        $items = [];

        // RSS 2.0
        if (isset($xml->channel->item)) {
            foreach ($xml->channel->item as $item) {
                $items[] = [
                    'title' => (string) $item->title,
                    'link' => (string) $item->link,
                    'description' => strip_tags((string) $item->description),
                    'pub_date' => (string) $item->pubDate,
                    'source_name' => $this->source->name,
                ];
            }
        }

        // Atom feed
        if (isset($xml->entry)) {
            foreach ($xml->entry as $entry) {
                $link = (string) ($entry->link['href'] ?? $entry->link);
                $items[] = [
                    'title' => (string) $entry->title,
                    'link' => $link,
                    'description' => strip_tags((string) ($entry->summary ?? $entry->content)),
                    'pub_date' => (string) $entry->published,
                    'source_name' => $this->source->name,
                ];
            }
        }

        return $items;
    }

    private function isRelevant(array $item): bool
    {
        $text = strtolower($item['title'] . ' ' . $item['description']);

        foreach (self::AI_KEYWORDS as $keyword) {
            if (str_contains($text, $keyword)) {
                return true;
            }
        }

        return false;
    }

    private function alreadyExists(string $url): bool
    {
        return Article::where('source_url', $url)->exists();
    }
}
