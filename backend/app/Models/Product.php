<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    protected $guarded = [];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function priceListItems(): HasMany
    {
        return $this->hasMany(
            PriceListItem::class,
        );
    }

    public function favoritedBy(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'favorites',
        )->withTimestamps();
    }
}