<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PortfolioItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function index(): Response
    {
        $items = PortfolioItem::orderBy('order')->get();

        return Inertia::render('Admin/Portfolio/Index', [
            'items' => $items,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Portfolio/Form');
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title'        => ['required', 'string', 'max:255'],
            'short_desc'   => ['required', 'string', 'max:255'],
            'long_desc'    => ['required', 'string'],
            'tech_stack'   => ['nullable', 'array'],
            'tech_stack.*' => ['string', 'max:100'],
            'live_url'     => ['nullable', 'url', 'max:255'],
            'is_featured'  => ['boolean'],
            'is_published' => ['boolean'],
            'order'        => ['integer', 'min:0'],
            'image'        => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('portfolio', 'public');
        }

        unset($data['image']);

        PortfolioItem::create($data);

        return redirect()->route('admin.portfolio.index')
            ->with('success', 'Portfolio item created.');
    }

    public function edit(PortfolioItem $portfolioItem): Response
    {
        return Inertia::render('Admin/Portfolio/Form', [
            'item' => $portfolioItem,
        ]);
    }

    public function update(Request $request, PortfolioItem $portfolioItem): RedirectResponse
    {
        $data = $request->validate([
            'title'        => ['required', 'string', 'max:255'],
            'short_desc'   => ['required', 'string', 'max:255'],
            'long_desc'    => ['required', 'string'],
            'tech_stack'   => ['nullable', 'array'],
            'tech_stack.*' => ['string', 'max:100'],
            'live_url'     => ['nullable', 'url', 'max:255'],
            'is_featured'  => ['boolean'],
            'is_published' => ['boolean'],
            'order'        => ['integer', 'min:0'],
            'image'        => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            if ($portfolioItem->image_path) {
                Storage::disk('public')->delete($portfolioItem->image_path);
            }
            $data['image_path'] = $request->file('image')->store('portfolio', 'public');
        }

        unset($data['image']);

        $portfolioItem->update($data);

        return redirect()->route('admin.portfolio.index')
            ->with('success', 'Portfolio item updated.');
    }

    public function destroy(PortfolioItem $portfolioItem): RedirectResponse
    {
        if ($portfolioItem->image_path) {
            Storage::disk('public')->delete($portfolioItem->image_path);
        }

        $portfolioItem->delete();

        return redirect()->route('admin.portfolio.index')
            ->with('success', 'Portfolio item deleted.');
    }

    public function togglePublish(PortfolioItem $portfolioItem): RedirectResponse
    {
        $portfolioItem->update(['is_published' => ! $portfolioItem->is_published]);

        return back()->with('success', $portfolioItem->is_published ? 'Item published.' : 'Item unpublished.');
    }

    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'items'         => ['required', 'array'],
            'items.*.id'    => ['required', 'integer', 'exists:portfolio_items,id'],
            'items.*.order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($request->items as ['id' => $id, 'order' => $order]) {
            PortfolioItem::where('id', $id)->update(['order' => $order]);
        }

        return response()->json(['ok' => true]);
    }
}
