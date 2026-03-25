import React from 'react';
import StatCards          from './StatCards';
import ParishTable        from './ParishTable';
import ParishAdminDashboard from './ParishAdminDashboard';

export default function Dashboard({
    stats,
    parishes,
    admin,
    paymentStats,
    userStats,
    recentPayments,
    recentUsers,
}) {
    // ── Ministerial Head IT Admin gets their own dedicated dashboard ──────────
    if (admin?.role === 'parish_admin') {
        return (
            <ParishAdminDashboard
                admin={admin}
                stats={stats}
                paymentStats={paymentStats}
                userStats={userStats}
                recentPayments={recentPayments}
                recentUsers={recentUsers}
            />
        );
    }

    // ── Default: Diocesan Admin + Helpdesk overview ───────────────────────────
    return (
        <div>
            <div className="admin-page-header">
                <h1 className="admin-page-header__title">Dashboard Overview</h1>
                <p className="admin-page-header__sub">
                    {new Date().toLocaleDateString('en-US', {
                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    })}
                </p>
            </div>

            <StatCards stats={stats} />
            <ParishTable parishes={parishes} />
        </div>
    );
}
