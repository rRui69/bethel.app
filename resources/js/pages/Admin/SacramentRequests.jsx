import React, { useState, useEffect, useMemo } from 'react';
import { FaCheck, FaXmark, FaMagnifyingGlass, FaHandsPraying, FaX } from 'react-icons/fa6';

// ── Helpers ───────────────────────────────────────────────────

function StatusBadge({ status }) {
    return (
        <span className={`sr-status-badge sr-status-badge--${status}`}>
            {status}
        </span>
    );
}

// Converts a snake_case or camelCase key to a readable label
// e.g. "child_name" → "Child Name", "godparents" → "Godparents"
function humanize(key) {
    return key
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, c => c.toUpperCase());
}

// ── Detail Modal ──────────────────────────────────────────────

function SacramentRequestDetailModal({ requestId, onClose, onStatusChange }) {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving]   = useState(false);
    const [notes, setNotes]     = useState('');
    const [notesEdited, setNotesEdited] = useState(false);

    useEffect(() => {
        axios.get(`/admin/api/sacrament-requests/${requestId}`)
            .then(r => {
                setData(r.data);
                setNotes(r.data.admin_notes ?? '');
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [requestId]);

    const handleStatusChange = async (newStatus) => {
        if (!confirm(`Mark this request as ${newStatus}?`)) return;
        setSaving(true);
        try {
            await axios.patch(`/admin/api/sacrament-requests/${requestId}`, {
                status:      newStatus,
                admin_notes: notes,
            });
            setData(prev => ({ ...prev, status: newStatus, admin_notes: notes }));
            setNotesEdited(false);
            if (onStatusChange) onStatusChange(requestId, newStatus);
        } catch (e) {
            alert('Failed to update status.');
        } finally {
            setSaving(false);
        }
    };

    const saveNotes = async () => {
        setSaving(true);
        try {
            await axios.patch(`/admin/api/sacrament-requests/${requestId}`, {
                status:      data.status,
                admin_notes: notes,
            });
            setData(prev => ({ ...prev, admin_notes: notes }));
            setNotesEdited(false);
        } catch (e) {
            alert('Failed to save notes.');
        } finally {
            setSaving(false);
        }
    };

    // Extract initials from requester name for the avatar
    const initials = data?.requester?.name
        ? data.requester.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
        : '?';

    return (
        <div className="um-overlay" onClick={onClose}>
            <div className="um-modal um-modal--wide" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="um-modal__header">
                    {loading ? (
                        <p className="um-modal__title">Loading…</p>
                    ) : (
                        <div className="um-modal__header-info">
                            <div className="um-avatar um-avatar--lg" style={{ background: 'rgba(200,151,58,0.15)', color: '#c8973a' }}>
                                <FaHandsPraying size={20} />
                            </div>
                            <div>
                                <h2 className="um-modal__title">{data?.sacrament_type} Request</h2>
                                <p className="um-modal__sub">
                                    {data?.requester?.name} · Submitted {data?.submitted_at}
                                </p>
                            </div>
                        </div>
                    )}
                    <button className="um-modal__close" onClick={onClose}>
                        <FaX size={12} />
                    </button>
                </div>

                {/* Body */}
                <div className="um-modal__body um-modal__body--scroll-tall">
                    {loading ? (
                        <div className="um-modal-loading">Loading…</div>
                    ) : data ? (
                        <>
                            {/* Status + Parish row */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                                <StatusBadge status={data.status} />
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    {data.parish?.name}{data.parish?.city ? ` — ${data.parish.city}` : ''}
                                </span>
                            </div>

                            {/* Request Info */}
                            <div className="um-section-label" style={{ marginBottom: '0.5rem' }}>Request Details</div>
                            <div className="um-detail-grid">
                                {[
                                    ['Sacrament Type',  data.sacrament_type],
                                    ['Preferred Date',  data.preferred_date],
                                    ['Parish',          data.parish?.name ?? '—'],
                                    ['Parish City',     data.parish?.city ?? '—'],
                                ].map(([label, val]) => (
                                    <div key={label} className="um-detail-row">
                                        <span className="um-detail-label">{label}</span>
                                        <span className="um-detail-value">{val}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Requester Info */}
                            <div className="um-section-label" style={{ margin: '1.25rem 0 0.5rem' }}>Parishioner</div>
                            <div className="um-detail-grid">
                                {[
                                    ['Name',     data.requester?.name ?? '—'],
                                    ['Email',    data.requester?.email ?? '—'],
                                    ['Phone',    data.requester?.phone ?? '—'],
                                    ['City',     data.requester?.city ?? '—'],
                                    ['Barangay', data.requester?.barangay ?? '—'],
                                ].map(([label, val]) => (
                                    <div key={label} className="um-detail-row">
                                        <span className="um-detail-label">{label}</span>
                                        <span className="um-detail-value">{val}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Dynamic Details (from the details JSON column) */}
                            {data.details && Object.keys(data.details).length > 0 && (
                                <>
                                    <div className="um-section-label" style={{ margin: '1.25rem 0 0.5rem' }}>
                                        Submitted Information
                                    </div>
                                    <div className="um-detail-grid">
                                        {Object.entries(data.details).map(([key, val]) => (
                                            <div key={key} className="um-detail-row">
                                                <span className="um-detail-label">{humanize(key)}</span>
                                                <span className="um-detail-value">{val || '—'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Admin Notes */}
                            <div className="um-section-label" style={{ margin: '1.25rem 0 0.5rem' }}>Admin Notes</div>
                            <textarea
                                className="um-input"
                                rows={3}
                                style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.85rem' }}
                                placeholder="Add internal notes for this request (optional)…"
                                value={notes}
                                onChange={e => { setNotes(e.target.value); setNotesEdited(true); }}
                            />
                        </>
                    ) : (
                        <div className="um-modal-loading">Request not found.</div>
                    )}
                </div>

                {/* Footer */}
                <div className="um-modal__footer">
                    <button className="um-btn um-btn--outline" onClick={onClose} disabled={saving}>
                        Close
                    </button>

                    {data && notesEdited && (
                        <button className="um-btn um-btn--outline" onClick={saveNotes} disabled={saving}>
                            {saving ? 'Saving…' : 'Save Notes'}
                        </button>
                    )}

                    {data?.status === 'pending' && (
                        <>
                            <button
                                className="um-btn um-btn--danger"
                                onClick={() => handleStatusChange('rejected')}
                                disabled={saving}
                            >
                                <FaXmark size={11} /> Reject
                            </button>
                            <button
                                className="um-btn um-btn--success"
                                onClick={() => handleStatusChange('approved')}
                                disabled={saving}
                            >
                                <FaCheck size={11} /> Approve
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────

export default function SacramentRequests({ onStatsRefresh }) {
    const [requests, setRequests]           = useState([]);
    const [loading, setLoading]             = useState(true);
    const [search, setSearch]               = useState('');
    const [statusFilter, setStatusFilter]   = useState('all');
    const [detailRequestId, setDetailRequestId] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await axios.get('/admin/api/sacrament-requests');
            const data = response.data.data ?? response.data;
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching sacrament requests:', error);
        } finally {
            setLoading(false);
        }
    };

    // Called by both the table action buttons AND the modal's approve/reject buttons
    const handleStatusChange = async (id, newStatus, fromModal = false) => {
        if (!fromModal && !confirm(`Mark this request as ${newStatus}?`)) return;

        try {
            if (!fromModal) {
                await axios.patch(`/admin/api/sacrament-requests/${id}`, { status: newStatus });
            }
            // Update row in local state so table reflects the change immediately
            setRequests(prev =>
                prev.map(req => req.id === id ? { ...req, status: newStatus } : req)
            );
            if (onStatsRefresh) onStatsRefresh();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    // Called by the modal after it does its own PATCH — we just sync local state
    const handleModalStatusChange = (id, newStatus) => {
        handleStatusChange(id, newStatus, true);
    };

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const matchesStatus =
                statusFilter === 'all' || req.status === statusFilter;

            const haystack = [
                req.requester_name  ?? '',
                req.requester_email ?? '',
                req.sacrament_type  ?? '',
            ].join(' ').toLowerCase();

            const matchesSearch =
                search === '' || haystack.includes(search.toLowerCase());

            return matchesStatus && matchesSearch;
        });
    }, [requests, search, statusFilter]);

    return (
        <>
            {/* Page Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-header__title">Sacrament Requests</h1>
                    <p className="admin-page-header__sub">
                        Review, approve, or reject parishioner sacrament requests.
                    </p>
                </div>
            </div>

            {/* Table Card */}
            <div className="admin-table-card">

                {/* Toolbar */}
                <div className="um-toolbar">
                    <div className="um-search-wrap">
                        <FaMagnifyingGlass size={12} className="um-search-icon" />
                        <input
                            type="text"
                            className="um-search-input"
                            placeholder="Search by name, email, or type..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <select
                        className="um-filter-select"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Parishioner</th>
                                <th>Type</th>
                                <th>Preferred Date</th>
                                <th>Status</th>
                                <th>Submitted</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="um-table-empty">
                                        Loading requests...
                                    </td>
                                </tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="um-table-empty">
                                        No requests found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((req, i) => (
                                    <tr
                                        key={req.id}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setDetailRequestId(req.id)}
                                    >
                                        <td className="um-table-num">{i + 1}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                                {req.requester_name ?? 'Unknown'}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                                {req.requester_email}
                                            </div>
                                        </td>
                                        <td>{req.sacrament_type}</td>
                                        <td>{req.preferred_date ?? 'N/A'}</td>
                                        <td>
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td>{req.created_at}</td>
                                        <td
                                            style={{ textAlign: 'right' }}
                                            onClick={e => e.stopPropagation()} // prevent row click when using action buttons
                                        >
                                            {req.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                                    <button
                                                        className="sr-action-btn sr-action-btn--approve"
                                                        title="Approve"
                                                        onClick={() => handleStatusChange(req.id, 'approved')}
                                                    >
                                                        <FaCheck size={11} />
                                                    </button>
                                                    <button
                                                        className="sr-action-btn sr-action-btn--reject"
                                                        title="Reject"
                                                        onClick={() => handleStatusChange(req.id, 'rejected')}
                                                    >
                                                        <FaXmark size={11} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {detailRequestId && (
                <SacramentRequestDetailModal
                    requestId={detailRequestId}
                    onClose={() => setDetailRequestId(null)}
                    onStatusChange={handleModalStatusChange}
                />
            )}
        </>
    );
}