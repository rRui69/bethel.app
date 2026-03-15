<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClergyImageController extends AdminBaseController
{
    // ── Auth gate ────────────────────────────────────────────────
    private function authorizeClergy(User $clergy): void
    {
        $user = auth()->user();

        if ($clergy->role !== 'clergymen') {
            abort(404, 'Clergy member not found.');
        }

        // super_admin can manage any clergy
        if ($user->isSuperAdmin()) return;

        // parish_admin and parish_helpdesk can manage clergy in their own parish
        if (
            ($user->isParishAdmin() || $user->isParishHelpdesk()) &&
            (int) $clergy->parish_id === (int) $user->parish_id
        ) return;

        abort(403, 'You are not authorized to manage this clergy member\'s image.');
    }

    // ── POST /admin/api/clergy/{user}/image ───────────────────────
    // Receives the Cloudinary secure_url — browser uploaded directly.
    public function store(Request $request, User $clergy): JsonResponse
    {
        $this->authorizeClergy($clergy);

        $data = $request->validate([
            'image_url' => 'required|url|max:1000',
        ]);

        // Ensure profile exists (it always should for clergymen, but be safe)
        $profile = $clergy->clergyProfile;
        if (! $profile) {
            return response()->json(['message' => 'Clergy profile not found.'], 404);
        }

        $profile->update(['image_url' => $data['image_url']]);

        return response()->json([
            'image_url' => $profile->image_url,
            'message'   => 'Image updated successfully.',
        ]);
    }

    // ── DELETE /admin/api/clergy/{user}/image ─────────────────────
    public function destroy(User $clergy): JsonResponse
    {
        $this->authorizeClergy($clergy);

        $profile = $clergy->clergyProfile;
        if (! $profile) {
            return response()->json(['message' => 'Clergy profile not found.'], 404);
        }

        $profile->update(['image_url' => null]);

        return response()->json(['message' => 'Image removed.']);
    }
}
