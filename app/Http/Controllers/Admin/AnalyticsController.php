<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\ArticleDailyView;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(): Response
    {
        // Views per hari 30 hari terakhir
        $dailyViews = ArticleDailyView::select('date', DB::raw('SUM(views) as total'))
            ->where('date', '>=', now()->subDays(29)->toDateString())
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy(fn ($row) => $row->date->toDateString());

        $chartData = collect(range(29, 0))->map(function ($daysAgo) use ($dailyViews) {
            $date = now()->subDays($daysAgo)->toDateString();
            return ['date' => $date, 'views' => (int) ($dailyViews[$date]->total ?? 0)];
        });

        // Top 10 artikel all time
        $topAllTime = Article::published()
            ->with('category:id,name,color')
            ->orderByDesc('view_count')
            ->limit(10)
            ->get(['id', 'title', 'slug', 'view_count', 'like_count', 'category_id']);

        // Top 10 artikel 7 hari terakhir
        $topThisWeek = ArticleDailyView::select('article_id', DB::raw('SUM(views) as total'))
            ->where('date', '>=', now()->subDays(6)->toDateString())
            ->groupBy('article_id')
            ->orderByDesc('total')
            ->limit(10)
            ->with('article.category:id,name,color')
            ->get();

        // Summary stats
        $stats = [
            'views_today'    => (int) ArticleDailyView::where('date', now()->toDateString())->sum('views'),
            'views_7d'       => (int) ArticleDailyView::where('date', '>=', now()->subDays(6)->toDateString())->sum('views'),
            'views_30d'      => (int) ArticleDailyView::where('date', '>=', now()->subDays(29)->toDateString())->sum('views'),
            'views_all_time' => (int) Article::sum('view_count'),
            'likes_all_time' => (int) Article::sum('like_count'),
        ];

        return Inertia::render('Admin/Analytics/Index', [
            'chartData'    => $chartData,
            'topAllTime'   => $topAllTime,
            'topThisWeek'  => $topThisWeek,
            'stats'        => $stats,
        ]);
    }
}
