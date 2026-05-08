<?php

namespace App\Jobs;

use App\Models\Article;
use App\Models\ArticleDailyView;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

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

        // Increment total view count
        Article::where('id', $this->articleId)->increment('view_count');

        // Upsert daily analytics
        DB::table('article_daily_views')
            ->upsert(
                [['article_id' => $this->articleId, 'date' => now()->toDateString(), 'views' => 1, 'created_at' => now(), 'updated_at' => now()]],
                ['article_id', 'date'],
                ['views' => DB::raw('views + 1'), 'updated_at' => now()]
            );

        Cache::put($cacheKey, true, now()->addHours(24));
    }
}
