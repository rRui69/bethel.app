import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FaVideo, FaMicrophone, FaMicrophoneSlash, FaVideoSlash, FaStop, FaCircleNotch } from 'react-icons/fa6';

export default function AgoraBroadcaster({ channel, onStreamEnded }) {
    const [phase,     setPhase]     = useState('idle');   // idle | loading | live | error
    const [errorMsg,  setErrorMsg]  = useState('');
    const [micOn,     setMicOn]     = useState(true);
    const [camOn,     setCamOn]     = useState(true);

    const clientRef   = useRef(null);
    const micTrackRef = useRef(null);
    const camTrackRef = useRef(null);

    // Load Agora SDK
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

    // Start broadcast
    async function startBroadcast() {
        setPhase('loading');
        setErrorMsg('');

        try {
            const AgoraRTC = await loadAgora();
            

            // Fetch publisher token from admin API
            const res = await fetch('/admin/api/livestreams/publisher-token', {
                method:  'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content ?? '',
                },
                body: JSON.stringify({ channel }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.message ?? 'Failed to get broadcast token.');
            }

          
            const data = await res.json();
            console.log("FULL BACKEND RESPONSE:", data);
            const { token, app_id } = data;
            console.log("EXTRACTED APP ID:", app_id);
            console.log("APP ID LENGTH:", app_id ? app_id.length : 'Missing!');

            const client = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
            clientRef.current = client;
            client.setClientRole('host');

            await client.join(app_id, channel, token, null);

            // Request mic + camera
            const [micTrack, camTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
                {},             // microphone config
                { encoderConfig: '720p_2' } // camera resolution
            );

            micTrackRef.current = micTrack;
            camTrackRef.current = camTrack;

            // Play local preview
            camTrack.play('agora-local-preview');

            // Publish both tracks to the channel
            await client.publish([micTrack, camTrack]);

            setPhase('live');

        } catch (err) {
            setPhase('error');
            setErrorMsg(err?.message ?? 'Could not start broadcast. Check camera permissions.');
            cleanup();
        }
    }

    // Stop broadcast
    async function stopBroadcast() {
        if (!confirm('End this livestream? Viewers will be disconnected.')) return;
        cleanup();
        setPhase('idle');
        if (onStreamEnded) onStreamEnded();
    }

    // Toggle mic
    async function toggleMic() {
        if (!micTrackRef.current) return;
        await micTrackRef.current.setEnabled(!micOn);
        setMicOn(v => !v);
    }

    // Toggle camera
    async function toggleCam() {
        if (!camTrackRef.current) return;
        await camTrackRef.current.setEnabled(!camOn);
        setCamOn(v => !v);
    }

    // Cleanup 
    function cleanup() {
        try { micTrackRef.current?.stop(); micTrackRef.current?.close(); } catch (_) {}
        try { camTrackRef.current?.stop(); camTrackRef.current?.close(); } catch (_) {}
        micTrackRef.current = null;
        camTrackRef.current = null;
        clientRef.current?.leave().catch(() => {});
        clientRef.current?.removeAllListeners();
        clientRef.current = null;
    }

    // Cleanup on unmount
    useEffect(() => () => cleanup(), []);

    // Render 
    return (
        <div style={{ width: '100%' }}>

            {/* Local camera preview */}
            <div style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%',
                background: '#0a0a0a',
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '12px',
                display: phase === 'live' ? 'block' : 'none',
            }}>
                <div
                    id="agora-local-preview"
                    style={{ position: 'absolute', inset: 0 }}
                />
                {/* LIVE badge */}
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
                        background: '#fff', animation: 'pulse 1.5s infinite',
                    }} />
                    BROADCASTING
                </div>
                {/* Muted cam overlay */}
                {!camOn && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: '#111',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', flexDirection: 'column', gap: 8,
                    }}>
                        <FaVideoSlash size={28} style={{ opacity: 0.5 }} />
                        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Camera off</span>
                    </div>
                )}
            </div>

            {/* Idle / Loading / Error state */}
            {phase !== 'live' && (
                <div style={{
                    width: '100%', paddingTop: phase === 'idle' ? 0 : '30%',
                    position: phase === 'idle' ? 'static' : 'relative',
                    background: phase === 'idle' ? 'transparent' : '#111',
                    borderRadius: '10px', marginBottom: phase === 'idle' ? 0 : '12px',
                    overflow: 'hidden',
                }}>
                    {phase === 'loading' && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', flexDirection: 'column', gap: 10,
                        }}>
                            <FaCircleNotch size={24} style={{ animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Starting broadcast…</span>
                        </div>
                    )}
                    {phase === 'error' && (
                        <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: '8px 0' }}>{errorMsg}</p>
                    )}
                </div>
            )}

            {/* Controls */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {phase === 'idle' || phase === 'error' ? (
                    <button
                        onClick={startBroadcast}
                        style={{
                            flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none',
                            background: '#ef4444', color: '#fff', cursor: 'pointer',
                            fontWeight: 700, fontSize: '0.85rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                        }}
                    >
                        <FaVideo size={14} /> Start Camera Broadcast
                    </button>
                ) : phase === 'live' ? (
                    <>
                        {/* Mic toggle */}
                        <button
                            onClick={toggleMic}
                            title={micOn ? 'Mute microphone' : 'Unmute microphone'}
                            style={{
                                padding: '10px 14px', borderRadius: '8px', border: 'none',
                                background: micOn ? 'rgba(26,60,94,0.1)' : 'rgba(239,68,68,0.1)',
                                color: micOn ? '#1a3c5e' : '#ef4444',
                                cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
                                display: 'flex', alignItems: 'center', gap: '6px',
                            }}
                        >
                            {micOn ? <FaMicrophone size={13} /> : <FaMicrophoneSlash size={13} />}
                            {micOn ? 'Mute' : 'Unmute'}
                        </button>

                        {/* Camera toggle */}
                        <button
                            onClick={toggleCam}
                            title={camOn ? 'Turn off camera' : 'Turn on camera'}
                            style={{
                                padding: '10px 14px', borderRadius: '8px', border: 'none',
                                background: camOn ? 'rgba(26,60,94,0.1)' : 'rgba(239,68,68,0.1)',
                                color: camOn ? '#1a3c5e' : '#ef4444',
                                cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
                                display: 'flex', alignItems: 'center', gap: '6px',
                            }}
                        >
                            {camOn ? <FaVideo size={13} /> : <FaVideoSlash size={13} />}
                            {camOn ? 'Cam Off' : 'Cam On'}
                        </button>

                        {/* End stream */}
                        <button
                            onClick={stopBroadcast}
                            style={{
                                flex: 1, padding: '10px 16px', borderRadius: '8px', border: 'none',
                                background: '#1a3c5e', color: '#fff', cursor: 'pointer',
                                fontWeight: 700, fontSize: '0.85rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                            }}
                        >
                            <FaStop size={13} /> End Broadcast
                        </button>
                    </>
                ) : null}
            </div>

            <style>{`
                @keyframes spin  { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
            `}</style>
        </div>
    );
}