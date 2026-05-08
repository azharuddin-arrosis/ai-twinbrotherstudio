<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleDailyView;
use App\Models\Category;
use App\Models\Comment;
use App\Models\ContactSubmission;
use App\Models\PortfolioItem;
use App\Models\Subscriber;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $viewsChart = ArticleDailyView::select('date', DB::raw('SUM(views) as total'))
            ->where('date', '>=', now()->subDays(13)->toDateString())
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy(fn ($row) => $row->date->toDateString());

        $chartData = collect(range(13, 0))->map(function ($daysAgo) use ($viewsChart) {
            $date = now()->subDays($daysAgo)->toDateString();
            return ['date' => $date, 'views' => (int) ($viewsChart[$date]->total ?? 0)];
        });

        $topArticles = Article::published()
            ->with('category:id,slug,name,color')
            ->orderByDesc('view_count')
            ->limit(5)
            ->get(['id', 'title', 'slug', 'view_count', 'like_count', 'category_id']);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_articles'      => Article::count(),
                'published'           => Article::where('status', 'published')->count(),
                'pending_review'      => Article::where('status', 'ai_draft')->count(),
                'total_categories'    => Category::count(),
                'pending_comments'    => Comment::pending()->count(),
                'pending_submissions' => ContactSubmission::where('is_read', false)->count(),
                'total_portfolio'     => PortfolioItem::where('is_published', true)->count(),
                'total_subscribers'   => Subscriber::active()->count(),
                'views_today'         => (int) ArticleDailyView::where('date', now()->toDateString())->sum('views'),
                'views_30d'           => (int) ArticleDailyView::where('date', '>=', now()->subDays(29)->toDateString())->sum('views'),
            ],
            'chartData'      => $chartData,
            'topArticles'    => $topArticles,
            'pendingArticles' => Article::aiDraft()
                ->with('category:id,name,slug,color')
                ->latest()
                ->limit(8)
                ->get(['id', 'title', 'slug', 'category_id', 'source_name', 'created_at']),
        ]);
    }
}
