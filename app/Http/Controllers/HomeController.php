<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use App\Models\PortfolioItem;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $featured = Article::published()
            ->with('category')
            ->latest('published_at')
            ->limit(5)
            ->get(['id', 'title', 'slug', 'excerpt', 'featured_image', 'reading_time', 'published_at', 'category_id']);

        $categories = Category::orderBy('sort_order')
            ->withCount(['articles' => fn ($q) => $q->published()])
            ->get();

        $latestByCategory = $categories->mapWithKeys(function ($category) {
            return [
                $category->slug => Article::published()
                    ->where('category_id', $category->id)
                    ->with('category')
                    ->latest('published_at')
                    ->limit(4)
                    ->get(['id', 'title', 'slug', 'excerpt', 'featured_image', 'reading_time', 'published_at', 'category_id']),
            ];
        });

        $featuredPortfolio = PortfolioItem::featured()->limit(3)->get([
            'id', 'title', 'slug', 'short_desc', 'image_path', 'tech_stack', 'live_url',
        ]);

        return Inertia::render('Home', [
            'featured' => $featured,
            'categories' => $categories,
            'latestByCategory' => $latestByCategory,
            'featuredPortfolio' => $featuredPortfolio,
        ]);
    }
}
