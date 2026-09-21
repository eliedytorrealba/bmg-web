<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    private const CATEGORY_GROUPS = [
        'filters' => [
            'FILTRO',
            'FILTROS',
        ],

        'lubricants' => [
            'ACEITE',
            'LUBRICANTE',
            'LUBRICANTES',
            'GRASA',
            'FLUIDO',
        ],

        'additives' => [
            'ADITIVO',
            'ADITIVOS',
        ],

        'cosmetics' => [
            'COSMETICA',
            'COSMÉTICA',
            'LIMPIEZA',
            'LIMPIADOR',
            'LIMPIADORES',
            'CERA',
            'CERAS',
            'SHAMPOO',
            'AROMATIZANTE',
            'AROMATIZANTES',
            'SILICONA',
            'REVIVIDOR',
        ],

        'accessories' => [
            'ACCESORIO',
            'ACCESORIOS',
            'ESCOBILLA',
            'ESCOBILLAS',
        ],
    ];

    public function index(
        Request $request,
    ): JsonResponse {
        $request->validate([
            'search' => [
                'nullable',
                'string',
                'max:100',
            ],

            'brand_id' => [
                'nullable',
                'integer',
                'exists:brands,id',
            ],

            'category_id' => [
                'nullable',
                'integer',
                'exists:categories,id',
            ],

            'category_group' => [
                'nullable',
                'string',

                Rule::in(
                    array_keys(
                        self::CATEGORY_GROUPS,
                    ),
                ),
            ],

            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        $user =
            Auth::guard(
                'sanctum',
            )->user();

        $priceListId =
            $user?->isClient()
                ? $user->price_list_id
                : null;

        $products =
            Product::query()
                ->with([
                    'brand:id,name',
                    'category:id,name',
                ])

                /*
                |--------------------------------------------------------------------------
                | Catálogo según lista de precios
                |--------------------------------------------------------------------------
                |
                | Si el usuario es cliente y tiene una lista asignada,
                | solamente se muestran los productos que pertenecen
                | actualmente a esa lista.
                |
                */

                ->when(
                    $priceListId !== null,
                    function (
                        Builder $query,
                    ) use (
                        $priceListId,
                    ): void {
                        $query->whereHas(
                            'priceListItems',
                            function (
                                Builder $priceQuery,
                            ) use (
                                $priceListId,
                            ): void {
                                $priceQuery->where(
                                    'price_list_id',
                                    $priceListId,
                                );
                            },
                        );
                    },
                )

                /*
                |--------------------------------------------------------------------------
                | Precio correspondiente a la lista del cliente
                |--------------------------------------------------------------------------
                */

                ->when(
                    $priceListId !== null,
                    fn (
                        Builder $query,
                    ) =>
                        $query->with([
                            'priceListItems' =>
                                fn (
                                    $priceQuery,
                                ) =>
                                    $priceQuery
                                        ->select([
                                            'id',
                                            'price_list_id',
                                            'product_id',
                                            'price',
                                            'discount_percentage',
                                        ])
                                        ->where(
                                            'price_list_id',
                                            $priceListId,
                                        ),
                        ]),
                )

                /*
                |--------------------------------------------------------------------------
                | Búsqueda
                |--------------------------------------------------------------------------
                */

                ->when(
                    $request->filled(
                        'search',
                    ),
                    function (
                        Builder $query,
                    ) use (
                        $request,
                    ): void {
                        $search =
                            trim(
                                (string) $request->input(
                                    'search',
                                ),
                            );

                        $query->where(
                            function (
                                Builder $searchQuery,
                            ) use (
                                $search,
                            ): void {
                                $searchQuery
                                    ->whereLike(
                                        'name',
                                        "%{$search}%",
                                    )
                                    ->orWhereLike(
                                        'bcn_code',
                                        "%{$search}%",
                                    )
                                    ->orWhereHas(
                                        'brand',
                                        fn (
                                            Builder $brandQuery,
                                        ) =>
                                            $brandQuery
                                                ->whereLike(
                                                    'name',
                                                    "%{$search}%",
                                                ),
                                    )
                                    ->orWhereHas(
                                        'category',
                                        fn (
                                            Builder $categoryQuery,
                                        ) =>
                                            $categoryQuery
                                                ->whereLike(
                                                    'name',
                                                    "%{$search}%",
                                                ),
                                    );
                            },
                        );
                    },
                )

                /*
                |--------------------------------------------------------------------------
                | Marca
                |--------------------------------------------------------------------------
                */

                ->when(
                    $request->filled(
                        'brand_id',
                    ),
                    fn (
                        Builder $query,
                    ) =>
                        $query->where(
                            'brand_id',
                            $request->integer(
                                'brand_id',
                            ),
                        ),
                )

                /*
                |--------------------------------------------------------------------------
                | Categoría
                |--------------------------------------------------------------------------
                */

                ->when(
                    $request->filled(
                        'category_id',
                    ),
                    fn (
                        Builder $query,
                    ) =>
                        $query->where(
                            'category_id',
                            $request->integer(
                                'category_id',
                            ),
                        ),
                )

                /*
                |--------------------------------------------------------------------------
                | Grupo de categoría
                |--------------------------------------------------------------------------
                */

                ->when(
                    $request->filled(
                        'category_group',
                    ),
                    function (
                        Builder $query,
                    ) use (
                        $request,
                    ): void {
                        $categoryGroup =
                            (string) $request->input(
                                'category_group',
                            );

                        $keywords =
                            self::CATEGORY_GROUPS[
                                $categoryGroup
                            ];

                        $query->whereHas(
                            'category',
                            function (
                                Builder $categoryQuery,
                            ) use (
                                $keywords,
                            ): void {
                                $categoryQuery->where(
                                    function (
                                        Builder $nameQuery,
                                    ) use (
                                        $keywords,
                                    ): void {
                                        foreach (
                                            $keywords as
                                            $keyword
                                        ) {
                                            $nameQuery
                                                ->orWhere(
                                                    'name',
                                                    'like',
                                                    "%{$keyword}%",
                                                );
                                        }
                                    },
                                );
                            },
                        );
                    },
                )

                /*
                |--------------------------------------------------------------------------
                | Orden y paginación
                |--------------------------------------------------------------------------
                */

                ->orderBy('name')
                ->paginate(
                    $request->integer(
                        'per_page',
                        24,
                    ),
                );

        /*
        |--------------------------------------------------------------------------
        | Formato de respuesta
        |--------------------------------------------------------------------------
        */

        $products
            ->getCollection()
            ->transform(
                function (
                    Product $product,
                ) use (
                    $user,
                ): array {
                    $data = [
                        'id' =>
                            $product->id,

                        'code' =>
                            $product->bcn_code,

                        'name' =>
                            $product->name,

                        'image_url' =>
                            $product->image_path
                                ? url(
                                    Storage::disk(
                                        'public',
                                    )->url(
                                        $product->image_path,
                                    ),
                                )
                                : null,

                        'brand' =>
                            $product->brand === null
                                ? null
                                : [
                                    'id' =>
                                        $product
                                            ->brand
                                            ->id,

                                    'name' =>
                                        $product
                                            ->brand
                                            ->name,
                                ],

                        'category' =>
                            $product->category ===
                            null
                                ? null
                                : [
                                    'id' =>
                                        $product
                                            ->category
                                            ->id,

                                    'name' =>
                                        $product
                                            ->category
                                            ->name,
                                ],

                        'can_view_price' =>
                            false,
                    ];

                    /*
                    |--------------------------------------------------------------------------
                    | Precio del cliente
                    |--------------------------------------------------------------------------
                    */

                    if (
                        $user?->isClient() &&
                        $user->price_list_id !==
                            null
                    ) {
                        $priceItem =
                            $product
                                ->priceListItems
                                ->first();

                        if (
                            $priceItem !==
                            null
                        ) {
                            $data[
                                'can_view_price'
                            ] = true;

                            $data['price'] =
                                $priceItem->price;

                            $data[
                                'discount_percentage'
                            ] =
                                $priceItem
                                    ->discount_percentage;
                        }
                    }

                    return $data;
                },
            );

        return response()->json(
            $products,
        );
    }

    public function show(
        Request $request,
        Product $product,
    ): JsonResponse {
        $user =
            Auth::guard(
                'sanctum',
            )->user();

        $product->load([
            'brand:id,name',
            'category:id,name',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Cargar precio correspondiente a la lista
        |--------------------------------------------------------------------------
        */

        if (
            $user?->isClient() &&
            $user->price_list_id !==
                null
        ) {
            $product->load([
                'priceListItems' =>
                    fn (
                        $query,
                    ) =>
                        $query
                            ->select([
                                'id',
                                'price_list_id',
                                'product_id',
                                'price',
                                'discount_percentage',
                            ])
                            ->where(
                                'price_list_id',
                                $user
                                    ->price_list_id,
                            ),
            ]);

            /*
            |--------------------------------------------------------------------------
            | Producto no disponible para este cliente
            |--------------------------------------------------------------------------
            |
            | Si el producto no está actualmente en la lista asignada
            | al cliente, no debe poder acceder a él manualmente.
            |
            */

            $priceItem =
                $product
                    ->priceListItems
                    ->first();

            if (
                $priceItem ===
                null
            ) {
                return response()->json([
                    'message' =>
                        'Producto no disponible.',
                ], 404);
            }
        }

        $data = [
            'id' =>
                $product->id,

            'code' =>
                $product->bcn_code,

            'name' =>
                $product->name,

            'image_url' =>
                $product->image_path
                    ? url(
                        Storage::disk(
                            'public',
                        )->url(
                            $product->image_path,
                        ),
                    )
                    : null,

            'brand' =>
                $product->brand ===
                null
                    ? null
                    : [
                        'id' =>
                            $product
                                ->brand
                                ->id,

                        'name' =>
                            $product
                                ->brand
                                ->name,
                    ],

            'category' =>
                $product->category ===
                null
                    ? null
                    : [
                        'id' =>
                            $product
                                ->category
                                ->id,

                        'name' =>
                            $product
                                ->category
                                ->name,
                    ],

            'can_view_price' =>
                false,
        ];

        /*
        |--------------------------------------------------------------------------
        | Precio del producto
        |--------------------------------------------------------------------------
        */

        if (
            $user?->isClient() &&
            $user->price_list_id !==
                null
        ) {
            $priceItem =
                $product
                    ->priceListItems
                    ->first();

            $data[
                'can_view_price'
            ] = true;

            $data['price'] =
                $priceItem->price;

            $data[
                'discount_percentage'
            ] =
                $priceItem
                    ->discount_percentage;
        }

        return response()->json([
            'data' =>
                $data,
        ]);
    }
}