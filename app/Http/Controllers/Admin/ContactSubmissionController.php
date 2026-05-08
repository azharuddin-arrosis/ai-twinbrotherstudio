<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ContactSubmissionController extends Controller
{
    public function index(): Response
    {
        $submissions = ContactSubmission::latest()
            ->paginate(20)
            ->withQueryString();

        $unreadCount = ContactSubmission::unread()->count();

        return Inertia::render('Admin/ContactSubmissions/Index', [
            'submissions' => $submissions,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function markRead(ContactSubmission $submission): RedirectResponse
    {
        $submission->update(['is_read' => true]);

        return back();
    }
}
