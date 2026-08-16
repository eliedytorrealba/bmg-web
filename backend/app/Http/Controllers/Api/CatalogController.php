<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CatalogController extends Controller
{
    public function filters(): JsonResponse
    {
        return response()->json([
            'data' => [
                'brands' => Brand::query()
                    ->select([
                        'id',
                        'name',
                    ])
                    ->orderBy('name')
                    ->get(),

                'categories' => Category::query()
                    ->select([
                        'id',
                        'name',
                    ])
                    ->orderBy('name')
                    ->get(),
            ],
        ]);
    }
}