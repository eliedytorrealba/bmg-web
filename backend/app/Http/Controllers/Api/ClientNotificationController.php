<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClientNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientNotificationController extends Controller
{
    public function index(
        Request $request,
    ): JsonResponse {
        $notifications = $request
            ->user()
            ->notifications()
            ->whereNull(
                'client_deleted_at',
            )
            ->where(function ($query) {
                $query
                    ->whereNull('expires_at')
                    ->orWhere(
                        'expires_at',
                        '>=',
                        now(),
                    );
            })
            ->latest()
            ->get();

        return response()->json([
            'data' => $notifications,
        ]);
    }

    public function markAllAsRead(
        Request $request,
    ): JsonResponse {
        $request
            ->user()
            ->notifications()
            ->whereNull(
                'client_deleted_at',
            )
            ->where(function ($query) {
                $query
                    ->whereNull('expires_at')
                    ->orWhere(
                        'expires_at',
                        '>=',
                        now(),
                    );
            })
            ->where(
                'is_read',
                false,
            )
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'message' =>
                'Todas las notificaciones se marcaron como leídas.',
        ]);
    }

    public function markAsRead(
        Request $request,
        ClientNotification $notification,
    ): JsonResponse {
        if (
            $notification->user_id !==
            $request->user()->id
        ) {
            abort(403);
        }

        if (
            $notification->client_deleted_at !==
            null
        ) {
            abort(404);
        }

        if (
            $notification->expires_at !== null &&
            $notification->expires_at->lt(now())
        ) {
            abort(404);
        }

        if (! $notification->is_read) {
            $notification->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return response()->json([
            'message' =>
                'La notificación se marcó como leída.',

            'data' => [
                'notification' =>
                    $notification->fresh(),
            ],
        ]);
    }

    public function destroyAll(
        Request $request,
    ): JsonResponse {
        $updatedCount = $request
            ->user()
            ->notifications()
            ->whereNull(
                'client_deleted_at',
            )
            ->update([
                'client_deleted_at' =>
                    now(),
            ]);

        return response()->json([
            'message' =>
                $updatedCount === 1
                    ? 'Se eliminó 1 notificación de tu cuenta.'
                    : "Se eliminaron {$updatedCount} notificaciones de tu cuenta.",

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
        if (
            $notification->user_id !==
            $request->user()->id
        ) {
            abort(403);
        }

        if (
            $notification->client_deleted_at ===
            null
        ) {
            $notification->update([
                'client_deleted_at' =>
                    now(),
            ]);
        }

        return response()->json([
            'message' =>
                'Notificación eliminada de tu cuenta.',
        ]);
    }
}