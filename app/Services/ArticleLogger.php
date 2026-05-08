<?php

namespace App\Services;

use App\Models\Article;

class ArticleLogger
{
    private static function path(Article $article): string
    {
        $category = $article->category?->slug ?? 'uncategorized';
        return storage_path("logs/articles/{$article->slug}--{$category}.log");
    }

    public static function log(Article $article, string $event, array $context = []): void
    {
        $dir = storage_path('logs/articles');
        if (! is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $time = now()->format('Y-m-d H:i:s');
        $tag  = str_pad($event, 12);
        $ctx  = empty($context) ? '' : ' | ' . collect($context)
            ->map(fn ($v, $k) => "{$k}: {$v}")
            ->join(' | ');

        file_put_contents(
            static::path($article),
            "[{$time}] {$tag}{$ctx}\n",
            FILE_APPEND | LOCK_EX
        );
    }

    public static function read(Article $article): array
    {
        $path = static::path($article);

        if (! file_exists($path)) {
            return [];
        }

        return array_values(array_filter(
            explode("\n", file_get_contents($path))
        ));
    }

    public static function delete(Article $article): void
    {
        $path = static::path($article);

        if (file_exists($path)) {
            unlink($path);
        }
    }
}
