<?php

namespace App\Http\Controllers;

use App\Jobs\IncrementArticleViewJob;
use App\Models\Article;
use App\Models\Category;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function show(Category $category, Article $article): Response
    {
        abort_if($article->status !== 'published', 404);
        abort_if($article->category_id !== $category->id, 404);

        dispatch(new IncrementArticleViewJob(
            articleId: $article->id,
            ipHash: md5(request()->ip()),
        ));

        $article->load([
            'category',
            'tags',
            'comments' => fn ($q) => $q->approved()
                ->whereNull('parent_id')
                ->with(['replies' => fn ($r) => $r->approved()->oldest()])
                ->latest(),
        ]);

        $related = Article::published()
            ->where('category_id', $article->category_id)
            ->where('id', '!=', $article->id)
            ->latest('published_at')
            ->limit(3)
            ->get(['id', 'title', 'slug', 'excerpt', 'featured_image', 'reading_time', 'published_at', 'category_id']);

        return Inertia::render('Article/Show', [
            'article' => $article,
            'related' => $related,
        ]);
    }
}
