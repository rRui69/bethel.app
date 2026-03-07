import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    FaHandsPraying, FaCalendarDays, FaClock, FaUsers, FaChurch,
    FaCircleCheck, FaCircleXmark, FaHourglassHalf, FaCreditCard,
    FaPersonPraying, FaComment, FaChevronDown, FaChevronUp,
    FaUpload, FaPaperPlane, FaX, FaArrowLeft, FaSpinner,
} from 'react-icons/fa6';

// ── Helpers ────────────────────────────────────────────────────
const STATUS_CFG = {
    pending:  { label: 'Pending',  bg: '#fef9c3', color: '#92400e', Icon: FaHourglassHalf },
    approved: { label: 'Approved', bg: '#d1fae5', color: '#065f46', Icon: FaCircleCheck   },
    rejected: { label: 'Rejected', bg: '#fee2e2', color: '#991b1b', Icon: FaCircleXmark   },
};
const CLERGY_CFG = {
    unassigned: { label: 'Not yet assigned', color: '#9ca3af' },
    pending:    { label: 'Awaiting confirmation', color: '#f59e0b' },
    confirmed:  { label: 'Confirmed', color: '#10b981' },
    declined:   { label: 'Declined', color: '#ef4444' },
};
const PAYMENT_CFG = {
    unpaid:    { label: 'Unpaid',    bg: '#f1f5f9', color: '#64748b' },
    submitted: { label: 'Submitted — Under Review', bg: '#fef9c3', color: '#92400e' },
    verified:  { label: 'Verified',  bg: '#d1fae5', color: '#065f46' },
    rejected:  { label: 'Re-submit Required', bg: '#fee2e2', color: '#991b1b' },
};

function StatusBadge({ status, cfg = STATUS_CFG }) {
    const c = cfg[status] ?? cfg['pending'];
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
            background: c.bg, color: c.color,
        }}>
            {c.Icon && <c.Icon size={10} />}
            {c.label ?? status}
        </span>
    );
}

function humanize(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Message Thread ─────────────────────────────────────────────
function MessageThread({ requestId, onClose }) {
    const [messages, setMessages] = useState([]);
    const [body,     setBody]     = useState('');
    const [sending,  setSending]  = useState(false);
    const [loading,  setLoading]  = useState(true);
    const bottomRef               = useRef(null);

    const load = useCallback(async () => {
        try {
            const res  = await fetch(`/api/bookings/${requestId}/messages`);
            const data = await res.json();
            setMessages(Array.isArray(data) ? data : []);
        } catch {}
        finally { setLoading(false); }
    }, [requestId]);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const send = async () => {
        if (!body.trim()) return;
        setSending(true);
        try {
            const res = await fetch(`/api/bookings/${requestId}/messages`, {
                method:  'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({ body: body.trim() }),
            });
            const msg = await res.json();
            if (res.ok) { setMessages(prev => [...prev, msg]); setBody(''); }
        } catch {}
        finally { setSending(false); }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
        }}>
            <div style={{
                background: 'var(--bg-card, #fff)', borderRadius: 16,
                width: '100%', maxWidth: 520, maxHeight: '80vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            }}>
                {/* Header */}
                <div style={{
                    padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color,#e5e7eb)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FaComment size={16} color="#6366f1" />
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary,#111)' }}>
                            Message Parish Staff
                        </span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                        <FaX size={12} />
                    </button>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#999', fontSize: '0.82rem' }}>Loading messages…</p>
                    ) : messages.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#bbb', fontSize: '0.82rem', marginTop: '2rem' }}>
                            No messages yet. Send one to start the conversation.
                        </p>
                    ) : (
                        messages.map(m => (
                            <div key={m.id} style={{
                                display: 'flex', flexDirection: 'column',
                                alignItems: m.is_mine ? 'flex-end' : 'flex-start',
                            }}>
                                <span style={{ fontSize: '0.7rem', color: '#bbb', marginBottom: 2 }}>
                                    {m.is_mine ? 'You' : m.sender} · {m.time}
                                </span>
                                <div style={{
                                    maxWidth: '78%', padding: '0.5rem 0.85rem',
                                    borderRadius: m.is_mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                    background: m.is_mine ? 'var(--bethel-primary, #1a3c5e)' : 'var(--bg-hover, #f1f5f9)',
                                    color: m.is_mine ? '#fff' : 'var(--text-primary,#111)',
                                    fontSize: '0.85rem', lineHeight: 1.5,
                                }}>
                                    {m.body}
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div style={{
                    padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color,#e5e7eb)',
                    display: 'flex', gap: 8,
                }}>
                    <textarea
                        rows={2}
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                        placeholder="Type a message…"
                        style={{
                            flex: 1, resize: 'none', borderRadius: 10, padding: '0.5rem 0.75rem',
                            border: '1px solid var(--border-color,#e5e7eb)', fontSize: '0.85rem',
                            fontFamily: 'inherit', background: 'var(--bg-input,#fff)',
                            color: 'var(--text-primary,#111)', outline: 'none',
                        }}
                    />
                    <button
                        onClick={send} disabled={sending || !body.trim()}
                        style={{
                            background: 'var(--bethel-primary,#1a3c5e)', color: '#fff', border: 'none',
                            borderRadius: 10, padding: '0 1rem', cursor: 'pointer',
                            opacity: (!body.trim() || sending) ? 0.4 : 1,
                            display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600,
                        }}
                    >
                        {sending ? <FaSpinner size={12} className="spin" /> : <FaPaperPlane size={12} />}
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Payment Upload Modal ───────────────────────────────────────
function PaymentModal({ requestId, sacramentType, onClose, onSuccess }) {
    const [method,    setMethod]    = useState('gcash');
    const [amount,    setAmount]    = useState('');
    const [file,      setFile]      = useState(null);
    const [preview,   setPreview]   = useState(null);
    const [submitting,setSubmitting]= useState(false);
    const [error,     setError]     = useState(null);

    const handleFile = e => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        const reader = new FileReader();
        reader.onload = ev => setPreview(ev.target.result);
        reader.readAsDataURL(f);
    };

    const submit = async () => {
        if (!file) { setError('Please upload proof of payment.'); return; }
        setSubmitting(true); setError(null);
        try {
            const fd = new FormData();
            fd.append('method', method);
            if (amount) fd.append('amount', amount);
            fd.append('proof', file);

            const res = await fetch(`/api/bookings/${requestId}/payment`, {
                method:  'POST',
                headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content },
                body:    fd,
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message ?? 'Upload failed.'); return; }
            onSuccess();
        } catch { setError('Network error. Try again.'); }
        finally  { setSubmitting(false); }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }}>
            <div style={{
                background: 'var(--bg-card,#fff)', borderRadius: 16, width: '100%', maxWidth: 440,
                boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            }}>
                <div style={{
                    padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color,#e5e7eb)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FaCreditCard size={16} color="#3b82f6" />
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary,#111)' }}>
                            Submit Payment Proof
                        </span>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                        <FaX size={12} />
                    </button>
                </div>

                <div style={{ padding: '1.25rem' }}>
                    <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: '1rem', lineHeight: 1.5 }}>
                        Upload a screenshot of your GCash, bank transfer, or other payment for your <strong>{sacramentType}</strong> request.
                    </p>

                    {/* Method */}
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary,#444)', display: 'block', marginBottom: 4 }}>
                        Payment Method
                    </label>
                    <select
                        value={method} onChange={e => setMethod(e.target.value)}
                        style={{
                            width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, marginBottom: '1rem',
                            border: '1px solid var(--border-color,#e5e7eb)', fontSize: '0.85rem',
                            background: 'var(--bg-input,#fff)', color: 'var(--text-primary,#111)',
                        }}
                    >
                        <option value="gcash">GCash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash (walk-in)</option>
                        <option value="other">Other</option>
                    </select>

                    {/* Amount */}
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary,#444)', display: 'block', marginBottom: 4 }}>
                        Amount (optional)
                    </label>
                    <input
                        type="number" value={amount} onChange={e => setAmount(e.target.value)}
                        placeholder="e.g. 500"
                        style={{
                            width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, marginBottom: '1rem',
                            border: '1px solid var(--border-color,#e5e7eb)', fontSize: '0.85rem',
                            background: 'var(--bg-input,#fff)', color: 'var(--text-primary,#111)',
                            boxSizing: 'border-box',
                        }}
                    />

                    {/* Proof upload */}
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary,#444)', display: 'block', marginBottom: 4 }}>
                        Proof of Payment <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <label style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        border: '2px dashed var(--border-color,#e5e7eb)', borderRadius: 10, padding: '1.5rem',
                        cursor: 'pointer', transition: 'border-color 0.2s', marginBottom: '1rem',
                        background: preview ? 'transparent' : 'var(--bg-hover,#f8fafc)',
                    }}>
                        {preview ? (
                            <img src={preview} alt="Preview" style={{ maxHeight: 160, borderRadius: 8, objectFit: 'contain' }} />
                        ) : (
                            <>
                                <FaUpload size={22} color="#9ca3af" />
                                <span style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 8 }}>
                                    Click to upload (JPG, PNG, PDF — max 5MB)
                                </span>
                            </>
                        )}
                        <input type="file" accept="image/*,.pdf" onChange={handleFile} style={{ display: 'none' }} />
                    </label>

                    {error && (
                        <div style={{
                            background: '#fee2e2', color: '#991b1b', borderRadius: 8,
                            padding: '0.5rem 0.75rem', fontSize: '0.8rem', marginBottom: '1rem',
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button onClick={onClose} style={{
                            background: 'none', border: '1px solid var(--border-color,#e5e7eb)',
                            borderRadius: 8, padding: '0.5rem 1.25rem', cursor: 'pointer',
                            fontSize: '0.85rem', color: 'var(--text-secondary,#444)',
                        }}>
                            Cancel
                        </button>
                        <button onClick={submit} disabled={submitting || !file} style={{
                            background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8,
                            padding: '0.5rem 1.25rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                            opacity: (!file || submitting) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                            {submitting && <FaSpinner size={11} className="spin" />}
                            Submit Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Booking Card ───────────────────────────────────────────────
function BookingCard({ booking, onRefresh }) {
    const [expanded,      setExpanded]      = useState(false);
    const [detail,        setDetail]        = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [showMessages,  setShowMessages]  = useState(false);
    const [showPayment,   setShowPayment]   = useState(false);
    const isTargeted = window.location.hash === `#request-${booking.id}`;

    useEffect(() => {
        if (isTargeted) { setExpanded(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    }, []);

    const loadDetail = async () => {
        if (detail) return;
        setLoadingDetail(true);
        try {
            const res  = await fetch(`/api/bookings/${booking.id}`);
            const data = await res.json();
            setDetail(data);
        } catch {}
        finally { setLoadingDetail(false); }
    };

    const handleExpand = () => {
        const next = !expanded;
        setExpanded(next);
        if (next) loadDetail();
    };

    const statusCfg    = STATUS_CFG[booking.status]    ?? STATUS_CFG['pending'];
    const clergyCfg    = CLERGY_CFG[booking.clergy_status] ?? CLERGY_CFG['unassigned'];
    const paymentCfg   = PAYMENT_CFG[booking.payment_status] ?? PAYMENT_CFG['unpaid'];
    const canPay       = ['pending','approved'].includes(booking.status)
                         && ['unpaid','rejected'].includes(booking.payment_status);
    const canMessage   = true;

    return (
        <>
            <div
                id={`request-${booking.id}`}
                style={{
                    background: 'var(--bg-card,#fff)',
                    border: `1px solid ${isTargeted ? 'var(--bethel-primary,#1a3c5e)' : 'var(--border-color,#e5e7eb)'}`,
                    borderRadius: 14, marginBottom: '1rem', overflow: 'hidden',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                    transition: 'border-color 0.3s',
                }}
            >
                {/* Card header — always visible */}
                <div
                    onClick={handleExpand}
                    style={{
                        padding: '1rem 1.25rem', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                            background: 'rgba(200,151,58,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <FaHandsPraying size={17} color="#c8973a" />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary,#111)', lineHeight: 1.2 }}>
                                {booking.sacrament_type}
                            </p>
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-muted,#9ca3af)' }}>
                                {booking.parish} · Submitted {booking.submitted_at}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        <StatusBadge status={booking.status} />
                        {booking.unread_messages > 0 && (
                            <span style={{
                                background: '#6366f1', color: '#fff',
                                borderRadius: 20, fontSize: '0.68rem', fontWeight: 700,
                                padding: '2px 7px',
                            }}>
                                {booking.unread_messages} new
                            </span>
                        )}
                        {expanded ? <FaChevronUp size={12} color="#9ca3af" /> : <FaChevronDown size={12} color="#9ca3af" />}
                    </div>
                </div>

                {/* Expanded body */}
                {expanded && (
                    <div style={{ borderTop: '1px solid var(--border-color,#f3f4f6)', padding: '1rem 1.25rem' }}>
                        {loadingDetail ? (
                            <p style={{ fontSize: '0.82rem', color: '#999', textAlign: 'center' }}>Loading details…</p>
                        ) : (
                            <>
                                {/* Info grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
                                    {[
                                        { Icon: FaCalendarDays, label: 'Date',         val: booking.preferred_date },
                                        { Icon: FaClock,        label: 'Time',         val: booking.preferred_time },
                                        { Icon: FaUsers,        label: 'Participants', val: booking.participants   },
                                        { Icon: FaChurch,       label: 'Parish',       val: `${booking.parish}${booking.parish_city ? `, ${booking.parish_city}` : ''}` },
                                    ].map(({ Icon, label, val }) => (
                                        <div key={label} style={{
                                            background: 'var(--bg-hover,#f8fafc)', borderRadius: 8, padding: '0.6rem 0.8rem',
                                            display: 'flex', alignItems: 'center', gap: 8,
                                        }}>
                                            <Icon size={13} color="#9ca3af" />
                                            <div>
                                                <p style={{ margin: 0, fontSize: '0.7rem', color: '#9ca3af' }}>{label}</p>
                                                <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary,#111)' }}>{val}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Clergy + Payment status row */}
                                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    <div style={{
                                        flex: 1, minWidth: 180, background: 'var(--bg-hover,#f8fafc)',
                                        borderRadius: 8, padding: '0.6rem 0.8rem',
                                        display: 'flex', alignItems: 'center', gap: 8,
                                    }}>
                                        <FaPersonPraying size={13} color="#6366f1" />
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#9ca3af' }}>Assigned Clergy</p>
                                            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: clergyCfg.color }}>
                                                {booking.assigned_clergy ?? clergyCfg.label}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{
                                        flex: 1, minWidth: 180, borderRadius: 8, padding: '0.6rem 0.8rem',
                                        background: paymentCfg.bg, display: 'flex', alignItems: 'center', gap: 8,
                                    }}>
                                        <FaCreditCard size={13} color={paymentCfg.color} />
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.7rem', color: paymentCfg.color, opacity: 0.8 }}>Payment</p>
                                            <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: paymentCfg.color }}>
                                                {paymentCfg.label}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Admin notes */}
                                {detail?.admin_notes && (
                                    <div style={{
                                        background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
                                        borderRadius: 8, padding: '0.65rem 0.9rem', marginBottom: '1rem', fontSize: '0.82rem',
                                        color: 'var(--text-primary,#111)', lineHeight: 1.5,
                                    }}>
                                        <strong style={{ display: 'block', marginBottom: 2, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: 1, color: '#92400e' }}>
                                            Note from Parish
                                        </strong>
                                        {detail.admin_notes}
                                    </div>
                                )}

                                {/* Submitted details */}
                                {detail?.details && Object.keys(detail.details).length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', marginBottom: 6 }}>
                                            Your Submitted Info
                                        </p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '0.4rem' }}>
                                            {Object.entries(detail.details).map(([k, v]) => (
                                                <div key={k} style={{ fontSize: '0.8rem', color: 'var(--text-primary,#111)' }}>
                                                    <span style={{ color: '#9ca3af' }}>{humanize(k)}: </span>
                                                    {Array.isArray(v) ? v.join(', ') : String(v || '—')}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Payment proof preview */}
                                {detail?.payment?.proof_url && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af', marginBottom: 6 }}>
                                            Payment Proof
                                        </p>
                                        <a href={detail.payment.proof_url} target="_blank" rel="noreferrer">
                                            <img src={detail.payment.proof_url} alt="Proof"
                                                style={{ maxHeight: 140, borderRadius: 8, border: '1px solid var(--border-color,#e5e7eb)', objectFit: 'contain' }} />
                                        </a>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {canMessage && (
                                        <button onClick={() => setShowMessages(true)} style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            padding: '0.45rem 1rem', borderRadius: 8, cursor: 'pointer',
                                            border: '1px solid #6366f1', background: 'rgba(99,102,241,0.08)',
                                            color: '#6366f1', fontSize: '0.82rem', fontWeight: 600,
                                        }}>
                                            <FaComment size={11} />
                                            Message Parish
                                            {booking.unread_messages > 0 && (
                                                <span style={{ background: '#6366f1', color: '#fff', borderRadius: 20, fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px' }}>
                                                    {booking.unread_messages}
                                                </span>
                                            )}
                                        </button>
                                    )}
                                    {canPay && (
                                        <button onClick={() => setShowPayment(true)} style={{
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            padding: '0.45rem 1rem', borderRadius: 8, cursor: 'pointer',
                                            border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.08)',
                                            color: '#3b82f6', fontSize: '0.82rem', fontWeight: 600,
                                        }}>
                                            <FaCreditCard size={11} />
                                            {booking.payment_status === 'rejected' ? 'Re-submit Payment' : 'Submit Payment'}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {showMessages && (
                <MessageThread requestId={booking.id} onClose={() => { setShowMessages(false); onRefresh(); }} />
            )}
            {showPayment && (
                <PaymentModal
                    requestId={booking.id}
                    sacramentType={booking.sacrament_type}
                    onClose={() => setShowPayment(false)}
                    onSuccess={() => { setShowPayment(false); onRefresh(); }}
                />
            )}
        </>
    );
}

// ── Main Page ──────────────────────────────────────────────────
export default function MyBookingsPage({ isAuth = true }) {
    const [bookings,      setBookings]      = useState([]);
    const [loading,       setLoading]       = useState(true);
    const [statusFilter,  setStatusFilter]  = useState('all');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
            const res    = await fetch(`/api/bookings${params}`);
            const data   = await res.json();
            setBookings(Array.isArray(data) ? data : []);
        } catch {}
        finally { setLoading(false); }
    }, [statusFilter]);

    useEffect(() => { load(); }, [load]);

    if (!isAuth) {
        return (
            <div className="container py-5" style={{ maxWidth: 520 }}>
                <div style={{
                    background: 'var(--bg-card,#fff)', border: '1px solid var(--border-color,#e5e7eb)',
                    borderRadius: 16, padding: '3rem 2rem', textAlign: 'center',
                }}>
                    <FaHandsPraying size={36} color="#c8973a" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary,#111)' }}>Sign in to view your bookings</h2>
                    <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                        Track your sacramental appointment requests here.
                    </p>
                    <a href="/login" className="btn" style={{ background: 'var(--bethel-primary,#1a3c5e)', color: '#fff', borderRadius: 8, padding: '0.6rem 1.75rem', fontWeight: 600 }}>
                        Sign In
                    </a>
                </div>
            </div>
        );
    }

    return (
        <>
            <style>{`
                .spin { animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>

            <div className="container py-4" style={{ maxWidth: 760 }}>
                {/* Header */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <a href="/sacraments" style={{ fontSize: '0.8rem', color: 'var(--bethel-primary,#1a3c5e)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: '0.75rem' }}>
                        <FaArrowLeft size={11} /> Back to Sacraments
                    </a>
                    <h1 style={{ fontWeight: 800, fontSize: '1.6rem', color: 'var(--text-primary,#111)', margin: 0 }}>
                        My Bookings
                    </h1>
                    <p style={{ color: 'var(--text-muted,#9ca3af)', fontSize: '0.88rem', margin: '4px 0 0' }}>
                        Track all your sacramental appointment requests.
                    </p>
                </div>

                {/* Filter pills */}
                <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    {['all','pending','approved','rejected'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)} style={{
                            padding: '0.35rem 1rem', borderRadius: 20, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                            border: statusFilter === s ? '1.5px solid var(--bethel-primary,#1a3c5e)' : '1.5px solid var(--border-color,#e5e7eb)',
                            background: statusFilter === s ? 'var(--bethel-primary,#1a3c5e)' : 'transparent',
                            color: statusFilter === s ? '#fff' : 'var(--text-secondary,#444)',
                            transition: 'all 0.15s',
                        }}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>

                {/* List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                        <FaSpinner size={22} className="spin" />
                        <p style={{ marginTop: '0.75rem', fontSize: '0.88rem' }}>Loading your bookings…</p>
                    </div>
                ) : bookings.length === 0 ? (
                    <div style={{
                        background: 'var(--bg-card,#fff)', border: '1px solid var(--border-color,#e5e7eb)',
                        borderRadius: 14, padding: '3rem 2rem', textAlign: 'center',
                    }}>
                        <FaHandsPraying size={30} color="#e5e7eb" style={{ marginBottom: '0.75rem' }} />
                        <p style={{ color: '#9ca3af', fontSize: '0.9rem', margin: 0 }}>
                            {statusFilter === 'all' ? 'No bookings yet.' : `No ${statusFilter} bookings.`}
                        </p>
                        <a href="/sacraments" style={{
                            display: 'inline-block', marginTop: '1rem', padding: '0.5rem 1.25rem',
                            background: 'var(--bethel-primary,#1a3c5e)', color: '#fff',
                            borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
                        }}>
                            Book a Sacrament
                        </a>
                    </div>
                ) : (
                    bookings.map(b => (
                        <BookingCard key={b.id} booking={b} onRefresh={load} />
                    ))
                )}
            </div>
        </>
    );
}