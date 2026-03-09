import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    FaPlus, FaCalendarDays, FaPencil, FaTrash,
    FaBan, FaCircleCheck, FaVideo, FaChurch,
    FaRotate, FaCalendarXmark, FaXmark, FaChevronLeft, FaChevronRight,
} from 'react-icons/fa6';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const MASS_TYPES = [
    'Regular','Family','Youth','Daily',
    'Evening','Midday','Anticipated','Pilgrimage',
];

const TYPE_ACCENT = {
    Regular:    '#1a3c5e',
    Family:     '#059669',
    Youth:      '#7c3aed',
    Daily:      '#b45309',
    Evening:    '#4338ca',
    Midday:     '#0e7490',
    Anticipated:'#be185d',
    Pilgrimage: '#dc2626',
};

const EMPTY_FORM = {
    parish_id: '', clergy_id: '', type: 'Regular',
    schedule_type: 'recurring', day_of_week: '', specific_date: '',
    start_time: '', end_time: '', livestream_url: '', is_active: true, notes: '',
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function csrf() {
    return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

async function api(method, url, body) {
    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw data;
    return data;
}

function fmt12(t) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
}

// Week navigation helpers
function getWeekSunday(offset = 0) {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + offset * 7);
    d.setHours(0,0,0,0);
    return d;
}

function addDays(date, n) {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
}

function toISO(date) {
    return date.toISOString().split('T')[0];
}

function fmtDateLabel(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function StatPill({ label, value, color }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '14px 24px', borderRadius: '12px',
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--border-color, #e5e7eb)',
            minWidth: 100,
        }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: color || 'var(--primary, #1a3c5e)' }}>{value}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap' }}>{label}</span>
        </div>
    );
}

// Schedule card inside a grid cell
function ScheduleCard({ s, onEdit, onDelete, onCancel, cancelledDates }) {
    const accent    = TYPE_ACCENT[s.type] || '#1a3c5e';
    // For one_time entries the cancelled date IS the specific_date; for recurring check per-week-date
    const isCancelled = cancelledDates?.includes(s._dateKey);

    return (
        <div style={{
            borderLeft: `3px solid ${isCancelled ? '#ef4444' : accent}`,
            background: isCancelled ? 'rgba(239,68,68,0.04)' : `${accent}09`,
            borderRadius: '7px',
            padding: '8px 10px',
            marginBottom: '6px',
            opacity: isCancelled ? 0.7 : 1,
            position: 'relative',
        }}>
            {/* Time */}
            <div style={{ fontWeight: 700, fontSize: '0.78rem', color: isCancelled ? '#9ca3af' : 'var(--text-color, #111)', textDecoration: isCancelled ? 'line-through' : 'none' }}>
                {fmt12(s.start_time)}{s.end_time ? ` – ${fmt12(s.end_time)}` : ''}
            </div>

            {/* Type + parish */}
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.4 }}>
                <span style={{ color: accent, fontWeight: 600 }}>{s.type}</span>
                {s.parish && <span> · {s.parish}</span>}
            </div>
            {s.celebrant && (
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>{s.celebrant}</div>
            )}

            {/* CANCELLED chip */}
            {isCancelled && (
                <span style={{
                    display: 'inline-block', marginTop: '4px',
                    padding: '1px 7px', borderRadius: '10px',
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.03em',
                    background: 'rgba(239,68,68,0.12)', color: '#dc2626',
                    border: '1px solid rgba(239,68,68,0.2)',
                }}>
                    CANCELLED
                </span>
            )}

            {/* Livestream dot */}
            {s.livestream_url && !isCancelled && (
                <span title="Has livestream" style={{
                    position: 'absolute', top: 6, right: 6,
                    background: '#ef4444', borderRadius: '50%',
                    width: 7, height: 7, display: 'block',
                }} />
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                <button onClick={() => onEdit(s)} title="Edit" style={btnStyle('#e5e7eb','#111',22)}>
                    <FaPencil size={10} />
                </button>
                {!isCancelled ? (
                    <button onClick={() => onCancel(s)} title="Cancel this occurrence" style={btnStyle('rgba(239,68,68,0.1)','#dc2626',22)}>
                        <FaBan size={10} />
                    </button>
                ) : (
                    <button onClick={() => onCancel(s, true)} title="Restore (remove cancel)" style={btnStyle('rgba(16,185,129,0.1)','#059669',22)}>
                        <FaCircleCheck size={10} />
                    </button>
                )}
                <button onClick={() => onDelete(s)} title="Delete permanently" style={btnStyle('rgba(239,68,68,0.08)','#dc2626',22)}>
                    <FaTrash size={10} />
                </button>
            </div>
        </div>
    );
}

function btnStyle(bg, color, size) {
    return {
        width: size, height: size, border: 'none', cursor: 'pointer',
        borderRadius: '5px', background: bg, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    };
}

// ─────────────────────────────────────────────────────────────
// Form Modal
// ─────────────────────────────────────────────────────────────
function ScheduleModal({ open, onClose, onSave, form, setForm, parishes, clergy, errors, saving }) {
    if (!open) return null;

    const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

    const filteredClergy = form.parish_id
        ? clergy.filter(c => !c.parish_id || c.parish_id === parseInt(form.parish_id))
        : clergy;

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1050, padding: '20px',
        }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{
                background: 'var(--card-bg, #fff)',
                borderRadius: '16px', width: '100%', maxWidth: 540,
                maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid var(--border-color, #e5e7eb)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    position: 'sticky', top: 0, background: 'var(--card-bg, #fff)',
                    borderRadius: '16px 16px 0 0', zIndex: 1,
                }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                        {form.id ? 'Edit Mass Schedule' : 'Add Mass Schedule'}
                    </div>
                    <button onClick={onClose} style={{ ...btnStyle('transparent','var(--text-muted)',30), fontSize: '1rem' }}>
                        <FaXmark size={14} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                        {/* Parish */}
                        <div style={{ gridColumn: '1/-1' }}>
                            <Field label="Parish *" error={errors?.parish_id}>
                                <select value={form.parish_id} onChange={e => change('parish_id', e.target.value)} style={selectStyle}>
                                    <option value="">Select Parish</option>
                                    {parishes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </Field>
                        </div>

                        {/* Mass Type */}
                        <Field label="Mass Type *" error={errors?.type}>
                            <select value={form.type} onChange={e => change('type', e.target.value)} style={selectStyle}>
                                {MASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </Field>

                        {/* Celebrant */}
                        <Field label="Celebrant" error={errors?.clergy_id}>
                            <select value={form.clergy_id} onChange={e => change('clergy_id', e.target.value)} style={selectStyle}>
                                <option value="">— None assigned —</option>
                                {filteredClergy.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </Field>

                        {/* Schedule Type */}
                        <div style={{ gridColumn: '1/-1' }}>
                            <label style={labelStyle}>Schedule Type *</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {[
                                    { val: 'recurring', icon: <FaRotate size={12} />, label: 'Recurring (weekly)' },
                                    { val: 'one_time',  icon: <FaCalendarXmark size={12} />, label: 'One-time (specific date)' },
                                ].map(opt => (
                                    <button key={opt.val} type="button"
                                        onClick={() => change('schedule_type', opt.val)}
                                        style={{
                                            flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                            border: `2px solid ${form.schedule_type === opt.val ? '#1a3c5e' : 'var(--border-color, #e5e7eb)'}`,
                                            background: form.schedule_type === opt.val ? 'rgba(26,60,94,0.06)' : 'var(--input-bg, #fff)',
                                            color: form.schedule_type === opt.val ? '#1a3c5e' : 'var(--text-muted)',
                                            fontWeight: form.schedule_type === opt.val ? 700 : 400,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                            fontSize: '0.82rem', transition: 'all 0.15s',
                                        }}
                                    >
                                        {opt.icon} {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Day of week (recurring) */}
                        {form.schedule_type === 'recurring' && (
                            <div style={{ gridColumn: '1/-1' }}>
                                <label style={labelStyle}>Day of Week *</label>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {DAYS.map((d, i) => (
                                        <button key={i} type="button"
                                            onClick={() => change('day_of_week', i)}
                                            style={{
                                                padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                                                border: `1.5px solid ${parseInt(form.day_of_week) === i ? '#1a3c5e' : 'var(--border-color, #e5e7eb)'}`,
                                                background: parseInt(form.day_of_week) === i ? '#1a3c5e' : 'var(--input-bg, #fff)',
                                                color: parseInt(form.day_of_week) === i ? '#fff' : 'var(--text-color, #111)',
                                                fontSize: '0.78rem', fontWeight: 600,
                                            }}
                                        >
                                            {d.slice(0,3)}
                                        </button>
                                    ))}
                                </div>
                                {errors?.day_of_week && <div style={errStyle}>{errors.day_of_week}</div>}
                            </div>
                        )}

                        {/* Specific date (one_time) */}
                        {form.schedule_type === 'one_time' && (
                            <div style={{ gridColumn: '1/-1' }}>
                                <Field label="Date *" error={errors?.specific_date}>
                                    <input type="date" value={form.specific_date}
                                        onChange={e => change('specific_date', e.target.value)}
                                        style={inputStyle} />
                                </Field>
                            </div>
                        )}

                        {/* Start time */}
                        <Field label="Start Time *" error={errors?.start_time}>
                            <input type="time" value={form.start_time}
                                onChange={e => change('start_time', e.target.value)}
                                style={inputStyle} />
                        </Field>

                        {/* End time */}
                        <Field label="End Time">
                            <input type="time" value={form.end_time}
                                onChange={e => change('end_time', e.target.value)}
                                style={inputStyle} />
                        </Field>

                        {/* Livestream */}
                        <div style={{ gridColumn: '1/-1' }}>
                            <Field label="Livestream URL" error={errors?.livestream_url}>
                                <input type="url" value={form.livestream_url} placeholder="https://..."
                                    onChange={e => change('livestream_url', e.target.value)}
                                    style={inputStyle} />
                            </Field>
                        </div>

                        {/* Notes */}
                        <div style={{ gridColumn: '1/-1' }}>
                            <Field label="Notes">
                                <textarea value={form.notes} rows={2}
                                    onChange={e => change('notes', e.target.value)}
                                    style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }} />
                            </Field>
                        </div>

                        {/* Active toggle */}
                        <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input type="checkbox" id="is_active" checked={form.is_active}
                                onChange={e => change('is_active', e.target.checked)}
                                style={{ width: 16, height: 16, cursor: 'pointer' }} />
                            <label htmlFor="is_active" style={{ fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500 }}>
                                Active (visible to parishioners)
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                        <button onClick={onClose} style={{
                            padding: '9px 20px', borderRadius: '8px', border: '1.5px solid var(--border-color, #e5e7eb)',
                            background: 'transparent', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
                            color: 'var(--text-color, #111)',
                        }}>
                            Cancel
                        </button>
                        <button onClick={onSave} disabled={saving} style={{
                            padding: '9px 20px', borderRadius: '8px', border: 'none',
                            background: '#1a3c5e', color: '#fff', cursor: 'pointer',
                            fontSize: '0.875rem', fontWeight: 700, opacity: saving ? 0.6 : 1,
                        }}>
                            {saving ? 'Saving…' : (form.id ? 'Save Changes' : 'Add Schedule')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Cancel modal — pick a date + optional reason
function CancelModal({ open, schedule, onClose, onConfirm, saving }) {
    const [date,   setDate]   = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (open && schedule) {
            // Pre-fill with this week's date for the relevant day
            const today = new Date();
            if (schedule.schedule_type === 'one_time' && schedule.specific_date) {
                setDate(schedule.specific_date);
            } else {
                // Next occurrence of that day_of_week
                const dow    = schedule.day_of_week ?? 0;
                const target = new Date(today);
                target.setDate(today.getDate() + ((dow - today.getDay() + 7) % 7));
                setDate(toISO(target));
            }
            setReason('');
        }
    }, [open, schedule]);

    if (!open) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1060, padding: '20px',
        }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{ background: 'var(--card-bg,#fff)', borderRadius: '14px', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
                <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border-color,#e5e7eb)', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Cancel Occurrence</span>
                    <button onClick={onClose} style={{ ...btnStyle('transparent','var(--text-muted)',28) }}><FaXmark size={13} /></button>
                </div>
                <div style={{ padding: '20px 22px' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 16px' }}>
                        Marking a single occurrence as cancelled. Parishioners will see this on the schedule.
                    </p>
                    <Field label="Date to Cancel *">
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
                    </Field>
                    <div style={{ marginTop: '14px' }}>
                        <Field label="Reason (shown publicly)">
                            <textarea value={reason} rows={2} onChange={e => setReason(e.target.value)}
                                style={{ ...inputStyle, resize: 'vertical', minHeight: 52 }} placeholder="e.g. No mass on this date due to parish feast day." />
                        </Field>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                        <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: '8px', border: '1.5px solid var(--border-color,#e5e7eb)', background: 'transparent', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-color,#111)' }}>
                            Cancel
                        </button>
                        <button onClick={() => onConfirm(date, reason)} disabled={!date || saving} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 700, opacity: (!date || saving) ? 0.6 : 1 }}>
                            {saving ? 'Saving…' : 'Mark Cancelled'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Shared form field wrapper
function Field({ label, children, error }) {
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            {children}
            {error && <div style={errStyle}>{Array.isArray(error) ? error[0] : error}</div>}
        </div>
    );
}

const inputStyle = { width: '100%', padding: '8px 11px', borderRadius: '7px', fontSize: '0.875rem', border: '1.5px solid var(--border-color, #d1d5db)', background: 'var(--input-bg, #fff)', color: 'var(--text-color, #111)', boxSizing: 'border-box', outline: 'none' };
const selectStyle = { ...inputStyle, appearance: 'auto' };
const labelStyle = { display: 'block', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '5px' };
const errStyle = { fontSize: '0.75rem', color: '#dc2626', marginTop: '3px' };

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function MassScheduleAdmin() {
    const { parishes = [], clergy = [] } = window.__ADMIN_DATA__ || {};

    const [schedules,      setSchedules]      = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [weekOffset,     setWeekOffset]     = useState(0);
    const [filterParish,   setFilterParish]   = useState('');
    const [filterType,     setFilterType]     = useState('');

    // Modal state
    const [modal,          setModal]          = useState(false);
    const [form,           setForm]           = useState(EMPTY_FORM);
    const [formErrors,     setFormErrors]     = useState({});
    const [saving,         setSaving]         = useState(false);

    const [cancelModal,    setCancelModal]    = useState(false);
    const [cancelTarget,   setCancelTarget]   = useState(null);
    const [cancelSaving,   setCancelSaving]   = useState(false);

    // Cancellation map: { scheduleId: [dateString, ...] }
    const [cancelledMap,   setCancelledMap]   = useState({});

    // ── Computed week dates ───────────────────────────────────
    const weekSunday = getWeekSunday(weekOffset);
    const weekDates  = DAYS.map((_, i) => toISO(addDays(weekSunday, i)));
    const today      = toISO(new Date());

    // ── Load schedules ────────────────────────────────────────
    const loadSchedules = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ active_only: false });
            if (filterParish) params.append('parish_id', filterParish);
            if (filterType)   params.append('type', filterType);
            const data = await api('GET', `/admin/api/mass-schedules?${params}`);
            setSchedules(data);

            // Also fetch cancellations for current week
            const ids = data.map(s => s.id);
            if (ids.length === 0) { setCancelledMap({}); return; }

            // Build cancellation lookup from show() detail — batch via individual fetches is expensive
            // Instead, fetch public API for the week to get cancel data cross-referenced
            const cancelRes = await fetch(
                `/api/mass-schedules/public?${filterParish ? `parish_id=${filterParish}&` : ''}` +
                `week_offset=${weekOffset}`
            );
            if (cancelRes.ok) {
                const pub = await cancelRes.json();
                const map = {};
                Object.values(pub.schedules || {}).flat().forEach(entry => {
                    if (entry.is_cancelled) {
                        if (!map[entry.id]) map[entry.id] = [];
                        map[entry.id].push(entry._dateKey ?? pub.week_start);
                    }
                });
                setCancelledMap(map);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [filterParish, filterType, weekOffset]);

    useEffect(() => { loadSchedules(); }, [loadSchedules]);

    // ── Grid bucketing ────────────────────────────────────────
    // Returns schedules that "appear" in a given column (day index 0-6)
    function slotsForDay(dayIndex) {
        const dateStr = weekDates[dayIndex];
        return schedules
            .filter(s => {
                if (s.schedule_type === 'recurring') return s.day_of_week === dayIndex;
                return s.specific_date === dateStr;
            })
            .map(s => ({
                ...s,
                _dateKey: dateStr,
            }))
            .sort((a, b) => (a.start_time > b.start_time ? 1 : -1));
    }

    // ── Stats ─────────────────────────────────────────────────
    const total     = schedules.length;
    const recurring = schedules.filter(s => s.schedule_type === 'recurring').length;
    const oneTime   = schedules.filter(s => s.schedule_type === 'one_time').length;
    const inactive  = schedules.filter(s => !s.is_active).length;

    // ── CRUD handlers ─────────────────────────────────────────
    function openAdd() {
        setForm({ ...EMPTY_FORM });
        setFormErrors({});
        setModal(true);
    }

    function openEdit(s) {
        setForm({
            id:             s.id,
            parish_id:      s.parish_id ?? '',
            clergy_id:      s.clergy_id ?? '',
            type:           s.type,
            schedule_type:  s.schedule_type,
            day_of_week:    s.day_of_week ?? '',
            specific_date:  s.specific_date ?? '',
            start_time:     s.start_time,
            end_time:       s.end_time ?? '',
            livestream_url: s.livestream_url ?? '',
            is_active:      s.is_active,
            notes:          s.notes ?? '',
        });
        setFormErrors({});
        setModal(true);
    }

    async function handleSave() {
        setSaving(true);
        setFormErrors({});
        try {
            const payload = {
                ...form,
                clergy_id:  form.clergy_id   || null,
                end_time:   form.end_time     || null,
                day_of_week: form.schedule_type === 'recurring' ? parseInt(form.day_of_week) : null,
                specific_date: form.schedule_type === 'one_time' ? form.specific_date || null : null,
                livestream_url: form.livestream_url || null,
            };
            if (form.id) {
                await api('PATCH', `/admin/api/mass-schedules/${form.id}`, payload);
            } else {
                await api('POST', '/admin/api/mass-schedules', payload);
            }
            setModal(false);
            loadSchedules();
        } catch (err) {
            if (err?.errors) setFormErrors(err.errors);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(s) {
        if (!confirm(`Delete this ${s.type} mass schedule? This cannot be undone.`)) return;
        try {
            await api('DELETE', `/admin/api/mass-schedules/${s.id}`);
            loadSchedules();
        } catch (e) { alert('Delete failed.'); }
    }

    function openCancel(s, isUndo = false) {
        if (isUndo) {
            // Find cancellation id and remove it
            handleUncancel(s);
            return;
        }
        setCancelTarget(s);
        setCancelModal(true);
    }

    async function handleCancelConfirm(date, reason) {
        setCancelSaving(true);
        try {
            await api('POST', `/admin/api/mass-schedules/${cancelTarget.id}/cancel`, {
                cancelled_date: date,
                reason: reason || null,
            });
            setCancelModal(false);
            loadSchedules();
        } catch (e) { alert('Failed to cancel.'); }
        finally { setCancelSaving(false); }
    }

    async function handleUncancel(s) {
        // Fetch detail to get cancellation id
        try {
            const detail = await api('GET', `/admin/api/mass-schedules/${s.id}`);
            const cancellation = detail.cancellations?.[0];
            if (!cancellation) return;
            if (!confirm('Remove this cancellation?')) return;
            await api('DELETE', `/admin/api/mass-schedules/${s.id}/cancel/${cancellation.id}`);
            loadSchedules();
        } catch (e) { alert('Failed to remove cancellation.'); }
    }

    // ── Render ────────────────────────────────────────────────
    return (
        <div style={{ padding: '32px', minHeight: '100vh' }}>

            {/* Page header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Mass Schedules</h1>
                    <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Manage all regular and one-time mass schedules across parishes
                    </p>
                </div>
                <button onClick={openAdd} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 20px', borderRadius: '10px', border: 'none',
                    background: '#1a3c5e', color: '#fff', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.875rem',
                }}>
                    <FaPlus size={13} /> Add Mass Schedule
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <StatPill label="Total Schedules" value={total} />
                <StatPill label="Recurring"       value={recurring} color="#059669" />
                <StatPill label="One-Time"        value={oneTime}   color="#7c3aed" />
                <StatPill label="Inactive"        value={inactive}  color="#9ca3af" />
            </div>

            {/* Filters + Week Nav */}
            <div style={{
                display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end',
                marginBottom: '24px', padding: '16px 20px',
                background: 'var(--card-bg, #fff)',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '12px',
            }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                    <label style={labelStyle}>Parish</label>
                    <select value={filterParish} onChange={e => setFilterParish(e.target.value)} style={selectStyle}>
                        <option value="">All Parishes</option>
                        {parishes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div style={{ minWidth: 140 }}>
                    <label style={labelStyle}>Mass Type</label>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selectStyle}>
                        <option value="">All Types</option>
                        {MASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                {/* Week navigator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                    <button onClick={() => setWeekOffset(w => w - 1)} style={{ ...btnStyle('var(--card-bg,#fff)','var(--text-color,#111)',34), border: '1.5px solid var(--border-color,#e5e7eb)', borderRadius: '8px' }}>
                        <FaChevronLeft size={12} />
                    </button>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', minWidth: 160, textAlign: 'center' }}>
                        {fmtDateLabel(weekSunday)} – {fmtDateLabel(addDays(weekSunday, 6))}
                    </span>
                    <button onClick={() => setWeekOffset(w => w + 1)} style={{ ...btnStyle('var(--card-bg,#fff)','var(--text-color,#111)',34), border: '1.5px solid var(--border-color,#e5e7eb)', borderRadius: '8px' }}>
                        <FaChevronRight size={12} />
                    </button>
                    {weekOffset !== 0 && (
                        <button onClick={() => setWeekOffset(0)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1.5px solid var(--border-color,#e5e7eb)', background: 'transparent', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            This Week
                        </button>
                    )}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Loading…
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                    gap: '10px',
                    overflowX: 'auto',
                }}>
                    {DAYS.map((dayName, i) => {
                        const slots  = slotsForDay(i);
                        const isToday = weekDates[i] === today;

                        return (
                            <div key={i} style={{
                                minWidth: 130,
                                background: 'var(--card-bg, #fff)',
                                border: `1.5px solid ${isToday ? '#1a3c5e' : 'var(--border-color, #e5e7eb)'}`,
                                borderRadius: '12px',
                                overflow: 'hidden',
                            }}>
                                {/* Column header */}
                                <div style={{
                                    padding: '10px 12px',
                                    background: isToday ? '#1a3c5e' : 'var(--bg-subtle, rgba(0,0,0,0.02))',
                                    borderBottom: '1px solid var(--border-color, #e5e7eb)',
                                }}>
                                    <div style={{ fontWeight: 800, fontSize: '0.82rem', color: isToday ? '#fff' : 'var(--text-color, #111)' }}>
                                        {dayName}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: isToday ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginTop: '1px' }}>
                                        {fmtDateLabel(addDays(weekSunday, i))}
                                    </div>
                                </div>

                                {/* Slots */}
                                <div style={{ padding: '10px 8px', minHeight: 120 }}>
                                    {slots.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '20px 0', fontSize: '0.72rem', color: 'var(--text-muted)', opacity: 0.6 }}>
                                            No masses
                                        </div>
                                    ) : (
                                        slots.map(s => (
                                            <ScheduleCard
                                                key={`${s.id}-${s._dateKey}`}
                                                s={s}
                                                onEdit={openEdit}
                                                onDelete={handleDelete}
                                                onCancel={openCancel}
                                                cancelledDates={cancelledMap[s.id]}
                                            />
                                        ))
                                    )}

                                    {/* Quick-add button */}
                                    <button onClick={() => {
                                        setForm({ ...EMPTY_FORM, day_of_week: i, schedule_type: 'recurring' });
                                        setFormErrors({});
                                        setModal(true);
                                    }} style={{
                                        width: '100%', padding: '5px', marginTop: '4px',
                                        border: '1.5px dashed var(--border-color, #d1d5db)',
                                        borderRadius: '7px', background: 'transparent', cursor: 'pointer',
                                        fontSize: '0.72rem', color: 'var(--text-muted)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                    }}>
                                        <FaPlus size={9} /> Add
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modals */}
            <ScheduleModal
                open={modal} onClose={() => setModal(false)}
                onSave={handleSave} form={form} setForm={setForm}
                parishes={parishes} clergy={clergy}
                errors={formErrors} saving={saving}
            />
            <CancelModal
                open={cancelModal} schedule={cancelTarget}
                onClose={() => setCancelModal(false)}
                onConfirm={handleCancelConfirm}
                saving={cancelSaving}
            />
        </div>
    );
}