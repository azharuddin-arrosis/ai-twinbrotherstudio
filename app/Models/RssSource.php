<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RssSource extends Model
{
    protected $fillable = [
        'name', 'url', 'category_id', 'is_active',
        'last_fetched_at', 'fetch_interval_hours',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_fetched_at' => 'datetime',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function isDueForFetch(): bool
    {
        if (! $this->last_fetched_at) {
            return true;
        }

        return $this->last_fetched_at->addHours($this->fetch_interval_hours)->isPast();
    }
}
