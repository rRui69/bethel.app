<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt(
            [
                'username' => $this->string('username'),
                'password' => $this->string('password'),
            ],
            $this->boolean('remember')
        )) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'username' => __('auth.failed'),
            ]);
        }

        // Account Status Guard
        // Credentials are valid, but the account may be deactivated or suspended.
        // We must log the user out and reject the login before the session is used.
        $user = Auth::user();

        if ($user->account_status !== 'Active') {
            Auth::logout();
            RateLimiter::hit($this->throttleKey());

            $message = match ($user->account_status) {
                'Inactive'  => 'Your account has been deactivated. Please contact the parish administrator.',
                'Suspended' => 'Your account has been suspended. Please contact the parish administrator.',
                default     => 'Your account is not currently active.',
            };

            throw ValidationException::withMessages([
                'username' => $message,
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'username' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    public function throttleKey(): string
    {
        return Str::transliterate(
            Str::lower($this->string('username')) . '|' . $this->ip()
        );
    }
}