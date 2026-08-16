<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClientNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientNotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request
            ->user()
            ->notifications()
            ->latest()
            ->get();

        return response()->json([
            'data' => $notifications,
        ]);
    }

    public function markAllAsRead(
        Request $request
    ): JsonResponse {
        $request
            ->user()
            ->notifications()
            ->where('is_read', false)
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
        ClientNotification $notification
    ): JsonResponse {
        if (
            $notification->user_id !==
            $request->user()->id
        ) {
            abort(403);
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
}