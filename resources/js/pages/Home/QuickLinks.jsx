import React, { useState, useEffect } from 'react';
import ICON_MAP from '@/config/iconMap';
import { FaArrowRight } from 'react-icons/fa6';

/**
 * QuickLinks
 * Fetches active sacrament types from the DB.
 * Shows all as cards on the homepage.
 */
export default function QuickLinks() {
    const [sacraments, setSacraments] = useState([]);
    const [loading,    setLoading]    = useState(true);

    useEffect(() => {
        fetch('/api/sacrament-types')
            .then(r => r.json())
            .then(json => setSacraments(json.data ?? []))
            .catch(() => setSacraments([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="py-5 Quicklinks" aria-labelledby="sacraments-heading">
            <div className="container">

                <div className="row mb-4 text-center">
                    <div className="col">
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--bethel-secondary)' }}>
                            Sacramental Services
                        </p>
                        <h2 id="sacraments-heading" className="bethel-section-title">
                            Book a Sacrament
                        </h2>
                        <div className="bethel-section-divider mx-auto"></div>
                        <p className="text-muted" style={{ fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto' }}>
                            Select a sacrament to find an available parish and schedule your appointment.
                        </p>
                    </div>
                </div>

                {/* Loading skeleton */}
                {loading && (
                    <div className="row g-3 justify-content-center">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="col-6 col-sm-4 col-md-3 col-lg-2">
                                <div className="card bethel-card border-0 shadow-sm h-100 text-center py-4 px-2"
                                     style={{ opacity: 0.45 }}>
                                    <div className="bethel-quick-link__icon mx-auto mb-3"
                                         style={{ background: '#e5e7eb' }} />
                                    <div style={{ height: 12, background: '#e5e7eb', borderRadius: 4, width: '70%', margin: '0 auto' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Cards */}
                {!loading && sacraments.length > 0 && (
                    <div className="row g-3 justify-content-center">
                        {sacraments.map(({ id, icon, icon_color, icon_bg, name, description, href }) => {
                            const Icon = ICON_MAP[icon]?.Icon ?? ICON_MAP['hands'].Icon;
                            return (
                                <div key={id} className="col-6 col-sm-4 col-md-3 col-lg-2">
                                    <a href={href} className="text-decoration-none d-block h-100"
                                       aria-label={`${name}${description ? ' — ' + description : ''}`}>
                                        <div className="card bethel-card bethel-quick-link border-0 shadow-sm h-100 text-center py-4 px-2">
                                            <div className="bethel-quick-link__icon mx-auto mb-3"
                                                 style={{ background: icon_bg, color: icon_color }}>
                                                <Icon size={26} aria-hidden="true" />
                                            </div>
                                            <p className="mb-0 fw-semibold text-dark" style={{ fontSize: '0.82rem' }}>
                                                {name}
                                            </p>
                                        </div>
                                    </a>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty state */}
                {!loading && sacraments.length === 0 && (
                    <div className="text-center py-4 text-muted" style={{ fontSize: '0.875rem' }}>
                        No sacraments available at this time.
                    </div>
                )}

                <div className="text-center mt-4">
                    <a href="/sacraments"
                       className="btn btn-sm rounded-pill px-4 fw-semibold d-inline-flex align-items-center gap-2"
                       style={{ background: 'var(--bethel-primary)', color: '#fff' }}>
                        View All Sacraments
                        <FaArrowRight size={12} />
                    </a>
                </div>

            </div>
        </section>
    );
}