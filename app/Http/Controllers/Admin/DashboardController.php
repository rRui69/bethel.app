<?php

namespace App\Http\Controllers\Admin;

use App\Models\Parish;
use Illuminate\Http\Request;

class DashboardController extends AdminBaseController
{
    public function index(Request $request)
    {
        $adminData = $this->adminShellData();
        $user = auth()->user();

        // 1. Base query to fetch parishes and their pending sacramental requests
        $query = Parish::select('id', 'name', 'city', 'status')
            ->withCount([
                'events as pending_requests' => fn ($q) => $q->sacramental()->pending(),
            ]);

        // 2. SECURITY: Tenant Isolation
        // If the user is not a super_admin, lock the dashboard to their specific parish
        if (!$user->isSuperAdmin()) {
            $query->where('id', $user->parish_id);
        }

        // 3. Execute and map the data
        $adminData['parishes'] = $query->orderBy('name')
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