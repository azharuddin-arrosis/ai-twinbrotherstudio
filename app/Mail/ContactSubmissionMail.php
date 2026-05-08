<?php

namespace App\Mail;

use App\Models\ContactSetting;
use App\Models\ContactSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactSubmissionMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly ContactSubmission $submission,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            to: ContactSetting::get('admin_email', config('mail.from.address')),
            subject: "New Inquiry from {$this->submission->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.contact-submission',
        );
    }
}
