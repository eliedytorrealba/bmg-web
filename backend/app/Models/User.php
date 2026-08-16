<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
    'name',
    'email',
    'phone',
    'company',
    'document_type',
    'document_number',
    'password',
    'role',
    'price_list_id',
];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function addresses(): HasMany
    {
    return $this->hasMany(
        UserAddress::class,
    );
    }

    public function priceList(): BelongsTo
    {
        return $this->belongsTo(PriceList::class);
    }

    public function favoriteProducts(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'favorites',
        )->withTimestamps();
    }

    public function notifications(): HasMany
    {
    return $this->hasMany(
        ClientNotification::class,
    );
    }

    public function quotes(): HasMany
    {
    return $this->hasMany(Quote::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isClient(): bool
    {
        return $this->role === 'client';
    }
}