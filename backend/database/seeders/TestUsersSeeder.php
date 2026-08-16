<?php

namespace Database\Seeders;

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
            ]
        );

        User::query()->updateOrCreate(
            [
                'email' => 'cliente@bmg.com',
            ],
            [
                'name' => 'Cliente de Prueba',
                'password' => 'Cliente1234!',
                'role' => 'client',
                'price_list_id' => $generalPriceList->id,
            ]
        );
    }
}