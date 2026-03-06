import React, { useState, useMemo } from 'react';
import { FaBullhorn, FaMagnifyingGlass, FaCalendar, FaChurch, FaArrowRight } from 'react-icons/fa6';

const CATEGORY_COLORS = {
    'Parish News': 'primary',
    'Community':   'success',
    'Liturgy':     'warning',
    'Youth':       'info',
    'General':     'secondary',
};

function AnnouncementCard({ a }) {
    const color = CATEGORY_COLORS[a.category] ?? 'secondary';
    return (
        <a
            href={`/announcements/${a.id}`}
            className="card h-100 shadow-sm text-decoration-none announcement-card"
            style={{
                cursor: 'pointer',
                transition: 'transform 0.15s',
                borderTop: `3px solid var(--bs-${color})`,
                color: 'inherit',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className={`badge bg-${color}`}>{a.category}</span>
                    <span className="text-muted small">{a.date}</span>
                </div>
                <h5 className="card-title fw-semibold mb-2" style={{ lineHeight: 1.3 }}>{a.title}</h5>
                <p className="card-text text-muted small flex-grow-1"
                    style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {a.excerpt || a.body}
                </p>
                <div className="mt-2 d-flex align-items-center justify-content-between">
                    <div className="text-muted small">
                        <FaChurch size={11} className="me-1" />{a.parish}
                    </div>
                    <div className={`text-${color} small fw-semibold d-flex align-items-center gap-1`}>
                        Read more <FaArrowRight size={10} />
                    </div>
                </div>
            </div>
        </a>
    );
}

export default function AnnouncementsPage({ announcements = [], categories = [] }) {
    const [search,   setSearch]   = useState('');
    const [category, setCategory] = useState('All');

    const filtered = useMemo(() => {
        return announcements.filter(a => {
            const matchCat    = category === 'All' || a.category === category;
            const term        = search.toLowerCase();
            const matchSearch = !term ||
                a.title.toLowerCase().includes(term) ||
                (a.excerpt ?? '').toLowerCase().includes(term) ||
                (a.parish  ?? '').toLowerCase().includes(term);
            return matchCat && matchSearch;
        });
    }, [announcements, search, category]);

    return (
        <>
            <section className="py-5 bg-primary text-white">
                <div className="container">
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <FaBullhorn size={32} />
                        <h1 className="fw-bold mb-0">Parish Announcements</h1>
                    </div>
                    <p className="mb-0 opacity-75 lead">
                        Stay informed with the latest news and updates from your diocese.
                    </p>
                </div>
            </section>

            <section className="py-3 border-bottom sticky-top bg-white shadow-sm" style={{ zIndex: 100 }}>
                <div className="container">
                    <div className="row g-2 align-items-center">
                        <div className="col-12 col-md-5">
                            <div className="input-group">
                                <span className="input-group-text bg-white"><FaMagnifyingGlass size={14} /></span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Search announcements..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-12 col-md-7">
                            <div className="d-flex flex-wrap gap-2">
                                {categories.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-outline-secondary'}`}
                                        onClick={() => setCategory(c)}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-5">
                <div className="container">
                    <div className="text-muted small mb-3">
                        Showing <strong>{filtered.length}</strong> announcement{filtered.length !== 1 ? 's' : ''}
                        {category !== 'All' ? ` in ${category}` : ''}
                        {search ? ` matching "${search}"` : ''}
                    </div>
                    {filtered.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FaBullhorn size={48} className="d-block mx-auto mb-3 opacity-25" />
                            <h5>No announcements found</h5>
                            <p>Try adjusting your search or category filter.</p>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {filtered.map(a => (
                                <div key={a.id} className="col-12 col-md-6 col-lg-4">
                                    <AnnouncementCard a={a} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}