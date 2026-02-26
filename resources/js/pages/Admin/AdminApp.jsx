import React, { useState } from 'react';
import { ThemeProvider }  from '@/context/ThemeContext';
import Sidebar            from './Sidebar';
import TopNav             from './TopNav';
import Dashboard          from './Dashboard/Dashboard';
import UserManagement     from './UserManagement/UserManagement';

// ── Page router ───────────────────────────────────────────────
// Add new admin pages here as you build them.
const PAGE_MAP = {
    '/admin/dashboard': Dashboard,
    '/admin/users':     UserManagement,
};

export default function AdminApp({ stats, admin, parishes, notifications }) {
    const [collapsed, setCollapsed] = useState(false);

    const CurrentPage = PAGE_MAP[window.location.pathname] || Dashboard;

    return (
        <ThemeProvider>
            <div className="admin-shell">

                <Sidebar
                    collapsed={collapsed}
                    onToggle={() => setCollapsed(c => !c)}
                    stats={stats}
                    userRole={admin?.role}
                />

                <div className={`admin-main${collapsed ? ' sidebar-collapsed' : ''}`}>

                    <TopNav
                        collapsed={collapsed}
                        admin={admin}
                        notifications={notifications}
                    />

                    <main className="admin-content">
                        <CurrentPage stats={stats} parishes={parishes} admin={admin} />
                    </main>

                </div>

            </div>
        </ThemeProvider>
    );
}