<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class ArticleLikeController extends Controller
{
    public function store(Article $article): JsonResponse
    {
        abort_if($article->status !== 'published', 404);

        $cacheKey = 'like_' . $article->id . '_' . md5(request()->ip());

        if (Cache::has($cacheKey)) {
            return response()->json(['liked' => false, 'like_count' => $article->like_count], 409);
        }

        $article->increment('like_count');
        Cache::put($cacheKey, true, now()->addDays(30));

        return response()->json(['liked' => true, 'like_count' => $article->like_count]);
    }
}
