import React from 'react';
import ICON_MAP from '@/config/iconMap';
import { FaArrowRight, FaHandsPraying, FaChurch } from 'react-icons/fa6';

function SacramentCard({ type }) {
    const Icon = ICON_MAP[type.icon]?.Icon ?? ICON_MAP['hands'].Icon;

    return (
        <div className="col-12 col-sm-6 col-lg-4">
            <a
                href={type.href}
                className="text-decoration-none"
                aria-label={type.name}
            >
                <div
                    className="card border-0 shadow-sm h-100 bethel-card"
                    style={{ transition: 'transform 0.18s, box-shadow 0.18s', cursor: 'pointer' }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '';
                    }}
                >
                    <div className="card-body d-flex align-items-center gap-3 p-4">
                        {/* Icon */}
                        <div style={{
                            width: 58, height: 58, borderRadius: 14, flexShrink: 0,
                            background: type.icon_bg, display: 'grid', placeItems: 'center',
                        }}>
                            <Icon size={26} color={type.icon_color} aria-hidden="true" />
                        </div>

                        {/* Text */}
                        <div className="flex-grow-1 min-w-0">
                            <h5 className="mb-1 fw-bold" style={{ fontSize: '1rem', color: 'var(--bethel-primary)' }}>
                                {type.name}
                            </h5>
                            {type.description && (
                                <p className="mb-0 text-muted" style={{ fontSize: '0.8rem', lineHeight: 1.45 }}>
                                    {type.description}
                                </p>
                            )}
                        </div>

                        {/* Arrow */}
                        <FaArrowRight size={14} color={type.icon_color} style={{ flexShrink: 0 }} />
                    </div>
                </div>
            </a>
        </div>
    );
}

export default function SacramentsPage({ sacramentTypes = [] }) {
    return (
        <div>
            {/* ── Hero ── */}
            <section
                style={{
                    background: 'linear-gradient(135deg, var(--bethel-primary) 0%, #1a4a7a 100%)',
                    padding: '4rem 0 3rem',
                    color: '#fff',
                }}
            >
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
                                {sacramentTypes.length} sacrament{sacramentTypes.length !== 1 ? 's' : ''} available
                            </p>
                            <div className="row g-3">
                                {sacramentTypes.map(type => (
                                    <SacramentCard key={type.id} type={type} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Note */}
                    <div
                        className="mt-5 p-4 rounded-3"
                        style={{ background: 'rgba(var(--bethel-primary-rgb, 26,60,94), 0.05)', border: '1px solid rgba(26,60,94,0.1)' }}
                    >
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
        </div>
    );
}