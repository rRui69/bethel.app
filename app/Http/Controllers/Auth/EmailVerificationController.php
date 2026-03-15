<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpVerificationMail;
use App\Models\User;
use App\Services\BibleVerseOtp;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\View\View;

class EmailVerificationController extends Controller
{
    // ── GET /verify-otp ──────────────────────────────────────────
    public function show(Request $request): mixed
    {
        // Case A: pending registration in session (not yet logged in)
        if ($pending = $request->session()->get('pending_reg')) {
            return view('auth.verify-otp', [
                'email'     => $pending['email'],
                'firstName' => $pending['first_name'],
            ]);
        }

        // Case B: logged-in user who hasn't verified yet
        $user = $request->user();
        if ($user && ! $user->email_verified_at) {
            return view('auth.verify-otp', [
                'email'     => $user->email,
                'firstName' => $user->first_name,
            ]);
        }

        // Already verified — redirect to appropriate dashboard
        if ($user) {
            return redirect($this->redirectAfterVerification($user));
        }

        return redirect()->route('login');
    }

    // ── POST /verify-otp ─────────────────────────────────────────
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => ['required', 'string', 'max:20'],
        ]);

        $submitted = strtoupper(trim($request->otp));

        // ── Case A: pending registration ─────────────────────────
        if ($pending = $request->session()->get('pending_reg')) {
            $storedOtp     = strtoupper($pending['otp'] ?? '');
            $expiresAt     = $pending['otp_expires_at'] ?? null;

            if ($submitted !== $storedOtp) {
                return response()->json([
                    'message' => 'Invalid code. Please check and try again.',
                ], 422);
            }

            if (! $expiresAt || now()->isAfter($expiresAt)) {
                return response()->json([
                    'message' => 'This code has expired. Request a new one.',
                ], 422);
            }

            // OTP correct — now create the user
            $user = User::create([
                'username'          => $pending['username'],
                'email'             => $pending['email'],
                'password'          => $pending['password'],   // already hashed
                'first_name'        => $pending['first_name'],
                'middle_name'       => $pending['middle_name'],
                'last_name'         => $pending['last_name'],
                'birth_date'        => $pending['birth_date'],
                'gender'            => $pending['gender'],
                'phone'             => $pending['phone'],
                'country'           => $pending['country'],
                'province'          => $pending['province'],
                'city'              => $pending['city'],
                'barangay'          => $pending['barangay'],
                'street_address'    => $pending['street_address'],
                'zip_code'          => $pending['zip_code'],
                'email_verified_at' => now(),        // mark verified immediately
            ]);

            event(new Registered($user));

            // Clear pending registration from session
            $request->session()->forget('pending_reg');

            Auth::login($user);

            // New registrants always go to their profile first
            return response()->json([
                'success'      => true,
                'redirect_url' => route('profile'),
            ]);
        }

        // ── Case B: existing logged-in unverified user ────────────
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Session expired. Please log in again.'], 401);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'success'      => true,
                'redirect_url' => $this->redirectAfterVerification($user),
            ]);
        }

        if ($submitted !== strtoupper($user->otp_code ?? '')) {
            return response()->json([
                'message' => 'Invalid code. Please check and try again.',
            ], 422);
        }

        if (! $user->otp_expires_at || now()->isAfter($user->otp_expires_at)) {
            return response()->json([
                'message' => 'This code has expired. Request a new one.',
            ], 422);
        }

        $user->update([
            'email_verified_at' => now(),
            'otp_code'          => null,
            'otp_expires_at'    => null,
        ]);

        return response()->json([
            'success'      => true,
            'redirect_url' => $this->redirectAfterVerification($user),
        ]);
    }

    // ── POST /verify-otp/resend ───────────────────────────────────
    public function resend(Request $request): JsonResponse
    {
        // Case A: pending registration
        if ($pending = $request->session()->get('pending_reg')) {
            $expiresAt = $pending['otp_expires_at'] ?? null;

            // Throttle: only allow resend if OTP is within last 1 minute
            if ($expiresAt && now()->lt(\Carbon\Carbon::parse($expiresAt)->subMinutes(14))) {
                return response()->json([
                    'message' => 'Please wait before requesting another code.',
                ], 429);
            }

            $code = BibleVerseOtp::generate();
            $pending['otp']            = $code;
            $pending['otp_expires_at'] = now()->addMinutes(15)->toIso8601String();
            $request->session()->put('pending_reg', $pending);

            Mail::to($pending['email'])->send(
                new OtpVerificationMail($pending['first_name'], $pending['email'], $code)
            );

            return response()->json(['message' => 'A new code has been sent to your email.']);
        }

        // Case B: existing logged-in user
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Session expired. Please log in again.'], 401);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Already verified.']);
        }

        if (
            $user->otp_expires_at &&
            now()->lt($user->otp_expires_at->copy()->subMinutes(14))
        ) {
            return response()->json([
                'message' => 'Please wait before requesting another code.',
            ], 429);
        }

        self::sendOtp($user);

        return response()->json(['message' => 'A new code has been sent to your email.']);
    }

    // ── Used by login flow to send OTP to an existing user ───────
    public static function sendOtp(User $user): void
    {
        $code = BibleVerseOtp::generate();

        $user->update([
            'otp_code'        => $code,
            'otp_expires_at'  => now()->addMinutes(15),
        ]);

        Mail::to($user->email)->send(new OtpVerificationMail($user, $code));
    }

    // ── Redirect destination based on role ───────────────────────
    private function redirectAfterVerification(User $user): string
    {
        return match ($user->role) {
            'super_admin', 'parish_admin', 'parish_helpdesk' => route('admin.dashboard'),
            'clergymen'                                       => route('admin.clergy-dashboard'),
            default                                           => route('home'),
        };
    }
}
