import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    FaCheck, FaXmark, FaMagnifyingGlass, FaX, FaPersonPraying,
    FaCreditCard, FaComment, FaPaperPlane, FaSpinner, FaChevronDown, FaPaperclip, FaUpRightFromSquare,
    FaMoneyBillWave,
} from 'react-icons/fa6';

// ── Status Badge ───────────────────────────────────────────────
function StatusBadge({ status }) {
    return <span className={`sr-status-badge sr-status-badge--${status}`}>{status}</span>;
}
function PaymentBadge({ status }) {
    const cfg = {
        unpaid:    { bg: '#f1f5f9', color: '#64748b', label: 'Unpaid'    },
        submitted: { bg: '#fef9c3', color: '#92400e', label: 'Submitted' },
        verified:  { bg: '#d1fae5', color: '#065f46', label: 'Verified'  },
        rejected:  { bg: '#fee2e2', color: '#991b1b', label: 'Rejected'  },
    };
    const c = cfg[status] ?? cfg['unpaid'];
    return (
        <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: c.bg, color: c.color }}>
            {c.label}
        </span>
    );
}
function ClergyBadge({ status }) {
    const cfg = {
        unassigned: { color: '#9ca3af', label: 'No Clergy' },
        pending:    { color: '#f59e0b', label: 'Awaiting'  },
        confirmed:  { color: '#10b981', label: 'Confirmed' },
        declined:   { color: '#ef4444', label: 'Declined'  },
    };
    const c = cfg[status] ?? cfg['unassigned'];
    return <span style={{ fontSize: '0.72rem', fontWeight: 600, color: c.color }}>{c.label}</span>;
}
function humanize(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Assign Clergy Panel (inside modal) ────────────────────────
function AssignClergyPanel({ requestId, current, onAssigned }) {
    const [clergy,    setClergy]    = useState([]);
    const [selected,  setSelected]  = useState(current?.id ? String(current.id) : '');
    const [saving,    setSaving]    = useState(false);
    const [fetchErr,  setFetchErr]  = useState('');
    const [assignErr, setAssignErr] = useState('');
    const [success,   setSuccess]   = useState('');

    // Load available clergy every time the panel mounts (fresh on each modal open)
    useEffect(() => {
        setFetchErr('');
        axios.get(`/admin/api/sacrament-requests/${requestId}/available-clergy`)
            .then(r => setClergy(r.data))
            .catch(e => {
                const msg = e.response?.data?.message ?? 'Failed to load available clergy.';
                setFetchErr(msg);
            });
    }, [requestId]);

    const assign = async () => {
        const numericId = parseInt(selected, 10);
        if (!numericId) return;
        setSaving(true);
        setAssignErr('');
        setSuccess('');
        try {
            const r = await axios.post(
                `/admin/api/sacrament-requests/${requestId}/assign-clergy`,
                { clergy_id: numericId }
            );
            setSuccess('Clergy assigned successfully.');
            onAssigned(r.data);
        } catch (e) {
            // Extract the most useful error — validation errors come back as errors.clergy_id[0]
            const errBag   = e.response?.data?.errors;
            const specific = errBag?.clergy_id?.[0] ?? errBag?.[Object.keys(errBag ?? {})[0]]?.[0];
            const fallback = e.response?.data?.message ?? 'Failed to assign clergy. Please try again.';
            setAssignErr(specific ?? fallback);
        } finally { setSaving(false); }
    };

    return (
        <div style={{ marginTop: '0.5rem' }}>
            {/* Fetch error */}
            {fetchErr && (
                <div style={{
                    padding: '8px 12px', borderRadius: 6, marginBottom: 10,
                    background: 'rgba(239,68,68,0.08)', color: '#dc2626',
                    fontSize: '0.8rem', border: '1px solid rgba(239,68,68,0.2)',
                }}>
                    {fetchErr}
                </div>
            )}

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                    value={selected}
                    onChange={e => { setSelected(e.target.value); setAssignErr(''); setSuccess(''); }}
                    className="um-input"
                    style={{ flex: 1, minWidth: 200, fontSize: '0.82rem', padding: '0.4rem 0.6rem' }}
                    disabled={saving}
                >
                    <option value="">— Select clergy —</option>
                    {clergy.map(c => (
                        <option key={c.id} value={String(c.id)}>
                            {c.name} ({c.parish})
                        </option>
                    ))}
                </select>
                <button
                    className="um-btn um-btn--primary"
                    onClick={assign}
                    disabled={saving || !selected}
                    style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}
                >
                    {saving ? <FaSpinner size={11} /> : current ? 'Reassign' : 'Assign'}
                </button>
            </div>

            {/* Assignment error */}
            {assignErr && (
                <div style={{
                    padding: '8px 12px', borderRadius: 6, marginTop: 8,
                    background: 'rgba(239,68,68,0.08)', color: '#dc2626',
                    fontSize: '0.8rem', border: '1px solid rgba(239,68,68,0.2)',
                }}>
                    {assignErr}
                </div>
            )}

            {/* Success feedback */}
            {success && (
                <div style={{
                    padding: '8px 12px', borderRadius: 6, marginTop: 8,
                    background: 'rgba(16,185,129,0.08)', color: '#065f46',
                    fontSize: '0.8rem', border: '1px solid rgba(16,185,129,0.2)',
                    display: 'flex', alignItems: 'center', gap: 6,
                }}>
                    <FaCheck size={11} /> {success}
                </div>
            )}
        </div>
    );
}

// ── Message Panel (inside modal) ──────────────────────────────
function MessagePanel({ requestId }) {
    const [messages,  setMessages]  = useState([]);
    const [body,      setBody]      = useState('');
    const [msgImage,  setMsgImage]  = useState(null);
    const [sending,   setSending]   = useState(false);
    const [loading,   setLoading]   = useState(true);
    const bottomRef    = useRef(null);
    const scrollBoxRef = useRef(null);
    const imageInputRef = useRef(null);
    const pollRef      = useRef(null);
    const authId = window.__PAGE_DATA__?.authId ?? null;
    const { upload: uploadImage } = useCloudinaryUpload();

    const isNearBottom = () => {
        const el = scrollBoxRef.current;
        if (!el) return true;
        return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    };

    const fetchMessages = useCallback(async () => {
        try {
            const r = await axios.get(`/admin/api/sacrament-requests/${requestId}/messages`);
            setMessages(prev => {
                const next = r.data;
                if (JSON.stringify(prev.map(m => m.id)) === JSON.stringify(next.map(m => m.id))) return prev;
                return next;
            });
        } catch {}
    }, [requestId]);

    useEffect(() => {
        (async () => {
            await fetchMessages();
            setLoading(false);
        })();
        pollRef.current = setInterval(fetchMessages, 3000);
        return () => clearInterval(pollRef.current);
    }, [fetchMessages]);

    useEffect(() => {
        if (isNearBottom()) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const send = async () => {
        if (!body.trim() && !msgImage) return;
        setSending(true);
        try {
            let imageUrl = null;
            if (msgImage) {
                imageUrl = await uploadImage(msgImage, 'bethel_app/messages');
            }
            const r = await axios.post(`/admin/api/sacrament-requests/${requestId}/messages`, {
                body:      body.trim() || null,
                image_url: imageUrl,
            });
            setMessages(prev => [...prev, r.data]);
            setBody('');
            setMsgImage(null);
            if (imageInputRef.current) imageInputRef.current.value = '';
        } catch (err) { alert('Failed to send: ' + (err.message ?? 'unknown error')); }
        finally { setSending(false); }
    };

    const isMine = m => m.role !== 'parishioner';

    return (
        <div>
            <div ref={scrollBoxRef} style={{
                height: 260, overflowY: 'auto', padding: '0.5rem 0',
                display: 'flex', flexDirection: 'column', gap: 8,
            }}>
                {loading ? (
                    <p style={{ textAlign: 'center', color: '#999', fontSize: '0.8rem', marginTop: '1rem' }}>Loading…</p>
                ) : messages.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#bbb', fontSize: '0.8rem', marginTop: '1.5rem' }}>
                        No messages yet.
                    </p>
                ) : (
                    messages.map(m => (
                        <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine(m) ? 'flex-end' : 'flex-start' }}>
                            <span style={{ fontSize: '0.68rem', color: '#bbb', marginBottom: 2 }}>
                                {isMine(m) ? 'You' : m.sender} · {m.time}
                            </span>
                            <div style={{
                                maxWidth: '78%', padding: '0.45rem 0.8rem',
                                borderRadius: isMine(m) ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                                background: isMine(m) ? 'var(--admin-accent,#2563eb)' : 'var(--bg-hover,#f1f5f9)',
                                color: isMine(m) ? '#fff' : 'var(--text-primary,#111)',
                                fontSize: '0.82rem', lineHeight: 1.5,
                            }}>
                                {m.body && <div>{m.body}</div>}
                                {m.image_url && (
                                    <a href={m.image_url} target="_blank" rel="noreferrer">
                                        <img
                                            src={m.image_url}
                                            alt="attachment"
                                            style={{
                                                maxWidth: '100%', maxHeight: 200,
                                                borderRadius: 6, marginTop: m.body ? 5 : 0,
                                                display: 'block', cursor: 'pointer',
                                            }}
                                        />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))
                )}
                <div ref={bottomRef} />
            </div>
            <div style={{ marginTop: 6 }}>
                {msgImage && (
                    <div style={{ marginBottom: 6, padding: '0.35rem 0.6rem',
                        background: '#f0f9ff', borderRadius: 6, fontSize: '0.75rem', color: '#0369a1',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>📎 {msgImage.name}</span>
                        <button onClick={() => { setMsgImage(null); if (imageInputRef.current) imageInputRef.current.value = ''; }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                            <FaX size={9} />
                        </button>
                    </div>
                )}
                <div style={{ display: 'flex', gap: 6 }}>
                    <textarea rows={2} value={body}
                        onChange={e => setBody(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                        placeholder="Reply to parishioner…"
                        className="um-input"
                        style={{ flex: 1, resize: 'none', fontSize: '0.82rem', padding: '0.45rem 0.7rem', fontFamily: 'inherit' }} />
                    <button onClick={() => imageInputRef.current?.click()} title="Attach image"
                        style={{ background: msgImage ? '#dbeafe' : '#f1f5f9', border: '1px solid #e5e7eb',
                            borderRadius: 8, padding: '0 0.6rem', cursor: 'pointer', color: msgImage ? '#2563eb' : '#888' }}>
                        <FaPaperclip size={12} />
                    </button>
                    <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={e => setMsgImage(e.target.files[0] ?? null)} />
                    <button className="um-btn um-btn--primary" onClick={send}
                        disabled={sending || (!body.trim() && !msgImage)}
                        style={{ padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: 5,
                            opacity: (!body.trim() && !msgImage) ? 0.5 : 1 }}>
                        {sending ? <FaSpinner size={11} /> : <FaPaperPlane size={11} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Payment Verification Panel ────────────────────────────────
function PaymentVerifyPanel({ requestId, payment, onVerified }) {
    const [saving,  setSaving]  = useState(false);
    const [notes,   setNotes]   = useState('');

    if (!payment) return null;

    const isVerified = payment.status === 'verified';

    const verify = async (status) => {
        setSaving(true);
        try {
            await axios.post(`/admin/api/sacrament-requests/${requestId}/verify-payment`, {
                status, admin_notes: notes || null,
            });
            onVerified(status);
        } catch { alert('Failed to update payment.'); }
        finally { setSaving(false); }
    };

    const url = payment.proof_url?.startsWith('http') ? payment.proof_url : null;

    return (
        <div>
            {/* Proof image — always shown regardless of verification status */}
            {url && (
                <div style={{ marginBottom: '0.75rem' }}>
                    <a href={url} target="_blank" rel="noreferrer"
                        style={{ display: 'block', marginBottom: 8 }}>
                        <img
                            src={url}
                            alt="Payment Proof"
                            style={{
                                width: '100%', maxHeight: 200, borderRadius: 10,
                                objectFit: 'contain', display: 'block',
                                background: '#f8fafc', border: '1px solid #e5e7eb',
                                cursor: 'zoom-in',
                            }}
                        />
                    </a>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
                        <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>
                            {payment.method?.toUpperCase()}
                            {payment.amount ? ` · ₱${payment.amount}` : ''}
                            {payment.submitted ? ` · ${payment.submitted}` : ''}
                        </p>
                        <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                fontSize: '0.72rem', color: '#2563eb', fontWeight: 600,
                                textDecoration: 'none', padding: '3px 8px',
                                background: '#eff6ff', borderRadius: 6,
                            }}
                        >
                            <FaUpRightFromSquare size={9} /> View Full Image
                        </a>
                    </div>
                </div>
            )}

            {/* Verify/Reject actions — hidden once already verified */}
            {!isVerified && (
                <>
                    <textarea
                        className="um-input"
                        rows={2}
                        placeholder="Optional note to parishioner…"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        style={{ width: '100%', resize: 'none', fontSize: '0.82rem', marginBottom: '0.5rem', fontFamily: 'inherit' }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button className="um-btn um-btn--danger"  onClick={() => verify('rejected')} disabled={saving} style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
                            <FaXmark size={11} /> Reject
                        </button>
                        <button className="um-btn um-btn--success" onClick={() => verify('verified')} disabled={saving} style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}>
                            <FaCheck size={11} /> Verify
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

// ── Mark as Paid Panel (walk-in / cash) ───────────────────────
function MarkAsPaidPanel({ requestId, onMarkedPaid }) {
    const [amount,   setAmount]   = useState('');
    const [note,     setNote]     = useState('');
    const [saving,   setSaving]   = useState(false);
    const [err,      setErr]      = useState('');
    const [expanded, setExpanded] = useState(false);

    const submit = async () => {
        setSaving(true);
        setErr('');
        try {
            await axios.post(`/admin/api/sacrament-requests/${requestId}/mark-paid`, {
                amount:      amount ? parseFloat(amount) : null,
                admin_notes: note || null,
            });
            onMarkedPaid();
        } catch (e) {
            const msg = e.response?.data?.message ?? 'Failed to record payment.';
            setErr(msg);
        } finally { setSaving(false); }
    };

    if (!expanded) {
        return (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color, #e5e7eb)' }}>
                <button
                    onClick={() => setExpanded(true)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: 7,
                        padding: '8px 16px', borderRadius: 8, fontSize: '0.83rem', fontWeight: 600,
                        border: '1.5px solid #16a34a', color: '#16a34a',
                        background: 'rgba(22,163,74,0.06)', cursor: 'pointer',
                    }}
                >
                    💵 Mark as Paid (Walk-in / Cash)
                </button>
                <p style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Use this for parishioners who paid in person. No proof image required.
                </p>
            </div>
        );
    }

    return (
        <div style={{
            marginTop: '1rem', padding: '1rem', borderRadius: 10,
            border: '1.5px solid rgba(22,163,74,0.3)',
            background: 'rgba(22,163,74,0.04)',
        }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.75rem', color: '#15803d' }}>
                💵 Record Walk-in Payment
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 140 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Amount (₱) <span style={{ fontWeight: 400 }}>— optional</span>
                    </label>
                    <input
                        type="number" min="0" step="0.01"
                        placeholder="e.g. 500"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="um-input"
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                    />
                </div>
                <div style={{ flex: 2, minWidth: 180 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Note <span style={{ fontWeight: 400 }}>— optional</span>
                    </label>
                    <input
                        type="text"
                        placeholder="e.g. Paid at parish office"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        className="um-input"
                        style={{ fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
                    />
                </div>
            </div>
            {err && (
                <div style={{
                    padding: '7px 12px', borderRadius: 6, marginBottom: 10,
                    background: 'rgba(239,68,68,0.08)', color: '#dc2626',
                    fontSize: '0.8rem', border: '1px solid rgba(239,68,68,0.2)',
                }}>
                    {err}
                </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
                <button
                    onClick={() => { setExpanded(false); setErr(''); setAmount(''); setNote(''); }}
                    disabled={saving}
                    style={{
                        padding: '7px 14px', borderRadius: 7, fontSize: '0.82rem', fontWeight: 500,
                        border: '1.5px solid var(--border-color, #d1d5db)', background: 'transparent',
                        color: 'var(--text-muted)', cursor: 'pointer',
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={submit}
                    disabled={saving}
                    style={{
                        padding: '7px 18px', borderRadius: 7, fontSize: '0.82rem', fontWeight: 700,
                        border: 'none', background: '#16a34a', color: '#fff',
                        cursor: 'pointer', opacity: saving ? 0.7 : 1,
                        display: 'flex', alignItems: 'center', gap: 6,
                    }}
                >
                    <FaCheck size={11} /> {saving ? 'Recording…' : 'Confirm Payment'}
                </button>
            </div>
        </div>
    );
}

// ── Detail Modal ──────────────────────────────────────────────
function SacramentRequestDetailModal({ requestId, onClose, onStatusChange }) {
    const [data,       setData]       = useState(null);
    const [loading,    setLoading]    = useState(true);
    const [saving,     setSaving]     = useState(false);
    const [notes,      setNotes]      = useState('');
    const [notesEdited,setNotesEdited]= useState(false);
    const [activeTab,  setActiveTab]  = useState('details'); // details | clergy | payment | messages

    const load = useCallback(async () => {
        try {
            const r = await axios.get(`/admin/api/sacrament-requests/${requestId}`);
            setData(r.data);
            setNotes(r.data.admin_notes ?? '');
        } catch {}
        finally { setLoading(false); }
    }, [requestId]);

    useEffect(() => { load(); }, [load]);

    const handleStatusChange = async (newStatus) => {
        if (!confirm(`Mark this request as ${newStatus}?`)) return;
        setSaving(true);
        try {
            await axios.patch(`/admin/api/sacrament-requests/${requestId}`, { status: newStatus, admin_notes: notes });
            setData(prev => ({ ...prev, status: newStatus, admin_notes: notes }));
            setNotesEdited(false);
            if (onStatusChange) onStatusChange(requestId, newStatus);
        } catch { alert('Failed to update status.'); }
        finally { setSaving(false); }
    };

    const saveNotes = async () => {
        setSaving(true);
        try {
            await axios.patch(`/admin/api/sacrament-requests/${requestId}`, { status: data.status, admin_notes: notes });
            setData(prev => ({ ...prev, admin_notes: notes }));
            setNotesEdited(false);
        } catch { alert('Failed to save notes.'); }
        finally { setSaving(false); }
    };

    const TABS = [
        { id: 'details',  label: 'Details'  },
        { id: 'clergy',   label: 'Clergy'   },
        { id: 'payment',  label: 'Payment'  },
        { id: 'messages', label: 'Messages' },
    ];

    return (
        <div className="um-overlay" onClick={onClose}>
            <div className="um-modal um-modal--wide" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="um-modal__header">
                    {loading ? <p className="um-modal__title">Loading…</p> : (
                        <div className="um-modal__header-info">
                            <div className="um-avatar um-avatar--lg" style={{ background: 'rgba(200,151,58,0.15)', color: '#c8973a' }}>
                                <FaPersonPraying size={20} />
                            </div>
                            <div>
                                <h2 className="um-modal__title">{data?.sacrament_type} Request</h2>
                                <p className="um-modal__sub">{data?.requester?.name} · {data?.submitted_at}</p>
                            </div>
                        </div>
                    )}
                    <button className="um-modal__close" onClick={onClose}><FaX size={12} /></button>
                </div>

                {/* Tabs */}
                {!loading && (
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', paddingLeft: '1.25rem' }}>
                        {TABS.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                style={{
                                    padding: '0.6rem 1rem', fontSize: '0.82rem', fontWeight: 600,
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    color: activeTab === t.id ? 'var(--admin-accent,#2563eb)' : 'var(--text-muted)',
                                    borderBottom: activeTab === t.id ? '2px solid var(--admin-accent,#2563eb)' : '2px solid transparent',
                                    marginBottom: -1,
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Body */}
                <div className="um-modal__body um-modal__body--scroll-tall">
                    {loading ? <div className="um-modal-loading">Loading…</div> : !data ? (
                        <div className="um-modal-loading">Request not found.</div>
                    ) : (
                        <>
                            {/* ── DETAILS TAB ── */}
                            {activeTab === 'details' && (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                                        <StatusBadge status={data.status} />
                                        <PaymentBadge status={data.payment_status} />
                                        <ClergyBadge status={data.clergy_status} />
                                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                            {data.parish?.name}{data.parish?.city ? ` — ${data.parish.city}` : ''}
                                        </span>
                                    </div>

                                    <div className="um-section-label" style={{ marginBottom: '0.5rem' }}>Request Details</div>
                                    <div className="um-detail-grid">
                                        {[
                                            ['Sacrament Type', data.sacrament_type],
                                            ['Preferred Date', data.preferred_date],
                                            ['Preferred Time', data.preferred_time],
                                            ['Participants',   data.participants],
                                            ['Parish',         data.parish?.name ?? '—'],
                                            ['Parish City',    data.parish?.city ?? '—'],
                                        ].map(([label, val]) => (
                                            <div key={label} className="um-detail-row">
                                                <span className="um-detail-label">{label}</span>
                                                <span className="um-detail-value">{val}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="um-section-label" style={{ margin: '1.25rem 0 0.5rem' }}>Parishioner</div>
                                    <div className="um-detail-grid">
                                        {[
                                            ['Name',     data.requester?.name  ?? '—'],
                                            ['Email',    data.requester?.email ?? '—'],
                                            ['Phone',    data.requester?.phone ?? '—'],
                                            ['City',     data.requester?.city  ?? '—'],
                                            ['Barangay', data.requester?.barangay ?? '—'],
                                        ].map(([label, val]) => (
                                            <div key={label} className="um-detail-row">
                                                <span className="um-detail-label">{label}</span>
                                                <span className="um-detail-value">{val}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {data.details && Object.keys(data.details).length > 0 && (() => {
                                        // Build { fieldId → { label, type } } from the form_schema
                                        // the controller now returns. Falls back to humanize() if
                                        // a key somehow has no schema entry (schema deleted after submit).
                                        const schemaMap = Object.fromEntries(
                                            (data.field_schema ?? []).map(f => [f.id, f])
                                        );
                                        return (
                                            <>
                                                <div className="um-section-label" style={{ margin: '1.25rem 0 0.5rem' }}>Submitted Information</div>
                                                <div className="um-detail-grid">
                                                    {Object.entries(data.details).map(([key, val]) => {
                                                        const field   = schemaMap[key];
                                                        const label   = field?.label ?? humanize(key);
                                                        const isImage = (field?.type === 'file'
                                                            || (typeof val === 'string' && val.startsWith('http')))
                                                            && typeof val === 'string' && val.startsWith('http');
                                                        const display = Array.isArray(val) ? val.join(', ') : (val || '—');
                                                        return (
                                                            <div key={key} className="um-detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                                                                <span className="um-detail-label">{label}</span>
                                                                {isImage ? (
                                                                    <div>
                                                                        <a href={val} target="_blank" rel="noreferrer"
                                                                            style={{ display: 'block', marginBottom: 6 }}>
                                                                            <img
                                                                                src={val}
                                                                                alt={label}
                                                                                style={{
                                                                                    maxWidth: '100%', maxHeight: 120,
                                                                                    borderRadius: 8, objectFit: 'contain',
                                                                                    border: '1px solid #e5e7eb',
                                                                                    background: '#f8fafc', display: 'block',
                                                                                    cursor: 'zoom-in',
                                                                                }}
                                                                            />
                                                                        </a>
                                                                        <a href={val} target="_blank" rel="noreferrer"
                                                                            style={{
                                                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                                                fontSize: '0.72rem', color: '#2563eb', fontWeight: 600,
                                                                                textDecoration: 'none', padding: '3px 8px',
                                                                                background: '#eff6ff', borderRadius: 6,
                                                                            }}>
                                                                            <FaUpRightFromSquare size={9} /> View Full Image
                                                                        </a>
                                                                    </div>
                                                                ) : (
                                                                    <span className="um-detail-value">{display}</span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        );
                                    })()}

                                    <div className="um-section-label" style={{ margin: '1.25rem 0 0.5rem' }}>Admin Notes</div>
                                    <textarea
                                        className="um-input"
                                        rows={3}
                                        style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.85rem' }}
                                        placeholder="Add internal notes…"
                                        value={notes}
                                        onChange={e => { setNotes(e.target.value); setNotesEdited(true); }}
                                    />
                                </>
                            )}

                            {/* ── CLERGY TAB ── */}
                            {activeTab === 'clergy' && (
                                <div>
                                    <div className="um-section-label" style={{ marginBottom: '0.5rem' }}>Current Assignment</div>
                                    {data.assigned_clergy ? (
                                        <div className="um-detail-row" style={{ marginBottom: '1rem' }}>
                                            <span className="um-detail-label">Assigned To</span>
                                            <span className="um-detail-value">{data.assigned_clergy.name}</span>
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: '1rem' }}>No clergy assigned yet.</p>
                                    )}
                                    <div className="um-detail-row" style={{ marginBottom: '1.25rem' }}>
                                        <span className="um-detail-label">Clergy Status</span>
                                        <ClergyBadge status={data.clergy_status} />
                                    </div>

                                    <div className="um-section-label" style={{ marginBottom: '0.5rem' }}>
                                        {data.assigned_clergy ? 'Reassign Clergy' : 'Assign Clergy'}
                                    </div>
                                    <AssignClergyPanel
                                        requestId={requestId}
                                        current={data.assigned_clergy}
                                        onAssigned={res => {
                                            setData(prev => ({
                                                ...prev,
                                                assigned_clergy: res.assigned_clergy,
                                                clergy_status:   res.clergy_status,
                                            }));
                                            // Pass clergy update to the parent table row.
                                            // We use a special shape so the parent can patch
                                            // clergy_status + assigned_clergy on the right row.
                                            if (onStatusChange) {
                                                onStatusChange(requestId, null, {
                                                    clergy_status:   res.clergy_status,
                                                    assigned_clergy: res.assigned_clergy,
                                                });
                                            }
                                        }}
                                    />
                                </div>
                            )}

                            {/* ── PAYMENT TAB ── */}
                            {activeTab === 'payment' && (
                                <div>
                                    <div className="um-section-label" style={{ marginBottom: '0.5rem' }}>Payment Status</div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <PaymentBadge status={data.payment_status} />
                                    </div>

                                    {data.payment ? (
                                        <>
                                            <div className="um-section-label" style={{ marginBottom: '0.5rem' }}>Proof of Payment</div>
                                            <PaymentVerifyPanel
                                                requestId={requestId}
                                                payment={data.payment}
                                                onVerified={status => {
                                                    setData(prev => ({
                                                        ...prev,
                                                        payment_status: status,
                                                        payment: { ...prev.payment, status },
                                                    }));
                                                    if (onStatusChange) onStatusChange(requestId, data.status);
                                                }}
                                            />
                                        </>
                                    ) : (
                                        <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>No payment submitted yet.</p>
                                    )}

                                    {/* Walk-in / cash payment — only when still unpaid */}
                                    {data.payment_status === 'unpaid' && (
                                        <MarkAsPaidPanel
                                            requestId={requestId}
                                            onMarkedPaid={() => {
                                                setData(prev => ({ ...prev, payment_status: 'verified' }));
                                                if (onStatusChange) onStatusChange(requestId, data.status);
                                            }}
                                        />
                                    )}
                                </div>
                            )}

                            {/* ── MESSAGES TAB ── */}
                            {activeTab === 'messages' && (
                                <div>
                                    <div className="um-section-label" style={{ marginBottom: '0.75rem' }}>
                                        Conversation with Parishioner
                                    </div>
                                    <MessagePanel requestId={requestId} />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="um-modal__footer">
                    <button className="um-btn um-btn--outline" onClick={onClose} disabled={saving}>Close</button>
                    {data && notesEdited && activeTab === 'details' && (
                        <button className="um-btn um-btn--outline" onClick={saveNotes} disabled={saving}>
                            {saving ? 'Saving…' : 'Save Notes'}
                        </button>
                    )}
                    {data?.status === 'pending' && activeTab === 'details' && (
                        <>
                            <button className="um-btn um-btn--danger"  onClick={() => handleStatusChange('rejected')} disabled={saving}>
                                <FaXmark size={11} /> Reject
                            </button>
                            <button className="um-btn um-btn--success" onClick={() => handleStatusChange('approved')} disabled={saving}>
                                <FaCheck size={11} /> Approve
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────
export default function SacramentRequests({ onStatsRefresh }) {
    const [requests,      setRequests]      = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [search,        setSearch]        = useState('');
    const [statusFilter,  setStatusFilter]  = useState('all');
    const [typeFilter,    setTypeFilter]    = useState('all');
    const [types,         setTypes]         = useState([]);
    const [detailId,      setDetailId]      = useState(null);

    useEffect(() => {
        // Load available type names for the filter dropdown
        axios.get('/admin/api/sacrament-types').then(r => {
            const data = r.data?.data ?? r.data;
            setTypes(Array.isArray(data) ? data.map(t => t.name) : []);
        }).catch(() => {});

        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await axios.get('/admin/api/sacrament-requests');
            const data     = response.data.data ?? response.data;
            setRequests(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleStatusChange = async (id, newStatus, fromModal = false) => {
        if (!fromModal && !confirm(`Mark this request as ${newStatus}?`)) return;
        try {
            if (!fromModal) {
                await axios.patch(`/admin/api/sacrament-requests/${id}`, { status: newStatus });
            }
            if (newStatus !== null) {
                setRequests(prev => prev.map(req =>
                    req.id === id ? { ...req, status: newStatus } : req
                ));
            }
            if (onStatsRefresh) onStatsRefresh();
        } catch { alert('Failed to update status.'); }
    };

    // Called from the modal when clergy is successfully assigned — patches the
    // relevant table row in place so the UI reflects the change immediately.
    const handleClergyAssigned = (id, patch) => {
        setRequests(prev => prev.map(req =>
            req.id === id ? { ...req, ...patch } : req
        ));
    };

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const matchStatus = statusFilter === 'all' || req.status === statusFilter;
            const matchType   = typeFilter   === 'all' || req.sacrament_type === typeFilter;
            const haystack    = [req.requester_name ?? '', req.requester_email ?? '', req.sacrament_type ?? ''].join(' ').toLowerCase();
            const matchSearch = !search || haystack.includes(search.toLowerCase());
            return matchStatus && matchType && matchSearch;
        });
    }, [requests, search, statusFilter, typeFilter]);

    return (
        <>
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-header__title">Sacrament Requests</h1>
                    <p className="admin-page-header__sub">Review requests, assign clergy, verify payments, and message parishioners.</p>
                </div>
            </div>

            <div className="admin-table-card">
                {/* Toolbar */}
                <div className="um-toolbar" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div className="um-search-wrap">
                        <FaMagnifyingGlass size={12} className="um-search-icon" />
                        <input
                            type="text" className="um-search-input"
                            placeholder="Search by name, email, or type..."
                            value={search} onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    {/* Type filter */}
                    <select className="um-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                        <option value="all">All Types</option>
                        {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {/* Status filter */}
                    <select className="um-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Parishioner</th>
                                <th>Type</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Clergy</th>
                                <th>Payment</th>
                                <th style={{ textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="um-table-empty">Loading requests…</td></tr>
                            ) : filteredRequests.length === 0 ? (
                                <tr><td colSpan={8} className="um-table-empty">No requests found.</td></tr>
                            ) : (
                                filteredRequests.map((req, i) => (
                                    <tr key={req.id}
                                        className={`sr-row--${req.status ?? 'pending'}`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setDetailId(req.id)}>
                                        <td className="um-table-num">{i + 1}</td>
                                        <td>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{req.requester_name ?? 'Unknown'}</div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{req.requester_email}</div>
                                        </td>
                                        <td style={{ fontSize: '0.85rem' }}>{req.sacrament_type}</td>
                                        <td style={{ fontSize: '0.82rem' }}>{req.preferred_date ?? 'N/A'}</td>
                                        <td><StatusBadge status={req.status} /></td>
                                        <td><ClergyBadge status={req.clergy_status ?? 'unassigned'} /></td>
                                        <td><PaymentBadge status={req.payment_status ?? 'unpaid'} /></td>
                                        <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                            {req.status === 'pending' && (
                                                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                                    <button className="sr-action-btn sr-action-btn--approve" title="Approve" onClick={() => handleStatusChange(req.id, 'approved')}>
                                                        <FaCheck size={11} />
                                                    </button>
                                                    <button className="sr-action-btn sr-action-btn--reject" title="Reject" onClick={() => handleStatusChange(req.id, 'rejected')}>
                                                        <FaXmark size={11} />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {detailId && (
                <SacramentRequestDetailModal
                    requestId={detailId}
                    onClose={() => setDetailId(null)}
                    onStatusChange={(id, status, clergyPatch) => {
                        if (clergyPatch) {
                            // Clergy assignment update — patch clergy fields in the row
                            handleClergyAssigned(id, clergyPatch);
                        } else {
                            // Status change from inside the modal
                            handleStatusChange(id, status, true);
                            if (onStatsRefresh) onStatsRefresh();
                        }
                    }}
                />
            )}
        </>
    );
}