import React, { useState } from 'react';
// React Icons
import { FaNewspaper, FaBullhorn, FaArrowRight, FaCalendar, FaChurch } from 'react-icons/fa6';

const PLACEHOLDER_IMG = 'https://placehold.co/600x400/1a3c5e/ffffff?text=BethelApp';
const TABS = ['All', 'Parish News', 'Community', 'Liturgy'];

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });
}

function FeaturedCard({ item }) {
    if (!item) {
        return (
            <div className="card border-0 shadow-sm h-100 bethel-card d-flex align-items-center justify-content-center py-5">
                <div className="text-center text-muted">
                    <FaNewspaper size={40} className="d-block mb-2 mx-auto" style={{ opacity: 0.3, color: 'var(--bethel-primary)' }} />
                    <p>No announcements yet</p>
                </div>
            </div>
        );
    }
    return (
        <article className="card border-0 shadow-sm bethel-card overflow-hidden h-100">
            <div
                style={{
                    height: '240px',
                    backgroundImage: `url(${item.image || PLACEHOLDER_IMG})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
                role="img"
                aria-label={item.title}
            >
                <div style={{ height: '100%', background: 'linear-gradient(to top, rgba(15,39,68,0.7) 0%, transparent 60%)' }} />
            </div>
            <div className="card-body p-4 d-flex flex-column">
                <span className="badge-category mb-2 d-inline-block" style={{ width: 'fit-content' }}>
                    {item.category || 'General'}
                </span>
                <h4 className="card-title fw-bold lh-sm mb-2" style={{ color: 'var(--bethel-primary)', fontSize: '1.15rem' }}>
                    {item.title}
                </h4>
                <p className="card-text text-muted flex-grow-1" style={{ fontSize: '0.875rem' }}>
                    {item.excerpt}
                </p>
                <div className="d-flex align-items-center justify-content-between mt-3 pt-3"
                     style={{ borderTop: '1px solid #eef2f7' }}>
                    <div className="d-flex align-items-center gap-2">
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bethel-primary)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            {/* ── ICON: parish badge icon ── */}
                            <FaChurch size={12} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--bethel-primary)' }}>{item.parish || 'BethelApp'}</div>
                            <div style={{ fontSize: '0.7rem', color: '#999' }}>{formatDate(item.date)}</div>
                        </div>
                    </div>
                    <a href={`/announcements/${item.id}`}
                       className="btn btn-sm fw-semibold d-inline-flex align-items-center gap-1"
                       style={{ background: 'var(--bethel-primary)', color: '#fff', borderRadius: '50px', padding: '0.3rem 1rem', fontSize: '0.8rem' }}>
                        Read More <FaArrowRight size={10} />
                    </a>
                </div>
            </div>
        </article>
    );
}

function SmallCard({ item }) {
    return (
        <article className="card border-0 shadow-sm bethel-card overflow-hidden">
            <div className="row g-0">
                <div className="col-4">
                    <div style={{
                        backgroundImage: `url(${item.image || PLACEHOLDER_IMG})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: '110px',
                        height: '100%',
                    }} />
                </div>
                <div className="col-8">
                    <div className="card-body p-3">
                        <span className="badge-category d-inline-block mb-1" style={{ fontSize: '0.65rem' }}>
                            {item.category || 'General'}
                        </span>
                        <h6 className="card-title mb-1 lh-sm fw-bold" style={{ fontSize: '0.85rem', color: 'var(--bethel-primary)' }}>
                            {item.title}
                        </h6>
                        <small className="text-muted d-flex align-items-center gap-1 mb-2" style={{ fontSize: '0.72rem' }}>
                            {/* ── ICON: date icon ── */}
                            <FaCalendar size={10} />
                            {formatDate(item.date)}
                        </small>
                        <a href={`/announcements/${item.id}`}
                           className="btn btn-sm d-inline-flex align-items-center gap-1 py-0 px-3"
                           style={{ background: 'var(--bethel-primary)', color: '#fff', borderRadius: '50px', fontSize: '0.72rem' }}>
                            Read <FaArrowRight size={9} />
                        </a>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function AnnouncementCards({ announcements = [] }) {
    const [activeTab, setActiveTab] = useState('All');

    const filtered = activeTab === 'All'
        ? announcements
        : announcements.filter(a => a.category === activeTab);

    const [featured, ...rest] = filtered;
    const secondary = rest.slice(0, 3);

    return (
        <section className="py-5 bg-bethel-light" aria-labelledby="announcements-heading">
            <div className="container">

                <div className="row mb-4 align-items-end">
                    <div className="col">
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--bethel-secondary)' }}>
                            Latest News
                        </p>
                        <h2 id="announcements-heading" className="bethel-section-title mb-0">Announcements</h2>
                        <div className="bethel-section-divider"></div>
                    </div>
                    <div className="col-auto">
                        <a href="/announcements"
                           className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-inline-flex align-items-center gap-1">
                            View All <FaArrowRight size={10} />
                        </a>
                    </div>
                </div>

                {/* Tab Filter */}
                <div className="d-flex gap-2 flex-wrap mb-4">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`bethel-schedule-pill ${activeTab === tab ? 'active' : ''}`}
                            aria-pressed={activeTab === tab}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="row g-4">
                    <div className="col-lg-6">
                        <FeaturedCard item={featured} />
                    </div>
                    <div className="col-lg-6">
                        <div className="d-flex flex-column gap-3 h-100">
                            {secondary.length > 0
                                ? secondary.map((item, i) => <SmallCard key={item.id ?? i} item={item} />)
                                : (
                                    <div className="text-center text-muted py-5">
                                        <FaBullhorn size={40} className="d-block mb-2 mx-auto" style={{ opacity: 0.25, color: 'var(--bethel-primary)' }} />
                                        <p style={{ fontSize: '0.875rem' }}>No other announcements in this category.</p>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}