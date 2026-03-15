<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Mail;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        // Use the branded BethelApp password-reset email instead of
        // Laravel's default plain-text notification.
        ResetPassword::toMailUsing(function (object $notifiable, string $token) {
            $resetUrl = url(route('password.reset', [
                'token' => $token,
                'email' => $notifiable->getEmailForPasswordReset(),
            ], false));

            $expireMinutes = config('auth.passwords.'.config('auth.defaults.passwords').'.expire', 60);

            return (new \Illuminate\Mail\Mailable())
                ->to($notifiable->email)
                ->subject('Reset Your BethelApp Password')
                ->view('emails.password-reset', [
                    'user'          => $notifiable,
                    'resetUrl'      => $resetUrl,
                    'expireMinutes' => $expireMinutes,
                ]);
        });
    }
}
