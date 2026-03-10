import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FaCircleNotch, FaVideoSlash } from 'react-icons/fa6';

export default function AgoraViewer({ channel }) {
    const [status,      setStatus]      = useState('connecting'); // connecting | watching | offline | error
    const [errorMsg,    setErrorMsg]    = useState('');
    const clientRef     = useRef(null);
    const tracksRef     = useRef([]);

    // Load Agora SDK dynamically 
    // This avoids bundling the large Agora SDK into the main JS bundle.
    const loadAgora = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (window.AgoraRTC) { resolve(window.AgoraRTC); return; }
            const script  = document.createElement('script');
            script.src    = 'https://download.agora.io/sdk/release/AgoraRTC_N-4.21.0.js';
            script.onload = () => resolve(window.AgoraRTC);
            script.onerror = () => reject(new Error('Failed to load Agora SDK'));
            document.head.appendChild(script);
        });
    }, []);

    useEffect(() => {
        if (!channel) return;
        let cancelled = false;

        async function join() {
            try {
                const AgoraRTC = await loadAgora();
                if (cancelled) return;

                // Fetch subscriber token from our public API
                const res = await fetch('/api/livestreams/subscriber-token', {
                    method:  'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                    },
                    body: JSON.stringify({ channel }),
                });

                if (!res.ok) {
                    setStatus('offline');
                    return;
                }

                const { token, app_id } = await res.json();
                if (cancelled) return;

                const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
                clientRef.current = client;
                client.setClientRole('audience');

                // Listen for remote tracks published by the broadcaster
                client.on('user-published', async (user, mediaType) => {
                    await client.subscribe(user, mediaType);
                    if (mediaType === 'video') {
                        setStatus('watching');
                        // Small delay ensures DOM element is rendered
                        setTimeout(() => {
                            user.videoTrack?.play(`agora-remote-video-${channel}`);
                        }, 100);
                        tracksRef.current.push(user.videoTrack);
                    }
                    if (mediaType === 'audio') {
                        user.audioTrack?.play();
                        tracksRef.current.push(user.audioTrack);
                    }
                });

                client.on('user-unpublished', () => {
                    setStatus('offline');
                });

                client.on('connection-state-change', (state) => {
                    if (state === 'DISCONNECTED') setStatus('offline');
                });

                await client.join(app_id, channel, token, null);

            } catch (err) {
                if (!cancelled) {
                    setStatus('error');
                    setErrorMsg(err?.message ?? 'Could not connect to stream.');
                }
            }
        }

        join();

        return () => {
            cancelled = true;
            tracksRef.current.forEach(t => { try { t?.stop(); } catch (_) {} });
            tracksRef.current = [];
            clientRef.current?.leave().catch(() => {});
            clientRef.current?.removeAllListeners();
            clientRef.current = null;
        };
    }, [channel, loadAgora]);

    return (
        <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#0a0a0a', borderRadius: '10px', overflow: 'hidden' }}>

            {/* Video container — Agora plays into this div by ID */}
            <div
                id={`agora-remote-video-${channel}`}
                style={{
                    position: 'absolute', inset: 0,
                    display: status === 'watching' ? 'block' : 'none',
                }}
            />

            {/* Overlay states */}
            {status !== 'watching' && (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    color: '#fff', gap: '12px',
                }}>
                    {status === 'connecting' && (
                        <>
                            <FaCircleNotch size={28} style={{ animation: 'spin 1s linear infinite' }} />
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.7 }}>Connecting to stream…</p>
                        </>
                    )}
                    {status === 'offline' && (
                        <>
                            <FaVideoSlash size={28} style={{ opacity: 0.5 }} />
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.6 }}>
                                Stream has ended or the broadcaster is not live yet.
                            </p>
                        </>
                    )}
                    {status === 'error' && (
                        <>
                            <FaVideoSlash size={28} style={{ opacity: 0.5 }} />
                            <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.6 }}>{errorMsg}</p>
                        </>
                    )}
                </div>
            )}

            {/* Live indicator badge when watching */}
            {status === 'watching' && (
                <div style={{
                    position: 'absolute', top: 12, left: 12,
                    background: '#ef4444', color: '#fff',
                    padding: '3px 10px', borderRadius: '20px',
                    fontSize: '0.7rem', fontWeight: 700,
                    letterSpacing: '0.05em',
                    display: 'flex', alignItems: 'center', gap: '5px',
                    boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                }}>
                    <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#fff',
                        animation: 'pulse 1.5s infinite',
                    }} />
                    LIVE
                </div>
            )}

            <style>{`
                @keyframes spin  { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
            `}</style>
        </div>
    );
}