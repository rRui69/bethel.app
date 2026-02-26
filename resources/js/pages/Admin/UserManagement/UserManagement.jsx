import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    FaUserPlus, FaMagnifyingGlass, FaChevronLeft, FaChevronRight,
    FaEllipsisVertical, FaPen, FaBan, FaCircleCheck, FaX,
    FaCircle, FaArrowUpRightFromSquare, FaTriangleExclamation,
    FaCopy, FaCheck, FaTrash, FaKey, FaUser, FaShield, FaSkull,
} from 'react-icons/fa6';

// ── Debounce hook ─────────────────────────────────────────────
function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

// ── Constants ─────────────────────────────────────────────────
const ROLES = [
    { value: 'all',          label: 'All Roles' },
    { value: 'super_admin',  label: 'Ministerial Head IT Admin' },
    { value: 'parish_admin', label: 'Ministerial IT Helpdesk' },
    { value: 'clergymen',    label: 'Clergymen' },
    { value: 'parishioner',  label: 'Parishioner' },
];

const STATUSES = [
    { value: 'all',       label: 'All Statuses' },
    { value: 'Active',    label: 'Active' },
    { value: 'Inactive',  label: 'Inactive' },
    { value: 'Suspended', label: 'Suspended' },
];

// ─────────────────────────────────────────────────────────────
// SHARED FIELD — defined at module level so React never remounts
// it during typing. Defining inside a component would cause the
// input element to be destroyed + recreated on every keystroke.
// ─────────────────────────────────────────────────────────────
function Field({ label, name, type = 'text', value, onChange, error, required, disabled, children }) {
    return (
        <div className="um-field">
            <label className="um-label">{label}{required && ' *'}</label>
            {children || (
                <input
                    className={`um-input${error ? ' um-input--invalid' : ''}`}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    autoComplete="off"
                />
            )}
            {error && (
                <div className="um-field-error">
                    {Array.isArray(error) ? error[0] : error}
                </div>
            )}
        </div>
    );
}

// ── Badges ────────────────────────────────────────────────────
function RoleBadge({ role, label }) {
    return (
        <span className={`um-role-badge um-role-badge--${role}`}>{label}</span>
    );
}

function StatusBadge({ status }) {
    return (
        <span className={`um-status-badge um-status-badge--${status}`}>
            <FaCircle size={5} /> {status}
        </span>
    );
}

// ── Alert ─────────────────────────────────────────────────────
function Alert({ type = 'danger', children }) {
    return (
        <div className={`um-alert um-alert--${type}`}>
            <FaTriangleExclamation size={13} /> {children}
        </div>
    );
}

function Success({ children }) {
    return (
        <div className="um-alert um-alert--success">
            <FaCheck size={13} /> {children}
        </div>
    );
}

// ── Row Action Dropdown ───────────────────────────────────────
// Uses position:fixed anchored to the button's bounding rect so
// the menu always renders above table overflow:hidden clipping.
function RowActions({ user, onEdit, onToggleStatus, onViewDetail }) {
    const [open, setOpen] = useState(false);
    const [pos, setPos]   = useState({ top: 0, right: 0 });
    const btnRef          = useRef(null);
    const menuRef         = useRef(null);
    const isActive        = user.account_status === 'Active';

    const handleOpen = () => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
        }
        setOpen(o => !o);
    };

    useEffect(() => {
        if (!open) return;
        const h = (e) => {
            if (
                menuRef.current && !menuRef.current.contains(e.target) &&
                btnRef.current  && !btnRef.current.contains(e.target)
            ) setOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    return (
        <>
            <button ref={btnRef} className="um-row-action-btn" onClick={handleOpen}>
                <FaEllipsisVertical size={14} />
            </button>

            {open && (
                <div
                    ref={menuRef}
                    className="um-action-menu"
                    style={{ right: pos.right }}  /* only position values — not visual styles */
                >
                    <button className="um-action-item" onClick={() => { onViewDetail(user); setOpen(false); }}>
                        <FaArrowUpRightFromSquare size={12} /> View Details
                    </button>
                    <button className="um-action-item" onClick={() => { onEdit(user); setOpen(false); }}>
                        <FaPen size={12} /> Edit User
                    </button>
                    <div className="um-action-divider">
                        <button
                            className={`um-action-item um-action-item--${isActive ? 'danger' : 'success'}`}
                            onClick={() => { onToggleStatus(user); setOpen(false); }}
                        >
                            {isActive
                                ? <><FaBan size={12} /> Deactivate</>
                                : <><FaCircleCheck size={12} /> Activate</>
                            }
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

// ── Pagination ────────────────────────────────────────────────
function Pagination({ meta, onPageChange }) {
    if (!meta || meta.last_page <= 1) return null;
    const { current_page, last_page, from, to, total } = meta;

    const pages = (() => {
        const start = Math.max(1, Math.min(current_page - 2, last_page - 4));
        const end   = Math.min(last_page, start + 4);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    })();

    return (
        <div className="um-pagination">
            <span className="um-pagination__info">
                Showing {from}–{to} of {total} users
            </span>
            <div className="um-pagination__btns">
                <button
                    className="um-page-btn"
                    onClick={() => onPageChange(current_page - 1)}
                    disabled={current_page <= 1}
                >
                    <FaChevronLeft size={11} />
                </button>
                {pages.map(p => (
                    <button
                        key={p}
                        className={`um-page-btn${p === current_page ? ' um-page-btn--active' : ''}`}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </button>
                ))}
                <button
                    className="um-page-btn"
                    onClick={() => onPageChange(current_page + 1)}
                    disabled={current_page >= last_page}
                >
                    <FaChevronRight size={11} />
                </button>
            </div>
        </div>
    );
}

// ── Edit User Modal ───────────────────────────────────────────
const EDIT_TABS = [
    { id: 'profile',  label: 'Profile Info',   icon: FaUser   },
    { id: 'account',  label: 'Account & Role', icon: FaShield },
    { id: 'password', label: 'Reset Password', icon: FaKey    },
    { id: 'danger',   label: 'Danger Zone',    icon: FaSkull  },
];

function EditUserModal({ userId, onClose, onUpdated, onDeleted }) {
    const [tab, setTab]         = useState('profile');
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving]   = useState(false);
    const [error, setError]     = useState('');
    const [errors, setErrors]   = useState({});
    const [success, setSuccess] = useState('');

    const [profile, setProfile] = useState({
        first_name: '', middle_name: '', last_name: '', username: '',
        email: '', phone: '', gender: 'Male', birth_date: '',
        province: '', city: '', barangay: '', street_address: '', zip_code: '',
    });
    const [acct, setAcct]           = useState({ role: 'parishioner', account_status: 'Active' });
    const [generatedPw, setGenPw]   = useState('');
    const [copied, setCopied]       = useState(false);
    const [deleteConfirm, setDelCfm]= useState('');
    const [deleteType, setDelType]  = useState('soft');

    useEffect(() => {
        window.axios.get(`/admin/api/users/${userId}`)
            .then(r => {
                const u = r.data;
                setUser(u);
                setProfile({
                    first_name:     u.first_name     || '',
                    middle_name:    u.middle_name    || '',
                    last_name:      u.last_name      || '',
                    username:       u.username       || '',
                    email:          u.email          || '',
                    phone:          u.phone          || '',
                    gender:         u.gender         || 'Male',
                    birth_date:     u.birth_date     || '',
                    province:       u.province       || '',
                    city:           u.city           || '',
                    barangay:       u.barangay       || '',
                    street_address: u.street_address || '',
                    zip_code:       u.zip_code       || '',
                });
                setAcct({ role: u.role, account_status: u.account_status });
            })
            .catch(() => setError('Failed to load user.'))
            .finally(() => setLoading(false));
    }, [userId]);

    const clearFeedback = () => { setError(''); setSuccess(''); };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(p => ({ ...p, [name]: value }));
        if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
        clearFeedback();
    };

    const handleAcctChange = (e) => {
        const { name, value } = e.target;
        setAcct(p => ({ ...p, [name]: value }));
        clearFeedback();
    };

    const saveProfile = async () => {
        setSaving(true); clearFeedback(); setErrors({});
        try {
            const res = await window.axios.patch(`/admin/api/users/${userId}`, profile);
            setSuccess(res.data.message);
            onUpdated(res.data.user);
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors || {});
            else setError(err.response?.data?.message || 'Update failed.');
        } finally { setSaving(false); }
    };

    const saveAccount = async () => {
        setSaving(true); clearFeedback();
        try {
            const res = await window.axios.patch(`/admin/api/users/${userId}`, acct);
            setSuccess(res.data.message);
            onUpdated(res.data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed.');
        } finally { setSaving(false); }
    };

    const generatePassword = async () => {
        setSaving(true); clearFeedback(); setGenPw('');
        try {
            const res = await window.axios.post(`/admin/api/users/${userId}/reset-password`);
            setGenPw(res.data.generated_password);
            setSuccess(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Reset failed.');
        } finally { setSaving(false); }
    };

    const copyPassword = () => {
        navigator.clipboard.writeText(generatedPw);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        if (deleteConfirm !== user?.username) return;
        setSaving(true); setError('');
        try {
            await window.axios.delete(`/admin/api/users/${userId}`, {
                params: { force: deleteType === 'hard' },
            });
            onDeleted(userId);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Delete failed.');
            setSaving(false);
        }
    };

    const initials = user
        ? ((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase()
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
                            <div className="um-avatar um-avatar--lg">{initials}</div>
                            <div>
                                <h2 className="um-modal__title">{user?.full_name}</h2>
                                <p className="um-modal__sub">@{user?.username} · {user?.email}</p>
                            </div>
                        </div>
                    )}
                    <button className="um-modal__close" onClick={onClose}><FaX size={12} /></button>
                </div>

                {/* Tabs */}
                <div className="um-tabs">
                    {EDIT_TABS.map(t => {
                        const isDanger = t.id === 'danger';
                        const isActive = tab === t.id;
                        let cls = 'um-tab';
                        if (isActive && isDanger)   cls += ' um-tab--danger-active';
                        else if (isActive)           cls += ' um-tab--active';
                        else if (isDanger)           cls += ' um-tab--danger';
                        return (
                            <button key={t.id} className={cls}
                                onClick={() => { setTab(t.id); clearFeedback(); }}>
                                <t.icon size={11} /> {t.label}
                            </button>
                        );
                    })}
                </div>

                {/* Body */}
                <div className="um-modal__body um-modal__body--scroll">
                    {loading ? (
                        <div className="um-modal-loading">Loading…</div>
                    ) : (
                        <>
                            {error   && <Alert>{error}</Alert>}
                            {success && <Success>{success}</Success>}

                            {/* Profile Info */}
                            {tab === 'profile' && (
                                <>
                                    <div className="um-grid-2">
                                        <Field label="First Name" name="first_name" value={profile.first_name} onChange={handleProfileChange} error={errors.first_name} required />
                                        <Field label="Last Name" name="last_name" value={profile.last_name} onChange={handleProfileChange} error={errors.last_name} required />
                                    </div>
                                    <Field label="Middle Name (optional)" name="middle_name" value={profile.middle_name} onChange={handleProfileChange} />
                                    <div className="um-grid-2">
                                        <Field label="Username" name="username" value={profile.username} onChange={handleProfileChange} error={errors.username} required />
                                        <Field label="Email Address" name="email" type="email" value={profile.email} onChange={handleProfileChange} error={errors.email} required />
                                    </div>
                                    <div className="um-grid-2">
                                        <Field label="Phone Number" name="phone" value={profile.phone} onChange={e => {
                                            // Remove non-numeric characters
                                            const digitsOnly = e.target.value.replace(/\D/g, '');
                                            if (digitsOnly.length > 10) digitsOnly = digitsOnly.slice(0, 10);
                                            
                                            setProfile(prev => ({ ...prev, phone: digitsOnly }));
                                          }

                                        } error={errors.phone} required />
                                        <Field label="Gender" name="gender" value={profile.gender} onChange={handleProfileChange} required>
                                            <select className="um-select" name="gender" value={profile.gender} onChange={handleProfileChange}>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Prefer not to say">Prefer not to say</option>
                                            </select>
                                        </Field>
                                    </div>
                                    <Field label="Date of Birth" name="birth_date" type="date" value={profile.birth_date} onChange={handleProfileChange} error={errors.birth_date} required />
                                    <div className="um-grid-2">
                                        <Field label="Province" name="province" value={profile.province} onChange={handleProfileChange} />
                                        <Field label="City / Municipality" name="city" value={profile.city} onChange={handleProfileChange} error={errors.city} required />
                                    </div>
                                    <div className="um-grid-2">
                                        <Field label="Barangay" name="barangay" value={profile.barangay} onChange={handleProfileChange} error={errors.barangay} required />
                                        <Field label="ZIP Code" name="zip_code" value={profile.zip_code} onChange={handleProfileChange} />
                                    </div>
                                    <Field label="Street Address (optional)" name="street_address" value={profile.street_address} onChange={handleProfileChange} />
                                </>
                            )}

                            {/* Account & Role */}
                            {tab === 'account' && (
                                <>
                                    <p className="um-tab-hint">
                                        Changing the role immediately updates this user's access level.
                                        Deactivating prevents sign-in without deleting their record.
                                    </p>
                                    <Field label="Role" name="role" value={acct.role} onChange={handleAcctChange} required>
                                        <select className="um-select" name="role" value={acct.role} onChange={handleAcctChange}>
                                            {ROLES.filter(r => r.value !== 'all').map(r => (
                                                <option key={r.value} value={r.value}>{r.label}</option>
                                            ))}
                                        </select>
                                    </Field>
                                    <Field label="Account Status" name="account_status" value={acct.account_status} onChange={handleAcctChange} required>
                                        <select className="um-select" name="account_status" value={acct.account_status} onChange={handleAcctChange}>
                                            {STATUSES.filter(s => s.value !== 'all').map(s => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </Field>
                                </>
                            )}

                            {/* Reset Password */}
                            {tab === 'password' && (
                                <>
                                    <p className="um-tab-hint">
                                        A secure random password will be generated and shown once.
                                        Copy it and share it with the user — it won't appear again.
                                    </p>
                                    {generatedPw ? (
                                        <div className="um-pw-reveal">
                                            <div className="um-pw-reveal__label">Generated Password</div>
                                            <div className="um-pw-reveal__row">
                                                <code className="um-pw-reveal__code">{generatedPw}</code>
                                                <button className="um-btn um-btn--outline" onClick={copyPassword}>
                                                    {copied ? <><FaCheck size={11} /> Copied!</> : <><FaCopy size={11} /> Copy</>}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="um-pw-placeholder">
                                            Click "Generate Password" to create a new password for this user.
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Danger Zone */}
                            {tab === 'danger' && (
                                <div className="um-danger-zone">
                                    <div className="um-danger-zone__title">Delete this user account</div>
                                    <p className="um-danger-zone__desc">
                                        Choose the deletion type. To confirm, type the username&nbsp;
                                        <strong>{user?.username}</strong> below.
                                    </p>

                                    <div className="um-delete-type-row">
                                        {[
                                            { value: 'soft', label: 'Soft Delete',      desc: 'Hides user, can be restored' },
                                            { value: 'hard', label: 'Permanent Delete', desc: 'Removed from database forever' },
                                        ].map(dt => (
                                            <label
                                                key={dt.value}
                                                className={`um-delete-type-option${deleteType === dt.value ? ' um-delete-type-option--selected' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="deleteType"
                                                    value={dt.value}
                                                    checked={deleteType === dt.value}
                                                    onChange={e => setDelType(e.target.value)}
                                                    style={{ marginRight: 8 }}
                                                />
                                                <span className="um-delete-type-option__title">{dt.label}</span>
                                                <div className="um-delete-type-option__desc">{dt.desc}</div>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="um-confirm-field">
                                        <label className="um-label">Type username to confirm *</label>
                                        <input
                                            className={`um-input${deleteConfirm && deleteConfirm !== user?.username ? ' um-input--invalid' : ''}`}
                                            placeholder={user?.username}
                                            value={deleteConfirm}
                                            onChange={e => setDelCfm(e.target.value)}
                                        />
                                    </div>

                                    <button
                                        className="um-btn um-btn--danger um-btn--full"
                                        disabled={deleteConfirm !== user?.username || saving}
                                        onClick={handleDelete}
                                    >
                                        {deleteType === 'hard'
                                            ? <><FaSkull size={13} /> {saving ? 'Deleting…' : 'Permanently Delete User'}</>
                                            : <><FaTrash size={13} /> {saving ? 'Deleting…' : 'Soft Delete User'}</>
                                        }
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="um-modal__footer">
                    <button className="um-btn um-btn--outline" onClick={onClose} disabled={saving}>Close</button>
                    {tab === 'profile'  && <button className="um-btn um-btn--primary" onClick={saveProfile}  disabled={saving || loading}>{saving ? 'Saving…' : 'Save Profile'}</button>}
                    {tab === 'account' && <button className="um-btn um-btn--primary" onClick={saveAccount}  disabled={saving || loading}>{saving ? 'Saving…' : 'Save Changes'}</button>}
                    {tab === 'password' && (
                        <button className="um-btn um-btn--primary" onClick={generatePassword} disabled={saving || loading}>
                            <FaKey size={12} /> {saving ? 'Generating…' : 'Generate Password'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Status Toggle Confirm ─────────────────────────────────────
function StatusConfirmModal({ user, onClose, onConfirm }) {
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const isActive  = user?.account_status === 'Active';
    const newStatus = isActive ? 'Inactive' : 'Active';

    const confirm = async () => {
        setLoading(true); setError('');
        try {
            const res = await window.axios.patch(`/admin/api/users/${user.id}`, { account_status: newStatus });
            onConfirm(res.data.user);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed.');
        } finally { setLoading(false); }
    };

    return (
        <div className="um-overlay" onClick={onClose}>
            <div className="um-modal um-modal--narrow" onClick={e => e.stopPropagation()}>
                <div className="um-modal__header">
                    <h2 className="um-modal__title">{isActive ? 'Deactivate Account' : 'Activate Account'}</h2>
                    <button className="um-modal__close" onClick={onClose}><FaX size={12} /></button>
                </div>
                <div className="um-modal__body">
                    {error && <Alert>{error}</Alert>}
                    <p className="um-tab-hint">
                        {isActive
                            ? <>Are you sure you want to <strong>deactivate</strong> <strong>{user.full_name}</strong>? They will no longer be able to sign in.</>
                            : <>Are you sure you want to <strong>reactivate</strong> <strong>{user.full_name}</strong>? They will regain access to their account.</>
                        }
                    </p>
                </div>
                <div className="um-modal__footer">
                    <button className="um-btn um-btn--outline" onClick={onClose} disabled={loading}>Cancel</button>
                    <button
                        className={`um-btn um-btn--${isActive ? 'danger' : 'success'}`}
                        onClick={confirm}
                        disabled={loading}
                    >
                        {loading ? 'Updating…' : isActive ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── User Detail Modal ─────────────────────────────────────────
function UserDetailModal({ userId, onClose, onEdit }) {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.axios.get(`/admin/api/users/${userId}`)
            .then(r => setUser(r.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [userId]);

    return (
        <div className="um-overlay" onClick={onClose}>
            <div className="um-modal um-modal--wide" onClick={e => e.stopPropagation()}>
                <div className="um-modal__header">
                    <h2 className="um-modal__title">User Details</h2>
                    <button className="um-modal__close" onClick={onClose}><FaX size={12} /></button>
                </div>
                <div className="um-modal__body um-modal__body--scroll-tall">
                    {loading ? (
                        <div className="um-modal-loading">Loading…</div>
                    ) : user ? (
                        <>
                            <div className="um-detail-header">
                                <div className="um-avatar um-avatar--xl">
                                    {((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase()}
                                </div>
                                <div>
                                    <div className="um-detail-header__name">{user.full_name}</div>
                                    <div className="um-detail-header__username">@{user.username}</div>
                                    <div className="um-detail-header__badges">
                                        <RoleBadge role={user.role} label={user.role_label} />
                                        <StatusBadge status={user.account_status} />
                                    </div>
                                </div>
                            </div>
                            <div className="um-detail-grid">
                                {[
                                    ['Email',    user.email],
                                    ['Phone',    user.phone || '—'],
                                    ['Gender',   user.gender || '—'],
                                    ['Birthday', user.birth_date || '—'],
                                    ['City',     user.city || '—'],
                                    ['Barangay', user.barangay || '—'],
                                    ['Province', user.province || '—'],
                                    ['Country',  user.country || '—'],
                                    ['Address',  user.street_address || '—'],
                                    ['ZIP',      user.zip_code || '—'],
                                    ['Joined',   user.joined],
                                ].map(([label, val]) => (
                                    <div key={label} className="um-detail-row">
                                        <span className="um-detail-label">{label}</span>
                                        <span className="um-detail-value">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="um-modal-loading">User not found.</div>
                    )}
                </div>
                <div className="um-modal__footer">
                    <button className="um-btn um-btn--outline" onClick={onClose}>Close</button>
                    {user && (
                        <button className="um-btn um-btn--primary" onClick={() => { onClose(); onEdit({ id: userId }); }}>
                            <FaPen size={11} /> Edit User
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Create User Modal ─────────────────────────────────────────
const CREATE_INIT = {
    username: '', email: '', password: '', role: 'parishioner',
    first_name: '', middle_name: '', last_name: '',
    birth_date: '', gender: 'Male', phone: '', city: '', barangay: '',
};

function CreateUserModal({ onClose, onCreated }) {
    const [form, setForm]       = useState(CREATE_INIT);
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);
    const [general, setGeneral] = useState('');

    // Uses module-level Field — no remounting, typing works correctly
    const handle = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (general) setGeneral('');
    };

    const submit = async () => {
        setLoading(true); setErrors({}); setGeneral('');
        try {
            const res = await window.axios.post('/admin/api/users', form);
            onCreated(res.data.user);
            onClose();
        } catch (err) {
            if (err.response?.status === 422) setErrors(err.response.data.errors ?? {});
            else setGeneral(err.response?.data?.message || 'Something went wrong.');
        } finally { setLoading(false); }
    };

    return (
        <div className="um-overlay" onClick={onClose}>
            <div className="um-modal um-modal--wide" onClick={e => e.stopPropagation()}>
                <div className="um-modal__header">
                    <div>
                        <h2 className="um-modal__title">Create New User</h2>
                        <p className="um-modal__sub">Fill in the details to add a new system user.</p>
                    </div>
                    <button className="um-modal__close" onClick={onClose}><FaX size={12} /></button>
                </div>

                <div className="um-modal__body um-modal__body--scroll-tall">
                    {general && <Alert>{general}</Alert>}

                    <div className="um-section-label">Account Credentials</div>
                    <div className="um-grid-2">
                        <Field label="Username" name="username" value={form.username} onChange={handle} error={errors.username} required />
                        <Field label="Email Address" name="email" type="email" value={form.email} onChange={handle} error={errors.email} required />
                    </div>
                    <Field label="Temporary Password" name="password" type="password" value={form.password} onChange={handle} error={errors.password} required />
                    <Field label="Role" name="role" value={form.role} onChange={handle} error={errors.role} required>
                        <select className={`um-select${errors.role ? ' um-select--invalid' : ''}`} name="role" value={form.role} onChange={handle}>
                            {ROLES.filter(r => r.value !== 'all').map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </Field>

                    <div className="um-section-label um-section-label--spaced">Personal Information</div>
                    <div className="um-grid-2">
                        <Field label="First Name" name="first_name" value={form.first_name} onChange={handle} error={errors.first_name} required />
                        <Field label="Last Name" name="last_name" value={form.last_name} onChange={handle} error={errors.last_name} required />
                    </div>
                    <Field label="Middle Name (optional)" name="middle_name" value={form.middle_name} onChange={handle} />
                    <div className="um-grid-2">
                        <Field label="Date of Birth" name="birth_date" type="date" value={form.birth_date} onChange={handle} error={errors.birth_date} required />
                        <Field label="Gender" name="gender" value={form.gender} onChange={handle} required>
                            <select className="um-select" name="gender" value={form.gender} onChange={handle}>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                        </Field>
                    </div>
                    <div className="um-grid-2">
                        <Field label="Phone Number" name="phone" value={form.phone} onChange={handle} error={errors.phone} required />
                        <Field label="City / Municipality" name="city" value={form.city} onChange={handle} error={errors.city} required />
                    </div>
                    <Field label="Barangay" name="barangay" value={form.barangay} onChange={handle} error={errors.barangay} required />
                </div>

                <div className="um-modal__footer">
                    <button className="um-btn um-btn--outline" onClick={onClose} disabled={loading}>Cancel</button>
                    <button className="um-btn um-btn--primary" onClick={submit} disabled={loading}>
                        {loading ? 'Creating…' : 'Create User'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main Page Component ───────────────────────────────────────
const STAT_PILLS = [
    { key: 'total',       label: 'Total Users',  dotClass: 'um-stat-pill__dot--gold'   },
    { key: 'active',      label: 'Active',       dotClass: 'um-stat-pill__dot--green'  },
    { key: 'inactive',    label: 'Inactive',     dotClass: 'um-stat-pill__dot--gray'   },
    { key: 'admins',      label: 'Admins',       dotClass: 'um-stat-pill__dot--blue'   },
    { key: 'parishioners',label: 'Parishioners', dotClass: 'um-stat-pill__dot--purple' },
];

export default function UserManagement() {
    const [users, setUsers]     = useState([]);
    const [meta, setMeta]       = useState(null);
    const [stats, setStats]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch]   = useState('');
    const [role, setRole]       = useState('all');
    const [status, setStatus]   = useState('all');
    const [page, setPage]       = useState(1);

    const [editUserId, setEditUserId]     = useState(null);
    const [statusUser, setStatusUser]     = useState(null);
    const [detailUserId, setDetailUserId] = useState(null);
    const [showCreate, setShowCreate]     = useState(false);

    const debouncedSearch = useDebounce(search, 400);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await window.axios.get('/admin/api/users', {
                params: { search: debouncedSearch, role, status, page },
            });
            setUsers(data.data);
            setMeta({
                current_page: data.current_page,
                last_page:    data.last_page,
                from:         data.from,
                to:           data.to,
                total:        data.total,
            });
        } catch {}
        finally { setLoading(false); }
    }, [debouncedSearch, role, status, page]);

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await window.axios.get('/admin/api/users/stats');
            setStats(data);
        } catch {}
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);
    useEffect(() => { fetchStats(); }, [fetchStats]);
    useEffect(() => { setPage(1); }, [debouncedSearch, role, status]);

    const patchUser = (updated) => {
        setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
        fetchStats();
    };

    const removeUser = (id) => {
        setUsers(prev => prev.filter(u => u.id !== id));
        fetchStats();
        fetchUsers();
    };

    return (
        <>
            {/* Page Header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-header__title">User Management</h1>
                    <p className="admin-page-header__sub">Manage all system users — accounts, roles, and access control.</p>
                </div>
                <button className="um-btn um-btn--primary" onClick={() => setShowCreate(true)}>
                    <FaUserPlus size={13} /> Add User
                </button>
            </div>

            {/* Stat Pills */}
            <div className="um-stats-row">
                {STAT_PILLS.map(s => (
                    <div key={s.key} className="um-stat-pill">
                        <div className={`um-stat-pill__dot ${s.dotClass}`} />
                        <div>
                            <div className="um-stat-pill__value">{stats?.[s.key] ?? '—'}</div>
                            <div className="um-stat-pill__label">{s.label}</div>
                        </div>
                    </div>
                ))}
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
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name, username, email…"
                        />
                    </div>
                    <select className="um-filter-select" value={role} onChange={e => setRole(e.target.value)}>
                        {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <select className="um-filter-select" value={status} onChange={e => setStatus(e.target.value)}>
                        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>City</th>
                                <th>Joined</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="um-table-empty">Loading…</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="um-table-empty">No users found matching your filters.</td>
                                </tr>
                            ) : users.map((user, i) => (
                                <tr key={user.id}>
                                    <td className="um-table-num">{((page - 1) * 15) + i + 1}</td>
                                    <td>
                                        <div className="um-table-name">
                                            <div className="um-avatar">
                                                {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                            </div>
                                            <span className="um-full-name">{user.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="um-username">@{user.username}</td>
                                    <td className="um-email">{user.email}</td>
                                    <td><RoleBadge role={user.role} label={user.role_label} /></td>
                                    <td><StatusBadge status={user.account_status} /></td>
                                    <td className="um-city">{user.city || '—'}</td>
                                    <td className="um-joined">{user.joined}</td>
                                    <td>
                                        <RowActions
                                            user={user}
                                            onEdit={u => setEditUserId(u.id)}
                                            onToggleStatus={setStatusUser}
                                            onViewDetail={u => setDetailUserId(u.id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination meta={meta} onPageChange={setPage} />
            </div>

            {/* Modals */}
            {editUserId   && <EditUserModal    userId={editUserId}    onClose={() => setEditUserId(null)}    onUpdated={patchUser}  onDeleted={removeUser} />}
            {statusUser   && <StatusConfirmModal user={statusUser}    onClose={() => setStatusUser(null)}    onConfirm={patchUser}  />}
            {detailUserId && <UserDetailModal  userId={detailUserId}  onClose={() => setDetailUserId(null)}  onEdit={u => { setDetailUserId(null); setEditUserId(u.id); }} />}
            {showCreate   && <CreateUserModal                         onClose={() => setShowCreate(false)}   onCreated={() => { fetchUsers(); fetchStats(); }} />}
        </>
    );
}