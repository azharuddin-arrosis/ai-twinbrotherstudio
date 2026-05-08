<?php

namespace App\Http\Controllers;

use App\Mail\ContactSubmissionMail;
use App\Models\ContactSetting;
use App\Models\ContactSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function show(): Response
    {
        $settings = ContactSetting::all()->pluck('value', 'key');

        return Inertia::render('Contact/HireUs', [
            'contactSettings' => $settings,
        ]);
    }

    public function submit(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name'         => ['required', 'string', 'max:255'],
            'email'        => ['required', 'email', 'max:255'],
            'company'      => ['nullable', 'string', 'max:255'],
            'project_type' => ['nullable', 'string', 'max:100'],
            'budget_range' => ['nullable', 'string', 'max:100'],
            'message'      => ['required', 'string', 'max:5000'],
        ]);

        $submission = ContactSubmission::create($data);

        $adminEmail = ContactSetting::get('admin_email', config('mail.from.address'));

        if ($adminEmail) {
            Mail::to($adminEmail)->queue(new ContactSubmissionMail($submission));
        }

        return back()->with('success', "Thanks {$submission->name}! We'll get back to you within 1–2 business days.");
    }
}
