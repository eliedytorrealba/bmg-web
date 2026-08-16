<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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

    public function index(Request $request): JsonResponse
    {
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

        $user = $request->user();

        $priceListId = $user?->isClient()
            ? $user->price_list_id
            : null;

        $products = Product::query()
            ->with([
                'brand:id,name',
                'category:id,name',
            ])
            ->when(
                $priceListId !== null,
                fn (Builder $query) =>
                    $query->with([
                        'priceListItems' =>
                            fn ($priceQuery) =>
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
            ->when(
                $request->filled('search'),
                function (
                    Builder $query,
                ) use ($request): void {
                    $search = trim(
                        (string) $request->input(
                            'search',
                        ),
                    );

                    $query->where(
                        function (
                            Builder $searchQuery,
                        ) use ($search): void {
                            $searchQuery
                                ->where(
                                    'name',
                                    'like',
                                    "%{$search}%",
                                )
                                ->orWhere(
                                    'bcn_code',
                                    'like',
                                    "%{$search}%",
                                )
                                ->orWhereHas(
                                    'brand',
                                    fn (
                                        Builder $brandQuery,
                                    ) =>
                                        $brandQuery
                                            ->where(
                                                'name',
                                                'like',
                                                "%{$search}%",
                                            ),
                                )
                                ->orWhereHas(
                                    'category',
                                    fn (
                                        Builder $categoryQuery,
                                    ) =>
                                        $categoryQuery
                                            ->where(
                                                'name',
                                                'like',
                                                "%{$search}%",
                                            ),
                                );
                        },
                    );
                },
            )
            ->when(
                $request->filled('brand_id'),
                fn (Builder $query) =>
                    $query->where(
                        'brand_id',
                        $request->integer(
                            'brand_id',
                        ),
                    ),
            )
            ->when(
                $request->filled(
                    'category_id',
                ),
                fn (Builder $query) =>
                    $query->where(
                        'category_id',
                        $request->integer(
                            'category_id',
                        ),
                    ),
            )
            ->when(
                $request->filled(
                    'category_group',
                ),
                function (
                    Builder $query,
                ) use ($request): void {
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
                        ) use ($keywords): void {
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
            ->orderBy('name')
            ->paginate(
                $request->integer(
                    'per_page',
                    24,
                ),
            );

        $products
            ->getCollection()
            ->transform(
                function (
                    Product $product,
                ) use ($user): array {
                    $data = [
                        'id' =>
                            $product->id,

                        'code' =>
                            $product->bcn_code,

                        'name' =>
                            $product->name,

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

                    if (
                        $user?->isClient() &&
                        $user->price_list_id !==
                            null
                    ) {
                        $priceItem = $product
                            ->priceListItems
                            ->first();

                        if (
                            $priceItem !== null
                        ) {
                            $data[
                                'can_view_price'
                            ] = true;

                            $data['price'] =
                                $priceItem->price;

                            $data[
                                'discount_percentage'
                            ] = $priceItem
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
        $user = $request->user();

        $product->load([
            'brand:id,name',
            'category:id,name',
        ]);

        if (
            $user?->isClient() &&
            $user->price_list_id !== null
        ) {
            $product->load([
                'priceListItems' =>
                    fn ($query) =>
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
                                $user->price_list_id,
                            ),
            ]);
        }

        $data = [
            'id' => $product->id,

            'code' =>
                $product->bcn_code,

            'name' =>
                $product->name,

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
                $product->category === null
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

            'can_view_price' => false,
        ];

        if (
            $user?->isClient() &&
            $user->price_list_id !== null
        ) {
            $priceItem = $product
                ->priceListItems
                ->first();

            if ($priceItem !== null) {
                $data[
                    'can_view_price'
                ] = true;

                $data['price'] =
                    $priceItem->price;

                $data[
                    'discount_percentage'
                ] = $priceItem
                    ->discount_percentage;
            }
        }

        return response()->json([
            'data' => $data,
        ]);
    }
}