<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PortfolioItem extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'short_desc',
        'long_desc',
        'image_path',
        'tech_stack',
        'live_url',
        'is_featured',
        'is_published',
        'order',
    ];

    protected $casts = [
        'tech_stack'   => 'array',
        'is_featured'  => 'boolean',
        'is_published' => 'boolean',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (PortfolioItem $item): void {
            if (empty($item->slug)) {
                $item->slug = static::uniqueSlug($item->title);
            }
        });

        static::updating(function (PortfolioItem $item): void {
            if ($item->isDirty('title') && empty($item->slug)) {
                $item->slug = static::uniqueSlug($item->title);
            }
        });
    }

    private static function uniqueSlug(string $title): string
    {
        $slug = Str::slug($title);
        $count = static::where('slug', 'like', "{$slug}%")->count();
        return $count > 0 ? "{$slug}-{$count}" : $slug;
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true)->orderBy('order');
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true)
            ->where('is_published', true)
            ->orderBy('order');
    }
}
