<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AdminCatalogController extends Controller
{
    /**
     * Listado general de productos para administración.
     *
     * Este listado consulta directamente la tabla products.
     * De esta manera, cualquier producto creado durante una
     * importación de lista de precios aparecerá automáticamente.
     */
    public function index(
        Request $request,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' => 'No autorizado.',
            ], 403);
        }

        $validated = $request->validate([
            'search' => [
                'nullable',
                'string',
                'max:150',
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

            'image_status' => [
                'nullable',
                'string',
                Rule::in([
                    'with_image',
                    'without_image',
                ]),
            ],

            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],
        ]);

        $search = trim(
            (string) ($validated['search'] ?? ''),
        );

        $products = Product::query()
            ->with([
                'brand:id,name',
                'category:id,name',
            ])

            ->when(
                $search !== '',
                function (
                    Builder $query,
                ) use (
                    $search,
                ): void {
                    $query->where(
                        function (
                            Builder $searchQuery,
                        ) use (
                            $search,
                        ): void {
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
                                    function (
                                        Builder $brandQuery,
                                    ) use (
                                        $search,
                                    ): void {
                                        $brandQuery->where(
                                            'name',
                                            'like',
                                            "%{$search}%",
                                        );
                                    },
                                )
                                ->orWhereHas(
                                    'category',
                                    function (
                                        Builder $categoryQuery,
                                    ) use (
                                        $search,
                                    ): void {
                                        $categoryQuery->where(
                                            'name',
                                            'like',
                                            "%{$search}%",
                                        );
                                    },
                                );
                        },
                    );
                },
            )

            ->when(
                isset($validated['brand_id']),
                fn (
                    Builder $query,
                ) =>
                    $query->where(
                        'brand_id',
                        $validated['brand_id'],
                    ),
            )

            ->when(
                isset($validated['category_id']),
                fn (
                    Builder $query,
                ) =>
                    $query->where(
                        'category_id',
                        $validated['category_id'],
                    ),
            )

            ->when(
                ($validated['image_status'] ?? null) ===
                    'with_image',
                fn (
                    Builder $query,
                ) =>
                    $query
                        ->whereNotNull('image_path')
                        ->where('image_path', '<>', ''),
            )

            ->when(
                ($validated['image_status'] ?? null) ===
                    'without_image',
                fn (
                    Builder $query,
                ) =>
                    $query->where(
                        function (
                            Builder $imageQuery,
                        ): void {
                            $imageQuery
                                ->whereNull('image_path')
                                ->orWhere(
                                    'image_path',
                                    '',
                                );
                        },
                    ),
            )

            ->orderBy('name')
            ->paginate(
                (int) ($validated['per_page'] ?? 25),
            );

        $products
            ->getCollection()
            ->transform(
                fn (
                    Product $product,
                ): array =>
                    $this->formatProduct(
                        $product,
                    ),
            );

        return response()->json(
            $products,
        );
    }

    /**
     * Sube o reemplaza la imagen principal de un producto.
     */
    public function storeImage(
        Request $request,
        Product $product,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' => 'No autorizado.',
            ], 403);
        }

        $validated = $request->validate(
            [
                'image' => [
                    'required',
                    'image',
                    'mimes:jpg,jpeg,png,webp',
                    'max:5120',
                ],
            ],
            [
                'image.required' =>
                    'Debes seleccionar una imagen.',

                'image.image' =>
                    'El archivo seleccionado debe ser una imagen válida.',

                'image.mimes' =>
                    'La imagen debe estar en formato JPG, JPEG, PNG o WEBP.',

                'image.max' =>
                    'La imagen no puede superar los 5 MB.',
            ],
        );

        $uploadedImage =
            $request->file('image');

        if (! $uploadedImage) {
            return response()->json([
                'message' =>
                    'No se recibió la imagen.',
            ], 422);
        }

        $newImagePath = $uploadedImage->store(
            'products',
            'public',
        );

        if (! $newImagePath) {
            return response()->json([
                'message' =>
                    'No se pudo guardar la imagen.',
            ], 422);
        }

        $previousImagePath =
            $product->image_path;

        $product->update([
            'image_path' =>
                $newImagePath,
        ]);

        /*
         * La imagen anterior se elimina únicamente después
         * de guardar correctamente la nueva referencia.
         */
        if (
            $previousImagePath &&
            $previousImagePath !==
                $newImagePath
        ) {
            Storage::disk('public')
                ->delete(
                    $previousImagePath,
                );
        }

        $product->refresh();

        $product->load([
            'brand:id,name',
            'category:id,name',
        ]);

        return response()->json([
            'message' =>
                $previousImagePath
                    ? 'Imagen reemplazada correctamente.'
                    : 'Imagen cargada correctamente.',

            'data' =>
                $this->formatProduct(
                    $product,
                ),
        ]);
    }

    /**
     * Elimina la imagen principal sin eliminar el producto.
     */
    public function destroyImage(
        Request $request,
        Product $product,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' => 'No autorizado.',
            ], 403);
        }

        $imagePath =
            $product->image_path;

        if (! $imagePath) {
            return response()->json([
                'message' =>
                    'El producto no tiene una imagen cargada.',
            ], 422);
        }

        /*
         * Primero dejamos el producto sin referencia.
         * Después eliminamos el archivo físico.
         */
        $product->update([
            'image_path' => null,
        ]);

        Storage::disk('public')
            ->delete(
                $imagePath,
            );

        $product->refresh();

        $product->load([
            'brand:id,name',
            'category:id,name',
        ]);

        return response()->json([
            'message' =>
                'Imagen eliminada correctamente.',

            'data' =>
                $this->formatProduct(
                    $product,
                ),
        ]);
    }

    /**
     * Formato común utilizado por el catálogo administrativo.
     */
    private function formatProduct(
        Product $product,
    ): array {
        return [
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
                            $product->brand->id,

                        'name' =>
                            $product->brand->name,
                    ],

            'category' =>
                $product->category === null
                    ? null
                    : [
                        'id' =>
                            $product->category->id,

                        'name' =>
                            $product->category->name,
                    ],

            'has_image' =>
                filled(
                    $product->image_path,
                ),

            'image_url' =>
                $product->image_path
                    ? Storage::disk('public')
                        ->url(
                            $product->image_path,
                        )
                    : null,

            'created_at' =>
                $product->created_at,

            'updated_at' =>
                $product->updated_at,
        ];
    }
}