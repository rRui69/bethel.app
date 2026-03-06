import React, { useState, useEffect, useCallback } from 'react';
import {
    FaBullhorn, FaPlus, FaMagnifyingGlass, FaPen, FaTrash,
    FaX, FaCheck, FaFilter, FaEye, FaCircleCheck, FaCircleXmark,
} from 'react-icons/fa6';

// ── Utility ────────────────────────────────────────────────────────────────────
const CATEGORIES = ['Parish News', 'Community', 'Liturgy', 'Youth', 'General'];
const STATUSES   = ['Draft', 'Published', 'Archived'];

const CATEGORY_COLORS = {
    'Parish News': 'primary',
    'Community':   'success',
    'Liturgy':     'warning',
    'Youth':       'info',
    'General':     'secondary',
};

const STATUS_COLORS = {
    'Published': 'success',
    'Draft':     'warning',
    'Archived':  'secondary',
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
        { label: 'Published', value: stats.published, color: 'success' },
        { label: 'Drafts',    value: stats.drafts,    color: 'warning' },
        { label: 'Archived',  value: stats.archived,  color: 'secondary' },
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

// ── Create / Edit Modal ────────────────────────────────────────────────────────
function AnnouncementModal({ mode, announcement, parishes, onClose, onSaved }) {
    const isEdit = mode === 'edit';
    const [form, setForm] = useState({
        parish_id:    announcement?.parish_id ?? '',
        title:        announcement?.title     ?? '',
        excerpt:      announcement?.excerpt   ?? '',
        body:         announcement?.body      ?? '',
        category:     announcement?.category  ?? 'General',
        status:       announcement?.status    ?? 'Draft',
        published_at: announcement?.published_at ?? '',
    });
    const [errors,  setErrors]  = useState({});
    const [saving,  setSaving]  = useState(false);
    const [loadingBody, setLoadingBody] = useState(isEdit && !announcement?.body);

    // Load full body if editing and body not loaded yet
    useEffect(() => {
        if (isEdit && !announcement?.body) {
            window.axios.get(`/admin/api/announcements/${announcement.id}`)
                .then(res => {
                    setForm(f => ({ ...f, body: res.data.body ?? '' }));
                    setLoadingBody(false);
                })
                .catch(() => setLoadingBody(false));
        }
    }, []);

    const set = (field, val) => setForm(f => ({ ...f, [field]: val }));

    const handleSave = async () => {
        setSaving(true);
        setErrors({});
        try {
            const url    = isEdit ? `/admin/api/announcements/${announcement.id}` : '/admin/api/announcements';
            const method = isEdit ? 'patch' : 'post';
            const res    = await window.axios[method](url, form);
            onSaved(res.data.announcement, isEdit);
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
                            {isEdit ? 'Edit Announcement' : 'New Announcement'}
                        </h2>
                        <p className="um-modal__sub">
                            {isEdit ? `Editing: ${announcement?.title}` : 'Create a new parish announcement'}
                        </p>
                    </div>
                    <button className="um-modal__close" onClick={onClose} type="button">
                        <FaX size={12} />
                    </button>
                </div>

                <div className="um-modal__body um-modal__body--scroll">
                    {loadingBody ? (
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

                            {/* Category */}
                            <div className="col-12 col-md-3">
                                <label className="form-label fw-semibold">Category <span className="text-danger">*</span></label>
                                <select
                                    className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                                    value={form.category}
                                    onChange={e => set('category', e.target.value)}
                                >
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Status */}
                            <div className="col-12 col-md-3">
                                <label className="form-label fw-semibold">Status <span className="text-danger">*</span></label>
                                <select
                                    className={`form-select ${errors.status ? 'is-invalid' : ''}`}
                                    value={form.status}
                                    onChange={e => set('status', e.target.value)}
                                >
                                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* Title */}
                            <div className="col-12">
                                <label className="form-label fw-semibold">Title <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                                    value={form.title}
                                    onChange={e => set('title', e.target.value)}
                                    placeholder="Announcement headline…"
                                    maxLength={255}
                                />
                                {errors.title && <div className="invalid-feedback">{errors.title[0]}</div>}
                            </div>

                            {/* Excerpt */}
                            <div className="col-12">
                                <label className="form-label fw-semibold">Excerpt <small className="text-muted">(max 300 characters)</small></label>
                                <textarea
                                    className={`form-control ${errors.excerpt ? 'is-invalid' : ''}`}
                                    rows={2}
                                    value={form.excerpt}
                                    onChange={e => set('excerpt', e.target.value)}
                                    placeholder="Short summary shown on the home page and listing…"
                                    maxLength={300}
                                />
                                <div className="text-end text-muted" style={{ fontSize: '0.75rem' }}>
                                    {form.excerpt.length}/300
                                </div>
                            </div>

                            {/* Body */}
                            <div className="col-12">
                                <label className="form-label fw-semibold">Full Content <span className="text-danger">*</span></label>
                                <textarea
                                    className={`form-control ${errors.body ? 'is-invalid' : ''}`}
                                    rows={8}
                                    value={form.body}
                                    onChange={e => set('body', e.target.value)}
                                    placeholder="Full announcement content…"
                                />
                                {errors.body && <div className="invalid-feedback">{errors.body[0]}</div>}
                            </div>

                            {/* Published At */}
                            {form.status === 'Published' && (
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">Publish Date/Time</label>
                                    <input
                                        type="datetime-local"
                                        className="form-control"
                                        value={form.published_at}
                                        onChange={e => set('published_at', e.target.value)}
                                    />
                                    <div className="form-text">Leave blank to publish now.</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="um-modal__footer">
                    <button className="btn btn-secondary" onClick={onClose} type="button">Cancel</button>
                    <button
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={handleSave}
                        disabled={saving || loadingBody}
                        type="button"
                    >
                        {saving
                            ? <><span className="spinner-border spinner-border-sm" />&nbsp;Saving…</>
                            : <><FaCheck size={13} />{isEdit ? 'Save Changes' : 'Create Announcement'}</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────────
function DeleteModal({ announcement, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');

    const handleDelete = async () => {
        setLoading(true);
        try {
            await window.axios.delete(`/admin/api/announcements/${announcement.id}`);
            onDeleted(announcement.id);
        } catch {
            setError('Failed to delete. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="um-modal-backdrop" onClick={onClose}>
            <div className="um-modal um-modal--narrow" onClick={e => e.stopPropagation()}>
                <div className="um-modal__header">
                    <h2 className="um-modal__title">Delete Announcement</h2>
                    <button className="um-modal__close" onClick={onClose} type="button"><FaX size={12} /></button>
                </div>
                <div className="um-modal__body">
                    <p>Are you sure you want to delete <strong>"{announcement.title}"</strong>?</p>
                    <p className="text-muted small">This action cannot be undone.</p>
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
export default function AnnouncementManagement({ parishes }) {
    const [announcements, setAnnouncements] = useState([]);
    const [pagination,    setPagination]    = useState(null);
    const [stats,         setStats]         = useState(null);
    const [loading,       setLoading]       = useState(true);
    const [page,          setPage]          = useState(1);

    // Filters
    const [search,   setSearch]   = useState('');
    const [category, setCategory] = useState('all');
    const [status,   setStatus]   = useState('all');
    const [sort,     setSort]     = useState('created_at');
    const [dir,      setDir]      = useState('desc');

    const debouncedSearch = useDebounce(search);

    // Modals
    const [modal,         setModal]         = useState(null); // null | 'create' | 'edit' | 'delete'
    const [selectedItem,  setSelectedItem]  = useState(null);

    const fetchStats = useCallback(() => {
        window.axios.get('/admin/api/announcements/stats')
            .then(res => setStats(res.data));
    }, []);

    const fetchList = useCallback(() => {
        setLoading(true);
        window.axios.get('/admin/api/announcements', {
            params: { search: debouncedSearch, category, status, sort, direction: dir, page },
        })
            .then(res => {
                setAnnouncements(res.data.data);
                setPagination(res.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [debouncedSearch, category, status, sort, dir, page]);

    useEffect(() => { fetchStats(); }, []);
    useEffect(() => { fetchList(); }, [fetchList]);

    const handleSort = (col) => {
        if (sort === col) setDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSort(col); setDir('asc'); }
    };

    const handleSaved = (item, isEdit) => {
        setModal(null);
        if (isEdit) {
            setAnnouncements(prev => prev.map(a => a.id === item.id ? item : a));
        } else {
            fetchList();
        }
        fetchStats();
    };

    const handleDeleted = (id) => {
        setModal(null);
        setAnnouncements(prev => prev.filter(a => a.id !== id));
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
                        <FaBullhorn size={20} className="text-primary" />
                        Announcement Management
                    </h1>
                    <p className="text-muted small mb-0">Create and manage parish announcements</p>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={() => { setSelectedItem(null); setModal('create'); }}
                    type="button"
                >
                    <FaPlus size={13} /> New Announcement
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
                                    placeholder="Search title or excerpt…"
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>
                        <div className="col-6 col-md-2">
                            <select className="form-select form-select-sm" value={category}
                                onChange={e => { setCategory(e.target.value); setPage(1); }}>
                                <option value="all">All Categories</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="col-6 col-md-2">
                            <select className="form-select form-select-sm" value={status}
                                onChange={e => { setStatus(e.target.value); setPage(1); }}>
                                <option value="all">All Statuses</option>
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="col-12 col-md-2 ms-auto text-end">
                            <span className="text-muted small">
                                {pagination?.total ?? 0} announcements
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
                                    Title <SortIcon col="title" />
                                </th>
                                <th>Parish</th>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('category')}>
                                    Category <SortIcon col="category" />
                                </th>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
                                    Status <SortIcon col="status" />
                                </th>
                                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('published_at')}>
                                    Published <SortIcon col="published_at" />
                                </th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-5 text-muted">
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        Loading…
                                    </td>
                                </tr>
                            ) : announcements.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-5 text-muted">
                                        <FaBullhorn size={32} className="d-block mx-auto mb-2 opacity-25" />
                                        No announcements found
                                    </td>
                                </tr>
                            ) : announcements.map(a => (
                                <tr key={a.id}>
                                    <td>
                                        <div className="fw-semibold">{a.title}</div>
                                        {a.excerpt && (
                                            <div className="text-muted small"
                                                style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {a.excerpt}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span className="text-muted small">{a.parish}</span>
                                    </td>
                                    <td>
                                        <span className={`badge bg-${CATEGORY_COLORS[a.category] ?? 'secondary'}-subtle text-${CATEGORY_COLORS[a.category] ?? 'secondary'} border`}>
                                            {a.category}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge bg-${STATUS_COLORS[a.status] ?? 'secondary'}`}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="text-muted small">
                                            {a.published_at ?? '—'}
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-1"
                                            title="Edit"
                                            onClick={() => { setSelectedItem(a); setModal('edit'); }}
                                            type="button"
                                        >
                                            <FaPen size={11} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            title="Delete"
                                            onClick={() => { setSelectedItem(a); setModal('delete'); }}
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
                <AnnouncementModal
                    mode={modal}
                    announcement={selectedItem}
                    parishes={parishes}
                    onClose={() => setModal(null)}
                    onSaved={handleSaved}
                />
            )}
            {modal === 'delete' && selectedItem && (
                <DeleteModal
                    announcement={selectedItem}
                    onClose={() => setModal(null)}
                    onDeleted={handleDeleted}
                />
            )}
        </div>
    );
}