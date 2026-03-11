import React from 'react';
import {
    FaGauge, FaHandsPraying, FaCalendarDays,
    FaBullhorn, FaChurch, FaChevronLeft,
    FaChevronRight, FaUserGear, FaWandMagicSparkles,
    FaRightFromBracket, FaPersonPraying, FaBookOpen,
    FaCalendarCheck, FaTowerBroadcast, FaMapLocationDot,
} from 'react-icons/fa6';

const NAV_SECTIONS = [
    {
        section: 'Main',
        items: [
            {
                id:    'dashboard',
                label: 'Dashboard',
                icon:  FaGauge,
                href:  '/admin/dashboard',
                badge: null,
                roles: ['super_admin', 'parish_admin'],
            },
            {
                id:    'clergy-dashboard',
                label: 'My Assignments',
                icon:  FaPersonPraying,
                href:  '/admin/clergy-dashboard',
                badge: null,
                roles: ['clergymen'],
            },
        ],
    },
    {
        section: 'Management',
        items: [
            {
                id:    'users',
                label: 'User Management',
                icon:  FaUserGear,
                href:  '/admin/users',
                badge: null,
                roles: ['super_admin'],
            },
            {
                id:    'clergy',
                label: 'Clergy Management',
                icon:  FaChurch,
                href:  '/admin/clergy',
                badge: null,
                roles: ['super_admin'],
            },
            {
                id:    'parishes',
                label: 'Parish Management',
                icon:  FaMapLocationDot,
                href:  '/admin/parishes',
                badge: null,
                roles: ['super_admin'],
            },
            {
                id:    'sacrament-types',
                label: 'Manage Sacraments',
                icon:  FaWandMagicSparkles,
                href:  '/admin/sacrament-types',
                badge: null,
                roles: ['super_admin'],
            },
            {
                id:    'sacraments',
                label: 'Sacrament Requests',
                icon:  FaHandsPraying,
                href:  '/admin/sacraments',
                badge: 'pending',
                roles: ['super_admin', 'parish_admin'],
            },
            {
                id:    'events',
                label: 'Events',
                icon:  FaCalendarDays,
                href:  '/admin/events',
                badge: null,
                roles: ['super_admin', 'parish_admin'],
            },
            {
                id:    'mass-schedules',
                label: 'Mass Schedules',
                icon:  FaCalendarCheck,
                href:  '/admin/mass-schedules',
                badge: null,
                roles: ['super_admin', 'parish_admin'],
            },
            {
                id:    'announcements',
                label: 'Announcements',
                icon:  FaBullhorn,
                href:  '/admin/announcements',
                badge: null,
                roles: ['super_admin', 'parish_admin'],
            },
            {
                id:    'livestreams',
                label: 'Livestreams',
                icon:  FaTowerBroadcast,
                href:  '/admin/livestreams',
                badge: null,
                roles: ['super_admin', 'parish_admin'],
            },
        ],
    },
    {
        section: 'My Ministry',
        items: [
            {
                id:    'clergy-records',
                label: 'Sacramental Records',
                icon:  FaBookOpen,
                href:  '/admin/clergy-dashboard',
                badge: null,
                roles: ['clergymen'],
            },
        ],
    },
];

function NavItem({ item, collapsed, stats }) {
    const { label, icon: Icon, href, badge } = item;
    const isActive   = window.location.pathname === href ||
                       (href === '/admin/clergy-dashboard' && window.location.pathname === '/admin/clergy-dashboard');
    const badgeCount = badge === 'pending'
        ? (stats?.pending_sacrament_requests ?? 0)
        : 0;

    return (
        <a
            href={href}
            className={`sidebar-nav-item${isActive ? ' active' : ''}`}
            title={collapsed ? label : undefined}
            aria-current={isActive ? 'page' : undefined}
        >
            <span className="nav-icon">
                <Icon size={16} aria-hidden="true" />
            </span>
            {!collapsed && (
                <>
                    <span className="nav-label">{label}</span>
                    {badgeCount > 0 && (
                        <span className="nav-badge">{badgeCount}</span>
                    )}
                </>
            )}
        </a>
    );
}

function NavSection({ section, items, collapsed, stats, userRole }) {
    const visible = items.filter(item => item.roles.includes(userRole));
    if (visible.length === 0) return null;

    return (
        <div className="mb-2">
            {!collapsed && <div className="sidebar-section-label">{section}</div>}
            {visible.map(item => (
                <NavItem key={item.id} item={item} collapsed={collapsed} stats={stats} />
            ))}
        </div>
    );
}

export default function Sidebar({ collapsed, mobileOpen, onToggle, onMobileClose, stats, userRole }) {
    const sidebarClass = [
        'admin-sidebar',
        collapsed   ? 'collapsed'    : '',
        mobileOpen  ? 'mobile-open'  : '',
    ].filter(Boolean).join(' ');

    return (
        <aside className={sidebarClass}>

            <a href={userRole === 'clergymen' ? '/admin/clergy-dashboard' : '/admin/dashboard'} className="sidebar-brand">
                <div className="sidebar-brand__icon">
                    <FaChurch size={20} color="#1a3c5e" aria-hidden="true" />
                </div>
                {!collapsed && (
                    <span className="sidebar-brand__text">
                        Bethel<span>App</span>
                    </span>
                )}
            </a>

            <nav className="sidebar-nav" aria-label="Admin navigation">
                {NAV_SECTIONS.map(s => (
                    <NavSection
                        key={s.section}
                        section={s.section}
                        items={s.items}
                        collapsed={collapsed}
                        stats={stats}
                        userRole={userRole}
                    />
                ))}
            </nav>

            <div className="sidebar-footer">
                <form method="POST" action="/logout" style={{ marginBottom: '0.5rem' }}>
                    <input
                        type="hidden"
                        name="_token"
                        value={document.querySelector('meta[name="csrf-token"]')?.content}
                    />
                    <button
                        type="submit"
                        className="sidebar-nav-item"
                        title={collapsed ? 'Sign Out' : undefined}
                        style={{ width: '100%', color: '#ef4444' }}
                    >
                        <span className="nav-icon">
                            <FaRightFromBracket size={16} aria-hidden="true" />
                        </span>
                        {!collapsed && <span className="nav-label">Sign Out</span>}
                    </button>
                </form>

                <button
                    className="sidebar-collapse-btn"
                    onClick={onToggle}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    type="button"
                >
                    {collapsed
                        ? <FaChevronRight size={13} aria-hidden="true" />
                        : <><FaChevronLeft size={13} aria-hidden="true" /><span>Collapse</span></>
                    }
                </button>
            </div>
        </aside>
    );
}