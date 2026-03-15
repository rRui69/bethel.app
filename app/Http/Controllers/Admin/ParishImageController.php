<?php

namespace App\Http\Controllers\Admin;

use App\Models\Parish;
use App\Models\ParishImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParishImageController extends AdminBaseController
{
    private const MAX_IMAGES = 5;

    // ── Auth gate ────────────────────────────────────────────────
    private function authorizeParish(Parish $parish): void
    {
        $user = auth()->user();

        // super_admin can manage any parish
        if ($user->isSuperAdmin()) return;

        // parish_admin can only manage their own parish
        if ($user->isParishAdmin() && (int) $user->parish_id === (int) $parish->id) return;

        abort(403, 'You are not authorized to manage images for this parish.');
    }

    // ── GET /admin/api/parishes/{parish}/images ──────────────────
    public function index(Parish $parish): JsonResponse
    {
        $this->authorizeParish($parish);

        $images = $parish->images()
            ->select('id', 'image_url', 'sort_order')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'images' => $images,
            'count'  => $images->count(),
            'max'    => self::MAX_IMAGES,
        ]);
    }

    // ── POST /admin/api/parishes/{parish}/images ─────────────────
    // Receives the Cloudinary secure_url from the browser-direct upload.
    // The actual file never touches our server.
    public function store(Request $request, Parish $parish): JsonResponse
    {
        $this->authorizeParish($parish);

        $current = $parish->images()->count();
        if ($current >= self::MAX_IMAGES) {
            return response()->json([
                'message' => "Maximum of " . self::MAX_IMAGES . " images allowed per parish. Delete one first.",
            ], 422);
        }

        $data = $request->validate([
            'image_url' => 'required|url|max:1000',
        ]);

        $image = $parish->images()->create([
            'image_url'  => $data['image_url'],
            'sort_order' => $current, // append at end
        ]);

        return response()->json([
            'id'         => $image->id,
            'image_url'  => $image->image_url,
            'sort_order' => $image->sort_order,
        ], 201);
    }

    // ── DELETE /admin/api/parishes/{parish}/images/{image} ───────
    public function destroy(Parish $parish, ParishImage $image): JsonResponse
    {
        $this->authorizeParish($parish);

        if ((int) $image->parish_id !== (int) $parish->id) {
            return response()->json(['message' => 'Image does not belong to this parish.'], 422);
        }

        $image->delete();

        // Re-normalise sort_order after deletion
        $parish->images()
            ->orderBy('sort_order')
            ->get()
            ->each(fn ($img, $i) => $img->update(['sort_order' => $i]));

        return response()->json(['message' => 'Image deleted.']);
    }

    // ── PATCH /admin/api/parishes/{parish}/images/reorder ────────
    // Receives ordered array of image IDs and resets sort_order.
    public function reorder(Request $request, Parish $parish): JsonResponse
    {
        $this->authorizeParish($parish);

        $data = $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'integer|exists:parish_images,id',
        ]);

        foreach ($data['ids'] as $order => $id) {
            ParishImage::where('id', $id)
                ->where('parish_id', $parish->id) // safety: can't reorder another parish's images
                ->update(['sort_order' => $order]);
        }

        return response()->json(['message' => 'Order updated.']);
    }
}
