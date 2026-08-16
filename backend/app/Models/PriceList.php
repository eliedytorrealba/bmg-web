<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PriceList extends Model
{
    protected $guarded = [];

    protected $casts = [
        'is_general' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(PriceListItem::class);
    }
}