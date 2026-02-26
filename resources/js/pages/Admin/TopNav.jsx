import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaChevronDown, FaUser, FaRightFromBracket,
         FaSun, FaMoon, FaCircle, FaCalendarDays,
         FaUsers, FaGear, FaUserGear, FaHandsPraying,
         FaBullhorn, FaChurch } from 'react-icons/fa6';
import { useTheme } from '@/context/ThemeContext';

// ── Notification URL builder ──────────────────────────────────────────────
// Uses notifiable_type (Laravel model class) + notifiable_id + type
// to construct the correct admin redirect URL.
//
// notifiable_type examples from seeder:
//   "App\Models\Event"   → sacrament/event detail
//   "App\Models\User"    → users page
//   "App\Models\Parish"  → dashboard (no dedicated page yet)
//
function buildNotifUrl(type, notifiableType, notifiableId) {
    const model = notifiableType?.split('\\').pop(); // get last segment: "Event", "User", etc.

    switch (type) {
        case 'request':
            // Sacramental request → sacrament detail page
            return notifiableId ? `/admin/sacraments/${notifiableId}` : '/admin/sacraments';
        case 'user':
            // New user registered / user activity → user management
            return '/admin/users';
        case 'event':
            // Parish event notification → event detail page
            return notifiableId ? `/admin/events/${notifiableId}` : '/admin/events';
        case 'info':
            // General info — resolve by model type
            if (model === 'Parish'       && notifiableId) return `/admin/dashboard`;
            if (model === 'Event'        && notifiableId) return `/admin/events/${notifiableId}`;
            if (model === 'Announcement' && notifiableId) return `/admin/announcements/${notifiableId}`;
            return '/admin/dashboard';
        case 'system':
        default:
            return '/admin/dashboard';
    }
}

// Icon per notification type
const NOTIF_ICONS = {
    request: FaHandsPraying,
    user:    FaUsers,
    event:   FaCalendarDays,
    info:    FaChurch,
    system:  FaGear,
};

const PAGE_TITLES = {
    '/admin/dashboard':    { title: 'Dashboard',           sub: (name) => 'Welcome back, ' + (name || 'Admin') },
    '/admin/users':        { title: 'User Management',     sub: () => 'Manage accounts, roles, and access control' },
    '/admin/parishioners': { title: 'Parishioners',        sub: () => 'Manage registered parishioners' },
    '/admin/sacraments':   { title: 'Sacrament Requests',  sub: () => 'Review and manage requests' },
    '/admin/events':       { title: 'Events',              sub: () => 'Manage parish events' },
    '/admin/announcements':{ title: 'Announcements',       sub: () => 'Post and manage announcements' },
    '/admin/roles':        { title: 'Roles & Permissions', sub: () => 'Manage user access levels' },
};

export default function TopNav({ collapsed, admin, notifications = [] }) {
    const { theme, toggleTheme } = useTheme();
    const [notifOpen, setNotifOpen]     = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifs, setNotifs]           = useState(notifications);
    const notifRef   = useRef(null);
    const profileRef = useRef(null);

    // Sync if parent re-renders with new notifications
    useEffect(() => { setNotifs(notifications); }, [notifications]);

    const unreadCount = notifs.filter(n => !n.read).length;

    // Close dropdowns on outside click
    useEffect(() => {
        const h = (e) => {
            if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    // Mark a single notification as read then navigate
    const handleNotifClick = async (notif) => {
        // Optimistically mark as read in UI
        setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));

        // Fire-and-forget to backend
        window.axios.post('/admin/api/notifications/read', { id: notif.id }).catch(() => {});

        // Navigate
        const url = buildNotifUrl(notif.type, notif.notifiable_type, notif.notifiable_id);
        window.location.href = url;
    };

    const markAllRead = async () => {
        setNotifs(prev => prev.map(n => ({ ...n, read: true })));
        window.axios.post('/admin/api/notifications/read').catch(() => {});
    };

    const initials = admin?.name
        ? admin.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : 'SA';

    const path   = window.location.pathname;
    const pageCfg = PAGE_TITLES[path] || { title: 'Admin', sub: () => 'BethelApp' };
    const firstName = admin?.name?.split(' ')[0] || 'Admin';

    return (
        <header className={`admin-topnav ${collapsed ? 'sidebar-collapsed' : ''}`}>

            {/* Breadcrumb */}
            <div className="topnav-breadcrumb">
                <div className="topnav-breadcrumb__page">{pageCfg.title}</div>
                <div className="topnav-breadcrumb__path">{pageCfg.sub(firstName)}</div>
            </div>

            {/* Actions */}
            <div className="topnav-actions">

                {/* Theme Toggle */}
                <button className="theme-toggle" onClick={toggleTheme}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                    {theme === 'dark'
                        ? <FaSun  size={15} color="var(--admin-accent)" />
                        : <FaMoon size={15} />
                    }
                </button>

                {/* Notifications */}
                <div ref={notifRef} style={{ position: 'relative' }}>
                    <button className="notif-btn"
                        onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}>
                        <FaBell size={15} />
                        {unreadCount > 0 && (
                            <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                        )}
                    </button>

                    {notifOpen && (
                        <div className="notif-dropdown">
                            <div className="notif-dropdown__header">
                                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                    Notifications
                                </span>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        style={{ fontSize: '0.75rem', color: 'var(--admin-accent)', cursor: 'pointer', fontWeight: 600, background: 'none', border: 'none', padding: 0 }}>
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            {notifs.length === 0 ? (
                                <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                    No notifications
                                </div>
                            ) : notifs.map(n => {
                                const Icon = NOTIF_ICONS[n.type] || FaCircle;
                                const url  = buildNotifUrl(n.type, n.notifiable_type, n.notifiable_id);
                                return (
                                    // Each notification is a real clickable element
                                    <div
                                        key={n.id}
                                        className={`notif-item ${!n.read ? 'unread' : ''}`}
                                        onClick={() => handleNotifClick(n)}
                                        style={{ cursor: 'pointer' }}
                                        title={`Go to ${url}`}
                                    >
                                        {/* Unread indicator dot */}
                                        <div style={{ flexShrink: 0, width: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {!n.read && <div className="notif-dot" />}
                                        </div>

                                        {/* Icon */}
                                        <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-hover)', display: 'grid', placeItems: 'center' }}>
                                            <Icon size={12} style={{ color: 'var(--admin-accent)' }} />
                                        </div>

                                        {/* Text */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: n.read ? 400 : 600, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {n.message}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {n.time}
                                                <span style={{ opacity: 0.5 }}>·</span>
                                                <span style={{ color: 'var(--admin-accent)', fontWeight: 600 }}>{url}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div ref={profileRef} style={{ position: 'relative' }}>
                    <button className="admin-profile-btn"
                        onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}>
                        <div className="admin-avatar">{initials}</div>
                        <span className="admin-profile-name d-none d-md-block">
                            {firstName}
                        </span>
                        <FaChevronDown size={10} style={{ color: 'var(--text-muted)', marginLeft: '2px' }} />
                    </button>

                    {profileOpen && (
                        <div className="profile-dropdown">
                            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{admin?.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{admin?.label}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{admin?.email}</div>
                            </div>
                            <a href="/profile"      className="profile-dropdown__item"><FaUser    size={13} /> My Profile</a>
                            <a href="/admin/users"  className="profile-dropdown__item"><FaUserGear size={13} /> User Management</a>
                            <a href="/admin/settings" className="profile-dropdown__item"><FaGear  size={13} /> Settings</a>
                            <div style={{ borderTop: '1px solid var(--border-color)' }}>
                                <form method="POST" action="/logout">
                                    <input type="hidden" name="_token" value={document.querySelector('meta[name="csrf-token"]')?.content} />
                                    <button type="submit" className="profile-dropdown__item danger" style={{ width: '100%' }}>
                                        <FaRightFromBracket size={13} /> Sign Out
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}