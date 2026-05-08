<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function show(Category $category): Response
    {
        $articles = $category->publishedArticles()
            ->with('category')
            ->latest('published_at')
            ->paginate(12);

        return Inertia::render('Category/Show', [
            'category' => $category,
            'articles' => $articles,
        ]);
    }
}
