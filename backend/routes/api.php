<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\ClientNotificationController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\QuoteController;
use App\Http\Controllers\Api\UserAddressController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas públicas
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Autenticación
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function (): void {
    Route::post(
        '/login',
        [AuthController::class, 'login'],
    );
});

/*
|--------------------------------------------------------------------------
| Catálogo público
|--------------------------------------------------------------------------
*/

Route::get(
    '/catalog/filters',
    [CatalogController::class, 'filters'],
);

Route::get(
    '/products',
    [ProductController::class, 'index'],
);

Route::get(
    '/products/{product}',
    [ProductController::class, 'show'],
);

/*
|--------------------------------------------------------------------------
| Contacto público
|--------------------------------------------------------------------------
*/

Route::post(
    '/contact',
    [ContactController::class, 'store'],
);

/*
|--------------------------------------------------------------------------
| Rutas autenticadas
|--------------------------------------------------------------------------
*/

Route::middleware(
    'auth:sanctum',
)->group(function (): void {
    /*
    |--------------------------------------------------------------------------
    | Sesión
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/me',
        [AuthController::class, 'me'],
    );

    Route::patch(
        '/me/profile',
        [AuthController::class, 'updateProfile'],
    );

    Route::post(
        '/logout',
        [AuthController::class, 'logout'],
    );

    /*
    |--------------------------------------------------------------------------
    | Direcciones
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/my/addresses',
        [UserAddressController::class, 'index'],
    );

    Route::put(
        '/my/addresses',
        [UserAddressController::class, 'store'],
    );

    /*
    |--------------------------------------------------------------------------
    | Favoritos
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/my/favorites',
        [FavoriteController::class, 'index'],
    );

    Route::post(
        '/my/favorites/{product}',
        [FavoriteController::class, 'store'],
    );

    Route::delete(
        '/my/favorites/{product}',
        [FavoriteController::class, 'destroy'],
    );

    /*
    |--------------------------------------------------------------------------
    | Notificaciones
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/my/notifications',
        [ClientNotificationController::class, 'index'],
    );

    Route::patch(
    '/my/notifications/read-all',
    [
        ClientNotificationController::class,
        'markAllAsRead',
    ],
    );

    Route::patch(
        '/my/notifications/{notification}/read',
        [ClientNotificationController::class, 'markAsRead'],
    );

    /*
    |--------------------------------------------------------------------------
    | Cotizaciones
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/quotes',
        [QuoteController::class, 'store'],
    );

    Route::get(
        '/my/quotes',
        [QuoteController::class, 'myQuotes'],
    );

    Route::get(
        '/my/quotes/{quote}',
        [QuoteController::class, 'myQuote'],
    );

    /*
    |--------------------------------------------------------------------------
    | Administración
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/quotes',
        [QuoteController::class, 'index'],
    );
});