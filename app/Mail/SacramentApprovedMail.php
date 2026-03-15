<?php

namespace App\Mail;

use App\Models\SacramentRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SacramentApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly SacramentRequest $sacramentRequest
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your ' . $this->sacramentRequest->sacrament_type . ' Request Has Been Approved — BethelApp',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.sacrament-approved',
        );
    }
}
