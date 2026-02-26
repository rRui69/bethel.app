<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\View\View;
use Illuminate\Http\JsonResponse;

class RegisteredUserController extends Controller
{
    public function create(): View
    {
        return view('auth.register');
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            // Step 1 — Credentials
            'username'              => ['required', 'string', 'min:3', 'max:255', 'unique:users', 'regex:/^[a-zA-Z0-9._-]+$/'],
            'email'                 => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password'              => ['required', 'confirmed', Rules\Password::defaults()],

            // Step 2 — Personal Info
            'first_name'            => ['required', 'string', 'max:255'],
            'middle_name'           => ['nullable', 'string', 'max:255'],
            'last_name'             => ['required', 'string', 'max:255'],
            'birth_date'            => ['required', 'date', 'before:today'],
            'gender'                => ['required', 'in:Male,Female,Prefer not to say'],

            // Step 3 — Contact
            'phone'                 => ['required', 'string', 'max:20'],
            'country'               => ['required', 'string', 'max:255'],
            'province'              => ['nullable', 'string', 'max:255'],
            'city'                  => ['required', 'string', 'max:255'],
            'barangay'              => ['required', 'string', 'max:255'],
            'street_address'        => ['nullable', 'string', 'max:255'],
            'zip_code'              => ['nullable', 'string', 'max:10'],
        ]);

        $user = User::create([
            'username'       => $request->username,
            'email'          => $request->email,
            'password'       => Hash::make($request->password),
            'first_name'     => $request->first_name,
            'middle_name'    => $request->middle_name,
            'last_name'      => $request->last_name,
            'birth_date'     => $request->birth_date,
            'gender'         => $request->gender,
            'phone'          => $request->phone,
            'country'        => $request->country,
            'province'       => $request->province,
            'city'           => $request->city,
            'barangay'       => $request->barangay,
            'street_address' => $request->street_address,
            'zip_code'       => $request->zip_code,
        ]);

        event(new Registered($user));

        Auth::login($user);

        return response()->json(['success'=> true,'redirect_url' => route('home'),]);
    }
}