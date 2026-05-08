<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $articles = Article::published()
            ->select(['slug', 'category_id', 'updated_at'])
            ->with('category:id,slug')
            ->latest('updated_at')
            ->get();

        $categories = Category::select(['slug', 'updated_at'])->get();

        $xml = view('sitemap', compact('articles', 'categories'))->render();

        return response($xml, 200)->header('Content-Type', 'application/xml');
    }
}
