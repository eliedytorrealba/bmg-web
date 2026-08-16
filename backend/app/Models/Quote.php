<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Quote extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'customer_name',
        'company',
        'email',
        'phone',
        'message',
        'items',
        'total_items',
        'subtotal',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'items' => 'array',
            'total_items' => 'integer',
            'subtotal' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}