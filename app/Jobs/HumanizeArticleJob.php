<?php

namespace App\Jobs;

use App\Jobs\TranslateArticleJob;
use App\Models\Article;
use App\Services\AiContentService;
use App\Services\ArticleLogger;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class HumanizeArticleJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;
    public int $timeout = 120;

    private const MAX_ATTEMPTS = 5;
    private const PASS_SCORE = 70;

    public function __construct(
        public readonly int $articleId,
        public readonly int $attempt = 1,
    ) {}

    public function handle(AiContentService $ai): void
    {
        $article = Article::with('category')->find($this->articleId);

        if (! $article) {
            return;
        }

        $result = $ai->checkHumanity($article->content);

        if (isset($result['error'])) {
            Log::warning("HumanizeArticleJob: check failed for article [{$this->articleId}] — {$result['error']}");
            ArticleLogger::log($article, 'HUMANITY', ['attempt' => "{$this->attempt}/" . self::MAX_ATTEMPTS, 'error' => $result['error']]);
            return;
        }

        $score   = $result['score'];
        $issues  = $result['issues'] ?? [];
        $category = $result['category'] ?? 'unknown';

        $article->update([
            'humanity_score'    => $score,
            'humanity_attempts' => $this->attempt,
        ]);

        ArticleLogger::log($article, 'HUMANITY', [
            'attempt'  => "{$this->attempt}/" . self::MAX_ATTEMPTS,
            'score'    => "{$score}%",
            'category' => $category,
            'issues'   => empty($issues) ? 'none' : implode('; ', array_slice($issues, 0, 3)),
        ]);

        Log::info("HumanizeArticleJob: article [{$this->articleId}] attempt {$this->attempt}/" . self::MAX_ATTEMPTS . " — score {$score}");

        if ($score >= self::PASS_SCORE) {
            ArticleLogger::log($article, 'PASSED', ['score' => "{$score}%", 'attempts' => $this->attempt]);
            Log::info("HumanizeArticleJob: article [{$this->articleId}] passed (score {$score}) ✓");

            if (empty($article->translations)) {
                TranslateArticleJob::dispatch($article->id, 'pt-BR')
                    ->delay(now()->addSeconds(10));
            }

            return;
        }

        if ($this->attempt >= self::MAX_ATTEMPTS) {
            $article->update(['status' => 'ai_needs_review']);
            ArticleLogger::log($article, 'EXHAUSTED', ['final_score' => "{$score}%", 'status' => 'ai_needs_review']);
            Log::warning("HumanizeArticleJob: article [{$this->articleId}] exhausted {$this->attempt} attempts — flagged ai_needs_review");
            return;
        }

        $rewritten = $ai->rewriteForHumanity($article->content, $issues);

        if (! $rewritten) {
            Log::warning("HumanizeArticleJob: rewrite failed for article [{$this->articleId}]");
            return;
        }

        $article->update(['content' => $rewritten]);

        ArticleLogger::log($article, 'REWRITE', ['attempt' => "{$this->attempt}/" . self::MAX_ATTEMPTS]);

        self::dispatch($this->articleId, $this->attempt + 1)
            ->delay(now()->addSeconds(5));
    }
}
