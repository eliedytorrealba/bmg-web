<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAddress extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'street',
        'number',
        'floor_apartment',
        'city',
        'province',
        'postal_code',
        'notes',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
        );
    }
}