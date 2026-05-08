<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Tag;
use Inertia\Inertia;
use Inertia\Response;

class TagController extends Controller
{
    public function show(Tag $tag): Response
    {
        $articles = Article::published()
            ->with('category:id,name,slug,color')
            ->whereHas('tags', fn ($q) => $q->where('tags.id', $tag->id))
            ->latest('published_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Tag/Show', [
            'tag'      => $tag,
            'articles' => $articles,
        ]);
    }
}
