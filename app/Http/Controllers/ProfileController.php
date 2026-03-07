<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\View\View;

class ProfileController extends Controller
{
    /**
     * Serve the profile page — public layout (layouts.app) for ALL roles.
     */
    public function page(Request $request): View
    {
        return view('profile.page');
    }

    /**
     * Return the authenticated user's full profile as JSON.
     */
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
            // Role — read-only, never changeable from this page
            'role'           => $user->role,
            'role_label'     => match ($user->role) {
                'super_admin'  => 'Ministerial Head IT Administrator',
                'parish_admin' => 'Ministerial IT Helpdesk',
                'clergymen'    => 'Clergymen',
                default        => 'Parishioner',
            },
            'role_badge'     => match ($user->role) {
                'super_admin'  => 'danger',
                'parish_admin' => 'warning',
                'clergymen'    => 'info',
                default        => 'secondary',
            },
            'account_status' => $user->account_status ?? 'Active',
            'parish_name'    => $user->parish?->name  ?? null,
            'joined'         => $user->created_at->format('F d, Y'),
        ]);
    }

    /**
     * Update the authenticated user's profile.
     * Role and account_status are intentionally never updated here.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $rules = [
            'first_name'     => 'required|string|max:100',
            'middle_name'    => 'nullable|string|max:100',
            'last_name'      => 'required|string|max:100',
            'username'       => 'required|string|max:50|unique:users,username,' . $user->id,
            'phone'          => 'required|string|max:20',
            'gender'         => 'required|in:Male,Female,Prefer not to say',
            'birth_date'     => 'required|date',
            'country'        => 'nullable|string|max:100',
            'province'       => 'nullable|string|max:100',
            'city'           => 'required|string|max:100',
            'barangay'       => 'required|string|max:100',
            'street_address' => 'nullable|string|max:255',
            'zip_code'       => 'nullable|string|max:10',
        ];

        // Email: only updatable when NOT verified
        if (is_null($user->email_verified_at)) {
            $rules['email'] = 'required|email|max:255|unique:users,email,' . $user->id;
        }

        $validated = $request->validate($rules);

        // Hard-block: role and account_status cannot be updated from this endpoint
        unset($validated['role'], $validated['account_status']);

        // If verified, strip email even if someone sends it
        if (! is_null($user->email_verified_at)) {
            unset($validated['email']);
        }

        $user->fill($validated)->save();

        return response()->json([
            'message'    => 'Profile updated successfully.',
            'first_name' => $user->first_name,
            'last_name'  => $user->last_name,
            'username'   => $user->username,
        ]);
    }

    /**
     * Change the authenticated user's password.
     */
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