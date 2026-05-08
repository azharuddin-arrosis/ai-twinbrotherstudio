<?php

namespace App\Http\Controllers;

use App\Mail\NewCommentMail;
use App\Models\Article;
use App\Models\Category;
use App\Models\Comment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class CommentController extends Controller
{
    public function store(Request $request, Category $category, Article $article): RedirectResponse
    {
        abort_if($article->status !== 'published', 404);
        abort_if($article->category_id !== $category->id, 404);

        // Honeypot check — bot biasanya isi field tersembunyi ini
        if ($request->filled('website')) {
            return back();
        }

        $data = $request->validate([
            'name'    => ['required', 'string', 'max:100'],
            'email'   => ['required', 'email', 'max:255'],
            'body'    => ['required', 'string', 'min:3', 'max:1000'],
            'website' => ['nullable', 'string'],
        ]);

        $comment = Comment::create([
            'article_id' => $article->id,
            'name'       => $data['name'],
            'email'      => $data['email'],
            'body'       => $data['body'],
            'status'     => 'pending',
            'ip_hash'    => md5($request->ip()),
        ]);

        Mail::later(now()->addSeconds(5), new NewCommentMail($comment, $article));

        return back()->with('success', 'Your comment is awaiting moderation. Thank you!');
    }
}
