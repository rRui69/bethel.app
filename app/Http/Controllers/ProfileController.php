<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\View\View;

class ProfileController extends Controller
{
    public function page(Request $request): View
    {
        return view('profile.page');
    }

    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('parish:id,name,city');

        return response()->json([
            'id'             => $user->id,
            'first_name'     => $user->first_name     ?? '',
            'middle_name'    => $user->middle_name     ?? '',
            'last_name'      => $user->last_name       ?? '',
            'username'       => $user->username        ?? '',
            'email'          => $user->email           ?? '',
            'email_verified' => ! is_null($user->email_verified_at),
            'phone'          => $user->phone           ?? '',
            'gender'         => $user->gender          ?? 'Male',
            'birth_date'     => $user->birth_date?->format('Y-m-d') ?? '',
            'country'        => $user->country         ?? 'Philippines',
            'province'       => $user->province        ?? '',
            'city'           => $user->city            ?? '',
            'barangay'       => $user->barangay        ?? '',
            'street_address' => $user->street_address  ?? '',
            'zip_code'       => $user->zip_code        ?? '',
            'avatar_url'     => $user->avatar_url      ?? null,
            'role'           => $user->role,
            'role_label'     => match ($user->role) {
                'super_admin'     => 'Diocesan Head IT Admin',
                'parish_admin'    => 'Ministerial Head IT Admin',
                'parish_helpdesk' => 'Ministerial IT Helpdesk',
                'clergymen'       => 'Clergymen',
                default           => 'Parishioner',
            },
            'role_badge'     => match ($user->role) {
                'super_admin'     => 'danger',
                'parish_admin'    => 'warning',
                'parish_helpdesk' => 'info',
                'clergymen'       => 'info',
                default           => 'secondary',
            },
            'account_status' => $user->account_status ?? 'Active',
            'parish_name'    => $user->parish?->name  ?? null,
            'joined'         => $user->created_at->format('F d, Y'),
        ]);
    }

    /**
     * Update personal info fields only.
     */
    public function updatePersonal(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name'     => 'required|string|max:100',
            'middle_name'    => 'nullable|string|max:100',
            'last_name'      => 'required|string|max:100',
            'phone'          => 'required|string|max:20',
            'gender'         => 'required|in:Male,Female,Prefer not to say',
            'birth_date'     => 'required|date',
            'country'        => 'nullable|string|max:100',
            'province'       => 'nullable|string|max:100',
            'city'           => 'required|string|max:100',
            'barangay'       => 'required|string|max:100',
            'street_address' => 'nullable|string|max:255',
            'zip_code'       => 'nullable|string|max:10',
        ]);

        $user->fill($validated)->save();

        return response()->json([
            'message'        => 'Personal information updated successfully.',
            'first_name'     => $user->first_name,
            'middle_name'    => $user->middle_name,
            'last_name'      => $user->last_name,
            'phone'          => $user->phone,
            'gender'         => $user->gender,
            'birth_date'     => $user->birth_date?->format('Y-m-d'),
            'country'        => $user->country,
            'province'       => $user->province,
            'city'           => $user->city,
            'barangay'       => $user->barangay,
            'street_address' => $user->street_address,
            'zip_code'       => $user->zip_code,
        ]);
    }

    /**
     * Update account fields only (username, email).
     */
    public function updateAccount(Request $request): JsonResponse
    {
        $user = $request->user();

        $rules = [
            'username' => 'required|string|max:50|unique:users,username,' . $user->id,
        ];

        // Email only updatable when not verified
        if (is_null($user->email_verified_at)) {
            $rules['email'] = 'required|email|max:255|unique:users,email,' . $user->id;
        }

        $validated = $request->validate($rules);

        // Strip email if verified even if submitted
        if (! is_null($user->email_verified_at)) {
            unset($validated['email']);
        }

        $user->fill($validated)->save();

        return response()->json([
            'message'  => 'Account details updated successfully.',
            'username' => $user->username,
            'email'    => $user->email,
            'email_verified' => ! is_null($user->email_verified_at),
        ]);
    }

    /**
     * Update only the avatar — separate endpoint so we don't
     * need all required profile fields just to change a photo.
     */
    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar_url' => 'required|url|max:1000',
        ]);

        $user = $request->user();
        $user->update(['avatar_url' => $request->avatar_url]);

        return response()->json([
            'message'    => 'Profile photo updated.',
            'avatar_url' => $user->avatar_url,
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => ['required', 'confirmed',
                Password::min(8)->mixedCase()->numbers()
            ],
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'errors' => ['current_password' => ['Current password is incorrect.']],
            ], 422);
        }

        $user->update(['password' => $request->password]);

        return response()->json(['message' => 'Password changed successfully.']);
    }
}
