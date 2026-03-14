<?php

namespace App\Http\Controllers;

use App\Models\Parish;

class HomeController extends Controller
{
    /**
     * The homepage is now a single search-hero page.
     * All it needs is the list of active parishes for the autocomplete.
     * All other sections (announcements, mass schedules, events, livestreams)
     * now live on the individual parish page at /parish/{id}.
     */
    public function index()
    {
        $parishes = Parish::active()
            ->select('id', 'name', 'city')
            ->orderBy('name')
            ->get()
            ->map(fn ($p) => [
                'id'       => $p->id,
                'name'     => $p->name,
                'location' => $p->city,
            ])
            ->toArray();

        $pageData = compact('parishes');

        return view('parishioner.home', compact('pageData'));
    }
}