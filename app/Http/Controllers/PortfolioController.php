<?php

namespace App\Http\Controllers;

use App\Models\PortfolioItem;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function index(): Response
    {
        $items = PortfolioItem::published()->get();

        return Inertia::render('Portfolio/Index', [
            'items' => $items,
        ]);
    }

    public function show(PortfolioItem $portfolioItem): Response
    {
        abort_if(! $portfolioItem->is_published, 404);

        return Inertia::render('Portfolio/Show', [
            'item' => $portfolioItem,
        ]);
    }
}
