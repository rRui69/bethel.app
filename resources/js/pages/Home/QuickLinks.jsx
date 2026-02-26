import React from 'react';
import SACRAMENTS from '@/config/sacraments';
import { FaArrowRight } from 'react-icons/fa6';

export default function QuickLinks() {
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

                <div className="row g-3 justify-content-center">
                    {SACRAMENTS.map(({ id, Icon, label, color, bg, href, desc }) => (
                        <div key={id} className="col-6 col-sm-4 col-md-3 col-lg-2">
                            <a href={href} className="text-decoration-none d-block h-100" aria-label={`${label} — ${desc}`}>
                                <div className="card bethel-card bethel-quick-link border-0 shadow-sm h-100 text-center py-4 px-2">

                                    {/*─────────────────────────────────────────────────
                                        TO SWAP ALL ICONS: edit config/sacraments.js only.
                                        TO USE YOUR OWN PNG/SVG for a specific sacrament:
                                        Add imgSrc: '/images/icons/baptism.png' to
                                        entry in sacraments.js, then here use:
                                        <img src={imgSrc} alt={label} width={28} height={28} />
                                    ──────────────────────────────────────────────────── */}
                                    <div
                                        className="bethel-quick-link__icon mx-auto mb-3"
                                        style={{ background: bg, color }}
                                    >
                                        <Icon size={26} aria-hidden="true" />
                                    </div>

                                    <p className="mb-0 fw-semibold text-dark" style={{ fontSize: '0.82rem' }}>
                                        {label}
                                    </p>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>

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