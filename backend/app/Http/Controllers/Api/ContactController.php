<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    public function store(
        Request $request,
    ): JsonResponse {
        $validator = Validator::make(
            $request->all(),
            [
                'name' => [
                    'required',
                    'string',
                    'max:150',
                ],

                'company' => [
                    'nullable',
                    'string',
                    'max:150',
                ],

                'email' => [
                    'required',
                    'email',
                    'max:150',
                ],

                'phone' => [
                    'required',
                    'string',
                    'max:20',
                    'regex:/^[0-9+\-\s()]+$/',
                ],

                'subject' => [
                    'required',
                    'string',
                    'max:150',
                ],

                'message' => [
                    'required',
                    'string',
                    'max:1000',
                ],
            ],
            [
                'name.required' =>
                    'El nombre es obligatorio.',

                'email.required' =>
                    'El correo electrónico es obligatorio.',

                'email.email' =>
                    'Ingresa un correo electrónico válido.',

                'phone.required' =>
                    'El teléfono es obligatorio.',

                'phone.regex' =>
                    'El teléfono contiene caracteres no permitidos.',

                'subject.required' =>
                    'El asunto es obligatorio.',

                'message.required' =>
                    'El mensaje es obligatorio.',
            ],
        );

        if ($validator->fails()) {
            return response()->json(
                [
                    'message' =>
                        'Los datos enviados no son válidos.',
                    'errors' =>
                        $validator->errors(),
                ],
                422,
            );
        }

        $validated =
            $validator->validated();

        $contactMessage =
            ContactMessage::query()->create([
                'name' => trim(
                    $validated['name'],
                ),

                'company' => ! empty(
                    $validated['company']
                )
                    ? trim(
                        $validated['company'],
                    )
                    : null,

                'email' => trim(
                    $validated['email'],
                ),

                'phone' => trim(
                    $validated['phone'],
                ),

                'subject' => trim(
                    $validated['subject'],
                ),

                'message' => trim(
                    $validated['message'],
                ),

                'status' => 'pending',
            ]);

        return response()->json(
            [
                'message' =>
                    'Tu consulta fue enviada correctamente.',

                'contact' => [
                    'id' =>
                        $contactMessage->id,

                    'status' =>
                        $contactMessage->status,

                    'created_at' =>
                        $contactMessage->created_at,
                ],
            ],
            201,
        );
    }
}