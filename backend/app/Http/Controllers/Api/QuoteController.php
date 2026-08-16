<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Quote;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class QuoteController extends Controller
{
    private const QUOTE_STATUSES = [
        'pending',
        'answered',
        'approved',
        'rejected',
    ];

    /**
     * Crea una cotización para un cliente autenticado.
     */
    public function store(
        Request $request,
    ): JsonResponse {
        $user = $request->user();

        if (! $user?->isClient()) {
            return response()->json(
                [
                    'message' =>
                        'Debes iniciar sesión como cliente para solicitar una cotización.',
                ],
                403,
            );
        }

        if (
            $user->price_list_id === null
        ) {
            return response()->json(
                [
                    'message' =>
                        'Tu cuenta todavía no está habilitada para consultar precios. Comunícate con BMG.',
                ],
                422,
            );
        }

        $validator = Validator::make(
            $request->all(),
            [
                'customer.name' => [
                    'required',
                    'string',
                    'max:150',
                ],

                'customer.company' => [
                    'nullable',
                    'string',
                    'max:150',
                ],

                'customer.email' => [
                    'required',
                    'email',
                    'max:150',
                ],

                'customer.phone' => [
                    'required',
                    'string',
                    'max:20',
                    'regex:/^[0-9+\-\s()]+$/',
                ],

                'message' => [
                    'nullable',
                    'string',
                    'max:1000',
                ],

                'items' => [
                    'required',
                    'array',
                    'min:1',
                ],

                'items.*.productId' => [
                    'required',
                    'integer',
                    'exists:products,id',
                ],

                'items.*.quantity' => [
                    'required',
                    'integer',
                    'min:1',
                ],
            ],
            [
                'customer.name.required' =>
                    'El nombre es obligatorio.',

                'customer.name.max' =>
                    'El nombre no puede superar los 150 caracteres.',

                'customer.company.max' =>
                    'La empresa no puede superar los 150 caracteres.',

                'customer.email.required' =>
                    'El correo electrónico es obligatorio.',

                'customer.email.email' =>
                    'Ingresa un correo electrónico válido.',

                'customer.email.max' =>
                    'El correo electrónico no puede superar los 150 caracteres.',

                'customer.phone.required' =>
                    'El teléfono es obligatorio.',

                'customer.phone.max' =>
                    'El teléfono no puede superar los 20 caracteres.',

                'customer.phone.regex' =>
                    'El teléfono contiene caracteres no permitidos.',

                'message.max' =>
                    'El mensaje no puede superar los 1000 caracteres.',

                'items.required' =>
                    'Debes agregar al menos un producto.',

                'items.min' =>
                    'Debes agregar al menos un producto.',

                'items.*.productId.required' =>
                    'Uno de los productos enviados no es válido.',

                'items.*.productId.exists' =>
                    'Uno de los productos enviados no existe.',

                'items.*.quantity.required' =>
                    'La cantidad del producto es obligatoria.',

                'items.*.quantity.integer' =>
                    'La cantidad del producto debe ser un número entero.',

                'items.*.quantity.min' =>
                    'La cantidad del producto debe ser al menos 1.',
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

        $priceListId =
            $user->price_list_id;

        $requestedItems = collect(
            $validated['items'],
        );

        $productIds =
            $requestedItems
                ->pluck('productId')
                ->map(
                    fn ($productId): int =>
                        (int) $productId,
                )
                ->unique()
                ->values();

        $products = Product::query()
            ->with([
                'brand:id,name',
                'category:id,name',

                'priceListItems' =>
                    function (
                        $query,
                    ) use (
                        $priceListId,
                    ): void {
                        $query
                            ->select([
                                'id',
                                'price_list_id',
                                'product_id',
                                'price',
                                'discount_percentage',
                            ])
                            ->where(
                                'price_list_id',
                                $priceListId,
                            );
                    },
            ])
            ->whereIn(
                'id',
                $productIds,
            )
            ->get()
            ->keyBy('id');

        $normalizedItems =
            $requestedItems
                ->map(
                    function (
                        array $requestedItem,
                    ) use (
                        $products,
                    ): array {
                        $productId =
                            (int) $requestedItem[
                                'productId'
                            ];

                        $quantity =
                            (int) $requestedItem[
                                'quantity'
                            ];

                        /** @var Product|null $product */
                        $product =
                            $products->get(
                                $productId,
                            );

                        if (
                            $product === null
                        ) {
                            abort(
                                422,
                                'Uno de los productos solicitados no está disponible.',
                            );
                        }

                        $priceItem =
                            $product
                                ->priceListItems
                                ->first();

                        $canViewPrice =
                            $priceItem !== null;

                        $unitPrice =
                            $canViewPrice
                                ? (float) $priceItem
                                    ->price
                                : null;

                        $total =
                            $canViewPrice
                                ? round(
                                    $unitPrice *
                                        $quantity,
                                    2,
                                )
                                : null;

                        return [
                            'productId' =>
                                $product->id,

                            'name' =>
                                $product->name,

                            'brand' =>
                                $product
                                    ->brand
                                    ?->name,

                            'category' =>
                                $product
                                    ->category
                                    ?->name,

                            'code' =>
                                $product
                                    ->bcn_code,

                            'presentation' =>
                                null,

                            'quantity' =>
                                $quantity,

                            'canViewPrice' =>
                                $canViewPrice,

                            'unitPrice' =>
                                $unitPrice,

                            'discountPercentage' =>
                                $canViewPrice
                                    ? $priceItem
                                        ->discount_percentage
                                    : null,

                            'total' =>
                                $total,
                        ];
                    },
                )
                ->values();

        $totalItems =
            $normalizedItems->sum(
                fn (
                    array $item,
                ): int =>
                    $item['quantity'],
            );

        $hasVisiblePrices =
            $normalizedItems->contains(
                fn (
                    array $item,
                ): bool =>
                    $item[
                        'canViewPrice'
                    ] === true,
            );

        $allPricesVisible =
            $normalizedItems
                ->isNotEmpty() &&
            $normalizedItems->every(
                fn (
                    array $item,
                ): bool =>
                    $item[
                        'canViewPrice'
                    ] === true,
            );

        $subtotal =
            $normalizedItems->sum(
                fn (
                    array $item,
                ): float =>
                    $item[
                        'canViewPrice'
                    ]
                        ? (float) $item[
                            'total'
                        ]
                        : 0,
            );

        $quote =
            Quote::query()->create([
                'user_id' =>
                    $user->id,

                'customer_name' =>
                    trim(
                        $validated[
                            'customer'
                        ]['name'],
                    ),

                'company' =>
                    ! empty(
                        $validated[
                            'customer'
                        ]['company']
                    )
                        ? trim(
                            $validated[
                                'customer'
                            ]['company'],
                        )
                        : null,

                'email' =>
                    trim(
                        $validated[
                            'customer'
                        ]['email'],
                    ),

                'phone' =>
                    trim(
                        $validated[
                            'customer'
                        ]['phone'],
                    ),

                'message' =>
                    ! empty(
                        $validated[
                            'message'
                        ]
                    )
                        ? trim(
                            $validated[
                                'message'
                            ],
                        )
                        : null,

                'items' =>
                    $normalizedItems
                        ->all(),

                'total_items' =>
                    $totalItems,

                'subtotal' =>
                    $hasVisiblePrices
                        ? $subtotal
                        : 0,

                'status' =>
                    'pending',
            ]);

        return response()->json(
            [
                'message' =>
                    'Solicitud de cotización recibida correctamente.',

                'quote' =>
                    $this->formatQuote(
                        quote: $quote,

                        items:
                            $normalizedItems,

                        hasVisiblePrices:
                            $hasVisiblePrices,

                        allPricesVisible:
                            $allPricesVisible,
                    ),
            ],
            201,
        );
    }

    /**
     * Devuelve las cotizaciones del cliente autenticado.
     */
    public function myQuotes(
        Request $request,
    ): JsonResponse {
        $user = $request->user();

        if (! $user?->isClient()) {
            return response()->json(
                [
                    'message' =>
                        'Esta sección está disponible únicamente para clientes.',
                ],
                403,
            );
        }

        $validated =
            $request->validate([
                'from' => [
                    'nullable',
                    'date_format:Y-m-d',
                ],

                'to' => [
                    'nullable',
                    'date_format:Y-m-d',
                    'after_or_equal:from',
                ],

                'status' => [
                    'nullable',
                    'string',
                    Rule::in(
                        self::QUOTE_STATUSES,
                    ),
                ],

                'page' => [
                    'nullable',
                    'integer',
                    'min:1',
                ],

                'per_page' => [
                    'nullable',
                    'integer',
                    'min:1',
                    'max:50',
                ],
            ]);

        $quotesQuery =
            Quote::query()
                ->where(
                    'user_id',
                    $user->id,
                );

        $argentinaTimezone =
            'America/Argentina/Buenos_Aires';

        if (
            ! empty(
                $validated['from']
            )
        ) {
            $fromUtc =
                CarbonImmutable::createFromFormat(
                    'Y-m-d',
                    $validated['from'],
                    $argentinaTimezone,
                )
                    ->startOfDay()
                    ->utc();

            $quotesQuery->where(
                'created_at',
                '>=',
                $fromUtc,
            );
        }

        if (
            ! empty(
                $validated['to']
            )
        ) {
            $toUtc =
                CarbonImmutable::createFromFormat(
                    'Y-m-d',
                    $validated['to'],
                    $argentinaTimezone,
                )
                    ->endOfDay()
                    ->utc();

            $quotesQuery->where(
                'created_at',
                '<=',
                $toUtc,
            );
        }

        if (
            ! empty(
                $validated['status']
            )
        ) {
            $quotesQuery->where(
                'status',
                $validated['status'],
            );
        }

        $quotes =
            $quotesQuery
                ->latest()
                ->paginate(
                    $request->integer(
                        'per_page',
                        10,
                    ),
                )
                ->withQueryString();

        $quotes
            ->getCollection()
            ->transform(
                function (
                    Quote $quote,
                ): array {
                    return $this
                        ->formatStoredQuote(
                            $quote,
                        );
                },
            );

        return response()->json(
            $quotes,
        );
    }

    /**
     * Devuelve una cotización específica
     * perteneciente al cliente autenticado.
     */
    public function myQuote(
        Request $request,
        int $quote,
    ): JsonResponse {
        $user = $request->user();

        if (! $user?->isClient()) {
            return response()->json(
                [
                    'message' =>
                        'Esta sección está disponible únicamente para clientes.',
                ],
                403,
            );
        }

        $clientQuote =
            Quote::query()
                ->where(
                    'id',
                    $quote,
                )
                ->where(
                    'user_id',
                    $user->id,
                )
                ->first();

        if (
            $clientQuote === null
        ) {
            return response()->json(
                [
                    'message' =>
                        'La cotización solicitada no existe o no pertenece a tu cuenta.',
                ],
                404,
            );
        }

        return response()->json([
            'data' =>
                $this->formatStoredQuote(
                    $clientQuote,
                ),
        ]);
    }

    /**
     * Listado administrativo de todas las cotizaciones.
     */
    public function index(
        Request $request,
    ): JsonResponse {
        $user = $request->user();

        if (! $user?->isAdmin()) {
            return response()->json(
                [
                    'message' =>
                        'No tienes permisos para consultar todas las cotizaciones.',
                ],
                403,
            );
        }

        $quotes = Quote::query()
            ->with([
                'user:id,name,email',
            ])
            ->latest()
            ->paginate(20);

        return response()->json(
            $quotes,
        );
    }

    /**
     * Analiza una cotización guardada
     * y genera su respuesta completa.
     */
    private function formatStoredQuote(
        Quote $quote,
    ): array {
        $items = collect(
            $quote->items ?? [],
        );

        $hasVisiblePrices =
            $items->contains(
                fn (
                    array $item,
                ): bool =>
                    (
                        $item[
                            'canViewPrice'
                        ] ?? false
                    ) === true,
            );

        $allPricesVisible =
            $items->isNotEmpty() &&
            $items->every(
                fn (
                    array $item,
                ): bool =>
                    (
                        $item[
                            'canViewPrice'
                        ] ?? false
                    ) === true,
            );

        return $this->formatQuote(
            quote: $quote,

            items: $items,

            hasVisiblePrices:
                $hasVisiblePrices,

            allPricesVisible:
                $allPricesVisible,
        );
    }

    /**
     * Normaliza la respuesta de una cotización.
     */
    private function formatQuote(
        Quote $quote,
        Collection $items,
        bool $hasVisiblePrices,
        bool $allPricesVisible,
    ): array {
        return [
            'id' =>
                $quote->id,

            'number' =>
                sprintf(
                    'COT-%s-%06d',

                    $quote->created_at
                        ?->format('Y')
                        ?? now()
                            ->format('Y'),

                    $quote->id,
                ),

            'user_id' =>
                $quote->user_id,

            'customer' => [
                'name' =>
                    $quote
                        ->customer_name,

                'company' =>
                    $quote->company,

                'email' =>
                    $quote->email,

                'phone' =>
                    $quote->phone,
            ],

            'customer_name' =>
                $quote
                    ->customer_name,

            'company' =>
                $quote->company,

            'email' =>
                $quote->email,

            'phone' =>
                $quote->phone,

            'message' =>
                $quote->message,

            'items' =>
                $items
                    ->values()
                    ->all(),

            'total_items' =>
                $quote->total_items,

            'subtotal' =>
                $hasVisiblePrices
                    ? $quote->subtotal
                    : null,

            'has_visible_prices' =>
                $hasVisiblePrices,

            'all_prices_visible' =>
                $allPricesVisible,

            'status' =>
                $quote->status,

            'created_at' =>
                $quote->created_at,

            'updated_at' =>
                $quote->updated_at,
        ];
    }
}