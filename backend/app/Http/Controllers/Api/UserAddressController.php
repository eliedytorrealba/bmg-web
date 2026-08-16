<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserAddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $addresses = $request
            ->user()
            ->addresses()
            ->get()
            ->keyBy('type');

        return response()->json([
            'data' => [
                'principal' => $addresses->get('principal'),
                'secondary' => $addresses->get('secondary'),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => [
                'required',
                Rule::in([
                    'principal',
                    'secondary',
                ]),
            ],
            'street' => [
                'required',
                'string',
                'max:255',
            ],
            'number' => [
                'required',
                'string',
                'max:30',
            ],
            'floor_apartment' => [
                'nullable',
                'string',
                'max:100',
            ],
            'city' => [
                'required',
                'string',
                'max:255',
            ],
            'province' => [
                'required',
                'string',
                'max:255',
            ],
            'postal_code' => [
                'nullable',
                'string',
                'max:20',
            ],
            'notes' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        $address = UserAddress::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'type' => $validated['type'],
            ],
            [
                'street' => $validated['street'],
                'number' => $validated['number'],
                'floor_apartment' =>
                    $validated['floor_apartment'] ?? null,
                'city' => $validated['city'],
                'province' => $validated['province'],
                'postal_code' =>
                    $validated['postal_code'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ],
        );

        return response()->json([
            'message' =>
                'La dirección se guardó correctamente.',
            'data' => [
                'address' => $address,
            ],
        ]);
    }
}