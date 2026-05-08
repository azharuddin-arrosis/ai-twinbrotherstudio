<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Article extends Model
{
    protected $fillable = [
        'category_id', 'title', 'slug', 'excerpt', 'content',
        'featured_image', 'meta_title', 'meta_description',
        'status', 'source_type', 'source_url', 'source_name',
        'reading_time', 'view_count', 'like_count', 'humanity_score', 'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'view_count' => 'integer',
        'like_count' => 'integer',
        'humanity_score' => 'integer',
        'reading_time' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (Article $article) {
            if (empty($article->slug)) {
                $article->slug = Str::slug($article->title);
            }
            if (empty($article->reading_time) && $article->content) {
                $article->reading_time = max(1, (int) ceil(str_word_count(strip_tags($article->content)) / 200));
            }
        });
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')
                     ->where('published_at', '<=', now());
    }

    public function scopeAiDraft(Builder $query): Builder
    {
        return $query->where('status', 'ai_draft');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function incrementViews(): void
    {
        // Digantikan oleh IncrementArticleViewJob untuk deduplication — tidak dipakai langsung
    }

    public function getMetaTitleAttribute($value): string
    {
        return $value ?: $this->title;
    }

    public function getMetaDescriptionAttribute($value): string
    {
        return $value ?: Str::limit(strip_tags($this->excerpt ?? $this->content), 160);
    }
}
