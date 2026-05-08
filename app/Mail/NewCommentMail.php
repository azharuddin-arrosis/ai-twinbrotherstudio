<?php

namespace App\Mail;

use App\Models\Article;
use App\Models\Comment;
use App\Models\ContactSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewCommentMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Comment $comment,
        public readonly Article $article,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            to: ContactSetting::get('admin_email', config('mail.from.address')),
            subject: 'New Comment on: ' . $this->article->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.new-comment',
        );
    }
}
