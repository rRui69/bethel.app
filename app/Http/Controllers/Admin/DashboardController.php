<?php

namespace App\Http\Controllers\Admin;

use App\Models\Parish;
use App\Models\User;
use App\Models\RequestPayment;
use App\Models\SacramentRequest;
use Illuminate\Http\Request;

class DashboardController extends AdminBaseController
{
    public function index(Request $request)
    {
        $adminData = $this->adminShellData();
        $user      = auth()->user();

        // ─── Branch: Ministerial Head IT Admin ────────────────────────────────
        // parish_admin gets a dedicated payment & user-focused dashboard payload.
        // The React layer will detect admin.role === 'parish_admin' and render
        // ParishAdminDashboard instead of the default Diocesan overview.
        if ($user->isParishAdmin()) {
            $parishId = $user->parish_id;

            // ── User Statistics (scoped to this parish) ──────────────────────
            $userStats = User::where('parish_id', $parishId)
                ->selectRaw("
                    COUNT(*)                                                        AS total,
                    SUM(CASE WHEN role = 'parishioner' THEN 1 ELSE 0 END)          AS parishioners,
                    SUM(CASE WHEN role = 'clergymen'   THEN 1 ELSE 0 END)          AS clergy,
                    SUM(CASE WHEN role = 'parish_helpdesk' THEN 1 ELSE 0 END)      AS helpdesk,
                    SUM(CASE WHEN account_status = 'Active' THEN 1 ELSE 0 END)     AS active,
                    SUM(CASE WHEN account_status != 'Active' THEN 1 ELSE 0 END)    AS inactive
                ")
                ->first();

            // ── Payment / Financial Statistics ───────────────────────────────
            // Join through sacrament_requests to enforce parish scope.
            $paymentStats = RequestPayment::whereHas(
                    'sacramentRequest',
                    fn ($q) => $q->where('parish_id', $parishId)
                )
                ->selectRaw("
                    COUNT(*)                                                        AS total,
                    SUM(CASE WHEN status = 'pending'  THEN 1 ELSE 0 END)           AS pending,
                    SUM(CASE WHEN status = 'verified' THEN 1 ELSE 0 END)           AS verified,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END)           AS rejected,
                    COALESCE(SUM(CASE WHEN status = 'verified' THEN amount END), 0) AS total_collected
                ")
                ->first();

            // ── Recent Payment Submissions (last 10) ─────────────────────────
            $recentPayments = RequestPayment::with([
                    'user:id,first_name,last_name',
                    'sacramentRequest:id,sacrament_type',
                ])
                ->whereHas(
                    'sacramentRequest',
                    fn ($q) => $q->where('parish_id', $parishId)
                )
                ->latest()
                ->take(10)
                ->get()
                ->map(fn ($p) => [
                    'id'             => $p->id,
                    'parishioner'    => $p->user?->full_name ?? 'Unknown',
                    'sacrament_type' => $p->sacramentRequest?->sacrament_type ?? '—',
                    'method'         => $p->method,
                    'amount'         => $p->amount ? number_format((float) $p->amount, 2) : null,
                    'status'         => $p->status,
                    'submitted_at'   => $p->created_at->format('M d, Y'),
                ])
                ->toArray();

            // ── Recent User Registrations (last 8 parishioners) ──────────────
            $recentUsers = User::where('parish_id', $parishId)
                ->where('role', 'parishioner')
                ->latest()
                ->take(8)
                ->get(['id', 'first_name', 'last_name', 'email', 'account_status', 'created_at'])
                ->map(fn ($u) => [
                    'id'             => $u->id,
                    'name'           => $u->full_name,
                    'email'          => $u->email,
                    'account_status' => $u->account_status,
                    'joined'         => $u->created_at->format('M d, Y'),
                ])
                ->toArray();

            $adminData['payment_stats']  = $paymentStats;
            $adminData['user_stats']     = $userStats;
            $adminData['recent_payments'] = $recentPayments;
            $adminData['recent_users']   = $recentUsers;

            return view('admin.dashboard', compact('adminData'));
        }

        // ─── Default: Diocesan Head IT Admin + Helpdesk overview ──────────────
        // super_admin sees all parishes; others see only their own parish.
        $query = Parish::select('id', 'name', 'city', 'status')
            ->withCount([
                'events as pending_requests' => fn ($q) => $q->sacramental()->pending(),
                'users as users_count',
            ]);

        if (! $user->isSuperAdmin()) {
            $query->where('id', $user->parish_id);
        }

        $adminData['parishes'] = $query->orderBy('name')
            ->get()
            ->map(fn ($parish) => [
                'id'               => $parish->id,
                'name'             => $parish->name,
                'location'         => $parish->city,
                'status'           => $parish->status,
                'parishioners'     => $parish->users_count,
                'pending_requests' => $parish->pending_requests,
            ])
            ->toArray();

        return view('admin.dashboard', compact('adminData'));
    }
}
