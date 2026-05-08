<?php

namespace App\Jobs;

use App\Models\Article;
use App\Services\AiContentService;
use App\Services\ArticleLogger;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class TranslateArticleJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;
    public int $timeout = 150;

    // EN → pt-BR → de → id
    public const LANGUAGE_QUEUE = ['pt-BR', 'de', 'id'];

    public function __construct(
        public readonly int $articleId,
        public readonly string $language,
    ) {}

    public function handle(AiContentService $ai): void
    {
        $article = Article::find($this->articleId);

        if (! $article) {
            return;
        }

        $translations = $article->translations ?? [];

        if (isset($translations[$this->language])) {
            Log::info("TranslateArticleJob: [{$this->language}] already exists for article [{$this->articleId}], skipping");
            $this->dispatchNext();
            return;
        }

        $translated = $ai->translateArticle($article->toArray(), $this->language);

        if (! $translated) {
            Log::error("TranslateArticleJob: failed to translate article [{$this->articleId}] to [{$this->language}]");
            return;
        }

        $translations[$this->language] = $translated;

        $article->update(['translations' => $translations]);

        Log::info("TranslateArticleJob: article [{$this->articleId}] translated to [{$this->language}] ✓");
        ArticleLogger::log($article, 'TRANSLATE', ['lang' => $this->language, 'title' => $translated['title']]);

        $this->dispatchNext();
    }

    private function dispatchNext(): void
    {
        $currentIndex = array_search($this->language, self::LANGUAGE_QUEUE);
        $nextLang = self::LANGUAGE_QUEUE[$currentIndex + 1] ?? null;

        if ($nextLang) {
            self::dispatch($this->articleId, $nextLang)->delay(now()->addSeconds(10));
        }
    }
}
