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
     * Columnas obligatorias del archivo de Lista General.
     */
    private const REQUIRED_COLUMNS = [
        'codigo',
        'nombre',
        'marca',
        'rubro',
        'precio_venta',
    ];

    /**
     * Importa el catálogo y sus precios como Lista General.
     *
     * @return array<string, mixed>
     */
    public function import(string $filePath, bool $dryRun = false): array
    {
        $sheets = Excel::toArray([], $filePath);

        if ($sheets === [] || ! isset($sheets[0])) {
            throw new RuntimeException(
                'El archivo Excel no contiene hojas válidas.'
            );
        }

        $rows = $sheets[0];

        if ($rows === []) {
            throw new RuntimeException(
                'La primera hoja del Excel está vacía.'
            );
        }

        $headerIndex = $this->findHeaderRowIndex($rows);

        if ($headerIndex === null) {
            throw new RuntimeException(
                'No se encontró una fila de encabezados válida.'
            );
        }

        $headers = $this->normalizeHeaders($rows[$headerIndex]);

        $this->validateRequiredColumns($headers);

        $result = [
            'processed_rows' => 0,
            'created_products' => 0,
            'updated_products' => 0,
            'processed_brands' => 0,
            'processed_categories' => 0,
            'created_prices' => 0,
            'updated_prices' => 0,
            'skipped_rows' => 0,
            'errors' => [],
        ];

        /*
         * Estos arrays permiten contar marcas y categorías únicas,
         * sin contar una vez por cada producto.
         */
        $processedBrandNames = [];
        $processedCategoryNames = [];

        $process = function () use (
            $rows,
            $headerIndex,
            $headers,
            $dryRun,
            &$result,
            &$processedBrandNames,
            &$processedCategoryNames,
        ): void {
            $generalPriceList = $this->resolveGeneralPriceList($dryRun);

            foreach (
                array_slice($rows, $headerIndex + 1) as $offset => $values
            ) {
                $excelRowNumber = $headerIndex + $offset + 2;

                $row = $this->combineRow($headers, $values);

                if ($this->isEmptyRow($row)) {
                    continue;
                }

                try {
                    $bcnCode = $this->stringValue($row, 'codigo');
                    $name = $this->stringValue($row, 'nombre');
                    $brandName = $this->stringValue($row, 'marca');
                    $categoryName = $this->stringValue($row, 'rubro');
                    $price = $this->decimalOrNull(
                        $row['precio_venta'] ?? null
                    );

                    if ($bcnCode === null) {
                        throw new RuntimeException(
                            'El código del producto está vacío.'
                        );
                    }

                    if ($name === null) {
                        throw new RuntimeException(
                            'El nombre del producto está vacío.'
                        );
                    }

                    if ($price === null) {
                        throw new RuntimeException(
                            'El precio de venta está vacío o no es válido.'
                        );
                    }

                    if ($brandName !== null) {
                        $processedBrandNames[$brandName] = true;
                    }

                    if ($categoryName !== null) {
                        $processedCategoryNames[$categoryName] = true;
                    }

                    $existingProduct = Product::query()
                        ->where('bcn_code', $bcnCode)
                        ->first();

                    if ($existingProduct === null) {
                        $result['created_products']++;
                    } else {
                        $result['updated_products']++;
                    }

                    /*
                     * En dry-run validamos y contamos, pero no guardamos.
                     */
                    if ($dryRun) {
                        $result['processed_rows']++;

                        $existingPrice = $existingProduct !== null
                            ? PriceListItem::query()
                                ->where(
                                    'price_list_id',
                                    $generalPriceList?->id
                                )
                                ->where(
                                    'product_id',
                                    $existingProduct->id
                                )
                                ->exists()
                            : false;

                        if ($existingPrice) {
                            $result['updated_prices']++;
                        } else {
                            $result['created_prices']++;
                        }

                        continue;
                    }

                    $brand = $this->resolveBrand($brandName);
                    $category = $this->resolveCategory($categoryName);

                    $product = Product::query()->updateOrCreate(
                        [
                            'bcn_code' => $bcnCode,
                        ],
                        [
                            'name' => $name,
                            'brand_id' => $brand?->id,
                            'category_id' => $category?->id,
                        ],
                    );

                    $existingPriceItem = PriceListItem::query()
                        ->where(
                            'price_list_id',
                            $generalPriceList->id
                        )
                        ->where('product_id', $product->id)
                        ->first();

                    if ($existingPriceItem === null) {
                        $result['created_prices']++;
                    } else {
                        $result['updated_prices']++;
                    }

                    PriceListItem::query()->updateOrCreate(
                        [
                            'price_list_id' => $generalPriceList->id,
                            'product_id' => $product->id,
                        ],
                        [
                            'price' => $price,
                            'discount_percentage' => null,
                        ],
                    );

                    $result['processed_rows']++;
                } catch (Throwable $exception) {
                    $result['skipped_rows']++;
                    $result['errors'][] =
                        "Fila {$excelRowNumber}: {$exception->getMessage()}";
                }
            }
        };

        if ($dryRun) {
            $process();
        } else {
            DB::transaction($process);
        }

        $result['processed_brands'] = count($processedBrandNames);
        $result['processed_categories'] = count(
            $processedCategoryNames
        );

        return $result;
    }

    /**
     * Obtiene o crea la Lista General.
     */
    private function resolveGeneralPriceList(
        bool $dryRun
    ): ?PriceList {
        $priceList = PriceList::query()
            ->where('code', 'GENERAL')
            ->first();

        if ($dryRun) {
            return $priceList;
        }

        /*
         * Garantiza que solo la lista GENERAL quede marcada
         * como lista general.
         */
        PriceList::query()
            ->where('code', '!=', 'GENERAL')
            ->update(['is_general' => false]);

        return PriceList::query()->updateOrCreate(
            [
                'code' => 'GENERAL',
            ],
            [
                'name' => 'Lista General',
                'is_general' => true,
                'is_active' => true,
            ],
        );
    }

    private function resolveBrand(?string $name): ?Brand
    {
        if ($name === null) {
            return null;
        }

        return Brand::query()->firstOrCreate([
            'name' => $name,
        ]);
    }

    private function resolveCategory(?string $name): ?Category
    {
        if ($name === null) {
            return null;
        }

        return Category::query()->firstOrCreate([
            'name' => $name,
        ]);
    }

    /**
     * Busca los encabezados reales en las primeras 15 filas.
     */
    private function findHeaderRowIndex(array $rows): ?int
    {
        foreach (
            array_slice($rows, 0, 15, true) as $index => $row
        ) {
            $headers = $this->normalizeHeaders($row);

            if (
                in_array('codigo', $headers, true) &&
                in_array('nombre', $headers, true) &&
                in_array('precio_venta', $headers, true)
            ) {
                return $index;
            }
        }

        return null;
    }

    /**
     * Convierte "PRECIO VENTA" en "precio_venta".
     */
    private function normalizeHeaders(array $headers): array
    {
        return array_map(
            static fn (mixed $header): string => Str::of(
                (string) $header
            )
                ->trim()
                ->lower()
                ->ascii()
                ->replaceMatches('/[^a-z0-9]+/', '_')
                ->trim('_')
                ->toString(),
            $headers,
        );
    }

    private function validateRequiredColumns(array $headers): void
    {
        $missingColumns = array_values(
            array_diff(self::REQUIRED_COLUMNS, $headers)
        );

        if ($missingColumns !== []) {
            throw new RuntimeException(
                'Faltan columnas obligatorias: ' .
                implode(', ', $missingColumns)
            );
        }
    }

    /**
     * Combina encabezados y valores aunque una fila
     * tenga menos columnas que el encabezado.
     */
    private function combineRow(
        array $headers,
        array $values
    ): array {
        $row = [];

        foreach ($headers as $index => $header) {
            if ($header === '') {
                continue;
            }

            $row[$header] = $values[$index] ?? null;
        }

        return $row;
    }

    private function stringValue(
        array $row,
        string $column
    ): ?string {
        if (! array_key_exists($column, $row)) {
            return null;
        }

        return $this->cleanString($row[$column]);
    }

    private function cleanString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private function decimalOrNull(mixed $value): ?string
    {
        if ($value === null || trim((string) $value) === '') {
            return null;
        }

        /*
         * Excel normalmente entrega las celdas numéricas
         * directamente como int o float.
         */
        if (is_int($value) || is_float($value)) {
            return number_format(
                (float) $value,
                2,
                '.',
                ''
            );
        }

        $normalized = trim((string) $value);

        /*
         * Elimina moneda y espacios, conservando números,
         * puntos, comas y signo negativo.
         */
        $normalized = preg_replace(
            '/[^\d,.\-]/',
            '',
            $normalized
        );

        if ($normalized === null || $normalized === '') {
            return null;
        }

        $hasComma = str_contains($normalized, ',');
        $hasDot = str_contains($normalized, '.');

        if ($hasComma && $hasDot) {
            /*
             * El último separador se interpreta como decimal.
             */
            $lastComma = strrpos($normalized, ',');
            $lastDot = strrpos($normalized, '.');

            if ($lastComma > $lastDot) {
                $normalized = str_replace('.', '', $normalized);
                $normalized = str_replace(',', '.', $normalized);
            } else {
                $normalized = str_replace(',', '', $normalized);
            }
        } elseif ($hasComma) {
            $normalized = str_replace(',', '.', $normalized);
        }

        if (! is_numeric($normalized)) {
            return null;
        }

        return number_format(
            (float) $normalized,
            2,
            '.',
            ''
        );
    }

    private function isEmptyRow(array $row): bool
    {
        foreach ($row as $value) {
            if (
                $value !== null &&
                trim((string) $value) !== ''
            ) {
                return false;
            }
        }

        return true;
    }
}