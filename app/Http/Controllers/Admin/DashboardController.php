<?php

namespace App\Http\Controllers\Admin;

use App\Models\Parish;

class DashboardController extends AdminBaseController
{
    public function index()
    {
        // Start with the common shell data
        $adminData = $this->adminShellData();

        // Override parishes with the full table data (dashboard-specific)
        $adminData['parishes'] = Parish::select('id', 'name', 'city', 'status')
            ->withCount([
                'events as pending_requests' => fn ($q) => $q->sacramental()->pending(),
            ])
            ->orderBy('name')
            ->get()
            ->map(fn ($parish) => [
                'id'               => $parish->id,
                'name'             => $parish->name,
                'location'         => $parish->city,
                'status'           => $parish->status,
                'pending_requests' => $parish->pending_requests,
            ])
            ->toArray();

        return view('admin.dashboard', compact('adminData'));
    }
}