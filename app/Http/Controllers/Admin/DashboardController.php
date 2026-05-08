<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_articles' => Article::count(),
                'published' => Article::where('status', 'published')->count(),
                'pending_review' => Article::where('status', 'ai_draft')->count(),
                'total_categories' => Category::count(),
            ],
            'pendingArticles' => Article::aiDraft()
                ->with('category')
                ->latest()
                ->limit(10)
                ->get(['id', 'title', 'slug', 'category_id', 'source_name', 'created_at']),
        ]);
    }
}
