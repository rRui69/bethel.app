// resources/js/pages/Livestream/LivestreamPage.jsx
//
// Public-facing livestream page at /livestream.
// Shows all active streams + paginated archive.
// No auth required.

import React, { useState, useEffect, useCallback } from 'react';
import { FaFacebook, FaVideo, FaBoxArchive, FaCircleNotch, FaTowerBroadcast} from 'react-icons/fa6';
import FacebookEmbed from '@/components/livestream/FacebookEmbed';
import AgoraViewer   from '@/components/livestream/AgoraViewer';

// ── Stream Viewer Card ─────────────────────────────────────────
function StreamCard({ stream }) {
    const isFacebook = stream.type === 'facebook';

    return (
        <div style={{
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--border-color, #e5e7eb)',
            borderRadius: '14px', overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
            {/* Embed / Viewer */}
            <div style={{ padding: '0' }}>
                {isFacebook
                    ? <FacebookEmbed url={stream.facebook_url} />
                    : <AgoraViewer channel={stream.agora_channel} />
                }
            </div>

            {/* Info */}
            <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    {/* Live badge */}
                    <span style={{
                        padding: '2px 10px', borderRadius: '20px',
                        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.05em',
                        background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                    }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                        LIVE
                    </span>

                    {/* Type chip */}
                    <span style={{
                        padding: '2px 8px', borderRadius: '20px',
                        fontSize: '0.68rem', fontWeight: 600,
                        background: isFacebook ? 'rgba(59,89,152,0.08)' : 'rgba(239,68,68,0.08)',
                        color: isFacebook ? '#3b5998' : '#dc2626',
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                    }}>
                        {isFacebook ? <FaFacebook size={10} /> : <FaVideo size={10} />}
                        {isFacebook ? 'Facebook' : 'Camera'}
                    </span>
                </div>

                <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontWeight: 700, color: 'var(--text-color, #111)' }}>
                    {stream.title}
                </h3>
                {stream.description && (
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        {stream.description}
                    </p>
                )}
            </div>
        </div>
    );
}

//  Archive Card 
function ArchiveCard({ stream }) {
    const isFacebook = stream.type === 'facebook';

    return (
        <div style={{
            background: 'var(--card-bg, #fff)',
            border: '1px solid var(--border-color, #e5e7eb)',
            borderRadius: '12px', padding: '16px 18px',
            display: 'flex', gap: '14px', alignItems: 'flex-start',
        }}>
            <div style={{
                width: 38, height: 38, borderRadius: '9px', flexShrink: 0,
                background: isFacebook ? 'rgba(59,89,152,0.1)' : 'rgba(239,68,68,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isFacebook ? '#3b5998' : '#ef4444',
            }}>
                {isFacebook ? <FaFacebook size={16} /> : <FaVideo size={15} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-color, #111)', marginBottom: '3px' }}>
                    {stream.title}
                </div>
                {stream.description && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '5px', lineHeight: 1.4 }}>
                        {stream.description}
                    </div>
                )}
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {stream.streamed_on}
                    {stream.duration && <span> · {stream.duration}</span>}
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────
export default function LivestreamPage({ activeStreams: initial = [], archivedStreams: initialArchive = {} }) {
    const [activeStreams, setActiveStreams] = useState(initial);
    const [archive,       setArchive]       = useState(initialArchive?.data ?? []);
    const [archiveMeta,   setArchiveMeta]   = useState(initialArchive?.meta ?? {});
    const [archivePage,   setArchivePage]   = useState(1);
    const [archiveLoading, setArchiveLoading] = useState(false);
    const [polling,       setPolling]       = useState(false);

    // ── Poll for active streams every 30 seconds ───────────────
    const pollActive = useCallback(async () => {
        setPolling(true);
        try {
            const res  = await fetch('/api/livestreams/active');
            const data = await res.json();
            setActiveStreams(data);
        } catch (_) {
        } finally {
            setPolling(false);
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(pollActive, 30_000);
        return () => clearInterval(interval);
    }, [pollActive]);

    // ── Load archive page ──────────────────────────────────────
    const loadArchivePage = useCallback(async (page) => {
        setArchiveLoading(true);
        try {
            const res  = await fetch(`/api/livestreams/archive?page=${page}`);
            const data = await res.json();
            setArchive(data.data ?? []);
            setArchiveMeta(data.meta ?? {});
            setArchivePage(page);
        } catch (_) {
        } finally {
            setArchiveLoading(false);
        }
    }, []);

    const totalArchivePages = archiveMeta?.last_page ?? 1;

    return (
        <div className="container py-5">

            {/* ── Active Streams ─────────────────────────────── */}
            <div style={{ marginBottom: '48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--bethel-secondary, #c8a84b)', margin: '0 0 4px' }}>
                            Now Broadcasting
                        </p>
                        <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                            Live Streams
                        </h2>
                    </div>
                    {polling && (
                        <FaCircleNotch size={14} style={{ color: 'var(--text-muted)', animation: 'spin 1s linear infinite', marginLeft: 'auto' }} />
                    )}
                </div>

                {activeStreams.length === 0 ? (
                    <div style={{
                        padding: '48px', textAlign: 'center',
                        border: '2px dashed var(--border-color, #e5e7eb)',
                        borderRadius: '16px', color: 'var(--text-muted)',
                    }}>
                        <FaBroadcastTower size={32} style={{ opacity: 0.3, marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
                        <p style={{ margin: 0, fontWeight: 600 }}>No active streams right now.</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>Check back during scheduled Mass times.</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {activeStreams.map(stream => (
                            <div key={stream.id} className="col-12 col-lg-6">
                                <StreamCard stream={stream} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Archive ────────────────────────────────────── */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <FaBoxArchive size={16} style={{ color: 'var(--text-muted)' }} />
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Past Streams</h3>
                </div>

                {archive.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No archived streams yet.</p>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                            {archive.map(stream => (
                                <ArchiveCard key={stream.id} stream={stream} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalArchivePages > 1 && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                {Array.from({ length: totalArchivePages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => loadArchivePage(page)}
                                        disabled={archiveLoading}
                                        style={{
                                            width: 36, height: 36, borderRadius: '8px',
                                            border: `1.5px solid ${archivePage === page ? '#1a3c5e' : 'var(--border-color, #e5e7eb)'}`,
                                            background: archivePage === page ? '#1a3c5e' : 'transparent',
                                            color: archivePage === page ? '#fff' : 'var(--text-color, #111)',
                                            cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
                @keyframes spin  { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
            `}</style>
        </div>
    );
}