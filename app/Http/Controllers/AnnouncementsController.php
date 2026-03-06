<?php

namespace App\Http\Controllers;

use App\Models\Announcement;

class AnnouncementsController extends Controller
{
    public function index()
    {
        $announcements = Announcement::published()
            ->with('parish:id,name')
            ->select('id', 'parish_id', 'title', 'excerpt', 'body', 'category', 'published_at')
            ->latest('published_at')
            ->get()
            ->map(fn ($a) => [
                'id'       => $a->id,
                'title'    => $a->title,
                'excerpt'  => $a->excerpt,
                'body'     => $a->body,
                'category' => $a->category,
                'parish'   => $a->parish?->name,
                'date'     => $a->published_at?->format('M d, Y'),
            ])
            ->toArray();

        $pageData = [
            'announcements' => $announcements,
            'categories'    => ['All', 'Parish News', 'Community', 'Liturgy', 'Youth', 'General'],
        ];

        return view('parishioner.announcements', compact('pageData'));
    }

    public function show(Announcement $announcement)
    {
        abort_unless($announcement->status === 'Published', 404);

        $pageData = [
            'announcement' => [
                'id'       => $announcement->id,
                'title'    => $announcement->title,
                'excerpt'  => $announcement->excerpt,
                'body'     => $announcement->body,
                'category' => $announcement->category,
                'parish'   => $announcement->parish?->name,
                'date'     => $announcement->published_at?->format('M d, Y'),
            ],
        ];

        return view('parishioner.announcement-detail', compact('pageData'));
    }
}