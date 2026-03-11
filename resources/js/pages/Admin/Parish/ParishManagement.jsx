import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    FaChurch, FaMagnifyingGlass, FaPlus, FaPen, FaTrash,
    FaX, FaCheck, FaSpinner, FaUsers, FaPersonPraying,
    FaCircle, FaLocationDot, FaPhone, FaEnvelope,
    FaUserPlus, FaUserMinus, FaCircleInfo, FaTriangleExclamation,
} from 'react-icons/fa6';

// ── Shared helpers ────────────────────────────────────────────
function useDebounce(value, delay = 350) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

function Field({ label, required, error, children, style }) {
    return (
        <div className="um-field" style={style}>
            <label className="um-label">{label}{required && ' *'}</label>
            {children}
            {error && <div className="um-field-error">{Array.isArray(error) ? error[0] : error}</div>}
        </div>
    );
}

function TextInput({ value, onChange, placeholder, error, type = 'text', disabled }) {
    return (
        <input
            className={`um-input${error ? ' um-input--invalid' : ''}`}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="off"
        />
    );
}

// ── Stat Cards ────────────────────────────────────────────────
function StatCards({ parishes }) {
    const total    = parishes.length;
    const active   = parishes.filter(p => p.status === 'Active').length;
    const inactive = parishes.filter(p => p.status === 'Inactive').length;
    const pending  = parishes.reduce((s, p) => s + (p.pending_requests ?? 0), 0);

    const cards = [
        { label: 'Total Parishes',    value: total,    color: '#1a3c5e', icon: FaChurch        },
        { label: 'Active',            value: active,   color: '#059669', icon: FaCircle        },
        { label: 'Inactive',          value: inactive, color: '#9ca3af', icon: FaCircle        },
        { label: 'Pending Requests',  value: pending,  color: '#c8973a', icon: FaPersonPraying },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
            {cards.map(c => (
                <div key={c.label} style={{
                    background: 'var(--card-bg,#fff)',
                    border: '1px solid var(--border-color,#e5e7eb)',
                    borderRadius: 12, padding: '20px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: 4 }}>{c.label}</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: c.color, lineHeight: 1 }}>{c.value}</div>
                    </div>
                    <c.icon size={28} style={{ color: c.color, opacity: 0.1 }} />
                </div>
            ))}
        </div>
    );
}

// ── Status Badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
    const cfg = {
        Active:   { bg: 'rgba(16,185,129,0.1)',  color: '#065f46', dot: '#10b981' },
        Inactive: { bg: 'rgba(107,114,128,0.1)', color: '#374151', dot: '#9ca3af' },
    };
    const c = cfg[status] ?? cfg.Inactive;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: c.bg, color: c.color }}>
            <FaCircle size={5} style={{ color: c.dot }} /> {status}
        </span>
    );
}

// ── Role Badge ────────────────────────────────────────────────
function RoleBadge({ role }) {
    const map = {
        super_admin:  { label: 'Head Admin',  bg: 'rgba(99,102,241,0.1)',  color: '#4f46e5' },
        parish_admin: { label: 'IT Helpdesk', bg: 'rgba(14,165,233,0.1)', color: '#0284c7' },
        clergymen:    { label: 'Clergy',      bg: 'rgba(200,151,58,0.1)', color: '#92400e' },
        parishioner:  { label: 'Parishioner', bg: 'rgba(107,114,128,0.1)',color: '#374151' },
    };
    const c = map[role] ?? map.parishioner;
    return (
        <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.color }}>
            {c.label}
        </span>
    );
}

// ── Add / Edit Modal ──────────────────────────────────────────
const EMPTY_FORM = {
    name: '', diocese: '', address: '', barangay: '', city: '',
    province: '', country: 'Philippines', zip_code: '',
    phone: '', email: '', status: 'Active', description: '',
};

function ParishFormModal({ parish, onClose, onSaved }) {
    const isEdit = !!parish?.id;
    const [form,    setForm]    = useState(isEdit ? {
        name:        parish.name        ?? '',
        diocese:     parish.diocese     ?? '',
        address:     parish.address     ?? '',
        barangay:    parish.barangay    ?? '',
        city:        parish.city        ?? '',
        province:    parish.province    ?? '',
        country:     parish.country     ?? 'Philippines',
        zip_code:    parish.zip_code    ?? '',
        phone:       parish.phone       ?? '',
        email:       parish.email       ?? '',
        status:      parish.status      ?? 'Active',
        description: parish.description ?? '',
    } : { ...EMPTY_FORM });
    const [errors,  setErrors]  = useState({});
    const [saving,  setSaving]  = useState(false);

    const set = field => e => setForm(p => ({ ...p, [field]: e.target.value }));

    const submit = async () => {
        setSaving(true);
        setErrors({});
        try {
            const url    = isEdit ? `/admin/api/parishes/${parish.id}` : '/admin/api/parishes';
            const method = isEdit ? 'patch' : 'post';
            const { data } = await axios[method](url, form);
            onSaved(data, isEdit);
        } catch (e) {
            if (e.response?.status === 422) setErrors(e.response.data.errors ?? {});
            else alert(e.response?.data?.message ?? 'Failed to save parish.');
        } finally { setSaving(false); }
    };

    const inp = field => ({ value: form[field], onChange: set(field), error: errors[field] });

    return (
        <div className="um-overlay" onClick={onClose}>
            <div className="um-modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
                <div className="um-modal__header">
                    <div className="um-modal__header-info">
                        <div className="um-avatar um-avatar--lg" style={{ background: 'rgba(26,60,94,0.12)', color: '#1a3c5e' }}>
                            <FaChurch size={20} />
                        </div>
                        <div>
                            <h2 className="um-modal__title">{isEdit ? 'Edit Parish' : 'Add New Parish'}</h2>
                            <p className="um-modal__sub">{isEdit ? `Editing ${parish.name}` : 'Fill in the parish details below'}</p>
                        </div>
                    </div>
                    <button className="um-modal__close" onClick={onClose}><FaX size={12} /></button>
                </div>

                <div className="um-modal__body um-modal__body--scroll-tall">
                    {/* Church Info */}
                    <div className="um-section-label" style={{ marginBottom: '0.75rem' }}>Church Information</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                        <Field label="Parish Name" required error={errors.name} style={{ gridColumn: '1 / -1' }}>
                            <TextInput {...inp('name')} placeholder="e.g. Saint Joseph Parish" />
                        </Field>
                        <Field label="Diocese" error={errors.diocese}>
                            <TextInput {...inp('diocese')} placeholder="e.g. Diocese of Olongapo" />
                        </Field>
                        <Field label="Status" required error={errors.status}>
                            <select className={`um-input${errors.status ? ' um-input--invalid' : ''}`} value={form.status} onChange={set('status')}>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </Field>
                    </div>

                    {/* Contact */}
                    <div className="um-section-label" style={{ margin: '1.25rem 0 0.75rem' }}>Contact</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                        <Field label="Phone" error={errors.phone}>
                            <TextInput {...inp('phone')} placeholder="+63 xxx xxx xxxx" type="tel" />
                        </Field>
                        <Field label="Email" error={errors.email}>
                            <TextInput {...inp('email')} placeholder="parish@email.com" type="email" />
                        </Field>
                    </div>

                    {/* Address */}
                    <div className="um-section-label" style={{ margin: '1.25rem 0 0.75rem' }}>Address</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                        <Field label="Street Address" required error={errors.address} style={{ gridColumn: '1 / -1' }}>
                            <TextInput {...inp('address')} placeholder="Building / Street" />
                        </Field>
                        <Field label="Barangay" required error={errors.barangay}>
                            <TextInput {...inp('barangay')} />
                        </Field>
                        <Field label="City / Municipality" required error={errors.city}>
                            <TextInput {...inp('city')} />
                        </Field>
                        <Field label="Province" error={errors.province}>
                            <TextInput {...inp('province')} />
                        </Field>
                        <Field label="Zip Code" error={errors.zip_code}>
                            <TextInput {...inp('zip_code')} />
                        </Field>
                        <Field label="Country" error={errors.country} style={{ gridColumn: '1 / -1' }}>
                            <TextInput {...inp('country')} />
                        </Field>
                    </div>

                    {/* Description */}
                    <div className="um-section-label" style={{ margin: '1.25rem 0 0.75rem' }}>Description</div>
                    <Field label="Notes / Description" error={errors.description}>
                        <textarea
                            className={`um-input${errors.description ? ' um-input--invalid' : ''}`}
                            rows={3}
                            style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: '0.85rem' }}
                            value={form.description}
                            onChange={set('description')}
                            placeholder="Optional brief description of the parish…"
                        />
                    </Field>
                </div>

                <div className="um-modal__footer">
                    <button className="um-btn um-btn--outline" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className="um-btn um-btn--primary" onClick={submit} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        {saving ? <FaSpinner size={12} /> : <FaCheck size={12} />}
                        {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Parish'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Delete Confirm Modal ──────────────────────────────────────
function DeleteModal({ parish, onClose, onDeleted }) {
    const [deleting, setDeleting] = useState(false);
    const [err,      setErr]      = useState('');

    const confirm = async () => {
        setDeleting(true);
        setErr('');
        try {
            await axios.delete(`/admin/api/parishes/${parish.id}`);
            onDeleted(parish.id);
        } catch (e) {
            setErr(e.response?.data?.message ?? 'Failed to delete parish.');
        } finally { setDeleting(false); }
    };

    return (
        <div className="um-overlay" onClick={onClose}>
            <div className="um-modal um-modal--narrow" onClick={e => e.stopPropagation()}>
                <div className="um-modal__header">
                    <div className="um-modal__header-info">
                        <div className="um-avatar um-avatar--lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626' }}>
                            <FaTriangleExclamation size={20} />
                        </div>
                        <div>
                            <h2 className="um-modal__title">Delete Parish</h2>
                            <p className="um-modal__sub">This action cannot be undone</p>
                        </div>
                    </div>
                    <button className="um-modal__close" onClick={onClose}><FaX size={12} /></button>
                </div>
                <div className="um-modal__body">
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Are you sure you want to delete <strong>{parish.name}</strong>?
                        This will fail if the parish still has assigned clergy or users.
                    </p>
                    {err && (
                        <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.82rem' }}>
                            {err}
                        </div>
                    )}
                </div>
                <div className="um-modal__footer">
                    <button className="um-btn um-btn--outline" onClick={onClose} disabled={deleting}>Cancel</button>
                    <button className="um-btn um-btn--danger" onClick={confirm} disabled={deleting} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        {deleting ? <FaSpinner size={12} /> : <FaTrash size={12} />}
                        {deleting ? 'Deleting…' : 'Delete Parish'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Assign User Panel ─────────────────────────────────────────
function AssignUserPanel({ parishId, onAssigned }) {
    const [search,   setSearch]   = useState('');
    const [results,  setResults]  = useState([]);
    const [loading,  setLoading]  = useState(false);
    const [selected, setSelected] = useState(null);
    const [saving,   setSaving]   = useState(false);
    const [err,      setErr]      = useState('');
    const debouncedSearch = useDebounce(search, 350);

    useEffect(() => {
        if (debouncedSearch.length < 2) { setResults([]); return; }
        setLoading(true);
        axios.get(`/admin/api/parishes/${parishId}/available-users`, { params: { search: debouncedSearch } })
            .then(r => setResults(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [debouncedSearch, parishId]);

    const assign = async () => {
        if (!selected) return;
        setSaving(true);
        setErr('');
        try {
            const { data } = await axios.post(`/admin/api/parishes/${parishId}/assign-user`, { user_id: selected.id });
            onAssigned(data);
            setSearch('');
            setSelected(null);
            setResults([]);
        } catch (e) {
            setErr(e.response?.data?.message ?? 'Failed to assign user.');
        } finally { setSaving(false); }
    };

    return (
        <div style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: 10, border: '1.5px dashed var(--border-color,#e5e7eb)', background: 'var(--bg-hover,#f8fafc)' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 7 }}>
                <FaUserPlus size={13} style={{ color: '#2563eb' }} /> Assign User to Parish
            </div>

            <div style={{ position: 'relative', marginBottom: selected ? 10 : 0 }}>
                <FaMagnifyingGlass size={11} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                <input
                    className="um-input"
                    style={{ paddingLeft: 30, fontSize: '0.83rem' }}
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setSelected(null); }}
                />
            </div>

            {/* Dropdown results */}
            {results.length > 0 && !selected && (
                <div style={{ marginTop: 6, border: '1px solid var(--border-color,#e5e7eb)', borderRadius: 8, overflow: 'hidden', maxHeight: 200, overflowY: 'auto', background: 'var(--card-bg,#fff)' }}>
                    {results.map(u => (
                        <div key={u.id} onClick={() => { setSelected(u); setSearch(u.name); setResults([]); }} style={{ padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover,#f8fafc)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <div>
                                <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                                <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>{u.email}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                <RoleBadge role={u.role} />
                                {u.current_parish && (
                                    <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>
                                        → {u.current_parish}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {loading && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>Searching…</div>}

            {/* Selected user chip */}
            {selected && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)' }}>
                    <div>
                        <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)' }}>{selected.name}</div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                            {selected.email}
                            {selected.current_parish ? ` · Currently: ${selected.current_parish}` : ' · No parish'}
                        </div>
                    </div>
                    <button onClick={() => { setSelected(null); setSearch(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
                        <FaX size={10} />
                    </button>
                </div>
            )}

            {err && (
                <div style={{ marginTop: 8, padding: '7px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', color: '#dc2626', fontSize: '0.8rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {err}
                </div>
            )}

            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    className="um-btn um-btn--primary"
                    onClick={assign}
                    disabled={!selected || saving}
                    style={{ fontSize: '0.82rem', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    {saving ? <FaSpinner size={11} /> : <FaUserPlus size={11} />}
                    {saving ? 'Assigning…' : 'Assign'}
                </button>
            </div>
        </div>
    );
}

// ── Manage Parish Modal (Details + Assigned Users) ────────────
function ManageParishModal({ parishId, onClose, onEdited }) {
    const [parish,  setParish]  = useState(null);
    const [users,   setUsers]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab,     setTab]     = useState('details');  // details | users
    const [removing, setRemoving] = useState(null);
    const [showEdit, setShowEdit] = useState(false);

    const load = useCallback(async () => {
        try {
            const [pRes, uRes] = await Promise.all([
                axios.get(`/admin/api/parishes/${parishId}`),
                axios.get(`/admin/api/parishes/${parishId}/users`),
            ]);
            setParish(pRes.data);
            setUsers(uRes.data);
        } catch {}
        finally { setLoading(false); }
    }, [parishId]);

    useEffect(() => { load(); }, [load]);

    const removeUser = async (user) => {
        setRemoving(user.id);
        try {
            await axios.delete(`/admin/api/parishes/${parishId}/users/${user.id}`);
            setUsers(prev => prev.filter(u => u.id !== user.id));
            setParish(prev => ({ ...prev, users_count: (prev.users_count ?? 1) - 1 }));
        } catch (e) { alert(e.response?.data?.message ?? 'Failed to remove user.'); }
        finally { setRemoving(null); }
    };

    const TABS = [
        { id: 'details', label: 'Overview'       },
        { id: 'users',   label: `Users (${users.length})` },
    ];

    const detail = (icon, label, value) => value ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: 'var(--bg-hover,#f8fafc)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {React.createElement(icon, { size: 13, style: { color: 'var(--text-muted)' } })}
            </div>
            <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{value}</div>
            </div>
        </div>
    ) : null;

    return (
        <>
        <div className="um-overlay" onClick={onClose}>
            <div className="um-modal um-modal--wide" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
                <div className="um-modal__header">
                    {loading ? <p className="um-modal__title">Loading…</p> : (
                        <div className="um-modal__header-info">
                            <div className="um-avatar um-avatar--lg" style={{ background: 'rgba(26,60,94,0.12)', color: '#1a3c5e' }}>
                                <FaChurch size={20} />
                            </div>
                            <div>
                                <h2 className="um-modal__title">{parish?.name}</h2>
                                <p className="um-modal__sub">
                                    {parish?.diocese ? `Diocese of ${parish.diocese}` : 'No diocese assigned'}
                                    {parish?.city ? ` · ${parish.city}` : ''}
                                </p>
                            </div>
                        </div>
                    )}
                    <button className="um-modal__close" onClick={onClose}><FaX size={12} /></button>
                </div>

                {/* Tabs */}
                {!loading && (
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', paddingLeft: '1.25rem' }}>
                        {TABS.map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)} style={{
                                padding: '0.6rem 1rem', fontSize: '0.82rem', fontWeight: 600,
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: tab === t.id ? 'var(--admin-accent,#2563eb)' : 'var(--text-muted)',
                                borderBottom: tab === t.id ? '2px solid var(--admin-accent,#2563eb)' : '2px solid transparent',
                                marginBottom: -1,
                            }}>{t.label}</button>
                        ))}
                    </div>
                )}

                <div className="um-modal__body um-modal__body--scroll-tall">
                    {loading ? (
                        <div className="um-modal-loading">Loading…</div>
                    ) : (
                        <>
                            {/* ── OVERVIEW TAB ── */}
                            {tab === 'details' && (
                                <>
                                    {/* Stats row */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: '1.5rem' }}>
                                        {[
                                            { label: 'Assigned Users', value: parish.users_count,   color: '#1a3c5e' },
                                            { label: 'Clergy',         value: parish.clergy_count,  color: '#92400e' },
                                            { label: 'Pending Req.',   value: parish.pending_requests, color: '#c8973a' },
                                        ].map(s => (
                                            <div key={s.label} style={{ textAlign: 'center', padding: '14px 10px', borderRadius: 10, background: 'var(--bg-hover,#f8fafc)', border: '1px solid var(--border-color,#e5e7eb)' }}>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="um-section-label" style={{ marginBottom: '0.75rem' }}>Contact & Address</div>
                                    {detail(FaPhone, 'Phone', parish.phone)}
                                    {detail(FaEnvelope, 'Email', parish.email)}
                                    {detail(FaLocationDot, 'Address', [parish.address, parish.barangay, parish.city, parish.province, parish.country].filter(Boolean).join(', '))}
                                    {detail(FaCircleInfo, 'Zip Code', parish.zip_code)}
                                    {detail(FaCircle, 'Status', <StatusBadge status={parish.status} />)}

                                    {parish.description && (
                                        <>
                                            <div className="um-section-label" style={{ margin: '1.25rem 0 0.75rem' }}>Description</div>
                                            <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)', margin: 0 }}>{parish.description}</p>
                                        </>
                                    )}
                                </>
                            )}

                            {/* ── USERS TAB ── */}
                            {tab === 'users' && (
                                <>
                                    {users.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                            No users assigned to this parish yet.
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '0.5rem' }}>
                                            {users.map(u => (
                                                <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-hover,#f8fafc)', border: '1px solid var(--border-color,#e5e7eb)' }}>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 2 }}>{u.name}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                                        <RoleBadge role={u.role} />
                                                        <StatusBadge status={u.status} />
                                                        <button
                                                            onClick={() => removeUser(u)}
                                                            disabled={removing === u.id}
                                                            title="Remove from parish"
                                                            style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                        >
                                                            {removing === u.id ? <FaSpinner size={11} /> : <FaUserMinus size={11} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Assign user panel */}
                                    <AssignUserPanel
                                        parishId={parishId}
                                        onAssigned={newUser => {
                                            setUsers(prev => {
                                                // Update if already in list (re-assigned), else add
                                                const exists = prev.find(u => u.id === newUser.id);
                                                if (exists) return prev.map(u => u.id === newUser.id ? newUser : u);
                                                return [...prev, newUser];
                                            });
                                            setParish(prev => ({ ...prev, users_count: (prev.users_count ?? 0) + 1 }));
                                        }}
                                    />
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className="um-modal__footer">
                    <button className="um-btn um-btn--outline" onClick={onClose}>Close</button>
                    {!loading && (
                        <button className="um-btn um-btn--primary" onClick={() => setShowEdit(true)} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <FaPen size={11} /> Edit Parish
                        </button>
                    )}
                </div>
            </div>
        </div>

        {showEdit && parish && (
            <ParishFormModal
                parish={parish}
                onClose={() => setShowEdit(false)}
                onSaved={(updated) => {
                    setParish(prev => ({ ...prev, ...updated }));
                    setShowEdit(false);
                    onEdited(updated);
                }}
            />
        )}
        </>
    );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ParishManagement() {
    const [parishes,    setParishes]    = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [search,      setSearch]      = useState('');
    const [statusFilter,setStatusFilter]= useState('all');
    const [showAdd,     setShowAdd]     = useState(false);
    const [manageId,    setManageId]    = useState(null);
    const [deleteTarget,setDeleteTarget]= useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/admin/api/parishes');
            setParishes(data);
        } catch {}
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = parishes.filter(p => {
        const matchStatus = statusFilter === 'all' || p.status === statusFilter;
        const hay = [p.name, p.diocese, p.city].join(' ').toLowerCase();
        const matchSearch = !search || hay.includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <>
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-header__title">Parish Management</h1>
                    <p className="admin-page-header__sub">Manage parishes, assign users, and track operations.</p>
                </div>
                <button className="um-btn um-btn--primary" onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaPlus size={12} /> Add Parish
                </button>
            </div>

            <StatCards parishes={parishes} />

            <div className="admin-table-card">
                {/* Toolbar */}
                <div className="um-toolbar" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div className="um-search-wrap">
                        <FaMagnifyingGlass size={12} className="um-search-icon" />
                        <input
                            type="text"
                            className="um-search-input"
                            placeholder="Search by name, diocese, city…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <select className="um-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="all">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Parish Name</th>
                                <th>Diocese</th>
                                <th>City</th>
                                <th>Users</th>
                                <th>Clergy</th>
                                <th>Pending</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={9} className="um-table-empty">Loading parishes…</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={9} className="um-table-empty">No parishes found.</td></tr>
                            ) : (
                                filtered.map((p, i) => (
                                    <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setManageId(p.id)}>
                                        <td className="um-table-num">{i + 1}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(26,60,94,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <FaChurch size={14} style={{ color: '#1a3c5e', opacity: 0.7 }} />
                                                </div>
                                                {p.name}
                                            </div>
                                        </td>
                                        <td style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>{p.diocese ?? '—'}</td>
                                        <td style={{ fontSize: '0.83rem' }}>{p.city ?? '—'}</td>
                                        <td>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                <FaUsers size={11} style={{ color: '#9ca3af' }} /> {p.users_count ?? 0}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                                <FaPersonPraying size={11} style={{ color: '#9ca3af' }} /> {p.clergy_count ?? 0}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: p.pending_requests > 0 ? '#c8973a' : 'var(--text-muted)' }}>
                                                {p.pending_requests > 0 ? p.pending_requests : '—'}
                                            </span>
                                        </td>
                                        <td><StatusBadge status={p.status} /></td>
                                        <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                                <button
                                                    title="Manage"
                                                    onClick={() => setManageId(p.id)}
                                                    style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid var(--border-color,#e5e7eb)', background: 'transparent', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-accent,#2563eb)', display: 'flex', alignItems: 'center', gap: 5 }}
                                                >
                                                    <FaCircleInfo size={11} /> Manage
                                                </button>
                                                <button
                                                    title="Delete"
                                                    onClick={() => setDeleteTarget(p)}
                                                    style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                >
                                                    <FaTrash size={11} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            {showAdd && (
                <ParishFormModal
                    onClose={() => setShowAdd(false)}
                    onSaved={(created) => {
                        setParishes(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
                        setShowAdd(false);
                    }}
                />
            )}

            {/* Manage Modal */}
            {manageId && (
                <ManageParishModal
                    parishId={manageId}
                    onClose={() => setManageId(null)}
                    onEdited={(updated) => {
                        setParishes(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
                    }}
                />
            )}

            {/* Delete Confirm */}
            {deleteTarget && (
                <DeleteModal
                    parish={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                    onDeleted={(id) => {
                        setParishes(prev => prev.filter(p => p.id !== id));
                        setDeleteTarget(null);
                    }}
                />
            )}
        </>
    );
}