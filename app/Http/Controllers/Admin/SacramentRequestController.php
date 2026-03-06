<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\AdminBaseController;
use App\Models\SacramentRequest;
use Illuminate\Http\Request;

class SacramentRequestController extends AdminBaseController
{
    public function page()
    {
        $adminData = $this->adminShellData();
        return view('admin.sacrament-requests', compact('adminData'));
    }

    public function stats()
    {
        return response()->json([
            'pending' => SacramentRequest::where('status', 'pending')->count(),
        ]);
    }

    public function index(Request $request)
    {
        $query = SacramentRequest::with('user:id,first_name,last_name,email');

        $sort      = in_array($request->sort, ['created_at', 'sacrament_type', 'status']) ? $request->sort : 'created_at';
        $direction = $request->direction === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sort, $direction);

        $requests = $query->paginate($request->input('limit', 10))->through(fn ($req) => [
            'id'              => $req->id,
            'requester_name'  => $req->user?->full_name ?? 'Unknown',
            'requester_email' => $req->user?->email ?? '',
            'sacrament_type'  => $req->sacrament_type,
            'preferred_date'  => $req->preferred_date ? $req->preferred_date->format('M d, Y') : 'N/A',
            'status'          => strtolower($req->status),
            'created_at'      => $req->created_at->format('M d, Y'),
        ]);

        return response()->json($requests);
    }

    public function show(SacramentRequest $sacramentRequest)
    {
        $sacramentRequest->load([
            'user:id,first_name,last_name,email,phone,city,barangay',
            'parish:id,name,city',
        ]);

        return response()->json([
            'id'              => $sacramentRequest->id,
            'sacrament_type'  => $sacramentRequest->sacrament_type,
            'preferred_date'  => $sacramentRequest->preferred_date
                                    ? $sacramentRequest->preferred_date->format('F d, Y — g:i A')
                                    : 'Not specified',
            'status'          => strtolower($sacramentRequest->status),
            'admin_notes'     => $sacramentRequest->admin_notes,
            'submitted_at'    => $sacramentRequest->created_at->format('F d, Y g:i A'),
            'details'         => $sacramentRequest->details ?? [],

            'requester' => [
                'name'     => $sacramentRequest->user?->full_name ?? 'Unknown',
                'email'    => $sacramentRequest->user?->email ?? '—',
                'phone'    => $sacramentRequest->user?->phone ?? '—',
                'city'     => $sacramentRequest->user?->city ?? '—',
                'barangay' => $sacramentRequest->user?->barangay ?? '—',
            ],

            'parish' => [
                'name' => $sacramentRequest->parish?->name ?? '—',
                'city' => $sacramentRequest->parish?->city ?? '—',
            ],
        ]);
    }

    public function update(Request $request, SacramentRequest $sacramentRequest)
    {
        $validated = $request->validate([
            'status'      => 'required|in:pending,approved,rejected',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $sacramentRequest->update([
            'status'      => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? $sacramentRequest->admin_notes,
        ]);

        return response()->json([
            'id'          => $sacramentRequest->id,
            'status'      => $sacramentRequest->status,
            'admin_notes' => $sacramentRequest->admin_notes,
        ]);
    }
}