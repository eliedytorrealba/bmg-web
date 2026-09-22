<?php

use App\Http\Controllers\Api\AdminCatalogController;
use App\Http\Controllers\Api\AdminClientController;
use App\Http\Controllers\Api\AdminNotificationController;
use App\Http\Controllers\Api\AdminPriceListController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\ClientNotificationController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\FeaturedHighlightController;
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
        '/register',
        [AuthController::class, 'register'],
    );

    Route::post(
        '/login',
        [AuthController::class, 'login'],
    );

    Route::post(
        '/forgot-password',
        [AuthController::class, 'forgotPassword'],
    )->middleware('throttle:6,1');

    Route::post(
        '/reset-password',
        [AuthController::class, 'resetPassword'],
    )->middleware('throttle:6,1');
});

/*
|--------------------------------------------------------------------------
| Verificación de correo electrónico
|--------------------------------------------------------------------------
|
| Esta ruta debe ser pública porque el usuario accede a ella
| directamente desde el enlace recibido por correo.
|
*/

Route::get(
    '/email/verify/{id}/{hash}',
    [AuthController::class, 'verifyEmail'],
)->name('verification.verify');

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
| Destacados públicos
|--------------------------------------------------------------------------
*/

Route::get(
    '/highlights',
    [FeaturedHighlightController::class, 'index'],
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
    | Verificación de correo electrónico
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/email/verification-notification',
        [
            AuthController::class,
            'resendVerificationEmail',
        ],
    )->middleware('throttle:6,1');

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
    | Notificaciones del cliente
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

    Route::delete(
        '/my/notifications/all',
        [
            ClientNotificationController::class,
            'destroyAll',
        ],
    );

    Route::patch(
        '/my/notifications/{notification}/read',
        [
            ClientNotificationController::class,
            'markAsRead',
        ],
    );

    Route::delete(
        '/my/notifications/{notification}',
        [
            ClientNotificationController::class,
            'destroy',
        ],
    );

    /*
    |--------------------------------------------------------------------------
    | Cotizaciones del cliente
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
    | Administración - Catálogo
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/catalog',
        [AdminCatalogController::class, 'index'],
    );

    Route::post(
        '/admin/catalog/{product}/image',
        [
            AdminCatalogController::class,
            'storeImage',
        ],
    );

    Route::delete(
        '/admin/catalog/{product}/image',
        [
            AdminCatalogController::class,
            'destroyImage',
        ],
    );

    /*
    |--------------------------------------------------------------------------
    | Administración - Clientes
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/clients',
        [AdminClientController::class, 'index'],
    );

    Route::get(
        '/admin/clients/price-lists',
        [AdminClientController::class, 'priceLists'],
    );

    Route::get(
        '/admin/clients/{client}',
        [AdminClientController::class, 'show'],
    );

    Route::patch(
        '/admin/clients/{client}',
        [AdminClientController::class, 'update'],
    );

    Route::patch(
        '/admin/clients/{client}/price-list',
        [
            AdminClientController::class,
            'updatePriceList',
        ],
    );

    /*
    |--------------------------------------------------------------------------
    | Administración - Listas de precios
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/price-lists',
        [AdminPriceListController::class, 'index'],
    );

    Route::post(
        '/admin/price-lists',
        [AdminPriceListController::class, 'store'],
    );

    Route::get(
        '/admin/price-lists/{priceList}',
        [AdminPriceListController::class, 'show'],
    );

    Route::patch(
        '/admin/price-lists/{priceList}',
        [AdminPriceListController::class, 'update'],
    );

    Route::patch(
        '/admin/price-lists/{priceList}/status',
        [
            AdminPriceListController::class,
            'updateStatus',
        ],
    );

    Route::post(
        '/admin/price-lists/{priceList}/import',
        [AdminPriceListController::class, 'import'],
    );

    /*
    |--------------------------------------------------------------------------
    | Administración - Cotizaciones
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/quotes',
        [QuoteController::class, 'index'],
    );

    Route::get(
        '/quotes/{quote}',
        [QuoteController::class, 'show'],
    );

    Route::patch(
        '/quotes/{quote}/status',
        [QuoteController::class, 'updateStatus'],
    );

    Route::patch(
        '/quotes/{quote}/final-total',
        [QuoteController::class, 'updateFinalTotal'],
    );

    /*
    |--------------------------------------------------------------------------
    | Administración - Notificaciones
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/notifications',
        [AdminNotificationController::class, 'index'],
    );

    Route::post(
        '/admin/notifications',
        [AdminNotificationController::class, 'store'],
    );

    Route::delete(
        '/admin/notifications/all',
        [
            AdminNotificationController::class,
            'destroyAll',
        ],
    );

    Route::delete(
        '/admin/notifications/bulk',
        [
            AdminNotificationController::class,
            'destroyBulk',
        ],
    );

    Route::delete(
        '/admin/notifications/{notification}',
        [
            AdminNotificationController::class,
            'destroy',
        ],
    );

    /*
    |--------------------------------------------------------------------------
    | Administración - Destacados
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/admin/highlights',
        [
            FeaturedHighlightController::class,
            'adminIndex',
        ],
    );

    Route::post(
        '/admin/highlights',
        [
            FeaturedHighlightController::class,
            'store',
        ],
    );

    Route::post(
        '/admin/highlights/{highlight}',
        [
            FeaturedHighlightController::class,
            'update',
        ],
    );

    Route::delete(
        '/admin/highlights/{highlight}',
        [
            FeaturedHighlightController::class,
            'destroy',
        ],
    );
});