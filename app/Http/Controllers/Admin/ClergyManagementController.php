<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\AdminBaseController;
use App\Models\ClergyProfile;
use App\Models\Parish;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ClergyManagementController extends AdminBaseController
{
    // ── Blade page ────────────────────────────────────────────────
    public function page()
    {
        // Only super_admin may manage clergy accounts
        if (! auth()->user()->isSuperAdmin()) {
            abort(403, 'Only Ministerial Head IT Administrators can manage clergy.');
        }

        $adminData           = $this->adminShellData();
        $adminData['parishes'] = Parish::active()
            ->select('id', 'name', 'city')
            ->orderBy('name')
            ->get()
            ->toArray();

        return view('admin.clergy', compact('adminData'));
    }

    // ── API: list all clergy ──────────────────────────────────────
    public function index(Request $request)
    {
        $query = User::where('role', 'clergymen')
            ->with(['clergyProfile.parish:id,name,city'])
            ->withTrashed($request->boolean('with_deleted'));

        if ($request->filled('status')) {
            $query->where('account_status', $request->status);
        }

        if ($request->filled('parish_id')) {
            $query->whereHas('clergyProfile', fn ($q) => $q->where('parish_id', $request->parish_id));
        }

        if ($request->filled('search')) {
            $term = '%' . $request->search . '%';
            $query->where(fn ($q) => $q
                ->where('first_name', 'like', $term)
                ->orWhere('last_name',  'like', $term)
                ->orWhere('email',      'like', $term)
            );
        }

        $clergy = $query->orderBy('last_name')->get()->map(fn ($u) => $this->formatClergy($u));

        return response()->json($clergy);
    }

    // ── API: stats ────────────────────────────────────────────────
    public function stats()
    {
        return response()->json([
            'total'    => User::where('role', 'clergymen')->count(),
            'active'   => User::where('role', 'clergymen')->where('account_status', 'Active')->count(),
            'inactive' => User::where('role', 'clergymen')->where('account_status', '!=', 'Active')->count(),
        ]);
    }

    // ── API: show single clergy ───────────────────────────────────
    public function show(User $user)
    {
        $this->abortIfNotClergy($user);

        $user->load(['clergyProfile.parish:id,name,city']);

        return response()->json($this->formatClergy($user, withSchedule: true));
    }

    // ── API: create clergy (User + ClergyProfile in transaction) ──
    public function store(Request $request)
    {
        if (! auth()->user()->isSuperAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'first_name'     => 'required|string|max:100',
            'last_name'      => 'required|string|max:100',
            'middle_name'    => 'nullable|string|max:100',
            'email'          => 'required|email|unique:users,email',
            'username'       => 'required|string|max:50|unique:users,username|regex:/^[a-z0-9._]+$/i',
            'password'       => 'required|string|min:8|confirmed',
            // DB: phone is NOT NULL — required for clergy staff
            'phone'          => 'required|string|max:20',
            // DB enum: Male, Female, Prefer not to say (NOT NULL)
            'gender'         => 'required|in:Male,Female,Prefer not to say',
            // DB: birth_date is NOT NULL — required for clergy staff
            'birth_date'     => 'required|date|before:today',
            // Address fields — all nullable in DB
            'country'        => 'nullable|string|max:100',
            'province'       => 'nullable|string|max:100',
            'city'           => 'nullable|string|max:100',
            'barangay'       => 'nullable|string|max:100',
            'street_address' => 'nullable|string|max:255',
            'zip_code'       => 'nullable|string|max:10',
            // Clergy profile
            'parish_id'      => 'required|exists:parishes,id',
            'title'          => 'required|in:Fr.,Rev.,Msgr.,Bp.,Cardinal,Deacon',
            'specialization' => 'nullable|string|max:255',
            'schedule'       => 'nullable|array',
            'schedule.*.day' => 'required_with:schedule|string|max:20',
            'schedule.*.time'=> 'required_with:schedule|string|max:20',
            'schedule.*.type'=> 'required_with:schedule|string|max:50',
        ]);

        $user = DB::transaction(function () use ($validated) {
            $user = User::create([
                'first_name'     => $validated['first_name'],
                'last_name'      => $validated['last_name'],
                'middle_name'    => $validated['middle_name'] ?? null,
                'email'          => $validated['email'],
                'username'       => $validated['username'],
                'password'       => Hash::make($validated['password']),
                'role'           => 'clergymen',
                'account_status' => 'Active',
                'parish_id'      => $validated['parish_id'],
                'phone'          => $validated['phone'],
                'gender'         => $validated['gender'],
                'birth_date'     => $validated['birth_date'],
                'country'        => $validated['country'] ?? 'Philippines',
                'province'       => $validated['province'] ?? null,
                'city'           => $validated['city'] ?? null,
                'barangay'       => $validated['barangay'] ?? null,
                'street_address' => $validated['street_address'] ?? null,
                'zip_code'       => $validated['zip_code'] ?? null,
            ]);

            ClergyProfile::create([
                'user_id'        => $user->id,
                'parish_id'      => $validated['parish_id'],
                'title'          => $validated['title'],
                'specialization' => $validated['specialization'] ?? null,
                'schedule'       => $validated['schedule'] ?? null,
            ]);

            return $user;
        });

        $user->load(['clergyProfile.parish:id,name,city']);

        return response()->json($this->formatClergy($user, withSchedule: true), 201);
    }

    // ── API: update clergy ────────────────────────────────────────
    public function update(Request $request, User $user)
    {
        $this->abortIfNotClergy($user);

        if (! auth()->user()->isSuperAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'first_name'     => 'sometimes|required|string|max:100',
            'last_name'      => 'sometimes|required|string|max:100',
            'middle_name'    => 'nullable|string|max:100',
            'email'          => ['sometimes', 'required', 'email', Rule::unique('users', 'email')->ignore($user->id)],
            'username'       => ['sometimes', 'required', 'string', 'max:50', Rule::unique('users', 'username')->ignore($user->id)],
            // DB: phone, gender, birth_date are NOT NULL — empty strings are rejected
            'phone'          => 'sometimes|required|string|max:20',
            'gender'         => 'sometimes|required|in:Male,Female,Prefer not to say',
            'birth_date'     => 'sometimes|required|date|before:today',
            'account_status' => 'sometimes|in:Active,Inactive,Suspended',
            // Address — nullable in DB
            'country'        => 'nullable|string|max:100',
            'province'       => 'nullable|string|max:100',
            'city'           => 'nullable|string|max:100',
            'barangay'       => 'nullable|string|max:100',
            'street_address' => 'nullable|string|max:255',
            'zip_code'       => 'nullable|string|max:10',
            // Clergy profile
            'parish_id'      => 'sometimes|required|exists:parishes,id',
            'title'          => 'sometimes|required|in:Fr.,Rev.,Msgr.,Bp.,Cardinal,Deacon',
            'specialization' => 'nullable|string|max:255',
            'schedule'       => 'nullable|array',
            'schedule.*.day' => 'required_with:schedule|string|max:20',
            'schedule.*.time'=> 'required_with:schedule|string|max:20',
            'schedule.*.type'=> 'required_with:schedule|string|max:50',
        ]);

        DB::transaction(function () use ($user, $validated) {
            // Update user fields
            $userFields = array_intersect_key($validated, array_flip([
                'first_name', 'last_name', 'middle_name',
                'email', 'username', 'phone', 'gender', 'birth_date',
                'account_status',
                'country', 'province', 'city', 'barangay', 'street_address', 'zip_code',
            ]));

            if (isset($validated['parish_id'])) {
                $userFields['parish_id'] = $validated['parish_id'];
            }

            if (!empty($userFields)) {
                $user->update($userFields);
            }

            // Update clergy profile fields
            $profileFields = array_intersect_key($validated, array_flip([
                'parish_id', 'title', 'specialization', 'schedule',
            ]));

            if (!empty($profileFields)) {
                $user->clergyProfile?->update($profileFields);
            }
        });

        $user->load(['clergyProfile.parish:id,name,city']);

        return response()->json($this->formatClergy($user, withSchedule: true));
    }

    // ── API: delete (soft delete the user) ───────────────────────
    public function destroy(User $user)
    {
        $this->abortIfNotClergy($user);

        if (! auth()->user()->isSuperAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $user->delete(); // SoftDeletes — profile remains, FK nulled on sacrament_requests

        return response()->json(['message' => 'Clergy member deactivated successfully.']);
    }

    // ── API: reset password ───────────────────────────────────────
    public function resetPassword(Request $request, User $user)
    {
        $this->abortIfNotClergy($user);

        if (! auth()->user()->isSuperAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->update(['password' => Hash::make($validated['password'])]);

        return response()->json(['message' => 'Password reset successfully.']);
    }

    // ── Private helpers ───────────────────────────────────────────

    private function abortIfNotClergy(User $user): void
    {
        if ($user->role !== 'clergymen') {
            abort(404, 'Clergy member not found.');
        }
    }

    /**
     * Standardised API response shape for a clergy User.
     */
    private function formatClergy(User $user, bool $withSchedule = false): array
    {
        $profile = $user->clergyProfile;

        $data = [
            'id'             => $user->id,
            'first_name'     => $user->first_name,
            'last_name'      => $user->last_name,
            'middle_name'    => $user->middle_name,
            'full_name'      => $user->full_name,
            'titled_name'    => $profile
                ? "{$profile->title} {$user->first_name} {$user->last_name}"
                : $user->full_name,
            'email'          => $user->email,
            'username'       => $user->username,
            'phone'          => $user->phone,
            'gender'         => $user->gender,
            'birth_date'     => $user->birth_date?->format('Y-m-d'),
            'account_status' => $user->account_status,
            // Address fields — needed for edit form pre-population
            'country'        => $user->country ?? 'Philippines',
            'province'       => $user->province,
            'city'           => $user->city,
            'barangay'       => $user->barangay,
            'street_address' => $user->street_address,
            'zip_code'       => $user->zip_code,
            'title'          => $profile?->title ?? '—',
            'specialization' => $profile?->specialization ?? '—',
            'parish_id'      => $profile?->parish_id,
            'parish_name'    => $profile?->parish?->name ?? '—',
            'parish_city'    => $profile?->parish?->city ?? '—',
            'created_at'     => $user->created_at?->format('M d, Y'),
        ];

        if ($withSchedule) {
            $data['schedule'] = $profile?->schedule ?? [];
        }

        return $data;
    }
}