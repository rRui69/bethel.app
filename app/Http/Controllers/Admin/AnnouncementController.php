<?php

namespace App\Http\Controllers\Admin;

use App\Models\Announcement;
use App\Models\Parish;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AnnouncementController extends AdminBaseController
{
    public function page(): \Illuminate\View\View
    {
        $adminData = $this->adminShellData();
        $user = auth()->user();

        $parishQuery = Parish::active()->select('id', 'name', 'city')->orderBy('name');
        if (!$user->isSuperAdmin()) {
            $parishQuery->where('id', $user->parish_id);
        }

        $adminData['parishes'] = $parishQuery->get()
            ->map(fn ($p) => ['id' => $p->id, 'name' => $p->name, 'city' => $p->city])
            ->toArray();

        return view('admin.announcements', compact('adminData'));
    }

    public function stats(): JsonResponse
    {
        $user  = auth()->user();
        $query = Announcement::query();

        if (!$user->isSuperAdmin()) {
            $query->where('parish_id', $user->parish_id);
        }

        $counts = $query->selectRaw("
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'Published' THEN 1 ELSE 0 END) AS published,
            SUM(CASE WHEN status = 'Draft'     THEN 1 ELSE 0 END) AS drafts,
            SUM(CASE WHEN status = 'Archived'  THEN 1 ELSE 0 END) AS archived
        ")->first();

        return response()->json($counts);
    }

    public function index(Request $request): JsonResponse
    {
        $user  = auth()->user();
        $query = Announcement::with('parish:id,name')
            ->select('id', 'parish_id', 'title', 'excerpt', 'category', 'status', 'image_path', 'published_at', 'created_at');

        if (!$user->isSuperAdmin()) {
            $query->where('parish_id', $user->parish_id);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }
        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }
        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(fn ($q) => $q->where('title', 'like', $term)->orWhere('excerpt', 'like', $term));
        }

        $allowed   = ['title', 'category', 'status', 'published_at', 'created_at'];
        $sort      = in_array($request->sort, $allowed) ? $request->sort : 'created_at';
        $direction = $request->direction === 'asc' ? 'asc' : 'desc';

        $announcements = $query->orderBy($sort, $direction)
            ->paginate(15)
            ->through(fn ($a) => [
                'id'           => $a->id,
                'parish'       => $a->parish?->name ?? '—',
                'title'        => $a->title,
                'excerpt'      => $a->excerpt,
                'category'     => $a->category,
                'status'       => $a->status,
                'image'        => $a->image_path,
                'published_at' => $a->published_at?->format('M d, Y'),
            ]);

        return response()->json($announcements);
    }

    public function show(Announcement $announcement): JsonResponse
    {
        $user = auth()->user();
        if (!$user->isSuperAdmin() && $announcement->parish_id !== $user->parish_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            ...$announcement->toArray(),
            'image' => $announcement->image_path,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();

        $validated = $request->validate([
            'parish_id'  => ['required', 'exists:parishes,id'],
            'title'      => ['required', 'string', 'max:255'],
            'body'       => ['required', 'string'],
            'excerpt'    => ['nullable', 'string', 'max:300'],
            'category'   => ['required', 'string'],
            'status'     => ['required', Rule::in(['Draft', 'Published', 'Archived'])],
            'image_url'  => ['nullable', 'url', 'max:1000'],
        ]);

        // Prevent payload spoofing
        if (!$user->isSuperAdmin()) {
            $validated['parish_id'] = $user->parish_id;
        }

        $validated['user_id']    = $user->id;
        $validated['image_path'] = $validated['image_url'] ?? null;

        if ($validated['status'] === 'Published') {
            $validated['published_at'] = now();
        }

        unset($validated['image_url']);

        $announcement = Announcement::create($validated);

        return response()->json([
            'message'      => 'Announcement created.',
            'announcement' => $this->serializeForModal($announcement),
        ], 201);
    }

    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $user = auth()->user();
        if (!$user->isSuperAdmin() && $announcement->parish_id !== $user->parish_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title'       => ['sometimes', 'string', 'max:255'],
            'body'        => ['sometimes', 'string'],
            'excerpt'     => ['nullable', 'string', 'max:300'],
            'category'    => ['sometimes', 'string'],
            'status'      => ['sometimes', Rule::in(['Draft', 'Published', 'Archived'])],
            'image_url'   => ['nullable', 'url', 'max:1000'],
        ]);

        if (isset($validated['status']) && $validated['status'] === 'Published' && !$announcement->published_at) {
            $validated['published_at'] = now();
        }

        // Only update image_path when image_url is explicitly present in the request
        if ($request->has('image_url')) {
            $validated['image_path'] = $validated['image_url'];
        }

        unset($validated['image_url']);

        $announcement->update($validated);

        return response()->json([
            'message'      => 'Announcement updated.',
            'announcement' => $this->serializeForModal($announcement->fresh()),
        ]);
    }

    public function destroy(Announcement $announcement): JsonResponse
    {
        $user = auth()->user();
        if (!$user->isSuperAdmin() && $announcement->parish_id !== $user->parish_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $announcement->delete();

        return response()->json(['message' => 'Announcement deleted.']);
    }

    // Private Helpers
    private function serializeForModal(Announcement $a): array
    {
        return [
            'id'           => $a->id,
            'parish_id'    => $a->parish_id,
            'title'        => $a->title,
            'excerpt'      => $a->excerpt,
            'body'         => $a->body,
            'category'     => $a->category,
            'status'       => $a->status,
            'published_at' => $a->published_at?->format('M d, Y'),
            'image'        => $a->image_path, // image_path stores the full Cloudinary URL
        ];
    }
}