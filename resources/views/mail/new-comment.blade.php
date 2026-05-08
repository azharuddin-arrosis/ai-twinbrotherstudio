<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #4f46e5;">New Comment Awaiting Moderation</h2>
    <p>A new comment was posted on <strong>{{ $article->title }}</strong> and is waiting for your review.</p>

    <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 0; font-weight: bold; width: 80px;">Name:</td><td>{{ $comment->name }}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>{{ $comment->email }}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Article:</td><td>{{ $article->title }}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Posted:</td><td>{{ $comment->created_at->diffForHumans() }}</td></tr>
    </table>

    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="font-weight: bold; margin: 0 0 8px;">Comment:</p>
        <p style="margin: 0; line-height: 1.6;">{{ $comment->body }}</p>
    </div>

    <a href="{{ url('/admin/comments?status=pending') }}"
       style="display: inline-block; background: #4f46e5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 8px;">
        Review in Admin Panel →
    </a>

    <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
        Sent from twinbrotherstudio.com comment system
    </p>
</body>
</html>
