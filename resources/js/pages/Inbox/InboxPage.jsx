import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import {
    FaBell, FaComment, FaCircleCheck, FaHandsPraying, FaCreditCard,
    FaPersonPraying, FaChurch, FaCircle, FaSpinner, FaEnvelope,
    FaEnvelopeOpen, FaCheckDouble, FaArrowLeft, FaPaperPlane, FaX, FaPaperclip,
} from 'react-icons/fa6';

// ── Type → icon/colour map ─────────────────────────────────────
const TYPE_CFG = {
    request_update:    { Icon: FaCircleCheck,  color: '#10b981', label: 'Request Update'    },
    clergy_assignment: { Icon: FaPersonPraying, color: '#6366f1', label: 'Clergy Assigned'   },
    clergy_response:   { Icon: FaPersonPraying, color: '#f59e0b', label: 'Clergy Response'   },
    payment_update:    { Icon: FaCreditCard,    color: '#3b82f6', label: 'Payment Update'    },
    payment_submitted: { Icon: FaCreditCard,    color: '#f59e0b', label: 'Payment Submitted' },
    message:           { Icon: FaComment,       color: '#8b5cf6', label: 'New Message'       },
    sacrament_request: { Icon: FaHandsPraying,  color: '#c8973a', label: 'Sacrament'         },
};
const DEFAULT_CFG = { Icon: FaBell, color: '#9ca3af', label: 'Notification' };

function cfgFor(type) { return TYPE_CFG[type] ?? DEFAULT_CFG; }

// ── Message Thread Modal ──────────────────────────────────────
function ThreadModal({ bookingId, sacramentType, onClose, onMessagesRead }) {
    const [messages,  setMessages]  = useState([]);
    const [body,      setBody]      = useState('');
    const [msgImage,  setMsgImage]  = useState(null);
    const imageInputRef              = useRef(null);
    const { upload: uploadImage }    = useCloudinaryUpload();
    const [sending,  setSending]  = useState(false);
    const [loading,  setLoading]  = useState(true);
    const bottomRef = useRef(null);
    const scrollBoxRef = useRef(null);
    const pollRef   = useRef(null);
    const authId = window.__PAGE_DATA__?.authId ?? null;

    const isNearBottom = () => {
        const el = scrollBoxRef.current;
        if (!el) return true;
        return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    };

    const fetchMessages = useCallback(async () => {
        try {
            const res  = await fetch(`/api/bookings/${bookingId}/messages`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(prev => {
                    if (JSON.stringify(prev.map(m => m.id)) === JSON.stringify(data.map(m => m.id))) return prev;
                    if (onMessagesRead) onMessagesRead(bookingId);
                    return data;
                });
            }
        } catch {}
    }, [bookingId]);

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
            const csrf = document.querySelector('meta[name="csrf-token"]')?.content;
            let imageUrl = null;
            if (msgImage) {
                imageUrl = await uploadImage(msgImage, 'bethel_app/messages');
            }
            const res = await fetch(`/api/bookings/${bookingId}/messages`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify({ body: body.trim() || null, image_url: imageUrl }),
            });
            const msg = await res.json();
            if (res.ok) {
                setMessages(prev => [...prev, msg]);
                setBody('');
                setMsgImage(null);
                if (imageInputRef.current) imageInputRef.current.value = '';
            }
        } catch (err) { console.error('send failed', err); }
        finally { setSending(false); }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
        }} onClick={onClose}>
            <div style={{
                background: 'var(--bg-card,#fff)', borderRadius: 16,
                width: '100%', maxWidth: 520, maxHeight: '85vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--border-color,#e5e7eb)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: '50%',
                            background: 'rgba(99,102,241,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <FaComment size={15} color="#6366f1" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary,#111)' }}>
                                {sacramentType} — Parish Staff
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                                Booking #{bookingId}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#9ca3af', padding: '0.25rem',
                    }}>
                        <FaX size={12} />
                    </button>
                </div>

                {/* Messages */}
                <div ref={scrollBoxRef} style={{
                    flex: 1, overflowY: 'auto', padding: '1rem',
                    display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                            <FaSpinner size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
                        </div>
                    ) : messages.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#bbb', fontSize: '0.85rem' }}>
                            No messages yet. Send one to start the conversation.
                        </div>
                    ) : messages.map(m => (
                        <div key={m.id} style={{
                            display: 'flex', flexDirection: 'column',
                            alignItems: m.is_mine ? 'flex-end' : 'flex-start',
                        }}>
                            <span style={{ fontSize: '0.68rem', color: '#bbb', marginBottom: 2 }}>
                                {m.is_mine ? 'You' : m.sender} · {m.time}
                            </span>
                            <div style={{
                                maxWidth: '78%', padding: '0.5rem 0.85rem',
                                borderRadius: m.is_mine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                background: m.is_mine ? 'var(--bethel-primary,#1a3c5e)' : 'var(--bg-hover,#f1f5f9)',
                                color: m.is_mine ? '#fff' : 'var(--text-primary,#111)',
                                fontSize: '0.85rem', lineHeight: 1.5,
                            }}>
                                {m.body && <div>{m.body}</div>}
                                {m.image_url && (
                                    <a href={m.image_url} target="_blank" rel="noreferrer">
                                        <img src={m.image_url} alt="attachment"
                                            style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8,
                                                marginTop: m.body ? 6 : 0, display: 'block', cursor: 'pointer' }} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color,#e5e7eb)' }}>
                    {msgImage && (
                        <div style={{ marginBottom: 8, padding: '0.4rem 0.7rem',
                            background: 'var(--bg-hover,#f1f5f9)', borderRadius: 8,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            fontSize: '0.78rem', color: '#555' }}>
                            <span>📎 {msgImage.name}</span>
                            <button onClick={() => { setMsgImage(null); if (imageInputRef.current) imageInputRef.current.value = ''; }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}>
                                <FaX size={10} />
                            </button>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <textarea rows={2} value={body}
                            onChange={e => setBody(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }}}
                            placeholder="Reply to parish staff…"
                            style={{ flex: 1, resize: 'none', borderRadius: 10, padding: '0.5rem 0.75rem',
                                border: '1px solid var(--border-color,#e5e7eb)', fontSize: '0.85rem',
                                fontFamily: 'inherit', background: 'var(--bg-input,#fff)',
                                color: 'var(--text-primary,#111)', outline: 'none' }} />
                        <button onClick={() => imageInputRef.current?.click()} title="Attach image"
                            style={{ background: msgImage ? '#e0f2fe' : 'var(--bg-hover,#f1f5f9)',
                                border: '1px solid var(--border-color,#e5e7eb)', borderRadius: 10,
                                padding: '0 0.75rem', cursor: 'pointer', color: msgImage ? '#0284c7' : '#888' }}>
                            <FaPaperclip size={14} />
                        </button>
                        <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={e => setMsgImage(e.target.files[0] ?? null)} />
                        <button onClick={send} disabled={sending || (!body.trim() && !msgImage)}
                            style={{ background: 'var(--bethel-primary,#1a3c5e)', color: '#fff',
                                border: 'none', borderRadius: 10, padding: '0 1rem', cursor: 'pointer',
                                opacity: ((!body.trim() && !msgImage) || sending) ? 0.45 : 1,
                                display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', fontWeight: 600 }}>
                            {sending ? <FaSpinner size={12} style={{ animation: 'spin 0.8s linear infinite' }} />
                                     : <FaPaperPlane size={12} />}
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Notification Item ─────────────────────────────────────────
function NotifItem({ notif, onRead }) {
    const cfg = cfgFor(notif.type);
    const Icon = cfg.Icon;

    const handleClick = async () => {
        if (!notif.is_read) {
            // Optimistic
            onRead(notif.id);
            fetch('/api/inbox/read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                },
                body: JSON.stringify({ id: notif.id }),
            }).catch(() => {});
        }
        if (notif.link_id) {
            window.location.href = `/my-bookings#request-${notif.link_id}`;
        }
    };

    return (
        <div
            onClick={handleClick}
            style={{
                display: 'flex', gap: '0.85rem', alignItems: 'flex-start',
                padding: '0.9rem 1.25rem', cursor: notif.link_id ? 'pointer' : 'default',
                borderBottom: '1px solid var(--border-color,#f3f4f6)',
                background: notif.is_read ? 'transparent' : 'rgba(99,102,241,0.035)',
                transition: 'background 0.15s',
            }}
        >
            {/* Icon */}
            <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: cfg.color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={15} color={cfg.color} />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                    margin: 0, fontSize: '0.85rem', lineHeight: 1.45,
                    color: 'var(--text-primary,#111)',
                    fontWeight: notif.is_read ? 400 : 600,
                }}>
                    {notif.message}
                </p>
                <span style={{ fontSize: '0.72rem', color: '#aaa', marginTop: 2, display: 'block' }}>
                    {notif.time_full} · {cfg.label}
                </span>
            </div>

            {/* Unread dot */}
            {!notif.is_read && (
                <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#6366f1', flexShrink: 0, marginTop: 5,
                }} />
            )}
        </div>
    );
}

// ── Thread Item ───────────────────────────────────────────────
function ThreadItem({ thread, onOpen }) {
    const hasUnread = thread.unread_messages > 0;

    return (
        <div
            onClick={() => onOpen(thread)}
            style={{
                display: 'flex', gap: '0.85rem', alignItems: 'center',
                padding: '0.9rem 1.25rem', cursor: 'pointer',
                borderBottom: '1px solid var(--border-color,#f3f4f6)',
                background: hasUnread ? 'rgba(99,102,241,0.035)' : 'transparent',
                transition: 'background 0.15s',
            }}
        >
            <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(200,151,58,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <FaHandsPraying size={15} color="#c8973a" />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                    <p style={{
                        margin: 0, fontSize: '0.875rem', fontWeight: hasUnread ? 700 : 500,
                        color: 'var(--text-primary,#111)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                        {thread.sacrament_type}
                    </p>
                    {hasUnread && (
                        <span style={{
                            background: '#6366f1', color: '#fff',
                            borderRadius: 20, fontSize: '0.65rem', fontWeight: 700,
                            padding: '2px 7px', flexShrink: 0,
                        }}>
                            {thread.unread_messages} new
                        </span>
                    )}
                </div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
                    {thread.parish} · Submitted {thread.submitted_at}
                </p>
            </div>

            <FaComment size={14} color={hasUnread ? '#6366f1' : '#d1d5db'} style={{ flexShrink: 0 }} />
        </div>
    );
}

// ── Tab Bar ───────────────────────────────────────────────────
function TabBar({ active, onSelect, unreadNotifs, unreadThreads }) {
    const tabs = [
        { id: 'notifications', label: 'Notifications', badge: unreadNotifs },
        { id: 'messages',      label: 'Messages',      badge: unreadThreads },
    ];
    return (
        <div style={{
            display: 'flex', borderBottom: '1px solid var(--border-color,#e5e7eb)',
            background: 'var(--bg-card,#fff)',
        }}>
            {tabs.map(t => (
                <button
                    key={t.id}
                    onClick={() => onSelect(t.id)}
                    style={{
                        flex: 1, padding: '0.85rem 1rem',
                        background: 'none', border: 'none', cursor: 'pointer',
                        borderBottom: active === t.id ? '2.5px solid var(--bethel-primary,#1a3c5e)' : '2.5px solid transparent',
                        color: active === t.id ? 'var(--bethel-primary,#1a3c5e)' : 'var(--text-muted,#9ca3af)',
                        fontWeight: active === t.id ? 700 : 500,
                        fontSize: '0.875rem', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 8, transition: 'all 0.15s',
                    }}
                >
                    {t.label}
                    {t.badge > 0 && (
                        <span style={{
                            background: '#6366f1', color: '#fff',
                            borderRadius: 20, fontSize: '0.65rem', fontWeight: 700,
                            padding: '2px 7px', lineHeight: 1,
                        }}>
                            {t.badge > 99 ? '99+' : t.badge}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}

// ── Main InboxPage ────────────────────────────────────────────
export default function InboxPage({ isAuth = true }) {
    const [tab,          setTab]          = useState('notifications');
    const [data,         setData]         = useState(null);
    const [loading,      setLoading]      = useState(true);
    const [openThread,   setOpenThread]   = useState(null); // { id, sacramentType }

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res  = await fetch('/api/inbox');
            const json = await res.json();
            setData(json);
        } catch {}
        finally { setLoading(false); }
    }, []);

    useEffect(() => { if (isAuth) load(); }, [isAuth, load]);

    // Auto-open thread when arriving from ?thread=X (e.g. redirected from My Bookings)
    useEffect(() => {
        if (!data) return;
        const params   = new URLSearchParams(window.location.search);
        const threadId = params.get('thread');
        if (!threadId) return;
        const thread = (data.threads ?? []).find(t => String(t.id) === threadId);
        if (thread) {
            setTab('messages');
            setOpenThread({ id: thread.id, sacramentType: thread.sacrament_type });
        } else {
            // Thread exists but has no messages yet — still open it via a lightweight entry
            setTab('messages');
            setOpenThread({ id: Number(threadId), sacramentType: 'Sacrament Request' });
        }
        // Remove the param from the URL so a refresh doesn't re-open it
        const clean = window.location.pathname;
        window.history.replaceState(null, '', clean);
    }, [data]);

    // Optimistic mark-as-read for notifications
    const handleNotifRead = (id) => {
        setData(prev => ({
            ...prev,
            notifications: prev.notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ),
            unread_notifications: Math.max(0, (prev.unread_notifications ?? 1) - 1),
        }));
    };

    const handleMarkAllRead = async () => {
        // Optimistic
        setData(prev => ({
            ...prev,
            notifications: prev.notifications.map(n => ({ ...n, is_read: true })),
            unread_notifications: 0,
        }));
        fetch('/api/inbox/read-all', {
            method: 'POST',
            headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content },
        }).catch(() => {});
    };

    // After opening thread, mark it as read locally
    const handleThreadRead = (bookingId) => {
        setData(prev => ({
            ...prev,
            threads: prev.threads.map(t =>
                t.id === bookingId ? { ...t, unread_messages: 0 } : t
            ),
        }));
    };

    if (!isAuth) {
        return (
            <div className="container py-5" style={{ maxWidth: 500 }}>
                <div style={{
                    background: 'var(--bg-card,#fff)',
                    border: '1px solid var(--border-color,#e5e7eb)',
                    borderRadius: 16, padding: '3rem 2rem', textAlign: 'center',
                }}>
                    <FaBell size={36} color="#c8973a" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Sign in to view your inbox</h2>
                    <a href="/login" className="btn mt-3"
                       style={{ background: 'var(--bethel-primary,#1a3c5e)', color: '#fff', borderRadius: 8, padding: '0.6rem 1.75rem', fontWeight: 600 }}>
                        Sign In
                    </a>
                </div>
            </div>
        );
    }

    const notifications  = data?.notifications  ?? [];
    const threads        = data?.threads        ?? [];
    const unreadNotifs   = data?.unread_notifications ?? 0;
    const unreadThreads  = threads.reduce((sum, t) => sum + (t.unread_messages ?? 0), 0);

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                .inbox-spin { animation: spin 0.8s linear infinite; }
            `}</style>

            <div className="container py-4" style={{ maxWidth: 680 }}>

                {/* Page header */}
                <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                        <a href="/" style={{ fontSize: '0.8rem', color: 'var(--bethel-primary,#1a3c5e)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: '0.4rem' }}>
                            <FaArrowLeft size={10} /> Back to Home
                        </a>
                        <h1 style={{ fontWeight: 800, fontSize: '1.55rem', color: 'var(--text-primary,#111)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <FaEnvelope size={22} color="var(--bethel-primary,#1a3c5e)" />
                            Inbox
                        </h1>
                    </div>

                    {tab === 'notifications' && unreadNotifs > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '0.45rem 1rem', borderRadius: 8, cursor: 'pointer',
                                border: '1px solid var(--border-color,#e5e7eb)',
                                background: 'var(--bg-card,#fff)',
                                color: 'var(--text-secondary,#444)',
                                fontSize: '0.8rem', fontWeight: 600,
                            }}
                        >
                            <FaCheckDouble size={11} /> Mark all read
                        </button>
                    )}
                </div>

                {/* Card */}
                <div style={{
                    background: 'var(--bg-card,#fff)',
                    border: '1px solid var(--border-color,#e5e7eb)',
                    borderRadius: 16,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    overflow: 'hidden',
                }}>
                    <TabBar
                        active={tab}
                        onSelect={setTab}
                        unreadNotifs={unreadNotifs}
                        unreadThreads={unreadThreads}
                    />

                    {loading ? (
                        <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                            <FaSpinner size={22} className="inbox-spin" />
                            <p style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>Loading inbox…</p>
                        </div>
                    ) : (
                        <>
                            {/* Notifications tab */}
                            {tab === 'notifications' && (
                                notifications.length === 0 ? (
                                    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#bbb' }}>
                                        <FaBell size={28} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                                        <p style={{ fontSize: '0.875rem', margin: 0 }}>No notifications yet.</p>
                                        <p style={{ fontSize: '0.8rem', margin: '4px 0 0', color: '#ccc' }}>
                                            Parish staff updates will appear here.
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        {notifications.map(n => (
                                            <NotifItem key={n.id} notif={n} onRead={handleNotifRead} />
                                        ))}
                                    </div>
                                )
                            )}

                            {/* Messages tab */}
                            {tab === 'messages' && (
                                threads.length === 0 ? (
                                    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#bbb' }}>
                                        <FaComment size={28} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                                        <p style={{ fontSize: '0.875rem', margin: 0 }}>No message threads yet.</p>
                                        <p style={{ fontSize: '0.8rem', margin: '4px 0 0', color: '#ccc' }}>
                                            Messages from parish staff about your bookings appear here.
                                        </p>
                                        <a href="/my-bookings" style={{
                                            display: 'inline-block', marginTop: '1rem',
                                            padding: '0.45rem 1.2rem',
                                            background: 'var(--bethel-primary,#1a3c5e)',
                                            color: '#fff', borderRadius: 8,
                                            fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
                                        }}>
                                            View My Bookings
                                        </a>
                                    </div>
                                ) : (
                                    <div>
                                        {threads.map(t => (
                                            <ThreadItem
                                                key={t.id}
                                                thread={t}
                                                onOpen={(thread) => setOpenThread({ id: thread.id, sacramentType: thread.sacrament_type })}
                                            />
                                        ))}
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>

                {/* Quick links footer */}
                <div style={{ marginTop: '1rem', display: 'flex', gap: 12, fontSize: '0.8rem', color: '#aaa' }}>
                    <a href="/my-bookings" style={{ color: 'var(--bethel-primary,#1a3c5e)', textDecoration: 'none' }}>
                        My Bookings →
                    </a>
                    <span>·</span>
                    <a href="/profile" style={{ color: 'var(--bethel-primary,#1a3c5e)', textDecoration: 'none' }}>
                        My Profile →
                    </a>
                </div>
            </div>

            {/* Thread modal */}
            {openThread && (
                <ThreadModal
                    bookingId={openThread.id}
                    sacramentType={openThread.sacramentType}
                    onClose={() => { setOpenThread(null); load(); }}
                    onMessagesRead={handleThreadRead}
                />
            )}
        </>
    );
}