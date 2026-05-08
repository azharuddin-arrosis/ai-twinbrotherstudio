<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(Request $request): Response
    {
        $articles = Article::with('category')
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->when($request->category, fn ($q, $v) => $q->where('category_id', $v))
            ->when($request->search, fn ($q, $v) => $q->where('title', 'like', "%{$v}%"))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Articles/Index', [
            'articles' => $articles,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['status', 'category', 'search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Articles/Form', [
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'tags' => Tag::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'featured_image' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:320'],
            'status' => ['required', 'in:draft,review,published'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['exists:tags,id'],
            'published_at' => ['nullable', 'date'],
        ]);

        $article = Article::create(array_merge($data, [
            'slug' => Str::slug($data['title']),
            'source_type' => 'manual',
            'published_at' => $data['status'] === 'published' ? ($data['published_at'] ?? now()) : null,
        ]));

        if (! empty($data['tags'])) {
            $article->tags()->sync($data['tags']);
        }

        return redirect()->route('admin.articles.index')->with('success', 'Article created.');
    }

    public function show(Article $article): RedirectResponse
    {
        return redirect()->route('admin.articles.edit', $article);
    }

    public function edit(Article $article): Response
    {
        $article->load('tags');

        return Inertia::render('Admin/Articles/Form', [
            'article' => $article,
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'tags' => Tag::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Article $article): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category_id' => ['required', 'exists:categories,id'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'featured_image' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:320'],
            'status' => ['required', 'in:ai_draft,draft,review,published,rejected'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['exists:tags,id'],
            'published_at' => ['nullable', 'date'],
        ]);

        if ($data['status'] === 'published' && ! $article->published_at) {
            $data['published_at'] = $data['published_at'] ?? now();
        }

        $article->update($data);
        $article->tags()->sync($data['tags'] ?? []);

        return redirect()->route('admin.articles.index')->with('success', 'Article updated.');
    }

    public function destroy(Article $article): RedirectResponse
    {
        $article->delete();
        return back()->with('success', 'Article deleted.');
    }

    public function publish(Article $article): RedirectResponse
    {
        $article->update([
            'status' => 'published',
            'published_at' => $article->published_at ?? now(),
        ]);

        return back()->with('success', 'Article published.');
    }

    public function reject(Article $article): RedirectResponse
    {
        $article->update(['status' => 'rejected']);
        return back()->with('success', 'Article rejected.');
    }
}
