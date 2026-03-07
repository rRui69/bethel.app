import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaCircleCheck, FaHandsPraying, FaComment, FaCreditCard, FaPersonPraying } from 'react-icons/fa6';

const TYPE_ICON = {
    request_update:    { Icon: FaCircleCheck,   color: '#10b981' },
    clergy_assignment: { Icon: FaPersonPraying,  color: '#6366f1' },
    clergy_response:   { Icon: FaPersonPraying,  color: '#f59e0b' },
    payment_update:    { Icon: FaCreditCard,      color: '#3b82f6' },
    payment_submitted: { Icon: FaCreditCard,      color: '#f59e0b' },
    message:           { Icon: FaComment,         color: '#8b5cf6' },
    sacrament_request: { Icon: FaHandsPraying,    color: '#c8973a' },
};

export default function NotificationBell({ isAuth = false }) {
    const [open,          setOpen]          = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread,        setUnread]        = useState(0);
    const [loading,       setLoading]       = useState(false);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Poll unread count every 30s
    useEffect(() => {
        if (!isAuth) return;
        fetchCount();
        const interval = setInterval(fetchCount, 30_000);
        return () => clearInterval(interval);
    }, [isAuth]);

    const fetchCount = async () => {
        try {
            const res  = await fetch('/api/my-notifications');
            const data = await res.json();
            setUnread(data.unread ?? 0);
        } catch {}
    };

    const handleOpen = async () => {
        if (!isAuth) { window.location.href = '/login'; return; }
        setOpen(o => !o);
        if (!open) {
            setLoading(true);
            try {
                const res  = await fetch('/api/my-notifications');
                const data = await res.json();
                setNotifications(data.notifications ?? []);
                setUnread(data.unread ?? 0);
            } catch {}
            finally { setLoading(false); }

            // Mark as read after opening
            fetch('/api/my-notifications/read', {
                method:  'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Content-Type': 'application/json',
                },
            }).then(() => setUnread(0)).catch(() => {});
        }
    };

    const handleClick = (n) => {
        if (n.link_id) window.location.href = `/my-bookings#request-${n.link_id}`;
        setOpen(false);
    };

    return (
        <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={handleOpen}
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '0.4rem', borderRadius: 8, position: 'relative',
                    color: 'var(--text-secondary)',
                    transition: 'color 0.2s',
                }}
                title="Notifications"
            >
                <FaBell size={18} />
                {unread > 0 && (
                    <span style={{
                        position: 'absolute', top: 0, right: 0,
                        background: '#ef4444', color: '#fff',
                        fontSize: '0.6rem', fontWeight: 700,
                        borderRadius: '50%', width: 16, height: 16,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        lineHeight: 1,
                    }}>
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: 320, background: 'var(--bg-card, #fff)',
                    border: '1px solid var(--border-color, #e5e7eb)',
                    borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    zIndex: 9999, overflow: 'hidden',
                }}>
                    <div style={{
                        padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color, #e5e7eb)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary, #111)' }}>
                            Notifications
                        </span>
                        <a href="/my-bookings" style={{ fontSize: '0.75rem', color: 'var(--bethel-primary, #1a3c5e)', textDecoration: 'none' }}>
                            My Bookings →
                        </a>
                    </div>

                    <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#999', fontSize: '0.82rem' }}>
                                Loading…
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#999', fontSize: '0.82rem' }}>
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map(n => {
                                const cfg = TYPE_ICON[n.type] ?? TYPE_ICON['sacrament_request'];
                                return (
                                    <div
                                        key={n.id}
                                        onClick={() => handleClick(n)}
                                        style={{
                                            display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                                            padding: '0.75rem 1rem', cursor: 'pointer',
                                            borderBottom: '1px solid var(--border-color, #f3f4f6)',
                                            background: n.is_read ? 'transparent' : 'rgba(99,102,241,0.04)',
                                            transition: 'background 0.15s',
                                        }}
                                    >
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                            background: cfg.color + '18',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <cfg.Icon size={14} color={cfg.color} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{
                                                margin: 0, fontSize: '0.8rem', lineHeight: 1.4,
                                                color: 'var(--text-primary, #111)',
                                                fontWeight: n.is_read ? 400 : 600,
                                            }}>
                                                {n.message}
                                            </p>
                                            <span style={{ fontSize: '0.72rem', color: '#aaa' }}>{n.time}</span>
                                        </div>
                                        {!n.is_read && (
                                            <div style={{
                                                width: 7, height: 7, borderRadius: '50%',
                                                background: '#6366f1', flexShrink: 0, marginTop: 6,
                                            }} />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}