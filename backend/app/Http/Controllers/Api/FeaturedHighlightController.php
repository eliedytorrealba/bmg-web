<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeaturedHighlight;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FeaturedHighlightController extends Controller
{
    /**
     * Destacados públicos visibles en la Home.
     */
    public function index(): JsonResponse
    {
        $now = now();

        $highlights =
            FeaturedHighlight::query()
                ->where(
                    'is_active',
                    true,
                )
                ->where(
                    function ($query) use ($now): void {
                        $query
                            ->whereNull('starts_at')
                            ->orWhere(
                                'starts_at',
                                '<=',
                                $now,
                            );
                    },
                )
                ->where(
                    function ($query) use ($now): void {
                        $query
                            ->whereNull('ends_at')
                            ->orWhere(
                                'ends_at',
                                '>=',
                                $now,
                            );
                    },
                )
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(
                    fn (
                        FeaturedHighlight $highlight,
                    ): array => [
                        'id' =>
                            $highlight->id,

                        'title' =>
                            $highlight->title,

                        'alt_text' =>
                            $highlight->alt_text,

                        'image_url' =>
                            Storage::disk('public')
                                ->url(
                                    $highlight
                                        ->image_path,
                                ),

                        'link_url' =>
                            $highlight->link_url,

                        'sort_order' =>
                            $highlight->sort_order,
                    ],
                );

        return response()->json([
            'data' => $highlights,
        ]);
    }

    /**
     * Listado administrativo.
     */
    public function adminIndex(
        Request $request,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' =>
                    'No autorizado.',
            ], 403);
        }

        $highlights =
            FeaturedHighlight::query()
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(
                    fn (
                        FeaturedHighlight $highlight,
                    ): array => [
                        'id' =>
                            $highlight->id,

                        'title' =>
                            $highlight->title,

                        'alt_text' =>
                            $highlight->alt_text,

                        'image_path' =>
                            $highlight->image_path,

                        'image_url' =>
                            Storage::disk('public')
                                ->url(
                                    $highlight
                                        ->image_path,
                                ),

                        'link_url' =>
                            $highlight->link_url,

                        'is_active' =>
                            $highlight->is_active,

                        'sort_order' =>
                            $highlight->sort_order,

                        'starts_at' =>
                            $highlight->starts_at,

                        'ends_at' =>
                            $highlight->ends_at,

                        'created_at' =>
                            $highlight->created_at,

                        'updated_at' =>
                            $highlight->updated_at,
                    ],
                );

        return response()->json([
            'data' => $highlights,
        ]);
    }

    /**
     * Crea un nuevo destacado.
     */
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
                    'title' => [
                        'required',
                        'string',
                        'max:150',
                    ],

                    'alt_text' => [
                        'required',
                        'string',
                        'max:200',
                    ],

                    'image' => [
                        'required',
                        'image',
                        'mimes:jpg,jpeg,png,webp',
                        'max:8192',
                    ],

                    'link_url' => [
                        'nullable',
                        'string',
                        'max:2048',
                    ],

                    'is_active' => [
                        'required',
                        'boolean',
                    ],

                    'sort_order' => [
                        'required',
                        'integer',
                        'min:0',
                        'max:9999',
                    ],

                    'starts_at' => [
                        'nullable',
                        'date',
                    ],

                    'ends_at' => [
                        'nullable',
                        'date',
                        'after:starts_at',
                    ],
                ],
                [
                    'title.required' =>
                        'El título es obligatorio.',

                    'alt_text.required' =>
                        'El texto alternativo es obligatorio.',

                    'image.required' =>
                        'Selecciona una imagen.',

                    'image.image' =>
                        'El archivo debe ser una imagen.',

                    'image.mimes' =>
                        'La imagen debe ser JPG, JPEG, PNG o WEBP.',

                    'image.max' =>
                        'La imagen no puede superar los 8 MB.',

                    'sort_order.required' =>
                        'Indica el orden del destacado.',

                    'starts_at.date' =>
                        'La fecha de inicio no es válida.',

                    'ends_at.date' =>
                        'La fecha de finalización no es válida.',

                    'ends_at.after' =>
                        'La fecha de finalización debe ser posterior a la fecha de inicio.',
                ],
            );

        $imagePath =
            $request
                ->file('image')
                ->store(
                    'featured-highlights',
                    'public',
                );

        $highlight =
            FeaturedHighlight::query()
                ->create([
                    'title' =>
                        trim(
                            $validated['title'],
                        ),

                    'alt_text' =>
                        trim(
                            $validated['alt_text'],
                        ),

                    'image_path' =>
                        $imagePath,

                    'link_url' =>
                        $validated[
                            'link_url'
                        ] ?? null,

                    'is_active' =>
                        (bool) $validated[
                            'is_active'
                        ],

                    'sort_order' =>
                        (int) $validated[
                            'sort_order'
                        ],

                    'starts_at' =>
                        $validated[
                            'starts_at'
                        ] ?? null,

                    'ends_at' =>
                        $validated[
                            'ends_at'
                        ] ?? null,
                ]);

        return response()->json([
            'message' =>
                'Destacado creado correctamente.',

            'data' => [
                'highlight' => [
                    'id' =>
                        $highlight->id,

                    'title' =>
                        $highlight->title,

                    'alt_text' =>
                        $highlight->alt_text,

                    'image_url' =>
                        Storage::disk('public')
                            ->url(
                                $highlight
                                    ->image_path,
                            ),

                    'link_url' =>
                        $highlight->link_url,

                    'is_active' =>
                        $highlight->is_active,

                    'sort_order' =>
                        $highlight->sort_order,

                    'starts_at' =>
                        $highlight->starts_at,

                    'ends_at' =>
                        $highlight->ends_at,
                ],
            ],
        ], 201);
    }

    /**
     * Actualiza un destacado.
     */
    public function update(
        Request $request,
        FeaturedHighlight $highlight,
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
                    'title' => [
                        'required',
                        'string',
                        'max:150',
                    ],

                    'alt_text' => [
                        'required',
                        'string',
                        'max:200',
                    ],

                    'image' => [
                        'nullable',
                        'image',
                        'mimes:jpg,jpeg,png,webp',
                        'max:8192',
                    ],

                    'link_url' => [
                        'nullable',
                        'string',
                        'max:2048',
                    ],

                    'is_active' => [
                        'required',
                        'boolean',
                    ],

                    'sort_order' => [
                        'required',
                        'integer',
                        'min:0',
                        'max:9999',
                    ],

                    'starts_at' => [
                        'nullable',
                        'date',
                    ],

                    'ends_at' => [
                        'nullable',
                        'date',
                        'after:starts_at',
                    ],
                ],
            );

        $imagePath =
            $highlight->image_path;

        if (
            $request->hasFile('image')
        ) {
            $newImagePath =
                $request
                    ->file('image')
                    ->store(
                        'featured-highlights',
                        'public',
                    );

            if (
                $highlight->image_path &&
                Storage::disk('public')
                    ->exists(
                        $highlight
                            ->image_path,
                    )
            ) {
                Storage::disk('public')
                    ->delete(
                        $highlight
                            ->image_path,
                    );
            }

            $imagePath =
                $newImagePath;
        }

        $highlight->update([
            'title' =>
                trim(
                    $validated['title'],
                ),

            'alt_text' =>
                trim(
                    $validated['alt_text'],
                ),

            'image_path' =>
                $imagePath,

            'link_url' =>
                $validated[
                    'link_url'
                ] ?? null,

            'is_active' =>
                (bool) $validated[
                    'is_active'
                ],

            'sort_order' =>
                (int) $validated[
                    'sort_order'
                ],

            'starts_at' =>
                $validated[
                    'starts_at'
                ] ?? null,

            'ends_at' =>
                $validated[
                    'ends_at'
                ] ?? null,
        ]);

        return response()->json([
            'message' =>
                'Destacado actualizado correctamente.',
        ]);
    }

    /**
     * Elimina un destacado.
     */
    public function destroy(
        Request $request,
        FeaturedHighlight $highlight,
    ): JsonResponse {
        $user = $request->user();

        if (! $user || ! $user->isAdmin()) {
            return response()->json([
                'message' =>
                    'No autorizado.',
            ], 403);
        }

        $imagePath =
            $highlight->image_path;

        $highlight->delete();

        if (
            $imagePath &&
            Storage::disk('public')
                ->exists(
                    $imagePath,
                )
        ) {
            Storage::disk('public')
                ->delete(
                    $imagePath,
                );
        }

        return response()->json([
            'message' =>
                'Destacado eliminado correctamente.',
        ]);
    }
}