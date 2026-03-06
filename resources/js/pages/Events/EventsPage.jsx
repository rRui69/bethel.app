import React, { useState, useMemo } from 'react';
import {
    FaCalendarDays, FaMagnifyingGlass, FaClock, FaLocationDot,
    FaChurch, FaUsers, FaBookOpen, FaPeopleLine, FaArrowRight,
} from 'react-icons/fa6';

const TYPE_COLORS = { 'Community': 'success', 'Liturgy': 'warning', 'Youth': 'info' };
const TYPE_ICONS  = {
    'Community': FaUsers,
    'Liturgy':   FaBookOpen,
    'Youth':     FaPeopleLine,
};

function EventCard({ e }) {
    const Icon  = TYPE_ICONS[e.type] ?? FaCalendarDays;
    const color = TYPE_COLORS[e.type] ?? 'secondary';

    return (
        <a
            href={`/events/${e.id}`}
            className="card h-100 shadow-sm text-decoration-none"
            style={{ cursor: 'pointer', transition: 'transform 0.15s', color: 'inherit' }}
            onMouseEnter={ev => ev.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={ev => ev.currentTarget.style.transform = 'translateY(0)'}
        >
            <div className="card-body d-flex gap-3">
                <div
                    className={`d-flex flex-column align-items-center justify-content-center rounded-2 p-2 bg-${color} text-white flex-shrink-0`}
                    style={{ width: 56, minHeight: 60 }}
                >
                    <div style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {e.month}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>
                        {e.day_num}
                    </div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.85 }}>{e.day}</div>
                </div>
                <div className="flex-grow-1 min-w-0">
                    <div className="d-flex align-items-center gap-2 mb-1">
                        <span className={`badge bg-${color}-subtle text-${color} border`}>
                            <Icon size={10} className="me-1" />{e.type}
                        </span>
                    </div>
                    <h6 className="fw-semibold mb-1"
                        style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.title}
                    </h6>
                    <div className="text-muted small">
                        {e.time && (
                            <div><FaClock size={10} className="me-1" />
                                {e.time}{e.end_time ? ` - ${e.end_time}` : ''}
                            </div>
                        )}
                        {e.location && (
                            <div><FaLocationDot size={10} className="me-1" />{e.location}</div>
                        )}
                        {e.parish && (
                            <div><FaChurch size={10} className="me-1" />{e.parish}</div>
                        )}
                    </div>
                    <div className={`mt-2 text-${color} small fw-semibold d-flex align-items-center gap-1`}>
                        View details <FaArrowRight size={10} />
                    </div>
                </div>
            </div>
        </a>
    );
}

export default function EventsPage({ events = [], types = [] }) {
    const [search, setSearch] = useState('');
    const [typeF,  setTypeF]  = useState('All');

    const filtered = useMemo(() => {
        return events.filter(e => {
            const matchType   = typeF === 'All' || e.type === typeF;
            const term        = search.toLowerCase();
            const matchSearch = !term ||
                e.title.toLowerCase().includes(term) ||
                (e.location ?? '').toLowerCase().includes(term) ||
                (e.parish   ?? '').toLowerCase().includes(term);
            return matchType && matchSearch;
        });
    }, [events, search, typeF]);

    return (
        <>
            <section className="py-5 bg-success text-white">
                <div className="container">
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <FaCalendarDays size={32} />
                        <h1 className="fw-bold mb-0">Upcoming Events</h1>
                    </div>
                    <p className="mb-0 opacity-75 lead">
                        Community gatherings, liturgical celebrations, and youth activities across the diocese.
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
                                    placeholder="Search events..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="col-12 col-md-7">
                            <div className="d-flex flex-wrap gap-2">
                                {types.map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        className={`btn btn-sm ${typeF === t ? 'btn-success' : 'btn-outline-secondary'}`}
                                        onClick={() => setTypeF(t)}
                                    >
                                        {t}
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
                        <strong>{filtered.length}</strong> upcoming event{filtered.length !== 1 ? 's' : ''}
                        {typeF !== 'All' ? ` · ${typeF}` : ''}
                    </div>
                    {filtered.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FaCalendarDays size={48} className="d-block mx-auto mb-3 opacity-25" />
                            <h5>No events found</h5>
                            <p>Check back soon for upcoming parish activities.</p>
                        </div>
                    ) : (
                        <div className="row g-3">
                            {filtered.map(e => (
                                <div key={e.id} className="col-12 col-md-6 col-lg-4">
                                    <EventCard e={e} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}