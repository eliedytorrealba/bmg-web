<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PriceList;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminClientController extends Controller
{
    /**
     * Listado de clientes para el administrador.
     */
    public function index(
        Request $request,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' => 'No autorizado.',
            ], 403);
        }

        $search = trim(
            (string) $request->query(
                'search',
                '',
            ),
        );

        $clients = User::query()
            ->where(
                'role',
                'client',
            )
            ->when(
                $search !== '',
                function ($query) use ($search): void {
                    $query->where(
                        function ($subQuery) use ($search): void {
                            $subQuery
                                ->where(
                                    'name',
                                    'like',
                                    "%{$search}%",
                                )
                                ->orWhere(
                                    'email',
                                    'like',
                                    "%{$search}%",
                                )
                                ->orWhere(
                                    'company',
                                    'like',
                                    "%{$search}%",
                                )
                                ->orWhere(
                                    'document_number',
                                    'like',
                                    "%{$search}%",
                                );
                        },
                    );
                },
            )
            ->with('priceList')
            ->withCount([
                'quotes',

                'quotes as sales_count' =>
                    function ($query): void {
                        $query->where(
                            'status',
                            'processed',
                        );
                    },
            ])
            ->withSum(
                [
                    'quotes as sales_total' =>
                        function ($query): void {
                            $query->where(
                                'status',
                                'processed',
                            );
                        },
                ],
                'final_total',
            )
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $clients->map(
                function (
                    User $client,
                ): array {
                    return $this->formatClient(
                        $client,
                    );
                },
            ),
        ]);
    }

    /**
     * Devuelve las listas de precios activas
     * disponibles para asignar a clientes.
     */
    public function priceLists(
        Request $request,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' => 'No autorizado.',
            ], 403);
        }

        $priceLists = PriceList::query()
            ->where(
                'is_active',
                true,
            )
            ->orderByDesc(
                'is_general',
            )
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'code',
                'is_general',
                'is_active',
            ]);

        return response()->json([
            'data' => $priceLists,
        ]);
    }

    /**
     * Detalle de un cliente para el administrador.
     */
    public function show(
        Request $request,
        User $client,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' => 'No autorizado.',
            ], 403);
        }

        if (! $client->isClient()) {
            return response()->json([
                'message' =>
                    'El usuario seleccionado no es un cliente.',
            ], 404);
        }

        $client->load([
            'priceList',

            'quotes' =>
                function ($query): void {
                    $query->latest();
                },
        ]);

        $quotesCount =
            $client->quotes->count();

        $processedQuotes =
            $client->quotes
                ->where(
                    'status',
                    'processed',
                );

        $salesCount =
            $processedQuotes->count();

        $salesTotal =
            $processedQuotes->sum(
                function ($quote): float {
                    return (float) (
                        $quote->final_total
                        ?? $quote->subtotal
                        ?? 0
                    );
                },
            );

        return response()->json([
            'data' => [
                'id' =>
                    $client->id,

                'name' =>
                    $client->name,

                'email' =>
                    $client->email,

                'phone' =>
                    $client->phone,

                'company' =>
                    $client->company,

                'document_type' =>
                    $client->document_type,

                'document_number' =>
                    $client->document_number,

                'price_list' =>
                    $client->priceList
                        ? [
                            'id' =>
                                $client
                                    ->priceList
                                    ->id,

                            'name' =>
                                $client
                                    ->priceList
                                    ->name,

                            'code' =>
                                $client
                                    ->priceList
                                    ->code,

                            'is_general' =>
                                $client
                                    ->priceList
                                    ->is_general,
                        ]
                        : null,

                'quotes_count' =>
                    $quotesCount,

                'sales_count' =>
                    $salesCount,

                'sales_total' =>
                    round(
                        $salesTotal,
                        2,
                    ),

                'quotes' =>
                    $client->quotes
                        ->map(
                            function (
                                $quote,
                            ): array {
                                return [
                                    'id' =>
                                        $quote->id,

                                    'code' =>
                                        sprintf(
                                            'COT-%s-%06d',
                                            $quote
                                                ->created_at
                                                ->format('Y'),
                                            $quote->id,
                                        ),

                                    'status' =>
                                        $quote->status,

                                    'total_items' =>
                                        $quote->total_items,

                                    'subtotal' =>
                                        (float) $quote
                                            ->subtotal,

                                    'final_total' =>
                                        $quote
                                            ->final_total !== null
                                            ? (float) $quote
                                                ->final_total
                                            : null,

                                    'created_at' =>
                                        $quote->created_at,
                                ];
                            },
                        )
                        ->values(),
            ],
        ]);
    }

    /**
     * Edita los datos de un cliente.
     */
    public function update(
        Request $request,
        User $client,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' => 'No autorizado.',
            ], 403);
        }

        if (! $client->isClient()) {
            return response()->json([
                'message' =>
                    'El usuario seleccionado no es un cliente.',
            ], 404);
        }

        $validated =
            $request->validate(
                [
                    'name' => [
                        'required',
                        'string',
                        'max:150',
                    ],

                    'email' => [
                        'required',
                        'email',
                        'max:150',

                        Rule::unique(
                            'users',
                            'email',
                        )->ignore(
                            $client->id,
                        ),
                    ],

                    'phone' => [
                        'nullable',
                        'string',
                        'max:30',
                    ],

                    'company' => [
                        'nullable',
                        'string',
                        'max:150',
                    ],

                    'document_type' => [
                        'nullable',
                        'string',
                        'max:50',
                    ],

                    'document_number' => [
                        'nullable',
                        'string',
                        'max:100',
                    ],

                    'price_list_id' => [
                        'nullable',
                        'integer',
                        'exists:price_lists,id',
                    ],
                ],
                [
                    'name.required' =>
                        'El nombre es obligatorio.',

                    'email.required' =>
                        'El correo electrónico es obligatorio.',

                    'email.email' =>
                        'Ingresa un correo electrónico válido.',

                    'email.unique' =>
                        'Ya existe un usuario con ese correo electrónico.',

                    'price_list_id.exists' =>
                        'La lista de precios seleccionada no existe.',
                ],
            );

        if (
            array_key_exists(
                'price_list_id',
                $validated,
            ) &&
            $validated[
                'price_list_id'
            ] !== null
        ) {
            $priceList =
                PriceList::query()
                    ->find(
                        $validated[
                            'price_list_id'
                        ],
                    );

            if (
                ! $priceList ||
                ! $priceList->is_active
            ) {
                return response()->json([
                    'message' =>
                        'La lista de precios seleccionada no está activa.',
                ], 422);
            }
        }

        $client->fill([
            'name' =>
                trim(
                    $validated['name'],
                ),

            'email' =>
                trim(
                    $validated['email'],
                ),

            'phone' =>
                ! empty(
                    $validated['phone']
                )
                    ? trim(
                        $validated['phone'],
                    )
                    : null,

            'company' =>
                ! empty(
                    $validated['company']
                )
                    ? trim(
                        $validated['company'],
                    )
                    : null,

            'document_type' =>
                ! empty(
                    $validated[
                        'document_type'
                    ]
                )
                    ? trim(
                        $validated[
                            'document_type'
                        ],
                    )
                    : null,

            'document_number' =>
                ! empty(
                    $validated[
                        'document_number'
                    ]
                )
                    ? trim(
                        $validated[
                            'document_number'
                        ],
                    )
                    : null,

            'price_list_id' =>
                $validated[
                    'price_list_id'
                ] ?? null,
        ]);

        $client->save();

        $client->load(
            'priceList',
        );

        return response()->json([
            'message' =>
                'Datos del cliente actualizados correctamente.',

            'data' =>
                $this->formatClientDetail(
                    $client,
                ),
        ]);
    }

    /**
     * Asigna una lista de precios a un cliente.
     *
     * Se utiliza principalmente desde
     * el listado administrativo de clientes.
     */
    public function updatePriceList(
        Request $request,
        User $client,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' => 'No autorizado.',
            ], 403);
        }

        if (! $client->isClient()) {
            return response()->json([
                'message' =>
                    'El usuario seleccionado no es un cliente.',
            ], 404);
        }

        $validated =
            $request->validate(
                [
                    'price_list_id' => [
                        'nullable',
                        'integer',
                        'exists:price_lists,id',
                    ],
                ],
                [
                    'price_list_id.exists' =>
                        'La lista de precios seleccionada no existe.',
                ],
            );

        $priceListId =
            $validated[
                'price_list_id'
            ] ?? null;

        if ($priceListId !== null) {
            $priceList =
                PriceList::query()
                    ->find(
                        $priceListId,
                    );

            if (
                ! $priceList ||
                ! $priceList->is_active
            ) {
                return response()->json([
                    'message' =>
                        'La lista de precios seleccionada no está activa.',
                ], 422);
            }
        }

        $client->price_list_id =
            $priceListId;

        $client->save();

        $client->load(
            'priceList',
        );

        return response()->json([
            'message' =>
                'Lista de precios actualizada correctamente.',

            'data' => [
                'id' =>
                    $client->id,

                'price_list' =>
                    $client->priceList
                        ? [
                            'id' =>
                                $client
                                    ->priceList
                                    ->id,

                            'name' =>
                                $client
                                    ->priceList
                                    ->name,

                            'code' =>
                                $client
                                    ->priceList
                                    ->code,

                            'is_general' =>
                                $client
                                    ->priceList
                                    ->is_general,
                        ]
                        : null,
            ],
        ]);
    }

    /**
     * Formatea un cliente para el listado.
     */
    private function formatClient(
        User $client,
    ): array {
        return [
            'id' =>
                $client->id,

            'name' =>
                $client->name,

            'email' =>
                $client->email,

            'phone' =>
                $client->phone,

            'company' =>
                $client->company,

            'document_type' =>
                $client->document_type,

            'document_number' =>
                $client->document_number,

            'price_list' =>
                $client->priceList
                    ? [
                        'id' =>
                            $client
                                ->priceList
                                ->id,

                        'name' =>
                            $client
                                ->priceList
                                ->name,

                        'code' =>
                            $client
                                ->priceList
                                ->code,

                        'is_general' =>
                            $client
                                ->priceList
                                ->is_general,
                    ]
                    : null,

            'quotes_count' =>
                (int) (
                    $client->quotes_count
                    ?? 0
                ),

            'sales_count' =>
                (int) (
                    $client->sales_count
                    ?? 0
                ),

            'sales_total' =>
                round(
                    (float) (
                        $client->sales_total
                        ?? 0
                    ),
                    2,
                ),
        ];
    }

    /**
     * Respuesta utilizada después de editar
     * los datos del cliente.
     */
    private function formatClientDetail(
        User $client,
    ): array {
        return [
            'id' =>
                $client->id,

            'name' =>
                $client->name,

            'email' =>
                $client->email,

            'phone' =>
                $client->phone,

            'company' =>
                $client->company,

            'document_type' =>
                $client->document_type,

            'document_number' =>
                $client->document_number,

            'price_list' =>
                $client->priceList
                    ? [
                        'id' =>
                            $client
                                ->priceList
                                ->id,

                        'name' =>
                            $client
                                ->priceList
                                ->name,

                        'code' =>
                            $client
                                ->priceList
                                ->code,

                        'is_general' =>
                            $client
                                ->priceList
                                ->is_general,
                    ]
                    : null,
        ];
    }
}