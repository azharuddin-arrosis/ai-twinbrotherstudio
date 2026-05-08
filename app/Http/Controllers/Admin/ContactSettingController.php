<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactSettingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/ContactSettings/Index', [
            'settings' => ContactSetting::all(),
        ]);
    }

    public function bulkUpdate(Request $request): RedirectResponse
    {
        $request->validate([
            'settings'         => ['required', 'array'],
            'settings.*.key'   => ['required', 'string', 'exists:contact_settings,key'],
            'settings.*.value' => ['nullable', 'string'],
        ]);

        foreach ($request->settings as ['key' => $key, 'value' => $value]) {
            ContactSetting::where('key', $key)->update(['value' => $value]);
        }

        return back()->with('success', 'Settings updated.');
    }
}
