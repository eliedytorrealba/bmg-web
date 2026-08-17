<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => [
                'required',
                'email',
            ],
            'password' => [
                'required',
                'string',
            ],
        ]);

        $user = User::where(
            'email',
            $credentials['email']
        )->first();

        if (
            ! $user ||
            ! Hash::check(
                $credentials['password'],
                $user->password
            )
        ) {
            throw ValidationException::withMessages([
                'email' => [
                    'Las credenciales ingresadas no son correctas.',
                ],
            ]);
        }

        /*
         * Elimina tokens anteriores para evitar acumular
         * tokens cada vez que el usuario inicia sesión.
         */
        $user->tokens()->delete();

        $token = $user
            ->createToken('bmg-web')
            ->plainTextToken;

        $user->load([
            'priceList:id,code,name,is_general,is_active',
        ]);

        return response()->json([
            'message' => 'Inicio de sesión exitoso.',
            'data' => [
                'user' => $this->userData($user),
                'token' => $token,
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->load([
            'priceList:id,code,name,is_general,is_active',
        ]);

        return response()->json([
            'data' => [
                'user' => $this->userData($user),
            ],
        ]);
    }

    public function updateProfile(
        Request $request
    ): JsonResponse {
        $user = $request->user();

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'phone' => [
                'nullable',
                'string',
                'max:30',
            ],
            'company' => [
                'nullable',
                'string',
                'max:255',
            ],
            'current_password' => [
                'nullable',
                'string',
            ],
            'password' => [
                'nullable',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        if (! empty($validated['password'])) {
            if (empty($validated['current_password'])) {
                throw ValidationException::withMessages([
                    'current_password' => [
                        'Debes ingresar tu contraseña actual.',
                    ],
                ]);
            }

            if (
                ! Hash::check(
                    $validated['current_password'],
                    $user->password
                )
            ) {
                throw ValidationException::withMessages([
                    'current_password' => [
                        'La contraseña actual no es correcta.',
                    ],
                ]);
            }
        }

        $user->name = $validated['name'];
        $user->phone =
            $validated['phone'] ?? null;
        $user->company =
            $validated['company'] ?? null;

        if (! empty($validated['password'])) {
            $user->password =
                $validated['password'];
        }

        $user->save();

        $user->load([
            'priceList:id,code,name,is_general,is_active',
        ]);

        return response()->json([
            'message' =>
                'Los datos de tu cuenta se actualizaron correctamente.',
            'data' => [
                'user' => $this->userData($user),
            ],
        ]);
    }

    public function logout(
        Request $request
    ): JsonResponse {
        $token = $request
            ->user()
            ?->currentAccessToken();

        if ($token !== null) {
            $token->delete();
        }

        return response()->json([
            'message' =>
                'Sesión cerrada correctamente.',
        ]);
    }

    private function userData($user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'company' => $user->company,
            'document_type' =>
                $user->document_type,
            'document_number' =>
                $user->document_number,
            'role' => $user->role,
            'price_list' =>
                $user->priceList === null
                    ? null
                    : [
                        'id' =>
                            $user->priceList->id,
                        'code' =>
                            $user->priceList->code,
                        'name' =>
                            $user->priceList->name,
                        'is_general' =>
                            $user
                                ->priceList
                                ->is_general,
                        'is_active' =>
                            $user
                                ->priceList
                                ->is_active,
                    ],
        ];
    }
}