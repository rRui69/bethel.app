<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\BibleVerseOtp;
use App\Mail\OtpVerificationMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\View\View;

class RegisteredUserController extends Controller
{
    public function create(): View
    {
        return view('auth.register');
    }

    /**
     * Validate the form, store everything in session, send OTP.
     * The user account is NOT created here — only after OTP is verified.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'username'       => ['required', 'string', 'min:3', 'max:255', 'unique:users', 'regex:/^[a-zA-Z0-9._-]+$/'],
            'email'          => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password'       => ['required', 'confirmed', Rules\Password::defaults()],
            'first_name'     => ['required', 'string', 'max:255'],
            'middle_name'    => ['nullable', 'string', 'max:255'],
            'last_name'      => ['required', 'string', 'max:255'],
            'birth_date'     => ['required', 'date', 'before:today'],
            'gender'         => ['required', 'in:Male,Female,Prefer not to say'],
            'phone'          => ['required', 'string', 'max:20'],
            'country'        => ['required', 'string', 'max:255'],
            'province'       => ['nullable', 'string', 'max:255'],
            'city'           => ['required', 'string', 'max:255'],
            'barangay'       => ['required', 'string', 'max:255'],
            'street_address' => ['nullable', 'string', 'max:255'],
            'zip_code'       => ['nullable', 'string', 'max:10'],
        ]);

        // Generate OTP
        $code = BibleVerseOtp::generate();

        // Store pending registration data in session — no DB write yet
        $request->session()->put('pending_reg', [
            'username'       => $request->username,
            'email'          => $request->email,
            'password'       => Hash::make($request->password), // hash now, store hashed
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
            'otp'            => $code,
            'otp_expires_at' => now()->addMinutes(15)->toIso8601String(),
        ]);

        // Send OTP email — user doesn't exist yet, so pass values directly
        Mail::to($request->email)->send(
            new OtpVerificationMail($request->first_name, $request->email, $code)
        );

        return response()->json([
            'success'      => true,
            'redirect_url' => route('verification.otp'),
        ]);
    }
}
