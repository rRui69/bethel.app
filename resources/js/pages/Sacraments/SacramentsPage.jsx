import React, { useState, useRef } from 'react';
import ICON_MAP from '@/config/iconMap';
import { FaHandsPraying, FaChurch, FaFileLines, } from 'react-icons/fa6';
import { LuPhilippinePeso } from "react-icons/lu";
// ── Utility: hex → r,g,b components ─────────────────────────────
function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3
        ? h.split('').map(c => c + c).join('')
        : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// ── Flip Card ─────────────────────────────────────────────────────
function SacramentFlipCard({ type }) {
    const [flipped, setFlipped]   = useState(false);
    const isTouch                 = useRef(false);
    const Icon = ICON_MAP[type.icon]?.Icon ?? ICON_MAP['hands'].Icon;
    const [r, g, b]               = hexToRgb(type.icon_color ?? '#1a3c5e');
    const accentRgb               = `${r},${g},${b}`;

    // Mobile: tap to toggle. Desktop: hover handles it via CSS.
    const handleTouchStart = () => { isTouch.current = true; };
    const handleClick      = () => { if (isTouch.current) setFlipped(f => !f); };
    const handleMouseEnter = () => { if (!isTouch.current) setFlipped(true);  };
    const handleMouseLeave = () => { if (!isTouch.current) setFlipped(false); };

    return (
        <div className="col-6 col-lg-3">
            {/* Perspective wrapper */}
            <div
                style={{ perspective: 1000, aspectRatio: '4/5', cursor: 'pointer' }}
                onTouchStart={handleTouchStart}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Rotating inner */}
                <div style={{
                    position: 'relative', width: '100%', height: '100%',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 380ms cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    borderRadius: 14,
                    boxShadow: `0 4px 20px rgba(${accentRgb},0.22)`,
                }}>
                    {/*  FRONT  */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        borderRadius: 14, overflow: 'hidden',
                        background: `linear-gradient(145deg, ${type.icon_bg} 0%, rgba(${accentRgb},0.18) 100%)`,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        gap: 16, padding: '2rem',
                        border: `1.5px solid rgba(${accentRgb},0.2)`,
                    }}>
                        {/* Icon circle */}
                        <div style={{
                            width: 100, height: 100, borderRadius: '50%',
                            background: `rgba(${accentRgb},0.12)`,
                            border: `2px solid rgba(${accentRgb},0.25)`,
                            display: 'grid', placeItems: 'center',
                            boxShadow: `0 0 24px rgba(${accentRgb},0.18)`,
                        }}>
                            <Icon size={50} color={type.icon_color} />
                        </div>

                        {/* Name */}
                        <div style={{ textAlign: 'center' }}>

                            <h5 style={{
                                fontWeight: 1000, fontSize: '1.5rem', margin: 0,
                                color: type.icon_color,
                                letterSpacing: '0.01em',
                            }}>
                                {type.name}
                            </h5>
                            <p style={{
                                margin: '6px 0 0', fontSize: '0.72rem',
                                color: `rgba(${accentRgb},0.65)`, fontWeight: 500,
                            }}>
                                Tap to see details
                            </p>
                        </div>
                    </div>

                    <div style={{
                        position: 'absolute', inset: 0,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        borderRadius: 14, overflow: 'hidden',
                        background: `color-mix(in srgb, ${type.icon_bg} 40%, #fff)`,
                        display: 'flex', flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '1rem',
                    }}>
                        {/* Spinning accent border */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            pointerEvents: 'none', overflow: 'hidden', borderRadius: 14,
                        }}>
                            <div style={{
                                position: 'absolute',
                                width: '100%', height: '220%',
                                background: `linear-gradient(90deg, transparent, rgb(${accentRgb}), rgb(${accentRgb}), transparent)`,
                                animation: 'sacrament-spin 3s linear infinite',// SPIN SPEED: lower = faster (e.g. 2s = very fast, 8s = slow)
                            }} />
                            <div style={{
                                position: 'absolute',
                                inset: '0.2rem',
                                background: `color-mix(in srgb, ${type.icon_bg} 40%, #fff)`, borderRadius: 13,
                            }} />
                        </div>

                        <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

                            {/* Header row — icon + name */}
                            <div style={{
                                display: 'flex', alignItems: 'center',
                                gap: 10,
                                marginBottom: 20,
                                marginTop: 20,
                                marginLeft: 20,
                                marginRight: 20,
                            }}>
                                <div style={{
                                    // HEADER ICON BOX SIZE: width/height of the small icon container
                                    width: 50, height: 50,
                                    borderRadius: 9, flexShrink: 0,
                                    background: `rgba(${accentRgb},0.15)`,
                                    display: 'grid', placeItems: 'center',
                                }}>
                                    {/* HEADER ICON SIZE: the icon inside the box */}
                                    <Icon size={30} color={type.icon_color} />
                                </div>
                                <span style={{
                                    fontWeight: 800,
                                    fontSize: '1.6rem',
                                    lineHeight: 1.1,
                                    color: type.icon_color,
                                }}>
                                    {type.name}
                                </span>
                            </div>

                            {/* Description text */}
                            {type.description && (
                                <p style={{
                                    fontSize: '0.9rem',    // DESCRIPTION FONT SIZE
                                    color: `rgba(${accentRgb},0.8)`,
                                    lineHeight: 1.55,       // DESCRIPTION LINE HEIGHT: 1.4 = tight, 1.7 = airy
                                    margin: '0 0 10px', flexShrink: 0,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,     // DESCRIPTION MAX LINES: increase to show more text
                                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                    marginLeft:15, marginRight: 10,
                                }}>
                                    {type.description}
                                </p>
                            )}

                            {/* Base price row */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                marginBottom: 8,
                            }}>
                                {/* PRICE ICON SIZE */}
                                <LuPhilippinePeso size={20} color={type.icon_color} />
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 700, color: `rgb(${accentRgb})`,
                                }}>
                                    {type.min_price > 0
                                        ? `Base fee: ₱${type.min_price.toLocaleString()}`
                                        : 'No minimum fee'}
                                </span>
                            </div>

                            {/* Document requirements — only shown if sacrament type has file fields */}
                            {type.doc_fields?.length > 0 && (
                                <div style={{ marginBottom: 8 }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: 5,
                                        marginBottom: 5,
                                        marginTop: 10,
                                    }}>
                                        {/* DOCS LABEL ICON SIZE */}
                                        <FaFileLines size={20} color={`rgba(${accentRgb},0.6)`} />
                                        <span style={{
                                            marginTop: 5,
                                            fontSize: '0.68rem',
                                            color: `rgba(${accentRgb},0.65)`,
                                            fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                                        }}>
                                            Documents Required
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {type.doc_fields.slice(0, 3).map((label, i) => (
                                            <div key={i} style={{
                                                fontSize: '0.9rem',     // DOCUMENT ITEM FONT SIZE
                                                color: `rgba(${accentRgb},0.85)`,
                                                display: 'flex', alignItems: 'center', gap: 6,
                                            }}>
                                                <span style={{ width: 5, height: 5, borderRadius: '50%',
                                                               background: `rgb(${accentRgb})`, flexShrink: 0 }} />
                                                {label}
                                            </div>
                                        ))}
                                        {type.doc_fields.length > 3 && (
                                            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>
                                                +{type.doc_fields.length - 3} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Book Now button */}
                            <a
                                href={type.href}
                                onClick={e => e.stopPropagation()}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: 6,
                                    // ↓ BUTTON PADDING: top/bottom height of the Book Now button
                                    padding: '10px 0',
                                    borderRadius: 9, marginTop: 'auto',
                                    background: `rgb(${accentRgb})`, color: '#fff',
                                    fontWeight: 700,
                                    // ↓ BUTTON FONT SIZE
                                    fontSize: '0.85rem',
                                    textDecoration: 'none', border: 'none',
                                    transition: 'opacity 0.15s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                Book Now →
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function SacramentsPage({ sacramentTypes = [] }) {
    return (
        <div>
            {/* ── Hero ── */}
            <section style={{
                background: 'linear-gradient(135deg, var(--bethel-primary) 0%, #1a4a7a 100%)',
                padding: '4rem 0 3rem', color: '#fff',
            }}>
                <div className="container text-center">
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        display: 'grid', placeItems: 'center', margin: '0 auto 1rem',
                    }}>
                        <FaHandsPraying size={28} color="#fff" />
                    </div>
                    <h1 className="fw-bold mb-2" style={{ fontSize: '2rem' }}>Sacramental Services</h1>
                    <p style={{ fontSize: '1rem', opacity: 0.85, maxWidth: 520, margin: '0 auto' }}>
                        Select a sacrament below to begin your appointment request with your parish.
                    </p>
                </div>
            </section>

            {/* ── Cards grid ── */}
            <section className="py-5">
                <div className="container">
                    {sacramentTypes.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FaChurch size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
                            <p>No sacrament types are currently available.</p>
                        </div>
                    ) : (
                        <>
                            <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>
                                Hover or tap a card to see details
                            </p>
                            <div className="row g-4">
                                {sacramentTypes.map(type => (
                                    <SacramentFlipCard key={type.id} type={type} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* How it works note */}
                    <div className="mt-5 p-4 rounded-3" style={{
                        background: 'rgba(26,60,94,0.05)',
                        border: '1px solid rgba(26,60,94,0.1)',
                    }}>
                        <div className="d-flex gap-3 align-items-start">
                            <FaChurch size={18} style={{ color: 'var(--bethel-primary)', flexShrink: 0, marginTop: 2 }} />
                            <div>
                                <p className="fw-semibold mb-1" style={{ fontSize: '0.9rem', color: 'var(--bethel-primary)' }}>
                                    How it works
                                </p>
                                <p className="mb-0 text-muted" style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                                    Select a sacrament, fill out the form, and submit your request.
                                    Parish staff will review your submission and confirm your appointment.
                                    You must be logged in to submit a request.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Spin keyframe for the back card border */}
            <style>{`
                @keyframes sacrament-spin {
                    from { transform: rotateZ(0deg); }
                    to   { transform: rotateZ(360deg); }
                }
            `}</style>
        </div>
    );
}
