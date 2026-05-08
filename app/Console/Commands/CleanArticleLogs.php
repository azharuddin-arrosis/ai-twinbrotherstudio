<?php

namespace App\Console\Commands;

use App\Models\Article;
use App\Services\ArticleLogger;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('articles:clean-logs')]
#[Description('Delete article log files for articles that passed humanity check 7+ days ago')]
class CleanArticleLogs extends Command
{
    public function handle(): int
    {
        $cutoff = now()->subDays(7);

        $articles = Article::with('category')
            ->where('humanity_score', '>=', 70)
            ->where('updated_at', '<=', $cutoff)
            ->get();

        $deleted = 0;

        foreach ($articles as $article) {
            $path = storage_path("logs/articles/{$article->slug}--{$article->category?->slug ?? 'uncategorized'}.log");

            if (file_exists($path)) {
                unlink($path);
                $deleted++;
            }
        }

        $this->info("Cleaned {$deleted} article log files.");

        return self::SUCCESS;
    }
}
