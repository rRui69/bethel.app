import React, { useState, useCallback } from 'react';
import { ThemeProvider }  from '@/context/ThemeContext';
import Sidebar            from './Sidebar';
import TopNav             from './TopNav';
import Dashboard          from './Dashboard/Dashboard';
import UserManagement     from './UserManagement/UserManagement';
import AnnouncementManagement from '../Announcements/AnnouncementManagement';
import EventManagement    from '../Events/EventManagement';
import SacramentRequests  from './SacramentRequests';
import SacramentTypes     from './SacramentTypes/SacramentTypes';
import ClergyManagement   from './Clergy/ClergyManagement';
import ClergyDashboard    from '../Clergy/ClergyDashboard';

// Page router — add new admin pages here
const PAGE_MAP = {
    '/admin/dashboard':            Dashboard,
    '/admin/users':                UserManagement,
    '/admin/announcements':        AnnouncementManagement,
    '/admin/announcements/create': AnnouncementManagement,
    '/admin/events':               EventManagement,
    '/admin/events/create':        EventManagement,
    '/admin/sacraments':           SacramentRequests,
    '/admin/sacrament-types':      SacramentTypes,
    '/admin/clergy':               ClergyManagement,
    '/admin/clergy-dashboard':     ClergyDashboard,
};

export default function AdminApp({ stats: initialStats, admin, parishes, notifications, clergy }) {
    const [collapsed,    setCollapsed]    = useState(false);
    const [mobileOpen,   setMobileOpen]   = useState(false);

    const [stats, setStats] = useState(initialStats ?? {});

    const refreshSacramentStats = useCallback(async () => {
        try {
            const { data } = await axios.get('/admin/api/sacrament-requests/stats');
            setStats(prev => ({ ...prev, pending_sacrament_requests: data.pending }));
        } catch (e) {
            console.error('Failed to refresh sacrament stats:', e);
        }
    }, []);

    const closeMobileSidebar = useCallback(() => setMobileOpen(false), []);

    const CurrentPage = PAGE_MAP[window.location.pathname] || Dashboard;

    return (
        <ThemeProvider>
            <div className="admin-shell">

                <Sidebar
                    collapsed={collapsed}
                    mobileOpen={mobileOpen}
                    onToggle={() => setCollapsed(c => !c)}
                    onMobileClose={closeMobileSidebar}
                    stats={stats}
                    userRole={admin?.role}
                />

                {/* Mobile overlay — clicking outside closes sidebar */}
                {mobileOpen && (
                    <div
                        className="sidebar-overlay"
                        onClick={closeMobileSidebar}
                        aria-hidden="true"
                    />
                )}

                <div className={`admin-main${collapsed ? ' sidebar-collapsed' : ''}`}>

                    <TopNav
                        collapsed={collapsed}
                        admin={admin}
                        notifications={notifications}
                        onMobileMenuToggle={() => setMobileOpen(o => !o)}
                    />

                    <main className="admin-content">
                        <CurrentPage
                            stats={stats}
                            parishes={parishes}
                            admin={admin}
                            clergy={clergy}
                            onStatsRefresh={refreshSacramentStats}
                        />
                    </main>

                </div>

            </div>
        </ThemeProvider>
    );
}