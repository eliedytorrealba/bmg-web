<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\Category;
use App\Models\PriceList;
use App\Models\PriceListItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use RuntimeException;
use Throwable;

class BcnProductImportService
{
    /**
     * Columnas obligatorias del archivo.
     *
     * Las columnas adicionales, por ejemplo STOCK,
     * pueden existir y serán ignoradas.
     */
    private const REQUIRED_COLUMNS = [
        'codigo',
        'nombre',
        'marca',
        'rubro',
        'precio_venta',
    ];

    /**
     * Cantidad máxima de registros enviados
     * por cada operación masiva.
     */
    private const UPSERT_CHUNK_SIZE = 500;

    /**
     * Importa o sincroniza una lista de precios.
     *
     * LISTA GENERAL
     * - Puede crear productos.
     * - Puede actualizar productos.
     * - Puede crear marcas y categorías.
     * - Puede modificar únicamente sus propios precios.
     *
     * LISTAS PERSONALIZADAS
     * - Solo aceptan productos actualmente incluidos en General.
     * - No crean productos.
     * - No modifican productos, marcas ni categorías.
     * - Solo modifican sus propios precios.
     *
     * @return array<string, mixed>
     */
    public function import(
        string $filePath,
        bool $dryRun = false,
        ?PriceList $priceList = null,
        bool $synchronize = true,
    ): array {
        $sheets = Excel::toArray(
            [],
            $filePath,
        );

        if (
            $sheets === [] ||
            ! isset($sheets[0])
        ) {
            throw new RuntimeException(
                'El archivo Excel no contiene hojas válidas.',
            );
        }

        $rows = $sheets[0];

        if ($rows === []) {
            throw new RuntimeException(
                'La primera hoja del Excel está vacía.',
            );
        }

        $headerIndex =
            $this->findHeaderRowIndex(
                $rows,
            );

        if ($headerIndex === null) {
            throw new RuntimeException(
                'No se encontró una fila de encabezados válida.',
            );
        }

        $headers =
            $this->normalizeHeaders(
                $rows[$headerIndex],
            );

        $this->validateRequiredColumns(
            $headers,
        );

        $targetPriceList =
            $priceList;

        if ($targetPriceList === null) {
            $targetPriceList =
                $this->resolveGeneralPriceList(
                    $dryRun,
                );
        }

        if (
            ! $dryRun &&
            $targetPriceList === null
        ) {
            throw new RuntimeException(
                'No se pudo determinar la lista de precios.',
            );
        }

        $isGeneralImport =
            $priceList === null ||
            (
                $targetPriceList !== null &&
                $targetPriceList->is_general
            );

        $result = [
            'processed_rows' => 0,
            'created_products' => 0,
            'updated_products' => 0,
            'processed_brands' => 0,
            'processed_categories' => 0,
            'created_prices' => 0,
            'updated_prices' => 0,
            'removed_prices' => 0,
            'skipped_rows' => 0,
            'errors' => [],
        ];

        /*
         * =============================================================
         * 1. Normalizar y validar todas las filas en memoria
         * =============================================================
         */

        $normalizedRows = [];

        foreach (
            array_slice(
                $rows,
                $headerIndex + 1,
            ) as $offset => $values
        ) {
            $excelRowNumber =
                $headerIndex +
                $offset +
                2;

            $row =
                $this->combineRow(
                    $headers,
                    $values,
                );

            if ($this->isEmptyRow($row)) {
                continue;
            }

            try {
                $bcnCode =
                    $this->stringValue(
                        $row,
                        'codigo',
                    );

                $name =
                    $this->stringValue(
                        $row,
                        'nombre',
                    );

                $brandName =
                    $this->stringValue(
                        $row,
                        'marca',
                    );

                $categoryName =
                    $this->stringValue(
                        $row,
                        'rubro',
                    );

                $price =
                    $this->decimalOrNull(
                        $row[
                            'precio_venta'
                        ] ?? null,
                    );

                if ($bcnCode === null) {
                    throw new RuntimeException(
                        'El código del producto está vacío.',
                    );
                }

                if ($name === null) {
                    throw new RuntimeException(
                        'El nombre del producto está vacío.',
                    );
                }

                if ($price === null) {
                    throw new RuntimeException(
                        'El precio de venta está vacío o no es válido.',
                    );
                }

                $normalizedRows[] = [
                    'excel_row' =>
                        $excelRowNumber,

                    'bcn_code' =>
                        $bcnCode,

                    'name' =>
                        $name,

                    'brand_name' =>
                        $brandName,

                    'category_name' =>
                        $categoryName,

                    'price' =>
                        $price,
                ];
            } catch (Throwable $exception) {
                $result[
                    'skipped_rows'
                ]++;

                $result[
                    'errors'
                ][] =
                    "Fila {$excelRowNumber}: " .
                    $exception->getMessage();
            }
        }

        /*
         * No continuamos con una importación real
         * si la validación básica ya encontró errores.
         */
        if (
            ! $dryRun &&
            $result['errors'] !== []
        ) {
            throw new RuntimeException(
                'El archivo contiene errores. ' .
                'No se realizaron cambios. ' .
                $result['errors'][0],
            );
        }

        /*
         * Quitamos códigos duplicados manteniendo
         * la última aparición del archivo.
         */
        $rowsByCode = [];

        foreach (
            $normalizedRows as $row
        ) {
            $rowsByCode[
                $row['bcn_code']
            ] = $row;
        }

        $normalizedRows =
            array_values(
                $rowsByCode,
            );

        $codes =
            array_values(
                array_unique(
                    array_column(
                        $normalizedRows,
                        'bcn_code',
                    ),
                ),
            );

        /*
         * =============================================================
         * 2. Precargar productos existentes en UNA consulta
         * =============================================================
         */

        $existingProducts =
            Product::query()
                ->whereIn(
                    'bcn_code',
                    $codes,
                )
                ->get([
                    'id',
                    'bcn_code',
                    'name',
                    'brand_id',
                    'category_id',
                ])
                ->keyBy(
                    'bcn_code',
                );

        /*
         * =============================================================
         * 3. Precargar precios actuales de la lista
         * =============================================================
         */

        $existingPriceItemsByProductId =
            collect();

        $existingProductIdsInTarget = [];

        if ($targetPriceList !== null) {
            $existingTargetItems =
                PriceListItem::query()
                    ->where(
                        'price_list_id',
                        $targetPriceList->id,
                    )
                    ->get([
                        'id',
                        'product_id',
                        'price',
                    ]);

            $existingPriceItemsByProductId =
                $existingTargetItems
                    ->keyBy(
                        'product_id',
                    );

            $existingProductIdsInTarget =
                $existingTargetItems
                    ->pluck(
                        'product_id',
                    )
                    ->map(
                        static fn ($id): int =>
                            (int) $id,
                    )
                    ->all();
        }

        /*
         * =============================================================
         * 4. Lista personalizada
         * =============================================================
         */

        if (! $isGeneralImport) {
            $this->processCustomPriceList(
                normalizedRows:
                    $normalizedRows,

                existingProducts:
                    $existingProducts,

                targetPriceList:
                    $targetPriceList,

                existingPriceItemsByProductId:
                    $existingPriceItemsByProductId,

                existingProductIdsInTarget:
                    $existingProductIdsInTarget,

                result:
                    $result,

                dryRun:
                    $dryRun,

                synchronize:
                    $synchronize,
            );

            return $result;
        }

        /*
         * =============================================================
         * 5. Lista General
         * =============================================================
         */

        $this->processGeneralPriceList(
            normalizedRows:
                $normalizedRows,

            existingProducts:
                $existingProducts,

            targetPriceList:
                $targetPriceList,

            existingPriceItemsByProductId:
                $existingPriceItemsByProductId,

            existingProductIdsInTarget:
                $existingProductIdsInTarget,

            result:
                $result,

            dryRun:
                $dryRun,

            synchronize:
                $synchronize,
        );

        return $result;
    }

    /**
     * Procesa la Lista General.
     *
     * @param array<int, array<string, mixed>> $normalizedRows
     * @param array<string, mixed> $result
     */
    private function processGeneralPriceList(
        array $normalizedRows,
        $existingProducts,
        ?PriceList $targetPriceList,
        $existingPriceItemsByProductId,
        array $existingProductIdsInTarget,
        array &$result,
        bool $dryRun,
        bool $synchronize,
    ): void {
        $brandNames = [];
        $categoryNames = [];

        foreach (
            $normalizedRows as $row
        ) {
            if (
                $row['brand_name'] !==
                null
            ) {
                $brandNames[
                    $row['brand_name']
                ] = true;
            }

            if (
                $row['category_name'] !==
                null
            ) {
                $categoryNames[
                    $row['category_name']
                ] = true;
            }

            if (
                $existingProducts
                    ->has(
                        $row['bcn_code'],
                    )
            ) {
                $result[
                    'updated_products'
                ]++;
            } else {
                $result[
                    'created_products'
                ]++;
            }

            $result[
                'processed_rows'
            ]++;
        }

        $brandNames =
            array_keys(
                $brandNames,
            );

        $categoryNames =
            array_keys(
                $categoryNames,
            );

        $result[
            'processed_brands'
        ] =
            count(
                $brandNames,
            );

        $result[
            'processed_categories'
        ] =
            count(
                $categoryNames,
            );

        /*
         * DRY RUN
         *
         * Para productos existentes podemos determinar
         * si el precio ya existe.
         *
         * Para productos nuevos el precio también será nuevo.
         */
        if ($dryRun) {
            $processedProductIds = [];

            foreach (
                $normalizedRows as $row
            ) {
                $existingProduct =
                    $existingProducts
                        ->get(
                            $row[
                                'bcn_code'
                            ],
                        );

                if (
                    $existingProduct ===
                    null
                ) {
                    $result[
                        'created_prices'
                    ]++;

                    continue;
                }

                $productId =
                    (int)
                    $existingProduct->id;

                $processedProductIds[] =
                    $productId;

                if (
                    $existingPriceItemsByProductId
                        ->has(
                            $productId,
                        )
                ) {
                    $result[
                        'updated_prices'
                    ]++;
                } else {
                    $result[
                        'created_prices'
                    ]++;
                }
            }

            if (
                $synchronize &&
                $targetPriceList !== null
            ) {
                $removedProductIds =
                    array_diff(
                        $existingProductIdsInTarget,
                        $processedProductIds,
                    );

                $result[
                    'removed_prices'
                ] =
                    count(
                        $removedProductIds,
                    );
            }

            return;
        }

        if ($targetPriceList === null) {
            throw new RuntimeException(
                'No se pudo determinar la Lista General.',
            );
        }

        /*
         * =============================================================
         * IMPORTACIÓN REAL GENERAL
         * =============================================================
         */

        DB::transaction(
            function () use (
                $normalizedRows,
                $brandNames,
                $categoryNames,
                $targetPriceList,
                $existingPriceItemsByProductId,
                $existingProductIdsInTarget,
                $synchronize,
                &$result,
            ): void {
                $now = now();

                /*
                 * -----------------------------------------------------
                 * Marcas
                 * -----------------------------------------------------
                 */

                if ($brandNames !== []) {
                    $brandRows =
                        array_map(
                            static fn (
                                string $name,
                            ): array => [
                                'name' =>
                                    $name,

                                'created_at' =>
                                    $now,

                                'updated_at' =>
                                    $now,
                            ],
                            $brandNames,
                        );

                    foreach (
                        array_chunk(
                            $brandRows,
                            self::UPSERT_CHUNK_SIZE,
                        ) as $chunk
                    ) {
                        Brand::query()
                            ->insertOrIgnore(
                                $chunk,
                            );
                    }
                }

                /*
                 * -----------------------------------------------------
                 * Categorías
                 * -----------------------------------------------------
                 */

                if (
                    $categoryNames !== []
                ) {
                    $categoryRows =
                        array_map(
                            static fn (
                                string $name,
                            ): array => [
                                'name' =>
                                    $name,

                                'created_at' =>
                                    $now,

                                'updated_at' =>
                                    $now,
                            ],
                            $categoryNames,
                        );

                    foreach (
                        array_chunk(
                            $categoryRows,
                            self::UPSERT_CHUNK_SIZE,
                        ) as $chunk
                    ) {
                        Category::query()
                            ->insertOrIgnore(
                                $chunk,
                            );
                    }
                }

                /*
                 * Una consulta por tabla para obtener IDs.
                 */
                $brands =
                    Brand::query()
                        ->whereIn(
                            'name',
                            $brandNames,
                        )
                        ->pluck(
                            'id',
                            'name',
                        );

                $categories =
                    Category::query()
                        ->whereIn(
                            'name',
                            $categoryNames,
                        )
                        ->pluck(
                            'id',
                            'name',
                        );

                /*
                 * -----------------------------------------------------
                 * Productos - UPSERT por bloques
                 * -----------------------------------------------------
                 */

                $productRows = [];

                foreach (
                    $normalizedRows as $row
                ) {
                    $productRows[] = [
                        'bcn_code' =>
                            $row['bcn_code'],

                        'name' =>
                            $row['name'],

                        'brand_id' =>
                            $row[
                                'brand_name'
                            ] !== null
                                ? $brands->get(
                                    $row[
                                        'brand_name'
                                    ],
                                )
                                : null,

                        'category_id' =>
                            $row[
                                'category_name'
                            ] !== null
                                ? $categories->get(
                                    $row[
                                        'category_name'
                                    ],
                                )
                                : null,

                        'created_at' =>
                            $now,

                        'updated_at' =>
                            $now,
                    ];
                }

                foreach (
                    array_chunk(
                        $productRows,
                        self::UPSERT_CHUNK_SIZE,
                    ) as $chunk
                ) {
                    Product::query()
                        ->upsert(
                            $chunk,
                            [
                                'bcn_code',
                            ],
                            [
                                'name',
                                'brand_id',
                                'category_id',
                                'updated_at',
                            ],
                        );
                }

                /*
                 * Recuperamos todos los productos ya persistidos
                 * en una sola consulta.
                 */
                $codes =
                    array_column(
                        $normalizedRows,
                        'bcn_code',
                    );

                $persistedProducts =
                    Product::query()
                        ->whereIn(
                            'bcn_code',
                            $codes,
                        )
                        ->get([
                            'id',
                            'bcn_code',
                        ])
                        ->keyBy(
                            'bcn_code',
                        );

                /*
                 * -----------------------------------------------------
                 * Precios GENERAL
                 * -----------------------------------------------------
                 */

                $priceRows = [];
                $processedProductIds = [];

                foreach (
                    $normalizedRows as $row
                ) {
                    $product =
                        $persistedProducts
                            ->get(
                                $row[
                                    'bcn_code'
                                ],
                            );

                    if ($product === null) {
                        throw new RuntimeException(
                            "No se pudo resolver el producto {$row['bcn_code']}.",
                        );
                    }

                    $productId =
                        (int)
                        $product->id;

                    $processedProductIds[] =
                        $productId;

                    if (
                        $existingPriceItemsByProductId
                            ->has(
                                $productId,
                            )
                    ) {
                        $result[
                            'updated_prices'
                        ]++;
                    } else {
                        $result[
                            'created_prices'
                        ]++;
                    }

                    $priceRows[] = [
                        'price_list_id' =>
                            $targetPriceList->id,

                        'product_id' =>
                            $productId,

                        'price' =>
                            $row['price'],

                        'discount_percentage' =>
                            null,

                        'created_at' =>
                            $now,

                        'updated_at' =>
                            $now,
                    ];
                }

                foreach (
                    array_chunk(
                        $priceRows,
                        self::UPSERT_CHUNK_SIZE,
                    ) as $chunk
                ) {
                    PriceListItem::query()
                        ->upsert(
                            $chunk,
                            [
                                'price_list_id',
                                'product_id',
                            ],
                            [
                                'price',
                                'discount_percentage',
                                'updated_at',
                            ],
                        );
                }

                /*
                 * -----------------------------------------------------
                 * Sincronización
                 * -----------------------------------------------------
                 */

                if ($synchronize) {
    /*
     * Productos que estaban anteriormente en GENERAL
     * pero que ya no aparecen en el nuevo archivo.
     */
    $removedProductIds =
        array_values(
            array_diff(
                $existingProductIdsInTarget,
                $processedProductIds,
            ),
        );

    $result[
        'removed_prices'
    ] =
        count(
            $removedProductIds,
        );

    /*
     * Primero retiramos esos productos
     * de la propia Lista General.
     */
    if (
        $removedProductIds !==
        []
    ) {
        PriceListItem::query()
            ->where(
                'price_list_id',
                $targetPriceList->id,
            )
            ->whereIn(
                'product_id',
                $removedProductIds,
            )
            ->delete();
    }

    /*
     * Luego obtenemos todos los productos que
     * actualmente siguen perteneciendo a GENERAL.
     *
     * Esto también permite limpiar inconsistencias
     * históricas de listas personalizadas.
     */
    $currentGeneralProductIds =
        PriceListItem::query()
            ->where(
                'price_list_id',
                $targetPriceList->id,
            )
            ->pluck(
                'product_id',
            )
            ->map(
                static fn ($id): int =>
                    (int) $id,
            )
            ->all();

    /*
     * Una lista personalizada solo puede contener
     * productos que actualmente existan en GENERAL.
     *
     * Si un producto fue retirado de GENERAL,
     * también se elimina de todas las listas
     * personalizadas.
     *
     * NO se elimina Product del catálogo maestro.
     */
    $customPriceListItems =
        PriceListItem::query()
            ->where(
                'price_list_id',
                '!=',
                $targetPriceList->id,
            );

    if (
        $currentGeneralProductIds ===
        []
    ) {
        /*
         * Si GENERAL quedara vacía,
         * ninguna personalizada puede conservar productos.
         */
        $customPriceListItems
            ->delete();
    } else {
        $customPriceListItems
            ->whereNotIn(
                'product_id',
                $currentGeneralProductIds,
            )
            ->delete();
    }
}
            },
        );
    }

    /**
     * Procesa una lista personalizada.
     *
     * @param array<int, array<string, mixed>> $normalizedRows
     * @param array<string, mixed> $result
     */
    private function processCustomPriceList(
        array $normalizedRows,
        $existingProducts,
        ?PriceList $targetPriceList,
        $existingPriceItemsByProductId,
        array $existingProductIdsInTarget,
        array &$result,
        bool $dryRun,
        bool $synchronize,
    ): void {
        if ($targetPriceList === null) {
            throw new RuntimeException(
                'No se pudo determinar la lista de precios personalizada.',
            );
        }

        $generalPriceList =
            PriceList::query()
                ->where(
                    'code',
                    'GENERAL',
                )
                ->where(
                    'is_general',
                    true,
                )
                ->first();

        if ($generalPriceList === null) {
            throw new RuntimeException(
                'No se encontró una Lista General válida.',
            );
        }

        /*
         * IDs de productos presentes en el archivo
         * que sí existen como Product.
         */
        $candidateProductIds = [];

        foreach (
            $normalizedRows as $row
        ) {
            $product =
                $existingProducts
                    ->get(
                        $row['bcn_code'],
                    );

            if ($product !== null) {
                $candidateProductIds[] =
                    (int) $product->id;
            }
        }

        /*
         * Una única consulta para verificar membresía en GENERAL.
         */
        $generalProductIds =
            PriceListItem::query()
                ->where(
                    'price_list_id',
                    $generalPriceList->id,
                )
                ->whereIn(
                    'product_id',
                    array_values(
                        array_unique(
                            $candidateProductIds,
                        ),
                    ),
                )
                ->pluck(
                    'product_id',
                )
                ->mapWithKeys(
                    static fn (
                        $id,
                    ): array => [
                        (int) $id =>
                            true,
                    ],
                )
                ->all();

        $validRows = [];
        $processedProductIds = [];

        foreach (
            $normalizedRows as $row
        ) {
            $product =
                $existingProducts
                    ->get(
                        $row['bcn_code'],
                    );

            if ($product === null) {
                $result[
                    'skipped_rows'
                ]++;

                $result[
                    'errors'
                ][] =
                    "Fila {$row['excel_row']}: " .
                    "El producto con código {$row['bcn_code']} " .
                    'no existe en la Lista General.';

                continue;
            }

            $productId =
                (int) $product->id;

            if (
                ! isset(
                    $generalProductIds[
                        $productId
                    ],
                )
            ) {
                $result[
                    'skipped_rows'
                ]++;

                $result[
                    'errors'
                ][] =
                    "Fila {$row['excel_row']}: " .
                    "El producto con código {$row['bcn_code']} " .
                    'no pertenece actualmente a la Lista General.';

                continue;
            }

            $validRows[] = [
                ...$row,
                'product_id' =>
                    $productId,
            ];

            $processedProductIds[] =
                $productId;

            if (
                $existingPriceItemsByProductId
                    ->has(
                        $productId,
                    )
            ) {
                $result[
                    'updated_prices'
                ]++;
            } else {
                $result[
                    'created_prices'
                ]++;
            }

            $result[
                'processed_rows'
            ]++;
        }

        /*
         * Personalizadas nunca administran
         * catálogo maestro.
         */
        $result[
            'created_products'
        ] = 0;

        $result[
            'updated_products'
        ] = 0;

        $result[
            'processed_brands'
        ] = 0;

        $result[
            'processed_categories'
        ] = 0;

        /*
         * Para personalizada cualquier error
         * invalida la operación completa.
         */
        if (
            $result['errors'] !== []
        ) {
            if ($dryRun) {
                return;
            }

            throw new RuntimeException(
                'La lista personalizada contiene productos inválidos. ' .
                'No se realizaron cambios. ' .
                $result['errors'][0],
            );
        }

        if ($synchronize) {
            $removedProductIds =
                array_values(
                    array_diff(
                        $existingProductIdsInTarget,
                        array_values(
                            array_unique(
                                $processedProductIds,
                            ),
                        ),
                    ),
                );

            $result[
                'removed_prices'
            ] =
                count(
                    $removedProductIds,
                );
        }

        if ($dryRun) {
            return;
        }

        DB::transaction(
            function () use (
                $validRows,
                $processedProductIds,
                $existingProductIdsInTarget,
                $targetPriceList,
                $synchronize,
            ): void {
                $now = now();

                $priceRows = [];

                foreach (
                    $validRows as $row
                ) {
                    $priceRows[] = [
                        'price_list_id' =>
                            $targetPriceList->id,

                        'product_id' =>
                            $row['product_id'],

                        'price' =>
                            $row['price'],

                        'discount_percentage' =>
                            null,

                        'created_at' =>
                            $now,

                        'updated_at' =>
                            $now,
                    ];
                }

                foreach (
                    array_chunk(
                        $priceRows,
                        self::UPSERT_CHUNK_SIZE,
                    ) as $chunk
                ) {
                    PriceListItem::query()
                        ->upsert(
                            $chunk,
                            [
                                'price_list_id',
                                'product_id',
                            ],
                            [
                                'price',
                                'discount_percentage',
                                'updated_at',
                            ],
                        );
                }

                if ($synchronize) {
                    $removedProductIds =
                        array_values(
                            array_diff(
                                $existingProductIdsInTarget,
                                array_values(
                                    array_unique(
                                        $processedProductIds,
                                    ),
                                ),
                            ),
                        );

                    if (
                        $removedProductIds !==
                        []
                    ) {
                        PriceListItem::query()
                            ->where(
                                'price_list_id',
                                $targetPriceList->id,
                            )
                            ->whereIn(
                                'product_id',
                                $removedProductIds,
                            )
                            ->delete();
                    }
                }
            },
        );
    }

    /**
     * Obtiene o crea la Lista General.
     */
    private function resolveGeneralPriceList(
        bool $dryRun,
    ): ?PriceList {
        $priceList =
            PriceList::query()
                ->where(
                    'code',
                    'GENERAL',
                )
                ->first();

        if ($dryRun) {
            return $priceList;
        }

        PriceList::query()
            ->where(
                'code',
                '!=',
                'GENERAL',
            )
            ->update([
                'is_general' =>
                    false,
            ]);

        return PriceList::query()
            ->updateOrCreate(
                [
                    'code' =>
                        'GENERAL',
                ],
                [
                    'name' =>
                        'Lista General',

                    'is_general' =>
                        true,

                    'is_active' =>
                        true,
                ],
            );
    }

    /**
     * Busca los encabezados reales
     * en las primeras 15 filas.
     */
    private function findHeaderRowIndex(
        array $rows,
    ): ?int {
        foreach (
            array_slice(
                $rows,
                0,
                15,
                true,
            ) as $index => $row
        ) {
            $headers =
                $this->normalizeHeaders(
                    $row,
                );

            if (
                in_array(
                    'codigo',
                    $headers,
                    true,
                ) &&
                in_array(
                    'nombre',
                    $headers,
                    true,
                ) &&
                in_array(
                    'precio_venta',
                    $headers,
                    true,
                )
            ) {
                return $index;
            }
        }

        return null;
    }

    /**
     * Convierte:
     *
     * PRECIO VENTA
     *
     * en:
     *
     * precio_venta
     */
    private function normalizeHeaders(
        array $headers,
    ): array {
        return array_map(
            static fn (
                mixed $header,
            ): string =>
                Str::of(
                    (string) $header,
                )
                    ->trim()
                    ->lower()
                    ->ascii()
                    ->replaceMatches(
                        '/[^a-z0-9]+/',
                        '_',
                    )
                    ->trim('_')
                    ->toString(),
            $headers,
        );
    }

    /**
     * Valida columnas obligatorias.
     *
     * Columnas extras como STOCK
     * se ignoran.
     */
    private function validateRequiredColumns(
        array $headers,
    ): void {
        $missingColumns =
            array_values(
                array_diff(
                    self::REQUIRED_COLUMNS,
                    $headers,
                ),
            );

        if ($missingColumns !== []) {
            throw new RuntimeException(
                'Faltan columnas obligatorias: ' .
                implode(
                    ', ',
                    $missingColumns,
                ),
            );
        }
    }

    /**
     * Combina encabezados y valores.
     */
    private function combineRow(
        array $headers,
        array $values,
    ): array {
        $row = [];

        foreach (
            $headers as
            $index => $header
        ) {
            if ($header === '') {
                continue;
            }

            $row[$header] =
                $values[$index] ??
                null;
        }

        return $row;
    }

    /**
     * Obtiene valor string.
     */
    private function stringValue(
        array $row,
        string $column,
    ): ?string {
        if (
            ! array_key_exists(
                $column,
                $row,
            )
        ) {
            return null;
        }

        return $this->cleanString(
            $row[$column],
        );
    }

    /**
     * Limpia strings vacíos.
     */
    private function cleanString(
        mixed $value,
    ): ?string {
        if ($value === null) {
            return null;
        }

        $value =
            trim(
                (string) $value,
            );

        return $value === ''
            ? null
            : $value;
    }

    /**
     * Convierte formatos de precio
     * a decimal estándar.
     */
    private function decimalOrNull(
        mixed $value,
    ): ?string {
        if (
            $value === null ||
            trim(
                (string) $value,
            ) === ''
        ) {
            return null;
        }

        if (
            is_int($value) ||
            is_float($value)
        ) {
            return number_format(
                (float) $value,
                2,
                '.',
                '',
            );
        }

        $normalized =
            trim(
                (string) $value,
            );

        $normalized =
            preg_replace(
                '/[^\d,.\-]/',
                '',
                $normalized,
            );

        if (
            $normalized === null ||
            $normalized === ''
        ) {
            return null;
        }

        $hasComma =
            str_contains(
                $normalized,
                ',',
            );

        $hasDot =
            str_contains(
                $normalized,
                '.',
            );

        if (
            $hasComma &&
            $hasDot
        ) {
            $lastComma =
                strrpos(
                    $normalized,
                    ',',
                );

            $lastDot =
                strrpos(
                    $normalized,
                    '.',
                );

            if (
                $lastComma >
                $lastDot
            ) {
                $normalized =
                    str_replace(
                        '.',
                        '',
                        $normalized,
                    );

                $normalized =
                    str_replace(
                        ',',
                        '.',
                        $normalized,
                    );
            } else {
                $normalized =
                    str_replace(
                        ',',
                        '',
                        $normalized,
                    );
            }
        } elseif ($hasComma) {
            $normalized =
                str_replace(
                    ',',
                    '.',
                    $normalized,
                );
        }

        if (! is_numeric($normalized)) {
            return null;
        }

        return number_format(
            (float) $normalized,
            2,
            '.',
            '',
        );
    }

    /**
     * Determina si una fila
     * está completamente vacía.
     */
    private function isEmptyRow(
        array $row,
    ): bool {
        foreach (
            $row as $value
        ) {
            if (
                $value !== null &&
                trim(
                    (string) $value,
                ) !== ''
            ) {
                return false;
            }
        }

        return true;
    }
}