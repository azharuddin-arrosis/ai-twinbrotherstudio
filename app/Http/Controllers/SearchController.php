<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function index(Request $request): Response
    {
        $query = $request->string('q')->trim()->toString();

        $articles = collect();
        if (strlen($query) >= 2) {
            $articles = Article::published()
                ->with('category')
                ->whereFullText(['title', 'content', 'excerpt'], $query)
                ->latest('published_at')
                ->paginate(12)
                ->withQueryString();
        }

        return Inertia::render('Search', [
            'query' => $query,
            'articles' => $articles,
        ]);
    }
}
