// resources/js/pages/Home/LivestreamWidget.jsx
//
// Homepage widget — polls /api/livestreams/active every 30 seconds.
// Renders nothing when no streams are live (zero layout shift).
// Shows a compact preview card for each active stream.

import React, { useState, useEffect, useCallback } from 'react';
import { FaFacebook, FaVideo, FaArrowRight } from 'react-icons/fa6';

function StreamPreviewCard({ stream }) {
    const isFacebook = stream.type === 'facebook';

    return (
        <a
            href="/livestream"
            style={{
                display: 'block', textDecoration: 'none',
                background: 'var(--card-bg, #fff)',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '12px', padding: '14px 16px',
                transition: 'box-shadow 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Icon */}
                <div style={{
                    width: 36, height: 36, borderRadius: '9px', flexShrink: 0,
                    background: isFacebook ? 'rgba(59,89,152,0.1)' : 'rgba(239,68,68,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isFacebook ? '#3b5998' : '#ef4444',
                }}>
                    {isFacebook ? <FaFacebook size={16} /> : <FaVideo size={14} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-color, #111)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {stream.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {isFacebook ? 'Facebook Live' : 'Camera Stream'}
                    </div>
                </div>

                {/* LIVE badge */}
                <span style={{
                    flexShrink: 0,
                    padding: '2px 8px', borderRadius: '20px',
                    fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em',
                    background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                    LIVE
                </span>
            </div>
        </a>
    );
}

export default function LivestreamWidget() {
    const [streams, setStreams] = useState(window.__PAGE_DATA__?.activeStreams ?? []);

    const poll = useCallback(async () => {
        try {
            const res  = await fetch('/api/livestreams/active');
            const data = await res.json();
            setStreams(Array.isArray(data) ? data : []);
        } catch (_) {}
    }, []);

    useEffect(() => {
        const interval = setInterval(poll, 30_000);
        return () => clearInterval(interval);
    }, [poll]);

    // Render nothing when no streams — zero layout impact
    if (!streams || streams.length === 0) return null;

    return (
        <section className="py-4" aria-label="Live streams">
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    {/* Animated LIVE indicator */}
                    <span style={{
                        padding: '4px 12px', borderRadius: '20px',
                        fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em',
                        background: '#ef4444', color: '#fff',
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
                    }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 1.5s infinite' }} />
                        LIVE NOW
                    </span>

                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-color, #111)' }}>
                        {streams.length === 1 ? '1 Active Stream' : `${streams.length} Active Streams`}
                    </span>

                    <a
                        href="/livestream"
                        style={{
                            marginLeft: 'auto', fontSize: '0.8rem', fontWeight: 600,
                            color: '#1a3c5e', textDecoration: 'none',
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                        }}
                    >
                        Watch <FaArrowRight size={11} />
                    </a>
                </div>

                <div className="row g-3">
                    {streams.map(stream => (
                        <div key={stream.id} className="col-12 col-md-6 col-lg-4">
                            <StreamPreviewCard stream={stream} />
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
            `}</style>
        </section>
    );
}