import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    FaUserPlus, FaMagnifyingGlass, FaEllipsisVertical, FaPen, FaBan,
    FaCircleCheck, FaX, FaCircle, FaTriangleExclamation, FaCheck,
    FaKey, FaChurch, FaPlus, FaTrash, FaEnvelope, FaPhone,
} from 'react-icons/fa6';

function useDebounce(value, delay = 400) {
    const [deb, setDeb] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDeb(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return deb;
}

const TITLES     = ['Fr.', 'Rev.', 'Msgr.', 'Bp.', 'Cardinal', 'Deacon'];
const DAYS       = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MASS_TYPES = ['Regular Mass', 'Family Mass', 'Youth Mass', 'Daily Mass', 'Evening Mass', 'Midday Mass', 'Anticipated Mass', 'Pilgrimage Mass'];

const inp = {
    width: '100%', padding: '9px 12px', fontSize: '0.875rem',
    border: '1.5px solid var(--border-color, #d1d5db)', borderRadius: '8px',
    background: 'var(--input-bg, #fff)', color: 'var(--text-color, #111)',
    outline: 'none', boxSizing: 'border-box',
};

const card = {
    background: 'var(--card-bg, #fff)',
    border: '1px solid var(--border-color, #e5e7eb)',
    borderRadius: '12px',
};

// ── Field ──────────────────────────────────────────────────────────────
function Field({ label, name, type = 'text', value, onChange, error, required, disabled, children, hint, style }) {
    return (
        <div style={style}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #374151)', marginBottom: '6px' }}>
                {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            {hint && <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginBottom: '5px' }}>{hint}</div>}
            {children || (
                <input
                    style={{ ...inp, ...(error ? { borderColor: '#ef4444' } : {}) }}
                    type={type} name={name} value={value} onChange={onChange}
                    disabled={disabled} autoComplete="off"
                />
            )}
            {error && <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px' }}>{Array.isArray(error) ? error[0] : error}</div>}
        </div>
    );
}

// ── Status Badge ───────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        Active:    { bg: 'rgba(16,185,129,0.1)',   color: '#059669', border: 'rgba(16,185,129,0.3)'  },
        Inactive:  { bg: 'rgba(107,114,128,0.1)',  color: '#4b5563', border: 'rgba(107,114,128,0.3)' },
        Suspended: { bg: 'rgba(239,68,68,0.1)',    color: '#dc2626', border: 'rgba(239,68,68,0.3)'   },
    };
    const t = map[status] || map.Inactive;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px', borderRadius: '20px', fontSize: '0.76rem', fontWeight: 600,
            background: t.bg, color: t.color, border: `1px solid ${t.border}`,
        }}>
            <FaCircle size={5} /> {status}
        </span>
    );
}

// ── Alert ──────────────────────────────────────────────────────────────
function Alert({ children }) {
    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#b91c1c', fontSize: '0.85rem',
        }}>
            <FaTriangleExclamation size={14} style={{ marginTop: '1px', flexShrink: 0 }} />
            {children}
        </div>
    );
}

// ── Schedule Editor ────────────────────────────────────────────────────
function ScheduleEditor({ schedule, onChange }) {
    const rows = Array.isArray(schedule) ? schedule : [];
    const add    = () => onChange([...rows, { day: 'Sunday', time: '6:00 AM', type: 'Regular Mass' }]);
    const remove = (i) => onChange(rows.filter((_, idx) => idx !== i));
    const update = (i, field, val) => onChange(rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary, #374151)' }}>Mass Schedule Slots</span>
                <button type="button" onClick={add} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600,
                    background: 'transparent', border: '1.5px solid var(--border-color, #d1d5db)',
                    color: 'var(--text-secondary, #374151)', cursor: 'pointer',
                }}>
                    <FaPlus size={10} /> Add Slot
                </button>
            </div>
            {rows.length === 0 ? (
                <div style={{
                    padding: '24px', borderRadius: '8px', textAlign: 'center',
                    border: '1.5px dashed var(--border-color, #d1d5db)',
                    color: 'var(--text-muted)', fontSize: '0.83rem',
                }}>
                    No slots yet — click "Add Slot" to begin.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {rows.map((row, i) => (
                        <div key={i} style={{
                            display: 'grid', gridTemplateColumns: '1fr 110px 1fr 36px',
                            gap: '8px', alignItems: 'center',
                            padding: '10px 12px',
                            background: 'var(--bg-subtle, rgba(0,0,0,0.02))',
                            border: '1px solid var(--border-color, #e5e7eb)', borderRadius: '8px',
                        }}>
                            <select style={inp} value={row.day}  onChange={e => update(i, 'day',  e.target.value)}>{DAYS.map(d => <option key={d}>{d}</option>)}</select>
                            <input  style={inp} value={row.time} onChange={e => update(i, 'time', e.target.value)} placeholder="6:00 AM" />
                            <select style={inp} value={row.type} onChange={e => update(i, 'type', e.target.value)}>{MASS_TYPES.map(t => <option key={t}>{t}</option>)}</select>
                            <button type="button" onClick={() => remove(i)} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                width: 36, height: 36, borderRadius: '6px', border: 'none',
                                background: 'rgba(239,68,68,0.08)', color: '#dc2626', cursor: 'pointer',
                            }}>
                                <FaTrash size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Row Actions Dropdown ───────────────────────────────────────────────
function RowActions({ clergy, onEdit, onToggleStatus, onResetPassword }) {
    const [open, setOpen] = useState(false);
    const [pos,  setPos]  = useState({ top: 0, right: 0 });
    const btnRef = useRef(null);
    const menuRef = useRef(null);
    const isActive = clergy.account_status === 'Active';

    const handleOpen = () => {
        if (btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
        }
        setOpen(o => !o);
    };

    useEffect(() => {
        if (!open) return;
        const h = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target) &&
                btnRef.current  && !btnRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    const item = (onClick, icon, label, danger = false) => (
        <button onClick={() => { onClick(); setOpen(false); }} style={{
            display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
            padding: '9px 14px', border: 'none', background: 'none',
            fontSize: '0.84rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left',
            color: danger ? '#dc2626' : 'var(--text-color, #111)', borderRadius: '6px',
        }}
        onMouseEnter={e => e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : 'var(--hover-bg, rgba(0,0,0,0.04))'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            {icon} {label}
        </button>
    );

    return (
        <>
            <button ref={btnRef} onClick={handleOpen} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: '6px', border: 'none',
                background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
            }}>
                <FaEllipsisVertical size={14} />
            </button>
            {open && (
                <div ref={menuRef} style={{
                    position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999,
                    background: 'var(--card-bg, #fff)',
                    border: '1px solid var(--border-color, #e5e7eb)',
                    borderRadius: '10px', padding: '6px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.12)', minWidth: 185,
                }}>
                    {item(() => onEdit(clergy),          <FaPen size={12} />,        'Edit Profile')}
                    {item(() => onResetPassword(clergy), <FaKey size={12} />,        'Reset Password')}
                    <div style={{ height: 1, background: 'var(--border-color, #e5e7eb)', margin: '4px 0' }} />
                    {isActive
                        ? item(() => onToggleStatus(clergy), <FaBan size={12} />,        'Deactivate', true)
                        : item(() => onToggleStatus(clergy), <FaCircleCheck size={12} />, 'Activate')}
                </div>
            )}
        </>
    );
}

// ── Clergy Modal ───────────────────────────────────────────────────────
function ClergyModal({ mode, clergy, parishes, onSave, onClose, loading, errors, apiError }) {
    const isEdit = mode === 'edit';
    const [activeTab, setActiveTab] = useState('personal');

    const blank = {
        first_name: '', last_name: '', middle_name: '',
        email: '', username: '', password: '', password_confirmation: '',
        phone: '', gender: '', birth_date: '',
        // Address
        country: 'Philippines', province: '', city: '', barangay: '', street_address: '', zip_code: '',
        parish_id: parishes[0]?.id || '', title: 'Fr.', specialization: '', schedule: [],
    };

    const [form, setForm] = useState(isEdit && clergy ? {
        ...blank,
        first_name:     clergy.first_name     || '',
        last_name:      clergy.last_name      || '',
        middle_name:    clergy.middle_name    || '',
        email:          clergy.email          || '',
        username:       clergy.username       || '',
        phone:          clergy.phone          || '',
        gender:         clergy.gender         || '',
        birth_date:     clergy.birth_date     || '',
        // Address pre-populated from API response
        country:        clergy.country        || 'Philippines',
        province:       clergy.province       || '',
        city:           clergy.city           || '',
        barangay:       clergy.barangay       || '',
        street_address: clergy.street_address || '',
        zip_code:       clergy.zip_code       || '',
        parish_id:      clergy.parish_id      || parishes[0]?.id || '',
        title:          clergy.title          || 'Fr.',
        specialization: clergy.specialization || '',
        schedule:       clergy.schedule       || [],
    } : blank);

    const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

    const TABS = [
        { id: 'personal', label: 'Personal' },
        { id: 'account',  label: 'Account'  },
        { id: 'ministry', label: 'Ministry' },
        { id: 'schedule', label: 'Schedule' },
    ];

    const tabErr = (tab) => {
        if (!errors) return false;
        const map = {
            personal: ['first_name','last_name','middle_name','phone','gender','birth_date',
                       'country','province','city','barangay','street_address','zip_code'],
            account:  ['email','username','password','password_confirmation'],
            ministry: ['title','parish_id','specialization'],
            schedule: ['schedule'],
        };
        return (map[tab] || []).some(k => errors[k]);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }} onClick={onClose}>
            <div style={{
                background: 'var(--card-bg, #fff)', borderRadius: '16px',
                width: '100%', maxWidth: 640, maxHeight: '90vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ padding: '24px 28px 0', borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                                {isEdit ? 'Edit Clergy Member' : 'Add New Clergy Member'}
                            </h2>
                            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                {isEdit ? 'Update profile and ecclesiastical details' : 'Create a new clergy user account'}
                            </p>
                        </div>
                        <button onClick={onClose} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 36, height: 36, borderRadius: '8px', border: 'none',
                            background: 'var(--hover-bg, rgba(0,0,0,0.06))', cursor: 'pointer',
                        }}>
                            <FaX size={13} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        {TABS.map(t => (
                            <button key={t.id} type="button" onClick={() => setActiveTab(t.id)} style={{
                                padding: '9px 18px', border: 'none', background: 'none', cursor: 'pointer',
                                fontSize: '0.84rem', fontWeight: activeTab === t.id ? 700 : 400,
                                color: activeTab === t.id ? 'var(--primary, #1a3c5e)' : 'var(--text-muted)',
                                borderBottom: activeTab === t.id ? '2px solid var(--primary, #1a3c5e)' : '2px solid transparent',
                                marginBottom: '-1px', position: 'relative',
                            }}>
                                {t.label}
                                {tabErr(t.id) && (
                                    <span style={{ position: 'absolute', top: 7, right: 7, width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
                    {apiError && <Alert>{apiError}</Alert>}

                    {activeTab === 'personal' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <Field label="First Name"  value={form.first_name}  onChange={set('first_name')}  error={errors?.first_name}  required />
                                <Field label="Last Name"   value={form.last_name}   onChange={set('last_name')}   error={errors?.last_name}   required />
                                <Field label="Middle Name" value={form.middle_name} onChange={set('middle_name')} error={errors?.middle_name} />
                                <Field label="Phone" value={form.phone} onChange={set('phone')} error={errors?.phone} required />
                                <Field label="Gender" error={errors?.gender} required>
                                    <select style={{ ...inp, ...(errors?.gender ? { borderColor: '#ef4444' } : {}) }} value={form.gender} onChange={set('gender')}>
                                        <option value="">— Select —</option>
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Prefer not to say</option>
                                    </select>
                                </Field>
                                <Field label="Birth Date" type="date" value={form.birth_date} onChange={set('birth_date')} error={errors?.birth_date} required />
                            </div>

                            {/* Address Section */}
                            <div>
                                <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '14px', paddingBottom: '8px', borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
                                    Address
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <Field label="Street Address" value={form.street_address} onChange={set('street_address')} error={errors?.street_address} style={{ gridColumn: '1 / -1' }} />
                                    <Field label="Barangay"       value={form.barangay}       onChange={set('barangay')}       error={errors?.barangay} />
                                    <Field label="City / Municipality" value={form.city}      onChange={set('city')}           error={errors?.city} />
                                    <Field label="Province"       value={form.province}       onChange={set('province')}       error={errors?.province} />
                                    <Field label="ZIP Code"       value={form.zip_code}       onChange={set('zip_code')}       error={errors?.zip_code} />
                                    <Field label="Country"        value={form.country}        onChange={set('country')}        error={errors?.country} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <Field label="Email Address" type="email" value={form.email} onChange={set('email')} error={errors?.email} required style={{ gridColumn: '1 / -1' }} />
                            <Field label="Username" value={form.username} onChange={set('username')} error={errors?.username} required hint="Lowercase letters, numbers, dots, underscores" style={{ gridColumn: '1 / -1' }} />
                            {!isEdit ? (
                                <>
                                    <Field label="Password" type="password" value={form.password} onChange={set('password')} error={errors?.password} required />
                                    <Field label="Confirm Password" type="password" value={form.password_confirmation} onChange={set('password_confirmation')} error={errors?.password_confirmation} required />
                                </>
                            ) : (
                                <div style={{
                                    gridColumn: '1 / -1', padding: '14px 16px', borderRadius: '8px',
                                    background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)',
                                    fontSize: '0.84rem', color: '#1d4ed8',
                                }}>
                                    To change the password use "Reset Password" from the clergy list.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'ministry' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <Field label="Title" error={errors?.title} required>
                                <select style={inp} value={form.title} onChange={set('title')}>
                                    {TITLES.map(t => <option key={t}>{t}</option>)}
                                </select>
                            </Field>
                            <Field label="Assigned Parish" error={errors?.parish_id} required>
                                <select style={inp} value={form.parish_id} onChange={set('parish_id')}>
                                    {parishes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </Field>
                            <Field label="Specialization" value={form.specialization} onChange={set('specialization')} error={errors?.specialization}
                                hint="e.g. Baptism, Marriage, Anointing" style={{ gridColumn: '1 / -1' }} />
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <ScheduleEditor schedule={form.schedule} onChange={(s) => setForm(f => ({ ...f, schedule: s }))} />
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 28px', borderTop: '1px solid var(--border-color, #e5e7eb)',
                    display: 'flex', justifyContent: 'flex-end', gap: '10px',
                }}>
                    <button onClick={onClose} disabled={loading} style={{
                        padding: '9px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500,
                        border: '1.5px solid var(--border-color, #d1d5db)',
                        background: 'transparent', color: 'var(--text-color, #111)', cursor: 'pointer',
                    }}>Cancel</button>
                    <button onClick={() => onSave(form)} disabled={loading} style={{
                        padding: '9px 24px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600,
                        border: 'none', background: 'var(--primary, #1a3c5e)', color: '#fff',
                        cursor: 'pointer', opacity: loading ? 0.7 : 1,
                    }}>
                        {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Clergy Account'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Reset Password Modal ───────────────────────────────────────────────
function ResetPasswordModal({ clergy, onSave, onClose, loading, errors, apiError }) {
    const [form, setForm] = useState({ password: '', password_confirmation: '' });
    const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }} onClick={onClose}>
            <div style={{
                background: 'var(--card-bg, #fff)', borderRadius: '16px',
                width: '100%', maxWidth: 440,
                boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
            }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-color, #e5e7eb)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Reset Password</h2>
                        <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>For {clergy.titled_name}</p>
                    </div>
                    <button onClick={onClose} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 32, height: 32, borderRadius: '8px', border: 'none',
                        background: 'var(--hover-bg, rgba(0,0,0,0.06))', cursor: 'pointer',
                    }}>
                        <FaX size={12} />
                    </button>
                </div>
                <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    {apiError && <Alert>{apiError}</Alert>}
                    <Field label="New Password" type="password" value={form.password} onChange={set('password')} error={errors?.password} required />
                    <Field label="Confirm Password" type="password" value={form.password_confirmation} onChange={set('password_confirmation')} error={errors?.password_confirmation} required />
                </div>
                <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border-color, #e5e7eb)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onClose} disabled={loading} style={{
                        padding: '9px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500,
                        border: '1.5px solid var(--border-color, #d1d5db)', background: 'transparent',
                        color: 'var(--text-color, #111)', cursor: 'pointer',
                    }}>Cancel</button>
                    <button onClick={() => onSave(form)} disabled={loading} style={{
                        padding: '9px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600,
                        border: 'none', background: 'var(--primary, #1a3c5e)', color: '#fff', cursor: 'pointer',
                    }}>
                        {loading ? 'Resetting…' : 'Reset Password'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main ───────────────────────────────────────────────────────────────
export default function ClergyManagement({ parishes = [] }) {
    const [clergy,       setClergy]       = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [search,       setSearch]       = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterParish, setFilterParish] = useState('all');
    const [modal,        setModal]        = useState(null);
    const [selected,     setSelected]     = useState(null);
    const [saving,       setSaving]       = useState(false);
    const [formErrors,   setFormErrors]   = useState({});
    const [apiError,     setApiError]     = useState('');
    const [toast,        setToast]        = useState('');

    const debSearch = useDebounce(search);
    const showToast  = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };
    const clearModal = () => { setModal(null); setSelected(null); setFormErrors({}); setApiError(''); };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filterStatus !== 'all') params.status    = filterStatus;
            if (filterParish !== 'all') params.parish_id = filterParish;
            if (debSearch)              params.search    = debSearch;
            const { data } = await axios.get('/admin/api/clergy', { params });
            setClergy(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [filterStatus, filterParish, debSearch]);

    useEffect(() => { load(); }, [load]);

    const handleSave = async (form) => {
        setSaving(true); setFormErrors({}); setApiError('');
        try {
            if (modal === 'add') {
                const { data } = await axios.post('/admin/api/clergy', form);
                setClergy(prev => [...prev, data]);
                showToast(`${data.titled_name} created successfully.`);
            } else {
                const { data } = await axios.patch(`/admin/api/clergy/${selected.id}`, form);
                setClergy(prev => prev.map(c => c.id === data.id ? data : c));
                showToast(`${data.titled_name} updated successfully.`);
            }
            clearModal();
        } catch (e) {
            if (e.response?.status === 422) setFormErrors(e.response.data.errors || {});
            else setApiError(e.response?.data?.message || 'An error occurred.');
        } finally { setSaving(false); }
    };

    const handleToggleStatus = async (c) => {
        const next = c.account_status === 'Active' ? 'Inactive' : 'Active';
        try {
            const { data } = await axios.patch(`/admin/api/clergy/${c.id}`, { account_status: next });
            setClergy(prev => prev.map(x => x.id === data.id ? data : x));
            showToast(`${data.titled_name} set to ${next}.`);
        } catch (e) { alert(e.response?.data?.message || 'Failed to update status.'); }
    };

    const handleResetPassword = async (form) => {
        setSaving(true); setFormErrors({}); setApiError('');
        try {
            await axios.post(`/admin/api/clergy/${selected.id}/reset-password`, form);
            showToast('Password reset successfully.');
            clearModal();
        } catch (e) {
            if (e.response?.status === 422) setFormErrors(e.response.data.errors || {});
            else setApiError(e.response?.data?.message || 'Failed to reset password.');
        } finally { setSaving(false); }
    };

    const openEdit = async (c) => {
        try {
            const { data } = await axios.get(`/admin/api/clergy/${c.id}`);
            setSelected(data); setModal('edit');
        } catch { alert('Failed to load clergy details.'); }
    };

    const activeCount = clergy.filter(c => c.account_status === 'Active').length;

    return (
        <div style={{ padding: '32px', maxWidth: 1200 }}>

            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Clergy Management</h1>
                    <p style={{ margin: '6px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Manage clergy user accounts and ecclesiastical profiles
                    </p>
                </div>
                <button onClick={() => setModal('add')} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    padding: '10px 20px', borderRadius: '10px', border: 'none',
                    background: 'var(--primary, #1a3c5e)', color: '#fff',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                }}>
                    <FaUserPlus size={14} /> Add Clergy Member
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
                {[
                    { label: 'Total Clergy', value: clergy.length,            color: '#1a3c5e' },
                    { label: 'Active',        value: activeCount,              color: '#059669' },
                    { label: 'Inactive',      value: clergy.length - activeCount, color: '#6b7280' },
                ].map(s => (
                    <div key={s.label} style={{ ...card, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>{s.label}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                        </div>
                        <FaChurch size={28} style={{ opacity: 0.07 }} />
                    </div>
                ))}
            </div>

            {/* Toast */}
            {toast && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
                    borderRadius: '8px', marginBottom: '20px',
                    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                    color: '#065f46', fontSize: '0.875rem',
                }}>
                    <FaCheck size={13} /> {toast}
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                    <FaMagnifyingGlass size={13} style={{
                        position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                        color: 'var(--text-muted)', pointerEvents: 'none',
                    }} />
                    <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)}
                        style={{ ...inp, paddingLeft: '36px' }} />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...inp, width: 'auto', minWidth: 150 }}>
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                </select>
                <select value={filterParish} onChange={e => setFilterParish(e.target.value)} style={{ ...inp, width: 'auto', minWidth: 180 }}>
                    <option value="all">All Parishes</option>
                    {parishes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            {/* Table */}
            <div style={{ ...card, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
                            {['Clergy Member', 'Parish', 'Specialization', 'Contact', 'Status', ''].map((h, i) => (
                                <th key={i} style={{
                                    padding: '14px 20px', textAlign: 'left',
                                    fontSize: '0.74rem', fontWeight: 700,
                                    textTransform: 'uppercase', letterSpacing: '0.06em',
                                    color: 'var(--text-muted)',
                                    background: 'var(--bg-subtle, rgba(0,0,0,0.02))',
                                    whiteSpace: 'nowrap',
                                    ...(i === 5 ? { width: 52 } : {}),
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading clergy…</td></tr>
                        ) : clergy.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No clergy members found.</td></tr>
                        ) : clergy.map((c, idx) => (
                            <tr key={c.id}
                                style={{ borderBottom: idx < clergy.length - 1 ? '1px solid var(--border-color, #f3f4f6)' : 'none' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg, rgba(0,0,0,0.02))'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '10px', flexShrink: 0,
                                            background: 'linear-gradient(135deg, #1a3c5e, #2563a8)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <FaChurch size={15} color="rgba(255,255,255,0.9)" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{c.titled_name}</div>
                                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>@{c.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{c.parish_name}</div>
                                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>{c.parish_city}</div>
                                </td>
                                <td style={{ padding: '16px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {c.specialization || '—'}
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.83rem', marginBottom: '3px' }}>
                                        <FaEnvelope size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> {c.email}
                                    </div>
                                    {c.phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                                            <FaPhone size={11} style={{ flexShrink: 0 }} /> {c.phone}
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    <StatusBadge status={c.account_status} />
                                </td>
                                <td style={{ padding: '16px 12px 16px 0' }}>
                                    <RowActions clergy={c} onEdit={openEdit} onToggleStatus={handleToggleStatus}
                                        onResetPassword={(x) => { setSelected(x); setModal('reset'); }} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {(modal === 'add' || modal === 'edit') && (
                <ClergyModal mode={modal} clergy={selected} parishes={parishes}
                    onSave={handleSave} onClose={clearModal}
                    loading={saving} errors={formErrors} apiError={apiError} />
            )}
            {modal === 'reset' && selected && (
                <ResetPasswordModal clergy={selected} onSave={handleResetPassword} onClose={clearModal}
                    loading={saving} errors={formErrors} apiError={apiError} />
            )}
        </div>
    );
}