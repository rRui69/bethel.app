<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SacramentRequest;
use Illuminate\Http\Request;

class SacramentRequestController extends Controller
{
    public function page()
    {
        return view('admin.sacrament-requests');
    }

    public function index()
    {
        $requests = SacramentRequest::with('user:id,first_name,last_name,email')
            ->latest()
            ->get();

        return response()->json($requests);
    }

    public function update(Request $request, SacramentRequest $sacramentRequest)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $sacramentRequest->update($validated);

        return response()->json($sacramentRequest);
    }
}