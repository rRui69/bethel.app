<?php

namespace App\Http\Controllers\Admin;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\Rule;

class UserManagementController extends AdminBaseController
{
    // ── Blade Page ──────────────────────────────────────────────────
    public function page()
    {
        $adminData = $this->adminShellData();
        return view('admin.users', compact('adminData'));
    }

    // ── Index (list) ────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = User::select([
            'id', 'username', 'email', 'role', 'account_status',
            'first_name', 'last_name', 'phone', 'city', 'created_at',
        ]);

        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('account_status', $request->status);
        }
        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(fn ($q) =>
                $q->where('first_name', 'like', $term)
                  ->orWhere('last_name',  'like', $term)
                  ->orWhere('username',   'like', $term)
                  ->orWhere('email',      'like', $term)
            );
        }

        $allowed   = ['created_at', 'last_name', 'email', 'role', 'account_status'];
        $sort      = in_array($request->sort, $allowed) ? $request->sort : 'created_at';
        $direction = $request->direction === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $direction);

        $users = $query->paginate(15)->through(fn ($u) => [
            'id'             => $u->id,
            'username'       => $u->username,
            'email'          => $u->email,
            'full_name'      => $u->full_name,
            'role'           => $u->role,
            'role_label'     => $this->roleLabel($u->role),
            'account_status' => $u->account_status,
            'phone'          => $u->phone,
            'city'           => $u->city,
            'joined'         => $u->created_at->format('M d, Y'),
        ]);

        return response()->json($users);
    }

    // ── Stats ────────────────────────────────────────────────────────
    public function stats(): JsonResponse
    {
        $counts = User::selectRaw("
            COUNT(*)                                                      AS total,
            SUM(CASE WHEN account_status = 'Active'   THEN 1 ELSE 0 END) AS active,
            SUM(CASE WHEN account_status != 'Active'  THEN 1 ELSE 0 END) AS inactive,
            SUM(CASE WHEN role = 'parishioner'        THEN 1 ELSE 0 END) AS parishioners,
            SUM(CASE WHEN role != 'parishioner'       THEN 1 ELSE 0 END) AS admins
        ")->first();

        return response()->json($counts);
    }

    // ── Show ────────────────────────────────────────────────────────
    public function show(User $user): JsonResponse
    {
        return response()->json([
            'id'             => $user->id,
            'username'       => $user->username,
            'email'          => $user->email,
            'full_name'      => $user->full_name,
            'first_name'     => $user->first_name,
            'middle_name'    => $user->middle_name,
            'last_name'      => $user->last_name,
            'role'           => $user->role,
            'role_label'     => $this->roleLabel($user->role),
            'account_status' => $user->account_status,
            'gender'         => $user->gender,
            'birth_date'     => $user->birth_date?->format('Y-m-d'),
            'phone'          => $user->phone,
            'country'        => $user->country,
            'province'       => $user->province,
            'city'           => $user->city,
            'barangay'       => $user->barangay,
            'street_address' => $user->street_address,
            'zip_code'       => $user->zip_code,
            'joined'         => $user->created_at->format('F d, Y'),
        ]);
    }

    // ── Store ────────────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username'    => ['required', 'string', 'min:3', 'max:255', 'unique:users', 'regex:/^[a-zA-Z0-9._-]+$/'],
            'email'       => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password'    => ['required', Rules\Password::defaults()],
            'role'        => ['required', Rule::in(['super_admin', 'parish_admin', 'clergymen', 'parishioner'])],
            'first_name'  => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name'   => ['required', 'string', 'max:255'],
            'birth_date'  => ['required', 'date', 'before:today'],
            'gender'      => ['required', 'in:Male,Female,Prefer not to say'],
            'phone'       => ['required', 'string', 'max:20'],
            'city'        => ['required', 'string', 'max:255'],
            'barangay'    => ['required', 'string', 'max:255'],
        ]);

        $user = User::create([
            ...$validated,
            'password'       => Hash::make($validated['password']),
            'account_status' => 'Active',
            'country'        => 'Philippines',
        ]);

        return response()->json([
            'success' => true,
            'message' => "User {$user->full_name} created successfully.",
            'user'    => $this->formatRow($user),
        ], 201);
    }

    // ── Full Update (profile + role/status) ─────────────────────────
    public function update(Request $request, User $user): JsonResponse
    {
        // Guard: self-lockout
        if ($user->id === auth()->id() && $request->has('account_status') && $request->account_status !== 'Active') {
            return response()->json(['message' => 'You cannot deactivate your own account.'], 422);
        }

        $validated = $request->validate([
            'first_name'     => ['sometimes', 'required', 'string', 'max:255'],
            'middle_name'    => ['sometimes', 'nullable', 'string', 'max:255'],
            'last_name'      => ['sometimes', 'required', 'string', 'max:255'],
            'username'       => ['sometimes', 'required', 'string', 'min:3', 'max:255', 'regex:/^[a-zA-Z0-9._-]+$/', Rule::unique('users')->ignore($user->id)],
            'email'          => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone'          => ['sometimes', 'required', 'string', 'max:20'],
            'gender'         => ['sometimes', 'required', 'in:Male,Female,Prefer not to say'],
            'birth_date'     => ['sometimes', 'required', 'date', 'before:today'],
            'province'       => ['sometimes', 'nullable', 'string', 'max:255'],
            'city'           => ['sometimes', 'required', 'string', 'max:255'],
            'barangay'       => ['sometimes', 'required', 'string', 'max:255'],
            'street_address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'zip_code'       => ['sometimes', 'nullable', 'string', 'max:10'],
            'role'           => ['sometimes', Rule::in(['super_admin', 'parish_admin', 'clergymen', 'parishioner'])],
            'account_status' => ['sometimes', Rule::in(['Active', 'Inactive', 'Suspended'])],
        ]);

        $user->update($validated);
        $user->refresh();

        return response()->json([
            'success' => true,
            'message' => "User {$user->full_name} updated successfully.",
            'user'    => $this->formatRow($user),
        ]);
    }

    // ── Reset Password (auto-generate) ───────────────────────────────
     public function resetPassword(User $user): JsonResponse
    {
        // Laravel docs: https://laravel.com/docs/12.x/strings#method-str-password
        $generated = \Illuminate\Support\Str::password(length: 12, symbols: true);

        $user->update(['password' => Hash::make($generated)]);

        return response()->json([
            'success'            => true,
            'generated_password' => $generated,
            'message'            => "Password reset for {$user->full_name}. Copy it now — it won't be shown again.",
        ]);
    }

    // ── Delete (soft or hard) ────────────────────────────────────────
    public function destroy(Request $request, User $user): JsonResponse
    {
        // Guard: prevent self-deletion
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'You cannot delete your own account.'], 422);
        }

        $force = $request->boolean('force');

        if ($force) {
            $name = $user->full_name;
            $user->forceDelete(); // permanently removes from DB
            return response()->json([
                'success' => true,
                'message' => "{$name} has been permanently deleted.",
                'deleted' => true,
            ]);
        }

        // Soft delete — sets deleted_at, user is hidden from normal queries
        $user->delete();
        return response()->json([
            'success' => true,
            'message' => "{$user->full_name} has been removed. They can be restored if needed.",
            'deleted' => true,
        ]);
    }

    // ── Mark notification read ───────────────────────────────────────
    public function markNotificationRead(Request $request): JsonResponse
    {
        $admin = auth()->user();

        if ($request->filled('id')) {
            \App\Models\Notification::where('user_id', $admin->id)
                ->where('id', $request->id)
                ->update(['is_read' => true]);
        } else {
            // Mark all
            \App\Models\Notification::where('user_id', $admin->id)
                ->update(['is_read' => true]);
        }

        return response()->json(['success' => true]);
    }

    // ── Private Helpers ──────────────────────────────────────────────
    private function formatRow(User $u): array
    {
        return [
            'id'             => $u->id,
            'username'       => $u->username,
            'email'          => $u->email,
            'full_name'      => $u->full_name,
            'role'           => $u->role,
            'role_label'     => $this->roleLabel($u->role),
            'account_status' => $u->account_status,
            'phone'          => $u->phone,
            'city'           => $u->city,
            'joined'         => $u->created_at->format('M d, Y'),
        ];
    }

    private function roleLabel(string $role): string
    {
        return match ($role) {
            'super_admin'  => 'Ministerial Head IT Admin',
            'parish_admin' => 'Ministerial IT Helpdesk',
            'clergymen'    => 'Clergymen',
            'parishioner'  => 'Parishioner',
            default        => 'Unknown',
        };
    }
}