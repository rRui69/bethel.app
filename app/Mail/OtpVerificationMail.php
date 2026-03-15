<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Accepts either:
     *   - new OtpVerificationMail($user, $code)          — existing User model
     *   - new OtpVerificationMail($firstName, $email, $code) — pending registration
     */
    public readonly string $firstName;
    public readonly string $recipientEmail;
    public readonly string $otpCode;

    public function __construct(
        string|\App\Models\User $firstNameOrUser,
        string $emailOrCode,
        ?string $code = null,
    ) {
        if ($firstNameOrUser instanceof \App\Models\User) {
            // Called from login-triggered resend: sendOtp($user, $code)
            $this->firstName      = $firstNameOrUser->first_name;
            $this->recipientEmail = $firstNameOrUser->email;
            $this->otpCode        = $emailOrCode; // second arg is code
        } else {
            // Called from pending registration: new(..., $firstName, $email, $code)
            $this->firstName      = $firstNameOrUser;
            $this->recipientEmail = $emailOrCode;
            $this->otpCode        = $code;
        }
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Verify Your BethelApp Account — ' . $this->otpCode,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp-verification',
        );
    }
}
