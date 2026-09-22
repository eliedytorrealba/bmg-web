<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PriceList;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate(
            [
                'name' => [
                    'required',
                    'string',
                    'max:255',
                    'regex:/^[\pL]+(?:[\s\'-]+[\pL]+)+$/u',
                ],
                'email' => [
                    'required',
                    'email',
                    'max:255',
                    'unique:users,email',
                ],
                'phone' => [
                    'nullable',
                    'string',
                    'regex:/^\d{8,15}$/',
                ],
                'company' => [
                    'nullable',
                    'string',
                    'max:255',
                ],
                'document_type' => [
                    'required',
                    'string',
                    Rule::in([
                        'DNI',
                        'CUIT',
                        'CUIL',
                        'PASSPORT',
                    ]),
                ],
                'document_number' => [
                    'required',
                    'string',
                    'max:20',
                ],
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed',
                ],
            ],
            [
                'name.required' =>
                    'El nombre y apellido son obligatorios.',

                'name.regex' =>
                    'Ingresa nombre y apellido usando solamente letras.',

                'email.required' =>
                    'El correo electrónico es obligatorio.',

                'email.email' =>
                    'Ingresa un correo electrónico válido.',

                'email.unique' =>
                    'Ya existe una cuenta con este correo electrónico.',

                'phone.regex' =>
                    'El teléfono debe contener entre 8 y 15 números.',

                'document_type.required' =>
                    'Selecciona un tipo de documento.',

                'document_type.in' =>
                    'El tipo de documento seleccionado no es válido.',

                'document_number.required' =>
                    'El número de documento es obligatorio.',

                'password.required' =>
                    'La contraseña es obligatoria.',

                'password.min' =>
                    'La contraseña debe tener al menos 8 caracteres.',

                'password.confirmed' =>
                    'Las contraseñas no coinciden.',
            ]
        );

        $documentNumber = strtoupper(
            trim($validated['document_number'])
        );

        $documentError = null;

        switch ($validated['document_type']) {
            case 'DNI':
                if (
                    preg_match(
                        '/^\d{7,8}$/',
                        $documentNumber
                    ) !== 1
                ) {
                    $documentError =
                        'El DNI debe contener 7 u 8 números.';
                }

                break;

            case 'CUIT':
            case 'CUIL':
                if (
                    preg_match(
                        '/^\d{11}$/',
                        $documentNumber
                    ) !== 1
                ) {
                    $documentError =
                        'El ' .
                        $validated['document_type'] .
                        ' debe contener exactamente 11 números.';
                }

                break;

            case 'PASSPORT':
                if (
                    preg_match(
                        '/^[A-Z0-9]{5,20}$/',
                        $documentNumber
                    ) !== 1
                ) {
                    $documentError =
                        'El pasaporte debe contener entre 5 y 20 letras o números.';
                }

                break;

            default:
                $documentError =
                    'El tipo de documento seleccionado no es válido.';

                break;
        }

        if ($documentError !== null) {
            throw ValidationException::withMessages([
                'document_number' => [
                    $documentError,
                ],
            ]);
        }

        $documentExists = User::query()
            ->where(
                'document_type',
                $validated['document_type']
            )
            ->where(
                'document_number',
                $documentNumber
            )
            ->exists();

        if ($documentExists) {
            throw ValidationException::withMessages([
                'document_number' => [
                    'Ya existe una cuenta con este documento.',
                ],
            ]);
        }

        $generalPriceList = PriceList::query()
            ->where('is_general', true)
            ->where('is_active', true)
            ->first();

        if ($generalPriceList === null) {
            return response()->json(
                [
                    'message' =>
                        'No hay una lista de precios general activa disponible.',
                ],
                422
            );
        }

        $user = DB::transaction(
            function () use (
                $validated,
                $documentNumber,
                $generalPriceList
            ): User {
                return User::create([
                    'name' =>
                        trim($validated['name']),

                    'email' =>
                        strtolower(
                            trim($validated['email'])
                        ),

                    'phone' =>
                        ! empty($validated['phone'])
                            ? trim($validated['phone'])
                            : null,

                    'company' =>
                        ! empty($validated['company'])
                            ? trim($validated['company'])
                            : null,

                    'document_type' =>
                        $validated['document_type'],

                    'document_number' =>
                        $documentNumber,

                    'password' =>
                        $validated['password'],

                    'role' =>
                        'client',

                    'price_list_id' =>
                        $generalPriceList->id,
                ]);
            }
        );

        $user->sendEmailVerificationNotification();

        $token = $user
            ->createToken('bmg-web')
            ->plainTextToken;

        $user->load([
            'priceList:id,code,name,is_general,is_active',
        ]);

        return response()->json(
            [
                'message' =>
                    'Tu cuenta se creó correctamente. Revisa tu correo electrónico para verificarla.',

                'data' => [
                    'user' =>
                        $this->userData($user),

                    'token' =>
                        $token,
                ],
            ],
            201
        );
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate(
            [
                'email' => [
                    'required',
                    'email',
                ],
                'password' => [
                    'required',
                    'string',
                ],
            ],
            [
                'email.required' =>
                    'El correo electrónico es obligatorio.',

                'email.email' =>
                    'Ingresa un correo electrónico válido.',

                'password.required' =>
                    'La contraseña es obligatoria.',
            ]
        );

        $email = strtolower(
            trim($credentials['email'])
        );

        $user = User::query()
            ->where('email', $email)
            ->first();

        if (
            $user === null ||
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

        $user->tokens()->delete();

        $token = $user
            ->createToken('bmg-web')
            ->plainTextToken;

        $user->load([
            'priceList:id,code,name,is_general,is_active',
        ]);

        return response()->json([
            'message' =>
                'Inicio de sesión exitoso.',

            'data' => [
                'user' =>
                    $this->userData($user),

                'token' =>
                    $token,
            ],
        ]);
    }

    public function forgotPassword(
        Request $request
    ): JsonResponse {
        $validated = $request->validate(
            [
                'email' => [
                    'required',
                    'email',
                    'max:255',
                ],
            ],
            [
                'email.required' =>
                    'El correo electrónico es obligatorio.',

                'email.email' =>
                    'Ingresa un correo electrónico válido.',
            ]
        );

        $email = strtolower(
            trim($validated['email'])
        );

        /*
         * No revelamos si el correo existe o no.
         *
         * Esto evita que este endpoint pueda utilizarse
         * para enumerar las cuentas registradas.
         */
        Password::broker()->sendResetLink([
            'email' => $email,
        ]);

        return response()->json([
            'message' =>
                'Si existe una cuenta asociada a ese correo electrónico, te enviaremos un enlace para restablecer tu contraseña.',
        ]);
    }

    public function resetPassword(
        Request $request
    ): JsonResponse {
        $validated = $request->validate(
            [
                'token' => [
                    'required',
                    'string',
                ],
                'email' => [
                    'required',
                    'email',
                    'max:255',
                ],
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'confirmed',
                ],
                'password_confirmation' => [
                    'required',
                    'string',
                    'min:8',
                ],
            ],
            [
                'token.required' =>
                    'El token de recuperación es obligatorio.',

                'email.required' =>
                    'El correo electrónico es obligatorio.',

                'email.email' =>
                    'Ingresa un correo electrónico válido.',

                'password.required' =>
                    'La nueva contraseña es obligatoria.',

                'password.min' =>
                    'La contraseña debe tener al menos 8 caracteres.',

                'password.confirmed' =>
                    'Las contraseñas no coinciden.',

                'password_confirmation.required' =>
                    'Debes confirmar la nueva contraseña.',

                'password_confirmation.min' =>
                    'La confirmación debe tener al menos 8 caracteres.',
            ]
        );

        $credentials = [
            'email' => strtolower(
                trim($validated['email'])
            ),
            'password' =>
                $validated['password'],
            'password_confirmation' =>
                $validated['password_confirmation'],
            'token' =>
                $validated['token'],
        ];

        $status = Password::broker()->reset(
            $credentials,
            function (
                User $user,
                string $password
            ): void {
                $user->forceFill([
                    'password' =>
                        Hash::make($password),

                    'remember_token' =>
                        Str::random(60),
                ])->save();

                /*
                 * Cerramos los tokens Sanctum existentes.
                 * Si alguien tenía una sesión abierta antes
                 * del cambio de contraseña, deja de ser válida.
                 */
                $user->tokens()->delete();

                event(
                    new PasswordReset($user)
                );
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [
                    'El enlace para restablecer la contraseña es inválido o ha expirado.',
                ],
            ]);
        }

        return response()->json([
            'message' =>
                'Tu contraseña se restableció correctamente. Ya podés iniciar sesión con tu nueva contraseña.',
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
                'user' =>
                    $this->userData($user),
            ],
        ]);
    }

    public function resendVerificationEmail(
        Request $request
    ): JsonResponse {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' =>
                    'Tu correo electrónico ya está verificado.',
            ]);
        }

        $user->sendEmailVerificationNotification();

        return response()->json([
            'message' =>
                'Te enviamos un nuevo correo de verificación.',
        ]);
    }

    public function verifyEmail(
        Request $request,
        int $id,
        string $hash
    ) {
        /*
         * Primero validamos que la URL realmente haya sido
         * firmada por Laravel y que no haya expirado.
         */
        if (! $request->hasValidSignature()) {
            return redirect(
                $this->frontendVerificationUrl(
                    'invalid'
                )
            );
        }

        /*
         * Buscamos manualmente el usuario porque la ruta
         * de verificación nativa utiliza {id}.
         */
        $user = User::query()
            ->find($id);

        if ($user === null) {
            return redirect(
                $this->frontendVerificationUrl(
                    'invalid'
                )
            );
        }

        /*
         * Comprobamos que el hash del enlace corresponda
         * realmente al correo del usuario.
         */
        if (
            ! hash_equals(
                $hash,
                sha1($user->getEmailForVerification())
            )
        ) {
            return redirect(
                $this->frontendVerificationUrl(
                    'invalid'
                )
            );
        }

        /*
         * Si ya había verificado el correo, no hacemos
         * ninguna modificación adicional.
         */
        if ($user->hasVerifiedEmail()) {
            return redirect(
                $this->frontendVerificationUrl(
                    'already-verified'
                )
            );
        }

        /*
         * Marcamos el correo como verificado y disparamos
         * el evento nativo de Laravel.
         */
        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return redirect(
            $this->frontendVerificationUrl(
                'verified'
            )
        );
    }

    public function updateProfile(
        Request $request
    ): JsonResponse {
        $user = $request->user();

        $validated = $request->validate(
            [
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
            ],
            [
                'name.required' =>
                    'El nombre y apellido son obligatorios.',

                'password.min' =>
                    'La contraseña debe tener al menos 8 caracteres.',

                'password.confirmed' =>
                    'Las contraseñas no coinciden.',
            ]
        );

        if (! empty($validated['password'])) {
            if (
                empty(
                    $validated['current_password']
                )
            ) {
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

        $user->name =
            trim($validated['name']);

        $user->phone =
            ! empty($validated['phone'])
                ? trim($validated['phone'])
                : null;

        $user->company =
            ! empty($validated['company'])
                ? trim($validated['company'])
                : null;

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
                'user' =>
                    $this->userData($user),
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

    private function frontendVerificationUrl(
        string $status
    ): string {
        $frontendUrl = rtrim(
            (string) config('app.frontend_url', 'http://localhost:5173'),
            '/'
        );

        return $frontendUrl .
            '/verificar-email?status=' .
            urlencode($status);
    }

    private function userData(
        User $user
    ): array {
        return [
            'id' =>
                $user->id,

            'name' =>
                $user->name,

            'email' =>
                $user->email,

            'email_verified' =>
                $user->hasVerifiedEmail(),

            'email_verified_at' =>
                $user->email_verified_at
                    ?->toISOString(),

            'phone' =>
                $user->phone,

            'company' =>
                $user->company,

            'document_type' =>
                $user->document_type,

            'document_number' =>
                $user->document_number,

            'role' =>
                $user->role,

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
                            $user->priceList->is_general,

                        'is_active' =>
                            $user->priceList->is_active,
                    ],
        ];
    }
}