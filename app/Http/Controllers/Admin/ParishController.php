<?php

namespace App\Http\Controllers\Admin;

use App\Models\Parish;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ParishController extends AdminBaseController
{
    // ── Gate ─────────────────────────────────────────────────────
    private function requireSuperAdmin(): ?JsonResponse
    {
        if (auth()->user()->role !== 'super_admin') {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        return null;
    }

    // ── Blade page ────────────────────────────────────────────────
    public function page()
    {
        if (auth()->user()->role !== 'super_admin') {
            abort(403);
        }
        return view('admin.dashboard', ['adminData' => $this->adminShellData()]);
    }

    // ── GET /admin/api/parishes ───────────────────────────────────
    public function index(): JsonResponse
    {
        $user  = auth()->user();
        $query = Parish::withCount([
            'users as users_count',
            'clergyProfiles as clergy_count',
            'events as pending_requests' => fn ($q) => $q->sacramental()->pending(),
        ]);

        // parish_admin and parish_helpdesk see only their own parish
        if (! $user->isSuperAdmin()) {
            $query->where('id', $user->parish_id);
        }

        $parishes = $query->orderBy('name')
            ->get()
            ->map(fn ($p) => $this->formatParish($p));

        return response()->json($parishes);
    }

    // ── POST /admin/api/parishes ──────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        if ($err = $this->requireSuperAdmin()) return $err;

        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'diocese'     => 'nullable|string|max:255',
            'address'     => 'required|string|max:255',
            'barangay'    => 'required|string|max:100',
            'city'        => 'required|string|max:100',
            'province'    => 'nullable|string|max:100',
            'country'     => 'nullable|string|max:100',
            'zip_code'    => 'nullable|string|max:10',
            'phone'       => 'nullable|string|max:20',
            'email'       => 'nullable|email|max:255',
            'status'      => 'required|in:Active,Inactive',
            'description' => 'nullable|string|max:1000',
        ]);

        $parish = Parish::create($data);
        $parish->loadCount(['users as users_count', 'clergyProfiles as clergy_count',
            'events as pending_requests' => fn ($q) => $q->sacramental()->pending()]);

        return response()->json($this->formatParish($parish), 201);
    }

    // ── GET /admin/api/parishes/{parish} ──────────────────────────
    public function show(Parish $parish): JsonResponse
    {
        $parish->loadCount([
            'users as users_count',
            'clergyProfiles as clergy_count',
            'events as pending_requests' => fn ($q) => $q->sacramental()->pending(),
        ]);

        return response()->json([
            ...$this->formatParish($parish),
            'description' => $parish->description,
            'address'     => $parish->address,
            'barangay'    => $parish->barangay,
            'province'    => $parish->province,
            'country'     => $parish->country,
            'zip_code'    => $parish->zip_code,
            'email'       => $parish->email,
            'phone'       => $parish->phone,
        ]);
    }

    // ── PATCH /admin/api/parishes/{parish} ────────────────────────
    public function update(Request $request, Parish $parish): JsonResponse
    {
        if ($err = $this->requireSuperAdmin()) return $err;

        $data = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'diocese'     => 'nullable|string|max:255',
            'address'     => 'sometimes|required|string|max:255',
            'barangay'    => 'sometimes|required|string|max:100',
            'city'        => 'sometimes|required|string|max:100',
            'province'    => 'nullable|string|max:100',
            'country'     => 'nullable|string|max:100',
            'zip_code'    => 'nullable|string|max:10',
            'phone'       => 'nullable|string|max:20',
            'email'       => 'nullable|email|max:255',
            'status'      => 'sometimes|required|in:Active,Inactive',
            'description' => 'nullable|string|max:1000',
        ]);

        $parish->update($data);
        $parish->loadCount([
            'users as users_count',
            'clergyProfiles as clergy_count',
            'events as pending_requests' => fn ($q) => $q->sacramental()->pending(),
        ]);

        return response()->json($this->formatParish($parish));
    }

    // ── DELETE /admin/api/parishes/{parish} ───────────────────────
    public function destroy(Parish $parish): JsonResponse
    {
        if ($err = $this->requireSuperAdmin()) return $err;

        $clergyCount = $parish->clergyProfiles()->count();
        $usersCount  = $parish->users()->count();

        if ($clergyCount > 0 || $usersCount > 0) {
            return response()->json([
                'message' => "Cannot delete parish with {$clergyCount} clergy and {$usersCount} assigned users. Reassign them first.",
            ], 422);
        }

        $parish->delete();
        return response()->json(['message' => 'Parish deleted.']);
    }

    // ── GET /admin/api/parishes/{parish}/users ────────────────────
    public function users(Parish $parish): JsonResponse
    {
        $users = $parish->users()
            ->select('id', 'first_name', 'last_name', 'email', 'role', 'account_status')
            ->orderBy('last_name')
            ->get()
            ->map(fn ($u) => [
                'id'     => $u->id,
                'name'   => $u->full_name,
                'email'  => $u->email,
                'role'   => $u->role,
                'status' => $u->account_status,
            ]);

        return response()->json($users);
    }

    // ── GET /admin/api/parishes/{parish}/available-users ──────────
    public function availableUsers(Request $request, Parish $parish): JsonResponse
    {
        $search = $request->string('search')->trim();

        $users = User::whereIn('role', ['parish_admin', 'parish_helpdesk', 'parishioner', 'clergymen'])
            ->where('account_status', 'Active')
            ->when($search->isNotEmpty(), fn ($q) =>
                $q->where(fn ($q2) =>
                    $q2->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$search}%"])
                       ->orWhere('email', 'like', "%{$search}%")
                )
            )
            ->with('parish:id,name')
            ->select('id', 'first_name', 'last_name', 'email', 'role', 'parish_id')
            ->orderBy('last_name')
            ->limit(30)
            ->get()
            ->map(fn ($u) => [
                'id'            => $u->id,
                'name'          => $u->full_name,
                'email'         => $u->email,
                'role'          => $u->role,
                'current_parish'=> $u->parish?->name,
            ]);

        return response()->json($users);
    }

    // ── POST /admin/api/parishes/{parish}/assign-user ─────────────
    public function assignUser(Request $request, Parish $parish): JsonResponse
    {
        if ($err = $this->requireSuperAdmin()) return $err;

        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($data['user_id']);

        if ($user->role === 'super_admin') {
            return response()->json(['message' => 'Cannot assign Diocesan Admins to a parish.'], 422);
        }

        $user->update(['parish_id' => $parish->id]);

        return response()->json([
            'id'     => $user->id,
            'name'   => $user->full_name,
            'email'  => $user->email,
            'role'   => $user->role,
            'status' => $user->account_status,
        ]);
    }

    // ── DELETE /admin/api/parishes/{parish}/users/{user} ─────────
    public function removeUser(Parish $parish, User $user): JsonResponse
    {
        if ($err = $this->requireSuperAdmin()) return $err;

        if ($user->parish_id !== $parish->id) {
            return response()->json(['message' => 'User does not belong to this parish.'], 422);
        }

        $user->update(['parish_id' => null]);
        return response()->json(['message' => 'User removed from parish.']);
    }

    // ── Private helpers ───────────────────────────────────────────
    private function formatParish(Parish $p): array
    {
        return [
            'id'              => $p->id,
            'name'            => $p->name,
            'diocese'         => $p->diocese,
            'city'            => $p->city,
            'status'          => $p->status,
            'users_count'     => $p->users_count    ?? 0,
            'clergy_count'    => $p->clergy_count   ?? 0,
            'pending_requests'=> $p->pending_requests ?? 0,
        ];
    }
}
