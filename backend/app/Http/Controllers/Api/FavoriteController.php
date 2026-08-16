<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = $request
            ->user()
            ->favoriteProducts()
            ->with([
                'brand:id,name',
                'category:id,name',
            ])
            ->get();

        return response()->json([
            'data' => $products,
        ]);
    }

    public function store(
        Request $request,
        Product $product
    ): JsonResponse {
        $request
            ->user()
            ->favoriteProducts()
            ->syncWithoutDetaching([
                $product->id,
            ]);

        return response()->json([
            'message' =>
                'El producto se agregó a favoritos.',
        ]);
    }

    public function destroy(
        Request $request,
        Product $product
    ): JsonResponse {
        $request
            ->user()
            ->favoriteProducts()
            ->detach($product->id);

        return response()->json([
            'message' =>
                'El producto se eliminó de favoritos.',
        ]);
    }
}