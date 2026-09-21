<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PriceList;
use App\Models\User;
use App\Services\BcnProductImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Throwable;

class AdminPriceListController extends Controller
{
    /**
     * Listado de listas de precios.
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

        $search = trim(
            (string) $request->query(
                'search',
                '',
            ),
        );

        $priceLists = PriceList::query()
            ->when(
                $search !== '',
                function ($query) use ($search): void {
                    $query->where(
                        function ($subQuery) use ($search): void {
                            $subQuery
                                ->where(
                                    'name',
                                    'like',
                                    "%{$search}%",
                                )
                                ->orWhere(
                                    'code',
                                    'like',
                                    "%{$search}%",
                                );
                        },
                    );
                },
            )
            ->withCount('items')
            ->orderByDesc('is_general')
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $priceLists
                ->map(
                    function (
                        PriceList $priceList,
                    ): array {
                        return $this->formatPriceList(
                            $priceList,
                        );
                    },
                )
                ->values(),
        ]);
    }

    /**
     * Detalle de una lista de precios.
     */
    public function show(
        Request $request,
        PriceList $priceList,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' => 'No autorizado.',
            ], 403);
        }

        $priceList->load([
            'items' => function ($query): void {
                $query
                    ->with([
                        'product.brand:id,name',
                        'product.category:id,name',
                    ])
                    ->orderBy('product_id');
            },
        ]);

        $clientsCount = User::query()
            ->where(
                'role',
                'client',
            )
            ->where(
                'price_list_id',
                $priceList->id,
            )
            ->count();

        return response()->json([
            'data' => [
                'id' =>
                    $priceList->id,

                'name' =>
                    $priceList->name,

                'code' =>
                    $priceList->code,

                'is_general' =>
                    (bool) $priceList->is_general,

                'is_active' =>
                    (bool) $priceList->is_active,

                'products_count' =>
                    $priceList->items->count(),

                'clients_count' =>
                    $clientsCount,

                'created_at' =>
                    $priceList->created_at,

                'updated_at' =>
                    $priceList->updated_at,

                'items' =>
                    $priceList->items
                        ->map(
                            function ($item): array {
                                return [
                                    'id' =>
                                        $item->id,

                                    'price' =>
                                        (float) $item->price,

                                    'discount_percentage' =>
                                        $item->discount_percentage !== null
                                            ? (float) $item
                                                ->discount_percentage
                                            : null,

                                    'product' =>
                                        $item->product
                                            ? [
                                                'id' =>
                                                    $item
                                                        ->product
                                                        ->id,

                                                'code' =>
                                                    $item
                                                        ->product
                                                        ->bcn_code,

                                                'name' =>
                                                    $item
                                                        ->product
                                                        ->name,

                                                'brand' =>
                                                    $item
                                                        ->product
                                                        ->brand
                                                        ? [
                                                            'id' =>
                                                                $item
                                                                    ->product
                                                                    ->brand
                                                                    ->id,

                                                            'name' =>
                                                                $item
                                                                    ->product
                                                                    ->brand
                                                                    ->name,
                                                        ]
                                                        : null,

                                                'category' =>
                                                    $item
                                                        ->product
                                                        ->category
                                                        ? [
                                                            'id' =>
                                                                $item
                                                                    ->product
                                                                    ->category
                                                                    ->id,

                                                            'name' =>
                                                                $item
                                                                    ->product
                                                                    ->category
                                                                    ->name,
                                                        ]
                                                        : null,
                                            ]
                                            : null,
                                ];
                            },
                        )
                        ->values(),
            ],
        ]);
    }

    /**
     * Crea una nueva lista de precios.
     *
     * Las listas nuevas siempre son personalizadas.
     * La Lista General sigue siendo única.
     */
    public function store(
        Request $request,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' => 'No autorizado.',
            ], 403);
        }

        $validated = $request->validate(
            [
                'name' => [
                    'required',
                    'string',
                    'max:150',
                ],

                'code' => [
                    'required',
                    'string',
                    'max:50',
                    Rule::unique(
                        'price_lists',
                        'code',
                    ),
                ],
            ],
            [
                'name.required' =>
                    'El nombre de la lista es obligatorio.',

                'code.required' =>
                    'El código de la lista es obligatorio.',

                'code.unique' =>
                    'Ya existe una lista con ese código.',
            ],
        );

        $code = strtoupper(
            trim(
                $validated['code'],
            ),
        );

        if ($code === 'GENERAL') {
            return response()->json([
                'message' =>
                    'El código GENERAL está reservado para la Lista General.',
            ], 422);
        }

        $priceList = PriceList::query()
            ->create([
                'name' =>
                    trim(
                        $validated['name'],
                    ),

                'code' =>
                    $code,

                'is_general' =>
                    false,

                'is_active' =>
                    true,
            ]);

        return response()->json([
            'message' =>
                'Lista de precios creada correctamente.',

            'data' =>
                $this->formatPriceList(
                    $priceList,
                ),
        ], 201);
    }

    /**
     * Edita nombre y código de una lista.
     */
    public function update(
        Request $request,
        PriceList $priceList,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' => 'No autorizado.',
            ], 403);
        }

        $validated = $request->validate(
            [
                'name' => [
                    'required',
                    'string',
                    'max:150',
                ],

                'code' => [
                    'required',
                    'string',
                    'max:50',

                    Rule::unique(
                        'price_lists',
                        'code',
                    )->ignore(
                        $priceList->id,
                    ),
                ],
            ],
            [
                'name.required' =>
                    'El nombre de la lista es obligatorio.',

                'code.required' =>
                    'El código de la lista es obligatorio.',

                'code.unique' =>
                    'Ya existe una lista con ese código.',
            ],
        );

        $code = strtoupper(
            trim(
                $validated['code'],
            ),
        );

        /*
         * La Lista General mantiene obligatoriamente
         * el código GENERAL.
         */
        if (
            $priceList->is_general &&
            $code !== 'GENERAL'
        ) {
            return response()->json([
                'message' =>
                    'El código de la Lista General no puede modificarse.',
            ], 422);
        }

        /*
         * Una lista personalizada tampoco puede
         * apropiarse del código reservado GENERAL.
         */
        if (
            ! $priceList->is_general &&
            $code === 'GENERAL'
        ) {
            return response()->json([
                'message' =>
                    'El código GENERAL está reservado para la Lista General.',
            ], 422);
        }

        $priceList->update([
            'name' =>
                trim(
                    $validated['name'],
                ),

            'code' =>
                $code,
        ]);

        $priceList->refresh();

        return response()->json([
            'message' =>
                'Lista de precios actualizada correctamente.',

            'data' =>
                $this->formatPriceList(
                    $priceList,
                ),
        ]);
    }

    /**
     * Activa o desactiva una lista personalizada.
     */
    public function updateStatus(
        Request $request,
        PriceList $priceList,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' => 'No autorizado.',
            ], 403);
        }

        $validated = $request->validate([
            'is_active' => [
                'required',
                'boolean',
            ],
        ]);

        /*
         * La Lista General debe permanecer activa.
         */
        if (
            $priceList->is_general &&
            ! $validated['is_active']
        ) {
            return response()->json([
                'message' =>
                    'La Lista General no puede desactivarse.',
            ], 422);
        }

        $priceList->update([
            'is_active' =>
                $validated['is_active'],
        ]);

        $priceList->refresh();

        return response()->json([
            'message' =>
                $priceList->is_active
                    ? 'Lista de precios activada correctamente.'
                    : 'Lista de precios desactivada correctamente.',

            'data' =>
                $this->formatPriceList(
                    $priceList,
                ),
        ]);
    }

    /**
     * Importa o sincroniza el contenido completo
     * de una lista de precios.
     */
    public function import(
        Request $request,
        PriceList $priceList,
        BcnProductImportService $importService,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' => 'No autorizado.',
            ], 403);
        }

        $request->validate(
            [
                'file' => [
                    'required',
                    'file',
                    'mimes:xlsx,xls',
                    'max:20480',
                ],
            ],
            [
                'file.required' =>
                    'Debes seleccionar un archivo.',

                'file.file' =>
                    'El archivo seleccionado no es válido.',

                'file.mimes' =>
                    'El archivo debe ser Excel (.xlsx o .xls).',

                'file.max' =>
                    'El archivo no puede superar los 20 MB.',
            ],
        );

        $uploadedFile =
            $request->file('file');

        if (! $uploadedFile) {
            return response()->json([
                'message' =>
                    'No se recibió el archivo.',
            ], 422);
        }

        $filePath =
            $uploadedFile->getRealPath();

        if (
            ! $filePath ||
            ! file_exists($filePath)
        ) {
            return response()->json([
                'message' =>
                    'No se pudo acceder al archivo cargado.',
            ], 422);
        }

        try {
            /*
             * PRIMER PASO: dry-run.
             *
             * Validamos todas las filas antes de tocar
             * la lista real.
             */
            $validationResult =
                $importService->import(
                    filePath: $filePath,
                    dryRun: true,
                    priceList: $priceList,
                    synchronize: true,
                );

            if (
                $validationResult['errors'] !== []
            ) {
                return response()->json([
                    'message' =>
                        'El archivo contiene errores y no fue importado.',

                    'data' => [
                        'processed_rows' =>
                            $validationResult[
                                'processed_rows'
                            ],

                        'skipped_rows' =>
                            $validationResult[
                                'skipped_rows'
                            ],

                        'errors' =>
                            $validationResult[
                                'errors'
                            ],
                    ],
                ], 422);
            }

            /*
             * SEGUNDO PASO: importación real.
             *
             * Como el dry-run terminó sin errores,
             * sincronizamos completamente la lista.
             */
            $result =
                $importService->import(
                    filePath: $filePath,
                    dryRun: false,
                    priceList: $priceList,
                    synchronize: true,
                );

            $priceList->touch();

            return response()->json([
                'message' =>
                    'Lista de precios actualizada correctamente.',

                'data' => [
                    'price_list' => [
                        'id' =>
                            $priceList->id,

                        'name' =>
                            $priceList->name,

                        'code' =>
                            $priceList->code,

                        'is_general' =>
                            (bool) $priceList
                                ->is_general,

                        'is_active' =>
                            (bool) $priceList
                                ->is_active,
                    ],

                    'import' => [
                        'processed_rows' =>
                            $result[
                                'processed_rows'
                            ],

                        'created_products' =>
                            $result[
                                'created_products'
                            ],

                        'updated_products' =>
                            $result[
                                'updated_products'
                            ],

                        'processed_brands' =>
                            $result[
                                'processed_brands'
                            ],

                        'processed_categories' =>
                            $result[
                                'processed_categories'
                            ],

                        'created_prices' =>
                            $result[
                                'created_prices'
                            ],

                        'updated_prices' =>
                            $result[
                                'updated_prices'
                            ],

                        'removed_prices' =>
                            $result[
                                'removed_prices'
                            ],

                        'skipped_rows' =>
                            $result[
                                'skipped_rows'
                            ],

                        'errors' =>
                            $result[
                                'errors'
                            ],
                    ],
                ],
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' =>
                    'No se pudo importar la lista de precios.',

                'error' =>
                    $exception->getMessage(),
            ], 422);
        }
    }

    /**
     * Formato común utilizado por el listado.
     */
    private function formatPriceList(
        PriceList $priceList,
    ): array {
        $itemsCount =
            isset($priceList->items_count)
                ? (int) $priceList->items_count
                : $priceList
                    ->items()
                    ->count();

        $clientsCount =
            User::query()
                ->where(
                    'role',
                    'client',
                )
                ->where(
                    'price_list_id',
                    $priceList->id,
                )
                ->count();

        return [
            'id' =>
                $priceList->id,

            'name' =>
                $priceList->name,

            'code' =>
                $priceList->code,

            'is_general' =>
                (bool) $priceList->is_general,

            'is_active' =>
                (bool) $priceList->is_active,

            'products_count' =>
                $itemsCount,

            'clients_count' =>
                $clientsCount,

            'created_at' =>
                $priceList->created_at,

            'updated_at' =>
                $priceList->updated_at,
        ];
    }
}