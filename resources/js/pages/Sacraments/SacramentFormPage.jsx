import React, { useState, useCallback, useEffect } from 'react';
import ICON_MAP from '@/config/iconMap';
import {
    FaHandsPraying, FaChurch, FaUser, FaPhone, FaCalendarDays,
    FaClock, FaUsers, FaChevronLeft, FaCircleCheck, FaTriangleExclamation,
    FaSpinner, FaLock, FaArrowRight,
} from 'react-icons/fa6';

// ─────────────────────────────────────────────────────────────
// Fixed field labels (always shown, not from form_schema)
// ─────────────────────────────────────────────────────────────
const FIXED_FIELDS_META = [
    { key: 'parish_id',      label: 'Parish',               icon: FaChurch       },
    { key: 'preferred_date', label: 'Preferred Date',        icon: FaCalendarDays },
    { key: 'preferred_time', label: 'Preferred Time',        icon: FaClock        },
    { key: 'participants',   label: 'Number of Participants', icon: FaUsers       },
];

// ─────────────────────────────────────────────────────────────
// Individual dynamic field renderer
// ─────────────────────────────────────────────────────────────
function DynamicField({ field, value, onChange, error }) {
    const base = 'form-control';
    const cls  = error ? `${base} is-invalid` : base;

    const handleChange = useCallback((val) => onChange(field.id, val), [field.id, onChange]);

    switch (field.type) {
        case 'short_text':
            return (
                <input
                    type="text"
                    className={cls}
                    value={value ?? ''}
                    placeholder={field.placeholder ?? ''}
                    onChange={e => handleChange(e.target.value)}
                />
            );

        case 'long_text':
            return (
                <textarea
                    className={cls}
                    rows={3}
                    value={value ?? ''}
                    placeholder={field.placeholder ?? ''}
                    onChange={e => handleChange(e.target.value)}
                    style={{ resize: 'vertical' }}
                />
            );

        case 'date':
            return (
                <input
                    type="date"
                    className={cls}
                    value={value ?? ''}
                    onChange={e => handleChange(e.target.value)}
                />
            );

        case 'time':
            return (
                <input
                    type="time"
                    className={cls}
                    value={value ?? ''}
                    onChange={e => handleChange(e.target.value)}
                />
            );

        case 'number':
            return (
                <input
                    type="number"
                    className={cls}
                    value={value ?? ''}
                    placeholder={field.placeholder ?? ''}
                    onChange={e => handleChange(e.target.value)}
                    min={0}
                />
            );

        case 'phone':
            return (
                <input
                    type="tel"
                    className={cls}
                    value={value ?? ''}
                    placeholder={field.placeholder ?? 'e.g. 09XX XXX XXXX'}
                    onChange={e => handleChange(e.target.value)}
                />
            );

        case 'radio':
            return (
                <div>
                    {(field.options ?? []).map(opt => (
                        <div className="form-check" key={opt}>
                            <input
                                className="form-check-input"
                                type="radio"
                                id={`${field.id}_${opt}`}
                                name={field.id}
                                value={opt}
                                checked={value === opt}
                                onChange={() => handleChange(opt)}
                            />
                            <label className="form-check-label" htmlFor={`${field.id}_${opt}`}>
                                {opt}
                            </label>
                        </div>
                    ))}
                </div>
            );

        case 'checkbox':
            return (
                <div>
                    {(field.options ?? []).map(opt => {
                        const checked = Array.isArray(value) && value.includes(opt);
                        return (
                            <div className="form-check" key={opt}>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`${field.id}_${opt}`}
                                    checked={checked}
                                    onChange={() => {
                                        const current = Array.isArray(value) ? value : [];
                                        handleChange(
                                            checked
                                                ? current.filter(v => v !== opt)
                                                : [...current, opt]
                                        );
                                    }}
                                />
                                <label className="form-check-label" htmlFor={`${field.id}_${opt}`}>
                                    {opt}
                                </label>
                            </div>
                        );
                    })}
                </div>
            );

        case 'file':
            return (
                <div>
                    <input
                        type="file"
                        className={cls}
                        onChange={e => handleChange(e.target.files[0]?.name ?? '')}
                    />
                    <div className="form-text" style={{ fontSize: '0.75rem' }}>
                        Note: File upload will be handled upon confirmation. Please bring the original document to the parish office.
                    </div>
                </div>
            );

        default:
            return null;
    }
}

// ─────────────────────────────────────────────────────────────
// Success screen
// ─────────────────────────────────────────────────────────────
function SuccessScreen({ sacramentName }) {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    window.location.href = '/sacraments';
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-center py-5">
            {/* Animated checkmark circle */}
            <div style={{
                width: 90, height: 90, borderRadius: '50%',
                background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                display: 'grid', placeItems: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: '0 0 0 8px rgba(16,185,129,0.1)',
                animation: 'popIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
            }}>
                <FaCircleCheck size={40} color="#10b981" />
            </div>

            <h2 className="fw-bold mb-2" style={{ color: 'var(--bethel-primary)', fontSize: '1.6rem' }}>
                Request Submitted!
            </h2>

            <p className="text-muted mb-2" style={{ maxWidth: 440, margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Your <strong>{sacramentName}</strong> request has been received.
                Parish staff will review it and reach out to confirm your appointment.
            </p>

            {/* What happens next */}
            <div style={{
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 10, padding: '0.75rem 1.25rem',
                maxWidth: 380, margin: '1.25rem auto',
                textAlign: 'left',
            }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 1 }}>
                    What happens next
                </p>
                {['Parish staff reviews your request', 'You will be contacted to confirm the schedule', 'Bring required documents on the day'].map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 4, fontSize: '0.8rem', color: '#065f46' }}>
                        <FaCircleCheck size={11} style={{ flexShrink: 0, marginTop: 2 }} />
                        {step}
                    </div>
                ))}
            </div>

            {/* Countdown */}
            <p style={{ fontSize: '0.78rem', color: '#aaa', marginBottom: '1rem' }}>
                Redirecting in {countdown}s…
            </p>

            <div className="d-flex gap-3 justify-content-center flex-wrap">
                <a href="/sacraments" className="btn btn-outline-secondary btn-sm px-4">
                    <FaHandsPraying size={12} className="me-2" />
                    Book Another
                </a>
                <a href="/" className="btn btn-sm px-4 fw-semibold"
                   style={{ background: 'var(--bethel-primary)', color: '#fff' }}>
                    Back to Home
                    <FaArrowRight size={12} className="ms-2" />
                </a>
            </div>

            <style>{`
                @keyframes popIn {
                    from { transform: scale(0.5); opacity: 0; }
                    to   { transform: scale(1);   opacity: 1; }
                }
            `}</style>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Main form page
// ─────────────────────────────────────────────────────────────
export default function SacramentFormPage({
    sacramentType,
    parishes     = [],
    prefill      = null,
    isAuth       = false,
}) {
    const Icon = ICON_MAP[sacramentType?.icon]?.Icon ?? ICON_MAP['hands'].Icon;

    // ── Fixed field state ─────────────────────────────────────
    const [parishId,       setParishId]       = useState('');
    const [preferredDate,  setPreferredDate]  = useState('');
    const [preferredTime,  setPreferredTime]  = useState('');
    const [participants,   setParticipants]   = useState(1);

    // ── Dynamic field state ───────────────────────────────────
    const customFields = sacramentType?.form_schema?.fields ?? [];
    const [details, setDetails] = useState({});
    const handleDetail = useCallback((id, val) => {
        setDetails(prev => ({ ...prev, [id]: val }));
    }, []);

    // ── UI state ──────────────────────────────────────────────
    const [errors,    setErrors]    = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted,  setSubmitted]  = useState(false);
    const [serverError, setServerError] = useState(null);

    // ── Today's date for min attribute ────────────────────────
    const today = new Date().toISOString().split('T')[0];

    // ── Validation ────────────────────────────────────────────
    const validate = () => {
        const e = {};

        if (!parishId)      e.parish_id      = 'Please select a parish.';
        if (!preferredDate) e.preferred_date = 'Please select a date.';
        if (!preferredTime) e.preferred_time = 'Please select a time.';
        if (!participants || participants < 1) e.participants = 'Enter number of participants.';

        customFields.forEach(field => {
            if (!field.required) return;
            const val = details[field.id];
            const empty =
                val === undefined || val === null || val === '' ||
                (Array.isArray(val) && val.length === 0);
            if (empty) e[`detail_${field.id}`] = `"${field.label}" is required.`;
        });

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── Submit ────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError(null);

        if (!validate()) {
            // Scroll to first error
            const firstErr = document.querySelector('.is-invalid, .bethel-field-error');
            firstErr?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setSubmitting(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

            const res = await fetch('/sacraments/submit', {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'Accept':        'application/json',
                    'X-CSRF-TOKEN':  csrfToken,
                },
                body: JSON.stringify({
                    sacrament_type_id: sacramentType.id,
                    parish_id:         parseInt(parishId),
                    preferred_date:    preferredDate,
                    preferred_time:    preferredTime,
                    participants:      parseInt(participants),
                    details,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 422 && data.errors) {
                    // Map Laravel validation errors back to fields
                    const mapped = {};
                    Object.entries(data.errors).forEach(([k, msgs]) => {
                        mapped[k] = msgs[0];
                    });
                    setErrors(mapped);
                } else {
                    setServerError(data.message ?? 'Something went wrong. Please try again.');
                }
                return;
            }

            setSubmitted(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch {
            setServerError('Network error. Please check your connection and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Not logged in guard ───────────────────────────────────
    if (!isAuth) {
        return (
            <div className="container py-5" style={{ maxWidth: 560 }}>
                <div className="card border-0 shadow-sm text-center p-5">
                    <FaLock size={32} style={{ color: 'var(--bethel-primary)', margin: '0 auto 1rem' }} />
                    <h4 className="fw-bold mb-2">Login Required</h4>
                    <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
                        You need to be logged in to submit a sacrament request.
                    </p>
                    <div className="d-flex gap-2 justify-content-center">
                        <a href="/login" className="btn btn-sm px-4 fw-semibold"
                           style={{ background: 'var(--bethel-primary)', color: '#fff' }}>
                            Log In
                        </a>
                        <a href="/register" className="btn btn-outline-secondary btn-sm px-4">
                            Register
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // ── Success screen ────────────────────────────────────────
    if (submitted) {
        return (
            <div className="container py-5" style={{ maxWidth: 560 }}>
                <div className="card border-0 shadow-sm p-4 p-md-5">
                    <SuccessScreen sacramentName={sacramentType?.name} />
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* ── Page header ── */}
            <section style={{
                background: 'linear-gradient(135deg, var(--bethel-primary) 0%, #1a4a7a 100%)',
                padding: '3rem 0 2.5rem',
                color: '#fff',
            }}>
                <div className="container" style={{ maxWidth: 720 }}>
                    <a href="/sacraments"
                       className="d-inline-flex align-items-center gap-2 mb-3"
                       style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', textDecoration: 'none' }}
                       onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                       onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}>
                        <FaChevronLeft size={10} /> Back to Sacraments
                    </a>

                    <div className="d-flex align-items-center gap-3">
                        <div style={{
                            width: 58, height: 58, borderRadius: 14, flexShrink: 0,
                            background: sacramentType?.icon_bg ?? 'rgba(255,255,255,0.2)',
                            display: 'grid', placeItems: 'center',
                        }}>
                            <Icon size={24} color={sacramentType?.icon_color ?? '#fff'} />
                        </div>
                        <div>
                            <h1 className="fw-bold mb-1" style={{ fontSize: '1.6rem' }}>
                                {sacramentType?.name}
                            </h1>
                            {sacramentType?.description && (
                                <p style={{ opacity: 0.8, fontSize: '0.875rem', margin: 0 }}>
                                    {sacramentType.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Form ── */}
            <section className="py-5">
                <div className="container" style={{ maxWidth: 720 }}>

                    {/* Server error */}
                    {serverError && (
                        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4"
                             style={{ fontSize: '0.875rem' }}>
                            <FaTriangleExclamation size={14} />
                            {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>

                        {/* ── Pre-filled info card ── */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header" style={{
                                background: 'rgba(26,60,94,0.05)',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                color: 'var(--bethel-primary)',
                                borderBottom: '1px solid rgba(0,0,0,0.06)',
                            }}>
                                <FaUser size={12} className="me-2" />
                                Your Information
                            </div>
                            <div className="card-body">
                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={prefill?.name ?? ''}
                                            readOnly
                                            style={{ background: 'var(--bs-secondary-bg, #f8f9fa)' }}
                                        />
                                        <div className="form-text" style={{ fontSize: '0.72rem' }}>
                                            Auto-filled from your account
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                                            Contact Number
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <FaPhone size={12} />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={prefill?.phone ?? ''}
                                                readOnly
                                                style={{ background: 'var(--bs-secondary-bg, #f8f9fa)' }}
                                            />
                                        </div>
                                        <div className="form-text" style={{ fontSize: '0.72rem' }}>
                                            Auto-filled from your account
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Fixed scheduling fields ── */}
                        <div className="card border-0 shadow-sm mb-4">
                            <div className="card-header" style={{
                                background: 'rgba(26,60,94,0.05)',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                color: 'var(--bethel-primary)',
                                borderBottom: '1px solid rgba(0,0,0,0.06)',
                            }}>
                                <FaCalendarDays size={12} className="me-2" />
                                Scheduling Details
                            </div>
                            <div className="card-body">
                                <div className="row g-3">

                                    {/* Parish */}
                                    <div className="col-12">
                                        <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                                            Parish <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <FaChurch size={12} />
                                            </span>
                                            <select
                                                className={`form-select${errors.parish_id ? ' is-invalid' : ''}`}
                                                value={parishId}
                                                onChange={e => { setParishId(e.target.value); setErrors(p => ({ ...p, parish_id: '' })); }}
                                            >
                                                <option value="">— Select a parish —</option>
                                                {parishes.map(p => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}{p.city ? ` — ${p.city}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.parish_id && (
                                            <div className="invalid-feedback d-block">{errors.parish_id}</div>
                                        )}
                                    </div>

                                    {/* Date + Time */}
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                                            Preferred Date <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <FaCalendarDays size={12} />
                                            </span>
                                            <input
                                                type="date"
                                                className={`form-control${errors.preferred_date ? ' is-invalid' : ''}`}
                                                value={preferredDate}
                                                min={today}
                                                onChange={e => { setPreferredDate(e.target.value); setErrors(p => ({ ...p, preferred_date: '' })); }}
                                            />
                                        </div>
                                        {errors.preferred_date && (
                                            <div className="invalid-feedback d-block">{errors.preferred_date}</div>
                                        )}
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                                            Preferred Time <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <FaClock size={12} />
                                            </span>
                                            <input
                                                type="time"
                                                className={`form-control${errors.preferred_time ? ' is-invalid' : ''}`}
                                                value={preferredTime}
                                                onChange={e => { setPreferredTime(e.target.value); setErrors(p => ({ ...p, preferred_time: '' })); }}
                                            />
                                        </div>
                                        {errors.preferred_time && (
                                            <div className="invalid-feedback d-block">{errors.preferred_time}</div>
                                        )}
                                    </div>

                                    {/* Participants */}
                                    <div className="col-12 col-md-6">
                                        <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                                            Number of Participants <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <FaUsers size={12} />
                                            </span>
                                            <input
                                                type="number"
                                                className={`form-control${errors.participants ? ' is-invalid' : ''}`}
                                                value={participants}
                                                min={1}
                                                max={500}
                                                onChange={e => { setParticipants(e.target.value); setErrors(p => ({ ...p, participants: '' })); }}
                                            />
                                        </div>
                                        {errors.participants && (
                                            <div className="invalid-feedback d-block">{errors.participants}</div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* ── Custom fields from admin schema ── */}
                        {customFields.length > 0 && (
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header" style={{
                                    background: 'rgba(26,60,94,0.05)',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                    color: 'var(--bethel-primary)',
                                    borderBottom: '1px solid rgba(0,0,0,0.06)',
                                }}>
                                    <FaHandsPraying size={12} className="me-2" />
                                    {sacramentType?.name} Details
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        {customFields.map(field => (
                                            <div
                                                key={field.id}
                                                className={field.type === 'long_text' || field.type === 'file' ? 'col-12' : 'col-12 col-md-6'}
                                            >
                                                <label className="form-label fw-semibold" style={{ fontSize: '0.82rem' }}>
                                                    {field.label}
                                                    {field.required && <span className="text-danger ms-1">*</span>}
                                                </label>
                                                <DynamicField
                                                    field={field}
                                                    value={details[field.id]}
                                                    onChange={handleDetail}
                                                    error={errors[`detail_${field.id}`]}
                                                />
                                                {errors[`detail_${field.id}`] && (
                                                    <div className="invalid-feedback d-block" style={{ fontSize: '0.78rem' }}>
                                                        {errors[`detail_${field.id}`]}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Submit bar ── */}
                        <div className="d-flex gap-3 align-items-center justify-content-between flex-wrap pt-2">
                            <a href="/sacraments"
                               className="btn btn-outline-secondary btn-sm px-4">
                                <FaChevronLeft size={10} className="me-1" /> Cancel
                            </a>
                            <button
                                type="submit"
                                className="btn btn-sm px-5 fw-bold"
                                style={{ background: 'var(--bethel-primary)', color: '#fff', minWidth: 180 }}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <FaSpinner size={12} className="me-2"
                                            style={{ animation: 'spin 1s linear infinite' }} />
                                        Submitting…
                                    </>
                                ) : (
                                    <>
                                        <FaHandsPraying size={12} className="me-2" />
                                        Submit Request
                                    </>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </section>

            {/* Spinner keyframe */}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}