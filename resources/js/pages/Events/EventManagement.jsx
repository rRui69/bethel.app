import React, { useState, useEffect, useCallback } from 'react';
import {
    FaCalendarDays, FaPlus, FaMagnifyingGlass, FaPen, FaTrash,
    FaX, FaCheck, FaLocationDot, FaClock, FaChurch,
} from 'react-icons/fa6';

// ── Constants ─────────────────────────────────────────────────────────────────
const EVENT_TYPES = ['Community', 'Liturgy', 'Youth'];
const EVENT_STATUSES = ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'];

const TYPE_COLORS = {
    'Community': 'success',
    'Liturgy':   'warning',
    'Youth':     'info',
};

const STATUS_COLORS = {
    'Approved':  'success',
    'Pending':   'warning',
    'Rejected':  'danger',
    'Completed': 'primary',
    'Cancelled': 'secondary',
};

function useDebounce(value, delay = 350) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

// ── Stat Cards ────────────────────────────────────────────────────────────────
function StatsRow({ stats }) {
    if (!stats) return null;
    const cards = [
        { label: 'Total',     value: stats.total,     color: 'primary' },
        { label: 'Upcoming',  value: stats.upcoming,  color: 'info' },
        { label: 'Approved',  value: stats.approved,  color: 'success' },
        { label: 'Pending',   value: stats.pending,   color: 'warning' },
    ];
    return (
        <div className="row g-3 mb-4">
            {cards.map(c => (
                <div key={c.label} className="col-6 col-md-3">
                    <div className={`card border-${c.color} h-100`}>
                        <div className="card-body text-center py-3">
                            <div className={`fs-2 fw-bold text-${c.color}`}>{c.value ?? '—'}</div>
                            <div className="text-muted small">{c.label}</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Event Modal ───────────────────────────────────────────────────────────────
function EventModal({ mode, event, parishes, clergy, onClose, onSaved }) {
    const isEdit = mode === 'edit';
    const [form, setForm] = useState({
        parish_id:   event?.parish_id   ?? '',
        clergy_id:   event?.clergy_id   ?? '',
        title:       event?.title       ?? '',
        description: event?.description ?? '',
        type:        event?.type        ?? 'Community',
        event_date:  event?.event_date  ?? '',
        start_time:  event?.start_time_raw ?? '',
        end_time:    event?.end_time_raw   ?? '',
        location:    event?.location    ?? '',
        status:      event?.status      ?? 'Approved',
    });
    const [errors,  setErrors]  = useState({});
    const [saving,  setSaving]  = useState(false);
    const [loadingDesc, setLoadingDesc] = useState(isEdit && !event?.description);

    useEffect(() => {
        if (isEdit && !event?.description) {
            window.axios.get(`/admin/api/events/${event.id}`)
                .then(res => {
                    setForm(f => ({ ...f, description: res.data.description ?? '' }));
                    setLoadingDesc(false);
                })
                .catch(() => setLoadingDesc(false));
        }
    }, []);

    const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

    const handleSave = async () => {
        setSaving(true);
        setErrors({});
        try {
            const url    = isEdit ? `/admin/api/events/${event.id}` : '/admin/api/events';
            const method = isEdit ? 'patch' : 'post';
            const payload = { ...form, clergy_id: form.clergy_id || null };
            const res = await window.axios[method](url, payload);
            onSaved(res.data.event, isEdit);
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors ?? {});
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="um-modal-backdrop" onClick={onClose}>
            <div className="um-modal um-modal--wide" onClick={e => e.stopPropagation()}>
                <div className="um-modal__header">
                    <div>
                        <h2 className="um-modal__title">
                            {isEdit ? 'Edit Event' : 'New Event'}
                        </h2>
                        <p className="um-modal__sub">
                            {isEdit ? `Editing: ${event?.title}` : 'Create a new parish event'}
                        </p>
                    </div>
                    <button className="um-modal__close" onClick={onClose} type="button">
                        <FaX size={12} />
                    </button>
                </div>

                <div className="um-modal__body um-modal__body--scroll">
                    {loadingDesc ? (
                        <div className="text-center py-4 text-muted">Loading…</div>
                    ) : (
                        <div className="row g-3">
                            {/* Parish */}
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold">Parish <span className="text-danger">*</span></label>
                                <select
                                    className={`form-select ${errors.parish_id ? 'is-invalid' : ''}`}
                                    value={form.parish_id}
                                    onChange={e => set('parish_id', e.target.value)}
                                >
                                    <option value="">Select parish…</option>
                                    {(parishes ?? []).map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {errors.parish_id && <div className="invalid-feedback">{errors.parish_id[0]}</div>}
                            </div>

                            {/* Clergy */}
                            <div className="col-12 col-md-6">
                                <label className="form-label fw-semibold">Assigned Clergy</label>
                                <select
                                    className="form-select"
                                    value={form.clergy_id}
                                    onChange={e => set('clergy_id', e.target.value)}
                                >
                                    <option value="">Unassigned</option>
                                    {(clergy ?? []).map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Type + Status */}
                            <div className="col-6 col-md-3">
                                <label className="form-label fw-semibold">Type <span className="text-danger">*</span></label>
                                <select
                                    className={`form-select ${errors.type ? 'is-invalid' : ''}`}
                                    value={form.type}
                                    onChange={e => set('type', e.target.value)}
                                >
                                    {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="col-6 col-md-3">
                                <label className="form-label fw-semibold">Status <span className="text-danger">*</span></label>
                                <select
                                    className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                                    value={form.status}
                                    onChange={e => set('status', e.target.value)}
                                >
                                    {EVENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* Date + Times */}
                            <div className="col-12 col-md-4">
                                <label className="form-label fw-semibold">Event Date <span className="text-danger">*</span></label>
                                <input
                                    type="date"
                                    className={`form-control ${errors.event_date ? 'is-invalid' : ''}`}
                                    value={form.event_date}
                                    onChange={e => set('event_date', e.target.value)}
                                />
                                {errors.event_date && <div className="invalid-feedback">{errors.event_date[0]}</div>}
                            </div>
                            <div className="col-6 col-md-3">
                                <label className="form-label fw-semibold">Start Time</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={form.start_time}
                                    onChange={e => set('start_time', e.target.value)}
                                />
                            </div>
                            <div className="col-6 col-md-3">
                                <label className="form-label fw-semibold">End Time</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={form.end_time}
                                    onChange={e => set('end_time', e.target.value)}
                                />
                            </div>

                            {/* Title */}
                            <div className="col-12">
                                <label className="form-label fw-semibold">Title <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                    value={form.title}
                                    onChange={e => set('title', e.target.value)}
                                    placeholder="Event name…"
                                    maxLength={255}
                                />
                                {errors.title && <div className="invalid-feedback">{errors.title[0]}</div>}
                            </div>

                            {/* Location */}
                            <div className="col-12">
                                <label className="form-label fw-semibold">Location</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={form.location}
                                    onChange={e => set('location', e.target.value)}
                                    placeholder="Venue or address…"
                                    maxLength={255}
                                />
                            </div>

                            {/* Description */}
                            <div className="col-12">
                                <label className="form-label fw-semibold">Description</label>
                                <textarea
                                    className="form-control"
                                    rows={4}
                                    value={form.description}
                                    onChange={e => set('description', e.target.value)}
                                    placeholder="Event details and additional information…"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="um-modal__footer">
                    <button className="btn btn-secondary" onClick={onClose} type="button">Cancel</button>
                    <button
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={handleSave}
                        disabled={saving || loadingDesc}
                        type="button"
                    >
                        {saving
                            ? <><span className="spinner-border spinner-border-sm" />&nbsp;Saving…</>
                            : <><FaCheck size={13} />{isEdit ? 'Save Changes' : 'Create Event'}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({ event, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');

    const handleDelete = async () => {
        setLoading(true);
        try {
            await window.axios.delete(`/admin/api/events/${event.id}`);
            onDeleted(event.id);
        } catch {
            setError('Failed to delete. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="um-modal-backdrop" onClick={onClose}>
            <div className="um-modal um-modal--narrow" onClick={e => e.stopPropagation()}>
                <div className="um-modal__header">
                    <h2 className="um-modal__title">Delete Event</h2>
                    <button className="um-modal__close" onClick={onClose} type="button"><FaX size={12} /></button>
                </div>
                <div className="um-modal__body">
                    <p>Delete <strong>"{event.title}"</strong>?</p>
                    <p className="text-muted small">This cannot be undone.</p>
                    {error && <div className="alert alert-danger py-2">{error}</div>}
                </div>
                <div className="um-modal__footer">
                    <button className="btn btn-secondary" onClick={onClose} type="button">Cancel</button>
                    <button
                        className="btn btn-danger d-flex align-items-center gap-2"
                        onClick={handleDelete}
                        disabled={loading}
                        type="button"
                    >
                        {loading
                            ? <><span className="spinner-border spinner-border-sm" />&nbsp;Deleting…</>
                            : <><FaTrash size={12} />Delete</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function EventManagement({ parishes, clergy }) {
    const [events,     setEvents]     = useState([]);
    const [pagination, setPagination] = useState(null);
    const [stats,      setStats]      = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [page,       setPage]       = useState(1);

    const [search,   setSearch]   = useState('');
    const [typeF,    setTypeF]    = useState('all');
    const [statusF,  setStatusF]  = useState('all');
    const [sort,     setSort]     = useState('event_date');
    const [dir,      setDir]      = useState('asc');

    const debouncedSearch = useDebounce(search);

    const [modal,        setModal]        = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchStats = useCallback(() => {
        window.axios.get('/admin/api/events/stats').then(res => setStats(res.data));
    }, []);

    const fetchList = useCallback(() => {
        setLoading(true);
        window.axios.get('/admin/api/events', {
            params: { search: debouncedSearch, type: typeF, status: statusF, sort, direction: dir, page },
        })
            .then(res => {
                setEvents(res.data.data);
                setPagination(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [debouncedSearch, typeF, statusF, sort, dir, page]);

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { fetchList(); }, [fetchList]);

    const handleSort = (col) => {
        if (sort === col) setDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSort(col); setDir('asc'); }
    };

    const handleSaved = (item, isEdit) => {
        setModal(null);
        if (isEdit) {
            setEvents(prev => prev.map(e => e.id === item.id ? item : e));
        } else {
            fetchList();
        }
        fetchStats();
    };

    const handleDeleted = (id) => {
        setModal(null);
        setEvents(prev => prev.filter(e => e.id !== id));
        fetchStats();
    };

    const SortIcon = ({ col }) => sort === col
        ? <span className="ms-1 text-primary">{dir === 'asc' ? '↑' : '↓'}</span>
        : <span className="ms-1 text-muted opacity-50">↕</span>;

    return (
        <div className="p-4">
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h1 className="h4 fw-bold mb-0 d-flex align-items-center gap-2">
                        <FaCalendarDays size={20} className="text-primary" />
                        Event Management
                    </h1>
                    <p className="text-muted small mb-0">Manage parish events — Community, Liturgy, Youth</p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() => { setSelectedItem(null); setModal('create'); }}
                    type="button"
                >
                    <FaPlus size={13} /> New Event
                </button>
            </div>

            {/* Stats */}
            <StatsRow stats={stats} />

            {/* Filters */}
            <div className="card mb-3">
                <div className="card-body py-2">
                    <div className="row g-2 align-items-center">
                        <div className="col-12 col-md-4">
                            <div className="input-group input-group-sm">
                                <span className="input-group-text"><FaMagnifyingGlass size={12} /></span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search title or location…"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>
                        <div className="col-6 col-md-2">
                            <select className="form-select form-select-sm" value={typeF}
                                onChange={e => { setTypeF(e.target.value); setPage(1); }}>
                                <option value="all">All Types</option>
                                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="col-6 col-md-2">
                            <select className="form-select form-select-sm" value={statusF}
                                onChange={e => { setStatusF(e.target.value); setPage(1); }}>
                                <option value="all">All Statuses</option>
                                {EVENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="col-12 col-md-2 ms-auto text-end">
                            <span className="text-muted small">
                                {pagination?.total ?? 0} events
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('title')}>
                                    Event <SortIcon col="title" />
                                </th>
                                <th>Parish</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('type')}>
                                    Type <SortIcon col="type" />
                                </th>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('event_date')}>
                                    Date <SortIcon col="event_date" />
                                </th>
                                <th>Time & Location</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
                                    Status <SortIcon col="status" />
                                </th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-5 text-muted">
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Loading…
                                    </td>
                                </tr>
                            ) : events.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-5 text-muted">
                                        <FaCalendarDays size={32} className="d-block mx-auto mb-2 opacity-25" />
                                        No events found
                                    </td>
                                </tr>
                            ) : events.map(e => (
                                <tr key={e.id}>
                                    <td>
                                        <div className="fw-semibold">{e.title}</div>
                                        {e.clergy !== 'Unassigned' && (
                                            <div className="text-muted small">{e.clergy}</div>
                                        )}
                                    </td>
                                    <td><span className="text-muted small">{e.parish}</span></td>
                                    <td>
                                        <span className={`badge bg-${TYPE_COLORS[e.type] ?? 'secondary'}-subtle text-${TYPE_COLORS[e.type] ?? 'secondary'} border`}>
                                            {e.type}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="fw-semibold">{e.event_date_display}</span>
                                    </td>
                                    <td>
                                        <div className="text-muted small">
                                            {e.start_time && (
                                                <span><FaClock size={10} className="me-1" />{e.start_time}{e.end_time ? ` – ${e.end_time}` : ''}</span>
                                            )}
                                        </div>
                                        {e.location && (
                                            <div className="text-muted small">
                                                <FaLocationDot size={10} className="me-1" />{e.location}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge bg-${STATUS_COLORS[e.status] ?? 'secondary'}`}>
                                            {e.status}
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-1"
                                            title="Edit"
                                            onClick={() => { setSelectedItem(e); setModal('edit'); }}
                                            type="button"
                                        >
                                            <FaPen size={11} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            title="Delete"
                                            onClick={() => { setSelectedItem(e); setModal('delete'); }}
                                            type="button"
                                        >
                                            <FaTrash size={11} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="card-footer d-flex justify-content-between align-items-center">
                        <span className="text-muted small">
                            Showing {pagination.from}–{pagination.to} of {pagination.total}
                        </span>
                        <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-outline-secondary"
                                disabled={page <= 1}
                                onClick={() => setPage(p => p - 1)}
                                type="button"
                            >‹ Prev</button>
                            <span className="btn btn-sm btn-primary">{page}</span>
                            <button className="btn btn-sm btn-outline-secondary"
                                disabled={page >= pagination.last_page}
                                onClick={() => setPage(p => p + 1)}
                                type="button"
                            >Next ›</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {(modal === 'create' || modal === 'edit') && (
                <EventModal
                    mode={modal}
                    event={selectedItem}
                    parishes={parishes}
                    clergy={clergy}
                    onClose={() => setModal(null)}
                    onSaved={handleSaved}
                />
            )}
            {modal === 'delete' && selectedItem && (
                <DeleteModal
                    event={selectedItem}
                    onClose={() => setModal(null)}
                    onDeleted={handleDeleted}
                />
            )}
        </div>
    );
}