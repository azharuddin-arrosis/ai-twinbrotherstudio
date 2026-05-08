<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Jobs\FetchRssSourceJob;
use App\Models\Category;
use App\Models\RssSource;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RssSourceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/RssSources/Index', [
            'sources' => RssSource::with('category')->orderBy('name')->get(),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'url' => ['required', 'url'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'fetch_interval_hours' => ['integer', 'min:1', 'max:168'],
            'is_active' => ['boolean'],
        ]);

        RssSource::create($data);

        return back()->with('success', 'RSS source added.');
    }

    public function update(Request $request, RssSource $rssSource): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'url' => ['required', 'url'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'fetch_interval_hours' => ['integer', 'min:1', 'max:168'],
            'is_active' => ['boolean'],
        ]);

        $rssSource->update($data);

        return back()->with('success', 'RSS source updated.');
    }

    public function destroy(RssSource $rssSource): RedirectResponse
    {
        $rssSource->delete();
        return back()->with('success', 'RSS source deleted.');
    }

    public function fetchNow(RssSource $rssSource): RedirectResponse
    {
        FetchRssSourceJob::dispatch($rssSource);
        return back()->with('success', "Fetch queued for: {$rssSource->name}");
    }
}
