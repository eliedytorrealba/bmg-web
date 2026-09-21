<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClientNotification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    public function index(
        Request $request,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' =>
                    'No autorizado.',
            ], 403);
        }

        $notifications =
            ClientNotification::query()
                ->whereNull(
                    'admin_deleted_at',
                )
                ->with([
                    'user:id,name,email,company',
                ])
                ->latest()
                ->get();

        return response()->json([
            'data' => $notifications,
        ]);
    }

    public function store(
        Request $request,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' =>
                    'No autorizado.',
            ], 403);
        }

        $validated =
            $request->validate(
                [
                    'send_to_all' => [
                        'required',
                        'boolean',
                    ],

                    'user_ids' => [
                        'required_if:send_to_all,false',
                        'array',
                    ],

                    'user_ids.*' => [
                        'integer',
                        'distinct',
                        'exists:users,id',
                    ],

                    'title' => [
                        'required',
                        'string',
                        'max:150',
                    ],

                    'message' => [
                        'required',
                        'string',
                    ],

                    'expires_at' => [
                        'nullable',
                        'date',
                        'after:now',
                    ],
                ],
                [
                    'send_to_all.required' =>
                        'Debes indicar los destinatarios.',

                    'send_to_all.boolean' =>
                        'La selección de destinatarios no es válida.',

                    'user_ids.required_if' =>
                        'Selecciona al menos un cliente.',

                    'user_ids.array' =>
                        'La selección de clientes no es válida.',

                    'user_ids.*.integer' =>
                        'Uno de los clientes seleccionados no es válido.',

                    'user_ids.*.distinct' =>
                        'Hay clientes seleccionados más de una vez.',

                    'user_ids.*.exists' =>
                        'Uno de los clientes seleccionados no existe.',

                    'title.required' =>
                        'El título es obligatorio.',

                    'title.max' =>
                        'El título no puede superar los 150 caracteres.',

                    'message.required' =>
                        'El mensaje es obligatorio.',

                    'expires_at.date' =>
                        'La fecha de vencimiento no es válida.',

                    'expires_at.after' =>
                        'La fecha de vencimiento debe ser posterior a la fecha actual.',
                ],
            );

        $sendToAll =
            (bool) $validated['send_to_all'];

        if ($sendToAll) {
            $clients =
                User::query()
                    ->where(
                        'role',
                        'client',
                    )
                    ->orderBy('name')
                    ->get();
        } else {
            $requestedIds =
                collect(
                    $validated['user_ids'] ?? [],
                )
                    ->map(
                        fn ($id): int =>
                            (int) $id,
                    )
                    ->unique()
                    ->values();

            if ($requestedIds->isEmpty()) {
                return response()->json([
                    'message' =>
                        'Selecciona al menos un cliente.',
                ], 422);
            }

            $clients =
                User::query()
                    ->where(
                        'role',
                        'client',
                    )
                    ->whereIn(
                        'id',
                        $requestedIds,
                    )
                    ->get();

            if (
                $clients->count() !==
                $requestedIds->count()
            ) {
                return response()->json([
                    'message' =>
                        'Uno de los usuarios seleccionados no es un cliente válido.',
                ], 422);
            }
        }

        if ($clients->isEmpty()) {
            return response()->json([
                'message' =>
                    'No hay clientes disponibles para recibir la notificación.',
            ], 422);
        }

        $notifications = [];

        foreach ($clients as $client) {
            $notification =
                ClientNotification::query()
                    ->create([
                        'user_id' =>
                            $client->id,

                        'title' =>
                            trim(
                                $validated['title'],
                            ),

                        'message' =>
                            trim(
                                $validated['message'],
                            ),

                        'is_read' =>
                            false,

                        'expires_at' =>
                            $validated[
                                'expires_at'
                            ] ?? null,

                        'read_at' =>
                            null,

                        'admin_deleted_at' =>
                            null,

                        'client_deleted_at' =>
                            null,
                    ]);

            $notification->load([
                'user:id,name,email,company',
            ]);

            $notifications[] =
                $notification;
        }

        $count =
            count($notifications);

        return response()->json([
            'message' =>
                $count === 1
                    ? 'Notificación enviada correctamente.'
                    : "Notificación enviada correctamente a {$count} clientes.",

            'data' => [
                'notifications' =>
                    $notifications,
            ],
        ], 201);
    }

    public function destroyAll(
        Request $request,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' =>
                    'No autorizado.',
            ], 403);
        }

        $updatedCount =
            ClientNotification::query()
                ->whereNull(
                    'admin_deleted_at',
                )
                ->update([
                    'admin_deleted_at' =>
                        now(),
                ]);

        return response()->json([
            'message' =>
                $updatedCount === 1
                    ? 'Se eliminó 1 notificación del historial administrativo.'
                    : "Se eliminaron {$updatedCount} notificaciones del historial administrativo.",

            'data' => [
                'deleted_count' =>
                    $updatedCount,
            ],
        ]);
    }

    public function destroyBulk(
        Request $request,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' =>
                    'No autorizado.',
            ], 403);
        }

        $validated =
            $request->validate(
                [
                    'notification_ids' => [
                        'required',
                        'array',
                        'min:1',
                    ],

                    'notification_ids.*' => [
                        'integer',
                        'distinct',
                        'exists:client_notifications,id',
                    ],
                ],
                [
                    'notification_ids.required' =>
                        'Selecciona al menos una notificación.',

                    'notification_ids.array' =>
                        'La selección de notificaciones no es válida.',

                    'notification_ids.min' =>
                        'Selecciona al menos una notificación.',

                    'notification_ids.*.integer' =>
                        'Una de las notificaciones seleccionadas no es válida.',

                    'notification_ids.*.distinct' =>
                        'Hay notificaciones seleccionadas más de una vez.',

                    'notification_ids.*.exists' =>
                        'Una de las notificaciones seleccionadas ya no existe.',
                ],
            );

        $notificationIds =
            collect(
                $validated[
                    'notification_ids'
                ],
            )
                ->map(
                    fn ($id): int =>
                        (int) $id,
                )
                ->unique()
                ->values();

        $updatedCount =
            ClientNotification::query()
                ->whereNull(
                    'admin_deleted_at',
                )
                ->whereIn(
                    'id',
                    $notificationIds,
                )
                ->update([
                    'admin_deleted_at' =>
                        now(),
                ]);

        return response()->json([
            'message' =>
                $updatedCount === 1
                    ? 'Se eliminó 1 notificación del historial administrativo.'
                    : "Se eliminaron {$updatedCount} notificaciones del historial administrativo.",

            'data' => [
                'deleted_count' =>
                    $updatedCount,
            ],
        ]);
    }

    public function destroy(
        Request $request,
        ClientNotification $notification,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' =>
                    'No autorizado.',
            ], 403);
        }

        if (
            $notification->admin_deleted_at ===
            null
        ) {
            $notification->update([
                'admin_deleted_at' =>
                    now(),
            ]);
        }

        return response()->json([
            'message' =>
                'Notificación eliminada del historial administrativo.',
        ]);
    }
}