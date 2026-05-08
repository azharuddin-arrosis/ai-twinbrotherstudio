<?php

namespace App\Http\Controllers;

use App\Models\Subscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SubscriberController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email'   => ['required', 'email', 'max:255'],
            'name'    => ['nullable', 'string', 'max:100'],
            'website' => ['nullable', 'string'], // honeypot
        ]);

        if ($request->filled('website')) {
            return back();
        }

        Subscriber::firstOrCreate(
            ['email' => $request->email],
            ['name' => $request->name, 'status' => 'active']
        );

        return back()->with('success', 'You\'re subscribed! We\'ll send you the latest tutorials.');
    }

    public function unsubscribe(string $token): RedirectResponse
    {
        $subscriber = Subscriber::where('token', $token)->first();

        if ($subscriber) {
            $subscriber->update(['status' => 'unsubscribed']);
        }

        return redirect('/')->with('success', 'You\'ve been unsubscribed successfully.');
    }
}
