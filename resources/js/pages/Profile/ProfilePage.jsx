import React, { useState, useEffect } from 'react';
import {
    FaUser, FaShield, FaKey, FaLock, FaChurch,
    FaCheck, FaTriangleExclamation, FaCircleCheck,
    FaPhone, FaLocationDot, FaCalendar, FaEnvelope,
} from 'react-icons/fa6';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const ROLE_BADGE = {
    super_admin:  'danger',
    parish_admin: 'warning',
    clergymen:    'info',
    parishioner:  'secondary',
};

function FieldError({ error }) {
    if (!error) return null;
    const msg = Array.isArray(error) ? error[0] : error;
    return <div className="invalid-feedback d-block">{msg}</div>;
}

function Toast({ type, msg, onClose }) {
    if (!msg) return null;
    const cls = type === 'success' ? 'alert-success' : 'alert-danger';
    const Icon = type === 'success' ? FaCircleCheck : FaTriangleExclamation;
    return (
        <div className={`alert ${cls} d-flex align-items-center gap-2 mb-3`} role="alert">
            <Icon size={14} />
            <span className="flex-grow-1" style={{ fontSize: '0.875rem' }}>{msg}</span>
            <button type="button" className="btn-close btn-close-sm" onClick={onClose} />
        </div>
    );
}

// ─────────────────────────────────────────────
// Tab: Personal Info
// ─────────────────────────────────────────────

function PersonalTab({ user, onSaved }) {
    const [form, setForm]     = useState({});
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null); // {type, msg}
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) return;
        setForm({
            first_name:     user.first_name,
            middle_name:    user.middle_name,
            last_name:      user.last_name,
            phone:          user.phone,
            gender:         user.gender,
            birth_date:     user.birth_date,
            country:        user.country,
            province:       user.province,
            city:           user.city,
            barangay:       user.barangay,
            street_address: user.street_address,
            zip_code:       user.zip_code,
        });
    }, [user]);

    const set = (name, value) => {
        setForm(p => ({ ...p, [name]: value }));
        setErrors(p => ({ ...p, [name]: null }));
        setStatus(null);
    };

    const handlePhone = (e) => {
        // Allow digits, +, -, spaces — max 20 chars
        const val = e.target.value.replace(/[^\d+\- ]/g, '').slice(0, 20);
        set('phone', val);
    };

    const save = async () => {
        setSaving(true); setErrors({}); setStatus(null);
        try {
            const res = await axios.patch('/api/profile', form);
            setStatus({ type: 'success', msg: res.data.message });
            if (onSaved) onSaved(res.data);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
            } else {
                setStatus({ type: 'error', msg: err.response?.data?.message || 'Update failed.' });
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4">
            <Toast type={status?.type} msg={status?.msg} onClose={() => setStatus(null)} />

            {/* Name */}
            <p className="text-muted fw-semibold mb-3" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Personal Information
            </p>
            <div className="row g-3 mb-3">
                <div className="col-md-4">
                    <label className="form-label fw-semibold small">First Name <span className="text-danger">*</span></label>
                    <input className={`form-control${errors.first_name ? ' is-invalid' : ''}`}
                        value={form.first_name || ''} onChange={e => set('first_name', e.target.value)} />
                    <FieldError error={errors.first_name} />
                </div>
                <div className="col-md-4">
                    <label className="form-label fw-semibold small">Middle Name</label>
                    <input className="form-control"
                        value={form.middle_name || ''} onChange={e => set('middle_name', e.target.value)} />
                </div>
                <div className="col-md-4">
                    <label className="form-label fw-semibold small">Last Name <span className="text-danger">*</span></label>
                    <input className={`form-control${errors.last_name ? ' is-invalid' : ''}`}
                        value={form.last_name || ''} onChange={e => set('last_name', e.target.value)} />
                    <FieldError error={errors.last_name} />
                </div>
            </div>
            <div className="row g-3 mb-3">
                <div className="col-md-6">
                    <label className="form-label fw-semibold small">Phone Number <span className="text-danger">*</span></label>
                    <input className={`form-control${errors.phone ? ' is-invalid' : ''}`}
                        value={form.phone || ''} onChange={handlePhone} placeholder="e.g. 09171234567" />
                    <FieldError error={errors.phone} />
                </div>
                <div className="col-md-3">
                    <label className="form-label fw-semibold small">Gender <span className="text-danger">*</span></label>
                    <select className={`form-select${errors.gender ? ' is-invalid' : ''}`}
                        value={form.gender || 'Male'} onChange={e => set('gender', e.target.value)}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    <FieldError error={errors.gender} />
                </div>
                <div className="col-md-3">
                    <label className="form-label fw-semibold small">Date of Birth <span className="text-danger">*</span></label>
                    <input type="date" className={`form-control${errors.birth_date ? ' is-invalid' : ''}`}
                        value={form.birth_date || ''} onChange={e => set('birth_date', e.target.value)} />
                    <FieldError error={errors.birth_date} />
                </div>
            </div>

            {/* Address */}
            <p className="text-muted fw-semibold mb-3 mt-4" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Address
            </p>
            <div className="row g-3 mb-3">
                <div className="col-md-6">
                    <label className="form-label fw-semibold small">Country</label>
                    <input className="form-control"
                        value={form.country || ''} onChange={e => set('country', e.target.value)} />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-semibold small">Province</label>
                    <input className="form-control"
                        value={form.province || ''} onChange={e => set('province', e.target.value)} />
                </div>
            </div>
            <div className="row g-3 mb-3">
                <div className="col-md-6">
                    <label className="form-label fw-semibold small">City / Municipality <span className="text-danger">*</span></label>
                    <input className={`form-control${errors.city ? ' is-invalid' : ''}`}
                        value={form.city || ''} onChange={e => set('city', e.target.value)} />
                    <FieldError error={errors.city} />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-semibold small">Barangay <span className="text-danger">*</span></label>
                    <input className={`form-control${errors.barangay ? ' is-invalid' : ''}`}
                        value={form.barangay || ''} onChange={e => set('barangay', e.target.value)} />
                    <FieldError error={errors.barangay} />
                </div>
            </div>
            <div className="row g-3 mb-4">
                <div className="col-md-8">
                    <label className="form-label fw-semibold small">Street Address</label>
                    <input className="form-control"
                        value={form.street_address || ''} onChange={e => set('street_address', e.target.value)} />
                </div>
                <div className="col-md-4">
                    <label className="form-label fw-semibold small">ZIP Code</label>
                    <input className="form-control"
                        value={form.zip_code || ''} onChange={e => set('zip_code', e.target.value)} />
                </div>
            </div>

            <div className="d-flex justify-content-end">
                <button className="btn px-4 fw-semibold" onClick={save} disabled={saving}
                    style={{ background: 'var(--bethel-primary)', color: '#fff', borderRadius: '8px' }}>
                    <FaCheck size={12} className="me-2" />
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Tab: Account (username + email)
// ─────────────────────────────────────────────

function AccountTab({ user, onSaved }) {
    const [form, setForm]     = useState({ username: '', email: '' });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null);
    const [saving, setSaving] = useState(false);

    const emailVerified = user?.email_verified;

    useEffect(() => {
        if (!user) return;
        setForm({ username: user.username, email: user.email });
    }, [user]);

    const set = (name, value) => {
        setForm(p => ({ ...p, [name]: value }));
        setErrors(p => ({ ...p, [name]: null }));
        setStatus(null);
    };

    const save = async () => {
        setSaving(true); setErrors({}); setStatus(null);
        const payload = { username: form.username };
        if (!emailVerified) payload.email = form.email;

        try {
            const res = await axios.patch('/api/profile', payload);
            setStatus({ type: 'success', msg: res.data.message });
            if (onSaved) onSaved(res.data);
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors || {});
            else setStatus({ type: 'error', msg: err.response?.data?.message || 'Update failed.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4">
            <Toast type={status?.type} msg={status?.msg} onClose={() => setStatus(null)} />

            {/* Read-only role / status */}
            <p className="text-muted fw-semibold mb-3" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Role &amp; Status
            </p>
            <div className="alert" style={{ background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '10px', fontSize: '0.875rem' }}>
                <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div>
                        <span className="text-muted small">Role</span><br />
                        <span className={`badge bg-${ROLE_BADGE[user?.role] ?? 'secondary'} mt-1`}>
                            {user?.role_label}
                        </span>
                    </div>
                    <div className="vr d-none d-md-block" />
                    <div>
                        <span className="text-muted small">Account Status</span><br />
                        <span className={`badge mt-1 ${user?.account_status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                            {user?.account_status}
                        </span>
                    </div>
                    {user?.parish_name && <>
                        <div className="vr d-none d-md-block" />
                        <div>
                            <span className="text-muted small">Parish</span><br />
                            <span className="fw-semibold small" style={{ color: 'var(--bethel-primary)' }}>
                                <FaChurch size={11} className="me-1" />{user.parish_name}
                            </span>
                        </div>
                    </>}
                </div>
                <p className="mb-0 mt-2 text-muted" style={{ fontSize: '0.75rem' }}>
                    Role and account status are managed by an administrator and cannot be changed here.
                </p>
            </div>

            {/* Credentials */}
            <p className="text-muted fw-semibold mb-3 mt-4" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Credentials
            </p>
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <label className="form-label fw-semibold small">Username <span className="text-danger">*</span></label>
                    <input className={`form-control${errors.username ? ' is-invalid' : ''}`}
                        value={form.username || ''} onChange={e => set('username', e.target.value)} />
                    <FieldError error={errors.username} />
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-semibold small d-flex align-items-center gap-2">
                        Email Address <span className="text-danger">{emailVerified ? '' : '*'}</span>
                        {emailVerified && (
                            <span className="badge bg-success-subtle text-success fw-normal"
                                style={{ fontSize: '0.7rem' }}>
                                <FaCircleCheck size={9} className="me-1" />Verified
                            </span>
                        )}
                    </label>
                    <div className="input-group">
                        <input type="email"
                            className={`form-control${errors.email ? ' is-invalid' : ''}`}
                            value={form.email || ''}
                            onChange={e => !emailVerified && set('email', e.target.value)}
                            readOnly={emailVerified}
                            style={emailVerified ? { cursor: 'not-allowed', opacity: 0.65 } : {}}
                        />
                        {emailVerified && (
                            <span className="input-group-text" title="Email verified — contact admin to change">
                                <FaLock size={12} />
                            </span>
                        )}
                        <FieldError error={errors.email} />
                    </div>
                    {emailVerified ? (
                        <div className="form-text text-muted" style={{ fontSize: '0.75rem' }}>
                            Your email is verified. Contact an administrator to change it.
                        </div>
                    ) : (
                        <div className="form-text text-warning" style={{ fontSize: '0.75rem' }}>
                            Your email is not yet verified.
                        </div>
                    )}
                </div>
            </div>

            <div className="d-flex justify-content-end">
                <button className="btn px-4 fw-semibold" onClick={save} disabled={saving}
                    style={{ background: 'var(--bethel-primary)', color: '#fff', borderRadius: '8px' }}>
                    <FaCheck size={12} className="me-2" />
                    {saving ? 'Saving…' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Tab: Password
// ─────────────────────────────────────────────

function PasswordTab() {
    const [form, setForm]     = useState({ current_password: '', password: '', password_confirmation: '' });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState(null);
    const [saving, setSaving] = useState(false);

    const set = (name, value) => {
        setForm(p => ({ ...p, [name]: value }));
        setErrors(p => ({ ...p, [name]: null }));
        setStatus(null);
    };

    const save = async () => {
        setSaving(true); setErrors({}); setStatus(null);
        try {
            const res = await axios.post('/api/profile/password', form);
            setStatus({ type: 'success', msg: res.data.message });
            setForm({ current_password: '', password: '', password_confirmation: '' });
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors || {});
            else setStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to change password.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4">
            <Toast type={status?.type} msg={status?.msg} onClose={() => setStatus(null)} />

            <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
                Password must be at least <strong>8 characters</strong> and include uppercase, lowercase, and a number.
            </p>

            <div className="row g-3 mb-4" style={{ maxWidth: '480px' }}>
                <div className="col-12">
                    <label className="form-label fw-semibold small">Current Password <span className="text-danger">*</span></label>
                    <input type="password" className={`form-control${errors.current_password ? ' is-invalid' : ''}`}
                        value={form.current_password} onChange={e => set('current_password', e.target.value)}
                        autoComplete="current-password" />
                    <FieldError error={errors.current_password} />
                </div>
                <div className="col-12">
                    <label className="form-label fw-semibold small">New Password <span className="text-danger">*</span></label>
                    <input type="password" className={`form-control${errors.password ? ' is-invalid' : ''}`}
                        value={form.password} onChange={e => set('password', e.target.value)}
                        autoComplete="new-password" />
                    <FieldError error={errors.password} />
                </div>
                <div className="col-12">
                    <label className="form-label fw-semibold small">Confirm New Password <span className="text-danger">*</span></label>
                    <input type="password" className={`form-control${errors.password_confirmation ? ' is-invalid' : ''}`}
                        value={form.password_confirmation} onChange={e => set('password_confirmation', e.target.value)}
                        autoComplete="new-password" />
                    <FieldError error={errors.password_confirmation} />
                </div>
            </div>

            <div className="d-flex justify-content-end" style={{ maxWidth: '480px' }}>
                <button className="btn px-4 fw-semibold" onClick={save} disabled={saving}
                    style={{ background: 'var(--bethel-primary)', color: '#fff', borderRadius: '8px' }}>
                    <FaKey size={12} className="me-2" />
                    {saving ? 'Saving…' : 'Change Password'}
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Main Profile Page
// ─────────────────────────────────────────────

const TABS = [
    { id: 'personal', label: 'Personal Info',   Icon: FaUser   },
    { id: 'account',  label: 'Account',         Icon: FaShield },
    { id: 'password', label: 'Change Password', Icon: FaKey    },
];

export default function ProfilePage() {
    const [tab,     setTab]     = useState('personal');
    const [user,    setUser]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState(null);

    useEffect(() => {
        axios.get('/api/profile')
            .then(r => setUser(r.data))
            .catch(() => setError('Failed to load profile. Please refresh.'))
            .finally(() => setLoading(false));
    }, []);

    // Patch in-memory user after a successful save
    const handleSaved = (updated) => {
        setUser(prev => ({ ...prev, ...updated }));
    };

    // Compute initials
    const initials = user
        ? ((user.first_name?.[0] ?? '') + (user.last_name?.[0] ?? '')).toUpperCase()
        : '?';

    return (
        <div style={{ background: 'var(--bethel-light-bg)', minHeight: 'calc(100vh - 64px)' }}>
            <div className="container py-5">

                {/* Page heading */}
                <div className="mb-4">
                    <h1 className="bethel-section-title mb-1">My Profile</h1>
                    <div className="bethel-section-divider" />
                    <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                        Manage your personal information and account settings.
                    </p>
                </div>

                {loading ? (
                    <div className="d-flex justify-content-center py-5">
                        <div className="spinner-border" style={{ color: 'var(--bethel-primary)' }} role="status">
                            <span className="visually-hidden">Loading…</span>
                        </div>
                    </div>
                ) : error ? (
                    <div className="alert alert-danger">{error}</div>
                ) : (
                    <div className="row g-4 align-items-start">

                        {/* ── Left: Identity card ────────────────── */}
                        <div className="col-lg-3">
                            <div className="card shadow-sm border-0" style={{ borderRadius: '14px', overflow: 'hidden' }}>
                                {/* Header strip */}
                                <div style={{ height: '70px', background: 'linear-gradient(135deg, var(--bethel-hero-start), var(--bethel-hero-end))' }} />

                                <div className="card-body text-center" style={{ paddingTop: '0.5rem' }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: '72px', height: '72px',
                                        borderRadius: '50%',
                                        background: 'var(--bethel-secondary)',
                                        color: 'var(--bethel-primary)',
                                        display: 'grid', placeItems: 'center',
                                        fontSize: '1.5rem', fontWeight: 800,
                                        margin: '-46px auto 12px',
                                        border: '4px solid #fff',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    }}>
                                        {initials}
                                    </div>

                                    <h5 className="fw-bold mb-0" style={{ color: 'var(--bethel-primary)', fontSize: '1rem' }}>
                                        {user?.first_name} {user?.last_name}
                                    </h5>
                                    <p className="text-muted mb-2" style={{ fontSize: '0.8rem' }}>@{user?.username}</p>

                                    <span className={`badge bg-${ROLE_BADGE[user?.role] ?? 'secondary'} mb-2`}
                                        style={{ fontSize: '0.72rem' }}>
                                        {user?.role_label}
                                    </span>

                                    <hr className="my-3" />

                                    {/* Info list */}
                                    <div className="text-start" style={{ fontSize: '0.8rem' }}>
                                        {[
                                            { Icon: FaEnvelope,    val: user?.email },
                                            { Icon: FaPhone,       val: user?.phone || '—' },
                                            { Icon: FaLocationDot, val: user?.city  || '—' },
                                            { Icon: FaCalendar,    val: `Joined ${user?.joined}` },
                                        ].map(({ Icon, val }, i) => (
                                            <div key={i} className="d-flex align-items-start gap-2 mb-2">
                                                <Icon size={12} style={{ color: 'var(--bethel-secondary)', marginTop: '3px', flexShrink: 0 }} />
                                                <span className="text-muted text-break">{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Right: Edit tabs ───────────────────── */}
                        <div className="col-lg-9">
                            <div className="card shadow-sm border-0" style={{ borderRadius: '14px' }}>

                                {/* Tab bar */}
                                <div className="card-header bg-white border-bottom px-0 pt-0 pb-0"
                                    style={{ borderRadius: '14px 14px 0 0' }}>
                                    <ul className="nav nav-tabs border-0 px-3 pt-3">
                                        {TABS.map(({ id, label, Icon }) => (
                                            <li className="nav-item" key={id}>
                                                <button
                                                    className={`nav-link d-flex align-items-center gap-2 fw-semibold${tab === id ? ' active' : ''}`}
                                                    style={{
                                                        fontSize: '0.82rem',
                                                        color: tab === id ? 'var(--bethel-primary)' : '#6c757d',
                                                        borderBottom: tab === id ? '2px solid var(--bethel-primary)' : '2px solid transparent',
                                                        background: 'none',
                                                        border: 'none',
                                                        borderBottom: tab === id
                                                            ? '2px solid var(--bethel-primary)'
                                                            : '2px solid transparent',
                                                        paddingBottom: '0.75rem',
                                                        cursor: 'pointer',
                                                    }}
                                                    onClick={() => setTab(id)}
                                                >
                                                    <Icon size={12} /> {label}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Tab content */}
                                <div className="card-body p-0">
                                    {tab === 'personal' && <PersonalTab  user={user} onSaved={handleSaved} />}
                                    {tab === 'account'  && <AccountTab   user={user} onSaved={handleSaved} />}
                                    {tab === 'password' && <PasswordTab />}
                                </div>

                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
}