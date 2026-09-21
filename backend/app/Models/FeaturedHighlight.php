<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeaturedHighlight extends Model
{
    protected $fillable = [
        'title',
        'alt_text',
        'image_path',
        'link_url',
        'is_active',
        'sort_order',
        'starts_at',
        'ends_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }
}