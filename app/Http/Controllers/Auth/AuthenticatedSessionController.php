<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AuthenticatedSessionController extends Controller
{
    /**
     * The one superadmin account that bypasses email verification.
     * This is the seed account used for initial setup and development.
     * All other accounts — including other super_admin role users —
     * must still verify their email.
     */
    private const SUPERADMIN_BYPASS_EMAIL = 'admin@bethelapp.com';

    public function create(): View
    {
        return view('auth.login');
    }

    public function store(LoginRequest $request): JsonResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = auth()->user();

        // Bypass OTP gate ONLY for the seeded superadmin account
        $isSuperadminBypass = $user->email === self::SUPERADMIN_BYPASS_EMAIL;

        if (! $isSuperadminBypass && ! $user->email_verified_at) {
            // Unverified user — send fresh OTP and redirect to verify page
            EmailVerificationController::sendOtp($user);

            return response()->json([
                'success'      => true,
                'redirect_url' => route('verification.otp'),
            ]);
        }

        // Auto-verify the bypass account if not already marked
        if ($isSuperadminBypass && ! $user->email_verified_at) {
            $user->update(['email_verified_at' => now()]);
        }

        $redirectUrl = match ($user->role) {
            'super_admin', 'parish_admin', 'parish_helpdesk' => route('admin.dashboard'),
            'clergymen'                                       => route('admin.clergy-dashboard'),
            default                                           => route('home'),
        };

        return response()->json([
            'success'      => true,
            'redirect_url' => $redirectUrl,
        ]);
    }

    public function destroy(Request $request): \Illuminate\Http\RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('home');
    }
}
