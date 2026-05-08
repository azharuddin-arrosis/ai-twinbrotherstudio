<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #4f46e5;">New Project Inquiry</h2>
    <table style="width:100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; font-weight: bold; width: 140px;">Name:</td><td>{{ $submission->name }}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:{{ $submission->email }}">{{ $submission->email }}</a></td></tr>
        @if($submission->company)
        <tr><td style="padding: 8px 0; font-weight: bold;">Company:</td><td>{{ $submission->company }}</td></tr>
        @endif
        @if($submission->project_type)
        <tr><td style="padding: 8px 0; font-weight: bold;">Project Type:</td><td>{{ $submission->project_type }}</td></tr>
        @endif
        @if($submission->budget_range)
        <tr><td style="padding: 8px 0; font-weight: bold;">Budget Range:</td><td>{{ $submission->budget_range }}</td></tr>
        @endif
    </table>
    <div style="margin-top: 16px; padding: 16px; background: #f9fafb; border-radius: 8px;">
        <p style="font-weight: bold; margin: 0 0 8px;">Message:</p>
        <p style="margin: 0; line-height: 1.6;">{{ $submission->message }}</p>
    </div>
    <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">Sent from twinbrotherstudio.com contact form</p>
</body>
</html>
