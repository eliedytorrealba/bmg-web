<?php

namespace Database\Seeders;

use App\Models\ClientNotification;
use App\Models\PriceList;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        $generalPriceList = PriceList::query()
            ->where('is_general', true)
            ->firstOrFail();

        User::query()->updateOrCreate(
            [
                'email' => 'admin@bmg.com',
            ],
            [
                'name' => 'Administrador BMG',
                'password' => 'Admin1234!',
                'role' => 'admin',
                'price_list_id' => null,
            ],
        );

        User::query()->updateOrCreate(
            [
                'email' => 'cliente@bmg.com',
            ],
            [
                'name' => 'Cliente de Prueba',
                'password' => 'Cliente1234!',
                'role' => 'client',
                'price_list_id' =>
                    $generalPriceList->id,
            ],
        );

        $demoUserOne =
            User::query()->updateOrCreate(
                [
                    'email' =>
                        'cliente.demo1@bmg.com',
                ],
                [
                    'name' =>
                        'Cliente Demo 01',
                    'password' =>
                        'BmgDemo01!',
                    'role' => 'client',
                    'price_list_id' =>
                        $generalPriceList->id,
                ],
            );

        $demoUserTwo =
            User::query()->updateOrCreate(
                [
                    'email' =>
                        'cliente.demo2@bmg.com',
                ],
                [
                    'name' =>
                        'Cliente Demo 02',
                    'password' =>
                        'BmgDemo02!',
                    'role' => 'client',
                    'price_list_id' =>
                        $generalPriceList->id,
                ],
            );

        ClientNotification::query()
            ->whereIn(
                'user_id',
                [
                    $demoUserOne->id,
                    $demoUserTwo->id,
                ],
            )
            ->delete();

        ClientNotification::query()->create([
            'user_id' =>
                $demoUserOne->id,
            'title' =>
                'Bienvenido a BMG',
            'message' =>
                'Gracias por utilizar el portal de clientes de BMG Distribuidora.',
            'is_read' => false,
            'expires_at' => null,
            'read_at' => null,
        ]);

        ClientNotification::query()->create([
            'user_id' =>
                $demoUserOne->id,
            'title' =>
                'Nuevos productos disponibles',
            'message' =>
                'Se incorporaron nuevos productos al catálogo. Ingresa para conocer las novedades.',
            'is_read' => false,
            'expires_at' => null,
            'read_at' => null,
        ]);

        ClientNotification::query()->create([
            'user_id' =>
                $demoUserOne->id,
            'title' =>
                'Promoción especial',
            'message' =>
                'Hay una promoción especial disponible en productos seleccionados.',
            'is_read' => false,
            'expires_at' =>
                now()->addDays(7),
            'read_at' => null,
        ]);

        ClientNotification::query()->create([
            'user_id' =>
                $demoUserOne->id,
            'title' =>
                'Lista de precios actualizada',
            'message' =>
                'Los precios disponibles para tu cuenta fueron actualizados recientemente.',
            'is_read' => true,
            'expires_at' => null,
            'read_at' => now(),
        ]);

        ClientNotification::query()->create([
            'user_id' =>
                $demoUserOne->id,
            'title' =>
                'Novedades BMG',
            'message' =>
                'Tenemos nuevas novedades disponibles para nuestros clientes.',
            'is_read' => false,
            'expires_at' => null,
            'read_at' => null,
        ]);

        ClientNotification::query()->create([
            'user_id' =>
                $demoUserTwo->id,
            'title' =>
                'Bienvenido al portal',
            'message' =>
                'Tu cuenta de cliente ya se encuentra disponible para consultar productos y cotizaciones.',
            'is_read' => false,
            'expires_at' => null,
            'read_at' => null,
        ]);

        ClientNotification::query()->create([
            'user_id' =>
                $demoUserTwo->id,
            'title' =>
                'Cotización actualizada',
            'message' =>
                'Una de tus cotizaciones tiene nueva información disponible.',
            'is_read' => false,
            'expires_at' => null,
            'read_at' => null,
        ]);

        ClientNotification::query()->create([
            'user_id' =>
                $demoUserTwo->id,
            'title' =>
                'Actualización de catálogo',
            'message' =>
                'Se actualizaron productos y precios disponibles en el catálogo.',
            'is_read' => true,
            'expires_at' => null,
            'read_at' => now(),
        ]);

        ClientNotification::query()->create([
            'user_id' =>
                $demoUserTwo->id,
            'title' =>
                'Promoción por tiempo limitado',
            'message' =>
                'Aprovecha la promoción disponible antes de su fecha de vencimiento.',
            'is_read' => false,
            'expires_at' =>
                now()->addDays(5),
            'read_at' => null,
        ]);

        ClientNotification::query()->create([
            'user_id' =>
                $demoUserTwo->id,
            'title' =>
                'Nuevos productos',
            'message' =>
                'Ya puedes consultar nuevos productos incorporados al catálogo.',
            'is_read' => false,
            'expires_at' => null,
            'read_at' => null,
        ]);
    }
}