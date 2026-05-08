<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscriber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SubscriberController extends Controller
{
    public function index(): InertiaResponse
    {
        $subscribers = Subscriber::latest()->paginate(25)->withQueryString();

        return Inertia::render('Admin/Subscribers/Index', [
            'subscribers'  => $subscribers,
            'activeCount'  => Subscriber::active()->count(),
            'totalCount'   => Subscriber::count(),
        ]);
    }

    public function destroy(Subscriber $subscriber): RedirectResponse
    {
        $subscriber->delete();
        return back()->with('success', 'Subscriber deleted.');
    }

    public function export(): Response
    {
        $csv = "Name,Email,Status,Subscribed At\n";
        Subscriber::active()->orderBy('created_at')->each(function ($s) use (&$csv) {
            $csv .= "\"{$s->name}\",\"{$s->email}\",\"{$s->status}\",\"{$s->created_at}\"\n";
        });

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="subscribers.csv"',
        ]);
    }
}
