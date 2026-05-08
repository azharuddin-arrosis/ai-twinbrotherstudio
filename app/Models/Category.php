<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'color', 'sort_order', 'keywords'];

    protected $casts = ['keywords' => 'array'];

    protected static function booted(): void
    {
        static::creating(function (Category $category) {
            if (empty($category->slug)) {
                $category->slug = Str::slug($category->name);
            }
        });
    }

    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }

    public function publishedArticles(): HasMany
    {
        return $this->hasMany(Article::class)->published();
    }

    public function rssSources(): HasMany
    {
        return $this->hasMany(RssSource::class);
    }
}
