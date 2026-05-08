<?php

namespace App\Jobs;

use App\Models\Article;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;

class IncrementArticleViewJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly int $articleId,
        public readonly string $ipHash,
    ) {}

    public function handle(): void
    {
        $cacheKey = "view_{$this->articleId}_{$this->ipHash}";

        if (Cache::has($cacheKey)) {
            return;
        }

        Article::where('id', $this->articleId)->increment('view_count');
        Cache::put($cacheKey, true, now()->addHours(24));
    }
}
