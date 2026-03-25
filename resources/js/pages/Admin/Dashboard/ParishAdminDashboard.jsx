import React from 'react';
import {
    FaUsers, FaUserCheck, FaUserXmark,
    FaHandsPraying, FaCircleCheck, FaClock,
    FaCircleXmark, FaPesoSign,
    FaArrowRight, FaUserPlus,
} from 'react-icons/fa6';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n) {
    return Number(n ?? 0).toLocaleString();
}

function currency(n) {
    return '₱' + Number(n ?? 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, iconBg, iconColor, accent, link, linkText }) {
    return (
        <div className="col-lg-3 col-md-6">
            <div className="admin-stat-card" style={{ '--card-accent': accent }}>
                <div className="d-flex flex-column align-items-center justify-content-center text-center"
                    style={{ minHeight: '120px' }}>
                    <div className="stat-card__icon mb-2" style={{ background: iconBg }}>
                        <Icon size={48} color={iconColor} />
                    </div>
                    <div className="stat-card__value">{value}</div>
                    <div className="stat-card__label">{label}</div>
                </div>
                {link && (
                    <div className="stat-card__action">
                        <a href={link} className="stat-card__link">
                            {linkText} <FaArrowRight size={10} />
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Payment Status Badge ─────────────────────────────────────────────────────

const STATUS_MAP = {
    pending:  { label: 'Pending',  cls: 'warning' },
    verified: { label: 'Verified', cls: 'active'  },
    rejected: { label: 'Rejected', cls: 'inactive' },
};

function PaymentBadge({ status }) {
    const { label, cls } = STATUS_MAP[status] ?? { label: status, cls: 'inactive' };
    return (
        <span className={`status-badge ${cls}`} style={{ fontSize: '0.72rem' }}>
            {label}
        </span>
    );
}

// ─── Recent Payments Table ────────────────────────────────────────────────────

function RecentPaymentsTable({ payments = [] }) {
    return (
        <div className="admin-table-card">
            <div className="admin-table-card__header">
                <span className="admin-table-card__title">Recent Payment Submissions</span>
                <a
                    href="/admin/sacraments"
                    style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                    View All Requests <FaArrowRight size={10} />
                </a>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Parishioner</th>
                            <th>Sacrament</th>
                            <th>Method</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Submitted</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    No payment submissions yet.
                                </td>
                            </tr>
                        ) : (
                            payments.map((p, i) => (
                                <tr key={p.id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        {String(i + 1).padStart(2, '0')}
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                            {p.parishioner}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                                        {p.sacrament_type}
                                    </td>
                                    <td>
                                        <span style={{
                                            fontSize: '0.78rem',
                                            padding: '0.2rem 0.5rem',
                                            borderRadius: '999px',
                                            background: 'var(--bg-input)',
                                            color: 'var(--text-secondary)',
                                            fontWeight: 500,
                                            textTransform: 'capitalize',
                                        }}>
                                            {p.method ?? '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                            {p.amount ? `₱${p.amount}` : '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <PaymentBadge status={p.status} />
                                    </td>
                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {p.submitted_at}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Recent Users Table ───────────────────────────────────────────────────────

function RecentUsersTable({ users = [] }) {
    return (
        <div className="admin-table-card">
            <div className="admin-table-card__header">
                <span className="admin-table-card__title">Recent Parishioner Registrations</span>
                <a
                    href="/admin/users"
                    style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                    Manage Users <FaArrowRight size={10} />
                </a>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    No parishioners registered yet.
                                </td>
                            </tr>
                        ) : (
                            users.map((u, i) => (
                                <tr key={u.id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        {String(i + 1).padStart(2, '0')}
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                            {u.name}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                                        {u.email}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${u.account_status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}
                                            style={{ fontSize: '0.72rem' }}>
                                            {u.account_status}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {u.joined}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ParishAdminDashboard({
    admin,
    stats,
    paymentStats,
    userStats,
    recentPayments = [],
    recentUsers    = [],
}) {
    const ps = paymentStats ?? {};
    const us = userStats    ?? {};

    return (
        <div>
            {/* Page Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-header__title">Ministerial Head IT Admin Dashboard</h1>
                    <p className="admin-page-header__sub">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                        })}
                    </p>
                </div>
            </div>

            {/* ── Section: User Statistics ──────────────────────────────── */}
            <div style={{ marginBottom: '0.4rem' }}>
                <h2 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                    User Overview
                </h2>
            </div>

            <div className="row g-3 mb-4">
                <StatCard
                    label="Total Parishioners"
                    value={fmt(us.parishioners)}
                    icon={FaUsers}
                    iconBg="rgba(59,130,246,0.15)"
                    iconColor="#3b82f6"
                    accent="#3b82f6"
                    link="/admin/users"
                    linkText="Manage Users"
                />
                <StatCard
                    label="Active Accounts"
                    value={fmt(us.active)}
                    icon={FaUserCheck}
                    iconBg="rgba(16,185,129,0.15)"
                    iconColor="#10b981"
                    accent="#10b981"
                    link="/admin/users"
                    linkText="View Active"
                />
                <StatCard
                    label="Inactive / Suspended"
                    value={fmt(us.inactive)}
                    icon={FaUserXmark}
                    iconBg="rgba(239,68,68,0.12)"
                    iconColor="#ef4444"
                    accent="#ef4444"
                    link="/admin/users"
                    linkText="Review Accounts"
                />
                <StatCard
                    label="Clergy Members"
                    value={fmt(us.clergy)}
                    icon={FaHandsPraying}
                    iconBg="rgba(200,151,58,0.15)"
                    iconColor="#c8973a"
                    accent="#c8973a"
                    link="/admin/clergy"
                    linkText="View Clergy"
                />
            </div>

            {/* ── Section: Payment & Financial Tracker ─────────────────── */}
            <div style={{ marginBottom: '0.4rem' }}>
                <h2 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                    Payment & Financial Tracker
                </h2>
            </div>

            <div className="row g-3 mb-4">
                <StatCard
                    label="Total Payment Submissions"
                    value={fmt(ps.total)}
                    icon={FaHandsPraying}
                    iconBg="rgba(99,102,241,0.15)"
                    iconColor="#6366f1"
                    accent="#6366f1"
                    link="/admin/sacraments"
                    linkText="View All Requests"
                />
                <StatCard
                    label="Pending Verification"
                    value={fmt(ps.pending)}
                    icon={FaClock}
                    iconBg="rgba(245,158,11,0.15)"
                    iconColor="#f59e0b"
                    accent="#f59e0b"
                    link="/admin/sacraments"
                    linkText="Verify Now"
                />
                <StatCard
                    label="Verified Payments"
                    value={fmt(ps.verified)}
                    icon={FaCircleCheck}
                    iconBg="rgba(16,185,129,0.15)"
                    iconColor="#10b981"
                    accent="#10b981"
                    link="/admin/sacraments"
                    linkText="View Verified"
                />
                <StatCard
                    label="Total Collected"
                    value={currency(ps.total_collected)}
                    icon={FaPesoSign}
                    iconBg="rgba(200,151,58,0.15)"
                    iconColor="#c8973a"
                    accent="#c8973a"
                    link="/admin/sacraments"
                    linkText="Payment Records"
                />
            </div>

            {/* ── Section: Tables ──────────────────────────────────────── */}
            <div className="row g-3">
                <div className="col-12">
                    <RecentPaymentsTable payments={recentPayments} />
                </div>
                <div className="col-12">
                    <RecentUsersTable users={recentUsers} />
                </div>
            </div>
        </div>
    );
}
