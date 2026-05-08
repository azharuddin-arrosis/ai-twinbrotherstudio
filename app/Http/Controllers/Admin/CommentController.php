<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommentController extends Controller
{
    public function index(Request $request): Response
    {
        $comments = Comment::with('article:id,title,slug,category_id', 'article.category:id,slug')
            ->when($request->status, fn ($q, $v) => $q->where('status', $v))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Admin/Comments/Index', [
            'comments'     => $comments,
            'pendingCount' => Comment::pending()->count(),
            'filters'      => $request->only('status'),
        ]);
    }

    public function approve(Comment $comment): RedirectResponse
    {
        $comment->update(['status' => 'approved']);
        return back()->with('success', 'Comment approved.');
    }

    public function reject(Comment $comment): RedirectResponse
    {
        $comment->update(['status' => 'rejected']);
        return back()->with('success', 'Comment rejected.');
    }

    public function destroy(Comment $comment): RedirectResponse
    {
        $comment->delete();
        return back()->with('success', 'Comment deleted.');
    }

    public function reply(Request $request, Comment $comment): RedirectResponse
    {
        $request->validate([
            'body' => ['required', 'string', 'min:3', 'max:1000'],
        ]);

        Comment::create([
            'article_id' => $comment->article_id,
            'parent_id'  => $comment->id,
            'name'       => 'Twin Brother Studio',
            'email'      => config('mail.from.address'),
            'body'       => $request->body,
            'status'     => 'approved',
            'ip_hash'    => md5('admin'),
        ]);

        return back()->with('success', 'Reply posted.');
    }
}
