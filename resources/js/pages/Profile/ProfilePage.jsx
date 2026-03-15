import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    FaUser, FaShield, FaKey, FaLock, FaChurch,
    FaCheck, FaTriangleExclamation, FaCircleCheck,
    FaPhone, FaLocationDot, FaCalendar, FaEnvelope,
    FaCamera, FaSpinner,
} from 'react-icons/fa6';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';

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

// ─────────────────────────────────────────────
// Save Success Modal
// ─────────────────────────────────────────────

const FIELD_LABELS = {
    first_name:     'First Name',
    middle_name:    'Middle Name',
    last_name:      'Last Name',
    phone:          'Phone',
    gender:         'Gender',
    birth_date:     'Date of Birth',
    country:        'Country',
    province:       'Province',
    city:           'City',
    barangay:       'Barangay',
    street_address: 'Street Address',
    zip_code:       'ZIP Code',
    username:       'Username',
    email:          'Email',
};

function SaveSuccessModal({ changes, onClose }) {
    const timerRef = React.useRef(null);
    const [progress, setProgress] = React.useState(100);

    React.useEffect(() => {
        const start = Date.now();
        const duration = 3000;

        // Shrink progress bar over 3 seconds
        const tick = setInterval(() => {
            const elapsed = Date.now() - start;
            const pct = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(pct);
            if (elapsed >= duration) { clearInterval(tick); onClose(); }
        }, 30);

        return () => clearInterval(tick);
    }, []);

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 1070,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1rem',
                animation: 'fadeIn 0.15s ease',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'var(--bg-card, #fff)',
                    borderRadius: 18,
                    padding: '2.5rem 2rem 1.5rem',
                    maxWidth: 420, width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Big checkmark */}
                <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    background: 'rgba(22,163,74,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                }}>
                    <FaCircleCheck size={36} style={{ color: '#16a34a' }} />
                </div>

                <h4 style={{ fontWeight: 800, fontSize: '1.15rem',
                              color: 'var(--bethel-primary)', marginBottom: 6 }}>
                    Changes Saved!
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
                    Your profile has been updated successfully.
                </p>



                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                    Click anywhere to dismiss
                </p>

                {/* Progress bar */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 0,
                    height: 4, width: `${progress}%`,
                    background: '#16a34a',
                    transition: 'width 0.03s linear',
                    borderRadius: '0 0 0 18px',
                }} />
            </div>

            <style>{`@keyframes fadeIn { from { opacity:0 } to { opacity:1 } }`}</style>
        </div>
    );
}

function PersonalTab({ user, onSaved }) {
    const [form, setForm]       = useState({});
    const [errors, setErrors]   = useState({});
    const [saving, setSaving]   = useState(false);
    const [changes, setChanges] = useState(null); // null = modal hidden

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
    };

    const handlePhone = (e) => {
        // Allow digits, +, -, spaces — max 20 chars
        const val = e.target.value.replace(/[^\d+\- ]/g, '').slice(0, 20);
        set('phone', val);
    };

    const save = async () => {
        setSaving(true); setErrors({});
        // Snapshot before values for diff
        const before = { ...form };
        try {
            const res = await axios.patch('/api/profile/personal', form);
            // Compute what actually changed
            const diff = Object.keys(FIELD_LABELS)
                .filter(k => before[k] !== undefined && before[k] !== res.data[k] && res.data[k] !== undefined)
                .map(k => ({ label: FIELD_LABELS[k], from: before[k] || '', to: res.data[k] || '' }));
            setChanges(diff);
            if (onSaved) onSaved(res.data);
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors || {});
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4">
            {changes !== null && (
                <SaveSuccessModal changes={changes} onClose={() => setChanges(null)} />
            )}

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
    const [form, setForm]       = useState({ username: '', email: '' });
    const [errors, setErrors]   = useState({});
    const [saving, setSaving]   = useState(false);
    const [changes, setChanges] = useState(null);

    const emailVerified = user?.email_verified;

    useEffect(() => {
        if (!user) return;
        setForm({ username: user.username, email: user.email });
    }, [user]);

    const set = (name, value) => {
        setForm(p => ({ ...p, [name]: value }));
        setErrors(p => ({ ...p, [name]: null }));
    };

    const save = async () => {
        setSaving(true); setErrors({});
        const before = { username: user.username, email: user.email };
        const payload = { username: form.username };
        if (!emailVerified) payload.email = form.email;

        try {
            const res = await axios.patch('/api/profile/account', payload);
            const diff = Object.keys(payload)
                .filter(k => before[k] !== res.data[k] && res.data[k] !== undefined)
                .map(k => ({ label: FIELD_LABELS[k], from: before[k] || '', to: res.data[k] || '' }));
            setChanges(diff);
            if (onSaved) onSaved(res.data);
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors || {});
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-4">
            {changes !== null && (
                <SaveSuccessModal changes={changes} onClose={() => setChanges(null)} />
            )}

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

// ── Avatar Upload with preview modal ─────────────────────────
function AvatarUpload({ currentAvatar, initials, onUploaded }) {
    const { upload, uploading } = useCloudinaryUpload();
    const [preview,   setPreview]   = useState(currentAvatar ?? null);
    const [pendingFile, setPending] = useState(null);   // file not yet confirmed
    const [pendingUrl,  setPendingUrl] = useState(null); // object URL for preview
    const [showModal,   setShowModal] = useState(false);
    const [saving,      setSaving]   = useState(false);
    const [msg,         setMsg]      = useState(null);
    const inputRef = useRef();

    useEffect(() => { setPreview(currentAvatar ?? null); }, [currentAvatar]);

    // When user picks a file — show modal preview, don't upload yet
    function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const objectUrl = URL.createObjectURL(file);
        setPending(file);
        setPendingUrl(objectUrl);
        setShowModal(true);
        e.target.value = '';
    }

    // User confirmed in modal — now upload to Cloudinary + save
    async function handleConfirm() {
        if (!pendingFile) return;
        setSaving(true);
        setMsg(null);
        try {
            const url = await upload(pendingFile, 'bethel_app/avatars');
            await window.axios.patch('/api/profile/avatar', { avatar_url: url });
            setPreview(url);
            onUploaded(url);
            setMsg({ ok: true, text: 'Photo updated!' });
        } catch {
            setMsg({ ok: false, text: 'Upload failed. Try again.' });
        } finally {
            setSaving(false);
            handleClose();
        }
    }

    function handleClose() {
        if (pendingUrl) URL.revokeObjectURL(pendingUrl);
        setPending(null);
        setPendingUrl(null);
        setShowModal(false);
    }

    const AVATAR_SIZE = 110;

    return (
        <>
            {/* Avatar circle */}
            <div style={{ position: 'relative', width: AVATAR_SIZE, height: AVATAR_SIZE, margin: '0 auto 14px' }}>
                <div
                    onClick={() => inputRef.current?.click()}
                    title="Change profile photo"
                    style={{
                        width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: '50%',
                        background: preview ? 'transparent' : 'var(--bethel-secondary)',
                        color: 'var(--bethel-primary)',
                        display: 'grid', placeItems: 'center',
                        fontSize: '2.2rem', fontWeight: 800,
                        border: '4px solid #fff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'opacity 0.15s',
                    }}
                >
                    {preview
                        ? <img src={preview} alt="Avatar"
                               style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : (uploading
                            ? <FaSpinner size={28} style={{ animation: 'spin 1s linear infinite' }} />
                            : initials)
                    }
                </div>

                {/* Camera badge */}
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading || saving}
                    title="Upload photo"
                    style={{
                        position: 'absolute', bottom: 4, right: 4,
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'var(--bethel-primary)', color: '#fff',
                        border: '2.5px solid #fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', padding: 0,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                    }}
                >
                    {saving
                        ? <FaSpinner size={11} style={{ animation: 'spin 1s linear infinite' }} />
                        : <FaCamera size={11} />}
                </button>

                <input ref={inputRef} type="file" accept="image/*"
                       style={{ display: 'none' }} onChange={handleFile} />
            </div>

            {/* Feedback */}
            {msg && (
                <p style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: 8,
                    color: msg.ok ? '#16a34a' : '#ef4444' }}>
                    {msg.text}
                </p>
            )}

            {/* ── Confirmation modal ────────────────────────── */}
            {showModal && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1060,
                        background: 'rgba(0,0,0,0.55)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '1rem',
                    }}
                    onClick={handleClose}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-card, #fff)',
                            borderRadius: 16, padding: '2rem',
                            maxWidth: 360, width: '100%',
                            textAlign: 'center',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        }}
                    >
                        <h5 style={{ fontWeight: 800, color: 'var(--bethel-primary)',
                                     marginBottom: 6, fontSize: '1rem' }}>
                            Set Profile Photo?
                        </h5>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                            This will be your new profile picture.
                        </p>

                        {/* Preview */}
                        <div style={{
                            width: 120, height: 120, borderRadius: '50%',
                            overflow: 'hidden', margin: '0 auto 1.5rem',
                            border: '4px solid var(--bethel-secondary)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        }}>
                            <img src={pendingUrl} alt="Preview"
                                 style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <button
                                onClick={handleClose}
                                disabled={saving}
                                style={{
                                    flex: 1, padding: '9px 0', borderRadius: 9,
                                    border: '1.5px solid var(--border-color, #d1d5db)',
                                    background: 'transparent',
                                    color: 'var(--text-primary)', fontWeight: 600,
                                    fontSize: '0.875rem', cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={saving}
                                style={{
                                    flex: 1, padding: '9px 0', borderRadius: 9,
                                    border: 'none',
                                    background: 'var(--bethel-primary)', color: '#fff',
                                    fontWeight: 700, fontSize: '0.875rem',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    opacity: saving ? 0.7 : 1,
                                    display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', gap: 6,
                                }}
                            >
                                {saving
                                    ? <><FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</>
                                    : 'Save Photo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

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
                    <div className="row g-4 justify-content-center">

                        {/* ── Identity card ──────────────────────── */}
                        <div className="col-12 col-md-8 col-lg-5">
                            <div className="card shadow-sm border-0 text-center"
                                 style={{ borderRadius: 18, overflow: 'hidden' }}>
                                {/* Banner */}
                                <div style={{
                                    height: 90,
                                    background: 'linear-gradient(135deg, var(--bethel-hero-start), var(--bethel-hero-end))',
                                }} />
                                <div className="card-body" style={{ paddingBottom: '1.75rem' }}>
                                    {/* Avatar — overlaps the banner */}
                                    <div style={{ marginTop: -72, marginBottom: 10 }}>
                                        <AvatarUpload
                                            currentAvatar={user?.avatar_url}
                                            initials={initials}
                                            onUploaded={(url) => setUser(prev => ({ ...prev, avatar_url: url }))}
                                        />
                                    </div>
                                    <h4 style={{ fontWeight: 800, color: 'var(--bethel-primary)', fontSize: '1.25rem', marginBottom: 3 }}>
                                        {user?.first_name} {user?.last_name}
                                    </h4>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 10 }}>
                                        @{user?.username}
                                    </p>
                                    <span className={`badge bg-${ROLE_BADGE[user?.role] ?? 'secondary'} mb-3`}
                                          style={{ fontSize: '0.75rem', padding: '5px 14px', borderRadius: 999 }}>
                                        {user?.role_label}
                                    </span>
                                    <hr style={{ margin: '0.75rem 0 1.1rem' }} />
                                    <div style={{ fontSize: '0.83rem', textAlign: 'left' }}>
                                        {[
                                            { Icon: FaEnvelope,    val: user?.email },
                                            { Icon: FaPhone,       val: user?.phone || '—' },
                                            { Icon: FaLocationDot, val: user?.city  || '—' },
                                            { Icon: FaCalendar,    val: `Joined ${user?.joined}` },
                                            ...(user?.parish_name ? [{ Icon: FaChurch, val: user.parish_name }] : []),
                                        ].map(({ Icon, val }, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                                                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(26,60,94,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <Icon size={12} style={{ color: 'var(--bethel-secondary)' }} />
                                                </div>
                                                <span style={{ color: 'var(--text-muted)', wordBreak: 'break-word', paddingTop: 5 }}>{val}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Edit tabs ──────────────────────────── */}
                        <div className="col-12 col-lg-7">
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
