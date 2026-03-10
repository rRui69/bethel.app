import React, { useState, useEffect, useCallback } from 'react';
import {
    FaPlus, FaVideo, FaFacebook, FaPlay, FaStop,
    FaTrash, FaPencil, FaBoxArchive, FaXmark,
    FaTowerBroadcast, FaCircleCheck, FaClock,
} from 'react-icons/fa6';
import AgoraBroadcaster from '@/components/livestream/AgoraBroadcaster';

// Constants
const STATUS_COLORS = {
    scheduled: { bg: 'rgba(99,102,241,0.1)',  text: '#6366f1' },
    live:      { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444' },
    ended:     { bg: 'rgba(156,163,175,0.15)', text: '#6b7280' },
};

const EMPTY_FORM = {
    parish_id: '', title: '', description: '',
    type: 'facebook', facebook_url: '',
};

// Helpers
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

// Sub-components

function StatPill({ label, value, color }) {
    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '14px 24px', borderRadius: '12px',
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--border-color, #e5e7eb)',
            minWidth: 110,
        }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: color || 'var(--primary, #1a3c5e)' }}>
                {value ?? 0}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap' }}>
                {label}
            </span>
        </div>
    );
}

function StatusBadge({ status }) {
    const { bg, text } = STATUS_COLORS[status] || STATUS_COLORS.ended;
    return (
        <span style={{
            padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem',
            fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
            background: bg, color: text,
            display: 'inline-flex', alignItems: 'center', gap: '5px',
        }}>
            {status === 'live' && (
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
            )}
            {status}
        </span>
    );
}

function Field({ label, children, error }) {
    return (
        <div>
            <label style={labelStyle}>{label}</label>
            {children}
            {error && <div style={errStyle}>{Array.isArray(error) ? error[0] : error}</div>}
        </div>
    );
}

const inputStyle = {
    width: '100%', padding: '8px 11px', borderRadius: '7px',
    fontSize: '0.875rem', border: '1.5px solid var(--border-color, #d1d5db)',
    background: 'var(--input-bg, #fff)', color: 'var(--text-color, #111)',
    boxSizing: 'border-box', outline: 'none',
};
const selectStyle  = { ...inputStyle, appearance: 'auto' };
const labelStyle   = { display: 'block', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '5px' };
const errStyle     = { fontSize: '0.75rem', color: '#dc2626', marginTop: '3px' };
function btnStyle(bg, color, size = 30) {
    return { width: size, height: size, border: 'none', cursor: 'pointer', borderRadius: '7px', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
}

// ── Create / Edit Modal ────────────────────────────────────────
function LivestreamModal({ open, onClose, onSave, form, setForm, parishes, errors, saving }) {
    if (!open) return null;
    const change = (k, v) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1050, padding: '20px',
        }} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={{
                background: 'var(--card-bg, #fff)', borderRadius: '16px',
                width: '100%', maxWidth: 520,
                maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid var(--border-color, #e5e7eb)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    position: 'sticky', top: 0, background: 'var(--card-bg, #fff)',
                    borderRadius: '16px 16px 0 0', zIndex: 1,
                }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                        {form.id ? 'Edit Livestream' : 'Create Livestream'}
                    </div>
                    <button onClick={onClose} style={{ ...btnStyle('transparent', 'var(--text-muted)', 30) }}>
                        <FaXmark size={14} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Parish */}
                    <Field label="Parish *" error={errors?.parish_id}>
                        <select value={form.parish_id} onChange={e => change('parish_id', e.target.value)} style={selectStyle}>
                            <option value="">Select Parish</option>
                            {parishes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </Field>

                    {/* Title */}
                    <Field label="Stream Title *" error={errors?.title}>
                        <input
                            type="text" value={form.title}
                            onChange={e => change('title', e.target.value)}
                            placeholder="e.g. Sunday 9AM Mass Livestream"
                            style={inputStyle}
                        />
                    </Field>

                    {/* Description */}
                    <Field label="Description">
                        <textarea
                            value={form.description} rows={2}
                            onChange={e => change('description', e.target.value)}
                            style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
                            placeholder="Optional short description"
                        />
                    </Field>

                    {/* Stream Type — only for new streams, cannot change after creation */}
                    {!form.id && (
                        <div>
                            <label style={labelStyle}>Stream Type *</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {[
                                    { val: 'facebook', icon: <FaFacebook size={14} />, label: 'Facebook Embed' },
                                    { val: 'camera',   icon: <FaVideo size={14} />,    label: 'Camera (Agora)' },
                                ].map(opt => (
                                    <button key={opt.val} type="button"
                                        onClick={() => change('type', opt.val)}
                                        style={{
                                            flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                            border: `2px solid ${form.type === opt.val ? '#1a3c5e' : 'var(--border-color, #e5e7eb)'}`,
                                            background: form.type === opt.val ? 'rgba(26,60,94,0.07)' : 'var(--input-bg, #fff)',
                                            color: form.type === opt.val ? '#1a3c5e' : 'var(--text-muted)',
                                            fontWeight: form.type === opt.val ? 700 : 400,
                                            fontSize: '0.82rem', transition: 'all 0.15s',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                                        }}
                                    >
                                        {opt.icon} {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Facebook URL — shown only for facebook type */}
                    {form.type === 'facebook' && (
                        <Field label="Facebook Video / Live URL *" error={errors?.facebook_url}>
                            <input
                                type="url" value={form.facebook_url}
                                onChange={e => change('facebook_url', e.target.value)}
                                placeholder="https://www.facebook.com/watch/?v=..."
                                style={inputStyle}
                            />
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Supports Facebook Page links and personal profile video links. Video must be Public.
                            </div>
                        </Field>
                    )}

                    {/* Camera note */}
                    {form.type === 'camera' && !form.id && (
                        <div style={{
                            padding: '12px 14px', borderRadius: '8px',
                            background: 'rgba(26,60,94,0.06)', border: '1px solid rgba(26,60,94,0.15)',
                            fontSize: '0.8rem', color: 'var(--text-color)', lineHeight: 1.5,
                        }}>
                            A unique Agora channel will be auto-generated. After creating the stream,
                            click <strong>Start</strong> then use the <strong>Broadcast</strong> panel to go live via your camera.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px', borderTop: '1px solid var(--border-color, #e5e7eb)',
                    display: 'flex', justifyContent: 'flex-end', gap: '10px',
                }}>
                    <button onClick={onClose} style={{
                        padding: '9px 20px', borderRadius: '8px',
                        border: '1.5px solid var(--border-color, #e5e7eb)',
                        background: 'transparent', cursor: 'pointer',
                        fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-color, #111)',
                    }}>
                        Cancel
                    </button>
                    <button onClick={onSave} disabled={saving} style={{
                        padding: '9px 20px', borderRadius: '8px', border: 'none',
                        background: '#1a3c5e', color: '#fff', cursor: 'pointer',
                        fontSize: '0.875rem', fontWeight: 700, opacity: saving ? 0.6 : 1,
                    }}>
                        {saving ? 'Saving…' : (form.id ? 'Save Changes' : 'Create Stream')}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Stream Row 
function StreamRow({ stream, onEdit, onStart, onEnd, onDelete, onToggleArchive, expandedId, setExpandedId }) {
    const isExpanded = expandedId === stream.id;
    const isCamera   = stream.type === 'camera';
    const isFacebook = stream.type === 'facebook';

    function handleStreamEnded() {
        onEnd(stream);
    }

    return (
        <>
            <tr style={{ borderBottom: '1px solid var(--border-color, #e5e7eb)' }}>
                {/* Type icon */}
                <td style={{ padding: '14px 16px', width: 44 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: '8px',
                        background: isFacebook ? 'rgba(59,89,152,0.1)' : 'rgba(239,68,68,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isFacebook ? '#3b5998' : '#ef4444',
                    }}>
                        {isFacebook ? <FaFacebook size={16} /> : <FaVideo size={15} />}
                    </div>
                </td>

                {/* Title + description */}
                <td style={{ padding: '14px 8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-color)' }}>
                        {stream.title}
                    </div>
                    {stream.description && (
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {stream.description}
                        </div>
                    )}
                    {stream.streamed_on && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                            {stream.streamed_on}{stream.duration ? ` · ${stream.duration}` : ''}
                        </div>
                    )}
                </td>

                {/* Status */}
                <td style={{ padding: '14px 8px', whiteSpace: 'nowrap' }}>
                    <StatusBadge status={stream.status} />
                </td>

                {/* Archive */}
                <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                    {stream.status === 'ended' && (
                        stream.is_archived
                            ? <FaCircleCheck size={15} style={{ color: '#059669' }} title="Archived" />
                            : <FaClock size={14} style={{ color: 'var(--text-muted)' }} title="Not archived" />
                    )}
                </td>

                {/* Created by */}
                <td style={{ padding: '14px 8px', fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {stream.created_by}
                </td>

                {/* Actions */}
                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>

                        {/* Start — scheduled only */}
                        {stream.status === 'scheduled' && (
                            <button onClick={() => onStart(stream)} title="Go Live"
                                style={{ ...btnStyle('rgba(239,68,68,0.1)', '#ef4444', 30), padding: '0 10px', width: 'auto', gap: '5px', fontSize: '0.78rem', fontWeight: 700 }}>
                                <FaPlay size={10} /> Go Live
                            </button>
                        )}

                        {/* End — live only */}
                        {stream.status === 'live' && (
                            <button onClick={() => onEnd(stream)} title="End stream"
                                style={{ ...btnStyle('rgba(239,68,68,0.1)', '#ef4444', 30), padding: '0 10px', width: 'auto', gap: '5px', fontSize: '0.78rem', fontWeight: 700 }}>
                                <FaStop size={10} /> End
                            </button>
                        )}

                        {/* Broadcast panel toggle — live camera streams only */}
                        {stream.status === 'live' && isCamera && (
                            <button
                                onClick={() => setExpandedId(isExpanded ? null : stream.id)}
                                title="Open broadcast panel"
                                style={{ ...btnStyle('rgba(26,60,94,0.1)', '#1a3c5e', 30) }}
                            >
                                <FaTowerBroadcast size={13} />
                            </button>
                        )}

                        {/* Edit — scheduled only */}
                        {stream.status === 'scheduled' && (
                            <button onClick={() => onEdit(stream)} title="Edit"
                                style={{ ...btnStyle('var(--bg-subtle, rgba(0,0,0,0.04))', 'var(--text-color, #111)', 30) }}>
                                <FaPencil size={11} />
                            </button>
                        )}

                        {/* Archive toggle — ended only */}
                        {stream.status === 'ended' && (
                            <button onClick={() => onToggleArchive(stream)} title={stream.is_archived ? 'Remove from archive' : 'Add to archive'}
                                style={{ ...btnStyle('rgba(5,150,105,0.08)', '#059669', 30) }}>
                                <FaBoxArchive size={12} />
                            </button>
                        )}

                        {/* Delete */}
                        {stream.status !== 'live' && (
                            <button onClick={() => onDelete(stream)} title="Delete"
                                style={{ ...btnStyle('rgba(239,68,68,0.08)', '#dc2626', 30) }}>
                                <FaTrash size={11} />
                            </button>
                        )}
                    </div>
                </td>
            </tr>

            {/* Broadcast panel — expanded row for live camera streams */}
            {isExpanded && isCamera && stream.status === 'live' && (
                <tr>
                    <td colSpan={6} style={{ padding: '0 16px 20px 64px', background: 'var(--bg-subtle, rgba(0,0,0,0.02))' }}>
                        <div style={{ maxWidth: 480 }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Broadcast Panel — {stream.agora_channel}
                            </div>
                            <AgoraBroadcaster
                                channel={stream.agora_channel}
                                onStreamEnded={handleStreamEnded}
                            />
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// Main Component
export default function LivestreamAdmin() {
    const { parishes = [], agora_app_id } = window.__ADMIN_DATA__ || {};

    const [streams,     setStreams]     = useState([]);
    const [stats,       setStats]       = useState({});
    const [loading,     setLoading]     = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType,   setFilterType]   = useState('all');
    const [expandedId,  setExpandedId]  = useState(null);

    // Modal
    const [modal,       setModal]       = useState(false);
    const [form,        setForm]        = useState(EMPTY_FORM);
    const [formErrors,  setFormErrors]  = useState({});
    const [saving,      setSaving]      = useState(false);

    // Load
    const loadStreams = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus !== 'all') params.set('status', filterStatus);
            if (filterType   !== 'all') params.set('type',   filterType);

            const [list, s] = await Promise.all([
                api('GET', `/admin/api/livestreams?${params}`),
                api('GET', '/admin/api/livestreams/stats'),
            ]);

            setStreams(list.data ?? []);
            setStats(s);
        } catch (e) {
            console.error('Failed to load livestreams', e);
        } finally {
            setLoading(false);
        }
    }, [filterStatus, filterType]);

    useEffect(() => { loadStreams(); }, [loadStreams]);

    // CRUD
    function openAdd() {
        setForm({ ...EMPTY_FORM });
        setFormErrors({});
        setModal(true);
    }

    function openEdit(s) {
        setForm({ id: s.id, parish_id: s.parish_id, title: s.title, description: s.description ?? '', type: s.type, facebook_url: s.facebook_url ?? '' });
        setFormErrors({});
        setModal(true);
    }

    async function handleSave() {
        setSaving(true);
        setFormErrors({});
        try {
            if (form.id) {
                await api('PATCH', `/admin/api/livestreams/${form.id}`, {
                    title: form.title, description: form.description || null,
                    facebook_url: form.facebook_url || null,
                });
            } else {
                await api('POST', '/admin/api/livestreams', {
                    parish_id: form.parish_id, title: form.title,
                    description: form.description || null,
                    type: form.type,
                    facebook_url: form.type === 'facebook' ? form.facebook_url : null,
                });
            }
            setModal(false);
            loadStreams();
        } catch (err) {
            if (err?.errors) setFormErrors(err.errors);
        } finally {
            setSaving(false);
        }
    }

    async function handleStart(s) {
        if (!confirm(`Set "${s.title}" as LIVE now?`)) return;
        try {
            await api('PATCH', `/admin/api/livestreams/${s.id}/start`);
            loadStreams();
        } catch { alert('Failed to start stream.'); }
    }

    async function handleEnd(s) {
        try {
            await api('PATCH', `/admin/api/livestreams/${s.id}/end`);
            setExpandedId(null);
            loadStreams();
        } catch { alert('Failed to end stream.'); }
    }

    async function handleDelete(s) {
        if (!confirm(`Delete "${s.title}"? This cannot be undone.`)) return;
        try {
            await api('DELETE', `/admin/api/livestreams/${s.id}`);
            loadStreams();
        } catch { alert('Delete failed.'); }
    }

    async function handleToggleArchive(s) {
        try {
            await api('PATCH', `/admin/api/livestreams/${s.id}/archive`);
            loadStreams();
        } catch { alert('Archive toggle failed.'); }
    }

    // ── Render ─────────────────────────────────────────────────
    return (
        <div style={{ padding: '32px', minHeight: '100vh' }}>

            {/* Page header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Livestreams</h1>
                    <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Manage Facebook embeds and live camera broadcasts
                    </p>
                </div>
                <button onClick={openAdd} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 20px', borderRadius: '10px', border: 'none',
                    background: '#1a3c5e', color: '#fff', cursor: 'pointer',
                    fontWeight: 700, fontSize: '0.875rem',
                }}>
                    <FaPlus size={13} /> Create Livestream
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <StatPill label="Total"     value={stats.total}     />
                <StatPill label="Live Now"  value={stats.live_now}  color="#ef4444" />
                <StatPill label="Scheduled" value={stats.scheduled} color="#6366f1" />
                <StatPill label="Archived"  value={stats.archived}  color="#6b7280" />
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end',
                marginBottom: '20px', padding: '16px 20px',
                background: 'var(--card-bg, #fff)',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '12px',
            }}>
                <div style={{ minWidth: 140 }}>
                    <label style={labelStyle}>Status</label>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={selectStyle}>
                        <option value="all">All Statuses</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="live">Live Now</option>
                        <option value="ended">Ended</option>
                    </select>
                </div>
                <div style={{ minWidth: 140 }}>
                    <label style={labelStyle}>Type</label>
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} style={selectStyle}>
                        <option value="all">All Types</option>
                        <option value="facebook">Facebook</option>
                        <option value="camera">Camera</option>
                    </select>
                </div>
                <button onClick={loadStreams} style={{ ...btnStyle('rgba(26,60,94,0.08)', '#1a3c5e', 36), width: 'auto', padding: '0 16px', fontSize: '0.8rem', fontWeight: 600 }}>
                    Refresh
                </button>
            </div>

            {/* Table */}
            <div style={{
                background: 'var(--card-bg, #fff)',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '14px', overflow: 'hidden',
            }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Loading…
                    </div>
                ) : streams.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No livestreams found. Click <strong>Create Livestream</strong> to add one.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color, #e5e7eb)' }}>
                                <th style={{ ...thStyle, width: 44 }}></th>
                                <th style={thStyle}>Stream</th>
                                <th style={thStyle}>Status</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Archive</th>
                                <th style={thStyle}>Created By</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {streams.map(s => (
                                <StreamRow
                                    key={s.id}
                                    stream={s}
                                    onEdit={openEdit}
                                    onStart={handleStart}
                                    onEnd={handleEnd}
                                    onDelete={handleDelete}
                                    onToggleArchive={handleToggleArchive}
                                    expandedId={expandedId}
                                    setExpandedId={setExpandedId}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            <LivestreamModal
                open={modal} onClose={() => setModal(false)}
                onSave={handleSave} form={form} setForm={setForm}
                parishes={parishes} errors={formErrors} saving={saving}
            />

            <style>{`
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
            `}</style>
        </div>
    );
}

const thStyle = {
    padding: '12px 16px', textAlign: 'left', fontSize: '0.74rem',
    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
    color: 'var(--text-muted)',
};