import React from 'react';
import {
    FaGauge, FaUsers, FaHandsPraying, FaCalendarDays,
    FaBullhorn, FaShield, FaChurch, FaChevronLeft,
    FaChevronRight, FaUserGear,
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
                roles: ['super_admin', 'parish_admin', 'clergymen'],
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
                id:    'parishioners',
                label: 'Parishioners',
                icon:  FaUsers,
                href:  '/admin/parishioners',
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
                id:    'announcements',
                label: 'Announcements',
                icon:  FaBullhorn,
                href:  '/admin/announcements',
                badge: null,
                roles: ['super_admin', 'parish_admin'],
            },
        ],
    },
    {
        section: 'System',
        items: [
            {
                id:    'roles',
                label: 'Roles & Permissions',
                icon:  FaShield,
                href:  '/admin/roles',
                badge: null,
                roles: ['super_admin'],
            },
        ],
    },
];

function NavItem({ item, collapsed, stats }) {
    const { label, icon: Icon, href, badge } = item;
    const isActive   = window.location.pathname === href;
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

export default function Sidebar({ collapsed, onToggle, stats, userRole }) {
    return (
        <aside className={`admin-sidebar${collapsed ? ' collapsed' : ''}`}>

            <a href="/admin/dashboard" className="sidebar-brand">
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