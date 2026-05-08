<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Subscriber extends Model
{
    protected $fillable = ['email', 'name', 'status', 'token'];

    protected static function booted(): void
    {
        static::creating(function (Subscriber $subscriber) {
            if (empty($subscriber->token)) {
                $subscriber->token = Str::random(64);
            }
        });
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }
}
