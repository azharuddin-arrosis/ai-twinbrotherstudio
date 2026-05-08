<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactSubmission;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactSubmissionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ContactSubmission::latest();

        if ($request->filled('status')) {
            match ($request->input('status')) {
                'unread' => $query->unread(),
                'read'   => $query->read(),
                default  => null,
            };
        }

        $submissions = $query->paginate(20)->withQueryString();
        $unreadCount = ContactSubmission::unread()->count();

        return Inertia::render('Admin/ContactSubmissions/Index', [
            'submissions' => $submissions,
            'unreadCount' => $unreadCount,
            'filters'     => $request->only('status'),
        ]);
    }

    public function show(ContactSubmission $submission): Response
    {
        $submission->markAsRead();

        return Inertia::render('Admin/ContactSubmissions/Show', [
            'submission' => $submission,
        ]);
    }

    public function markRead(ContactSubmission $submission): RedirectResponse
    {
        $submission->markAsRead();

        return back();
    }

    public function destroy(ContactSubmission $submission): RedirectResponse
    {
        $submission->delete();

        return redirect()->route('admin.contact-submissions.index')
            ->with('success', 'Submission deleted.');
    }
}
