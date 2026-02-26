import React, { useState } from 'react';
import { FaCircle, FaMagnifyingGlass, FaArrowUpRightFromSquare } from 'react-icons/fa6';

export default function ParishTable({ parishes = [] }) {
    const [search, setSearch] = useState('');

    const filtered = parishes.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-table-card">
            <div className="admin-table-card__header">
                <span className="admin-table-card__title">Parish Status Overview</span>
                <div style={{ position: 'relative' }}>
                    <FaMagnifyingGlass
                        size={12}
                        style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search parishes..."
                        style={{
                            padding: '0.45rem 0.75rem 0.45rem 2rem',
                            background: 'var(--bg-input)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '0.5rem',
                            color: 'var(--text-primary)',
                            fontSize: '0.8rem',
                            outline: 'none',
                            width: '200px',
                        }}
                    />
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Parish Name</th>
                            <th>Location</th>
                            <th>Parishioners</th>
                            <th>Pending Requests</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    No parishes found.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((parish, i) => (
                                <tr key={parish.id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        {String(i + 1).padStart(2, '0')}
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                                            {parish.name}
                                        </span>
                                    </td>
                                    <td>{parish.location}</td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                            {Number(parish.parishioners ?? 0).toLocaleString()}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            fontWeight: 700,
                                            color: parish.pending_requests > 0 ? '#c8973a' : 'var(--text-muted)',
                                        }}>
                                            {parish.pending_requests > 0 ? parish.pending_requests : '—'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${parish.status.toLowerCase()}`}>
                                            <FaCircle size={6} />
                                            {parish.status}
                                        </span>
                                    </td>
                                    <td>
                                        <a
                                            href={`/admin/parishes/${parish.id}`}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.3rem',
                                                fontSize: '0.78rem',
                                                fontWeight: 600,
                                                color: 'var(--admin-accent)',
                                                textDecoration: 'none',
                                            }}
                                        >
                                            View <FaArrowUpRightFromSquare size={10} />
                                        </a>
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