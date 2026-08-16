<?php

namespace App\Console\Commands;

use App\Services\BcnProductImportService;
use Illuminate\Console\Command;
use Throwable;

class ImportBcnProducts extends Command
{
    /**
     * Nombre y argumentos del comando.
     */
    protected $signature = 'bmg:import-products
                            {file=storage/app/imports/lista-general.xlsx : Ruta del archivo Excel}
                            {--dry-run : Valida y procesa el archivo sin guardar cambios}';

    /**
     * Descripción visible en Artisan.
     */
    protected $description =
        'Importa el catálogo y sus precios como Lista General';

    /**
     * Ejecuta el comando.
     */
    public function handle(
        BcnProductImportService $importService
    ): int {
        $fileArgument = (string) $this->argument('file');

        /*
         * Permite recibir tanto una ruta relativa al backend
         * como una ruta absoluta de Windows.
         */
        $filePath = $this->resolveFilePath($fileArgument);

        $dryRun = (bool) $this->option('dry-run');

        if (! file_exists($filePath)) {
            $this->error(
                "No se encontró el archivo: {$filePath}"
            );

            return self::FAILURE;
        }

        $this->info(
            'Iniciando importación de la Lista General...'
        );

        $this->line("Archivo: {$filePath}");

        if ($dryRun) {
            $this->warn(
                'Modo dry-run activo: no se guardarán cambios.'
            );
        }

        try {
            $result = $importService->import(
                filePath: $filePath,
                dryRun: $dryRun,
            );

            $this->newLine();
            $this->info('Proceso completado.');

            $this->table(
                ['Concepto', 'Cantidad'],
                [
                    [
                        'Filas procesadas',
                        $result['processed_rows'],
                    ],
                    [
                        'Productos creados',
                        $result['created_products'],
                    ],
                    [
                        'Productos actualizados',
                        $result['updated_products'],
                    ],
                    [
                        'Marcas procesadas',
                        $result['processed_brands'],
                    ],
                    [
                        'Categorías procesadas',
                        $result['processed_categories'],
                    ],
                    [
                        'Precios creados',
                        $result['created_prices'],
                    ],
                    [
                        'Precios actualizados',
                        $result['updated_prices'],
                    ],
                    [
                        'Filas omitidas',
                        $result['skipped_rows'],
                    ],
                    [
                        'Errores',
                        count($result['errors']),
                    ],
                ],
            );

            if ($result['errors'] !== []) {
                $this->newLine();
                $this->warn(
                    'Se encontraron errores durante el proceso:'
                );

                foreach ($result['errors'] as $error) {
                    $this->line("- {$error}");
                }
            }

            return $result['errors'] === []
                ? self::SUCCESS
                : self::FAILURE;
        } catch (Throwable $exception) {
            $this->error(
                'La importación no pudo completarse.'
            );

            $this->error($exception->getMessage());

            return self::FAILURE;
        }
    }

    private function resolveFilePath(string $file): string
    {
        /*
         * Detecta rutas absolutas de Windows:
         * C:\carpeta\archivo.xlsx
         */
        if (preg_match('/^[A-Za-z]:[\\\\\/]/', $file) === 1) {
            return $file;
        }

        /*
         * Detecta rutas absolutas de Linux/macOS.
         */
        if (str_starts_with($file, '/')) {
            return $file;
        }

        return base_path($file);
    }
}