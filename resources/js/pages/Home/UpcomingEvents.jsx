import React from 'react';
// ── React Icons ────────────────────────────────────────────────────────────
import { FaClock, FaLocationDot, FaChurch, FaCalendarPlus, FaArrowRight } from 'react-icons/fa6';

const EVENT_COLORS = {
    'Liturgy':      { badge: '#dbeafe', text: '#1e40af' },
    'Community':    { badge: '#d1fae5', text: '#065f46' },
    'Youth':        { badge: '#fef3c7', text: '#78350f' },
    'Sacramental':  { badge: '#ede9fe', text: '#4a1d96' },
    'Default':      { badge: '#f3f4f6', text: '#374151' },
};

function EventCard({ event }) {
    const date  = new Date(event.date);
    const day   = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const { badge, text } = EVENT_COLORS[event.type] ?? EVENT_COLORS['Default'];

    return (
        <article className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm bethel-card h-100">
                <div className="card-body p-4">
                    <div className="d-flex gap-3">

                        {/* Date block */}
                        <div className="bethel-event-date text-center" aria-label={`${month} ${day}`}>
                            <span className="bethel-event-date__month">{month}</span>
                            <span className="bethel-event-date__day">{day}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-grow-1">
                            <span className="d-inline-block mb-1 fw-semibold rounded-pill px-2"
                                  style={{ background: badge, color: text, fontSize: '0.7rem' }}>
                                {event.type || 'Event'}
                            </span>
                            <h6 className="card-title mb-2 fw-bold lh-sm" style={{ color: 'var(--bethel-primary)' }}>
                                {event.title}
                            </h6>

                            {/* ── Meta info rows — swap icons freely below ── */}
                            <div className="d-flex flex-column gap-1" style={{ fontSize: '0.775rem', color: '#888' }}>
                                <span className="d-flex align-items-center gap-1">
                                    {/* ── ICON: time ── */}
                                    <FaClock size={11} style={{ flexShrink: 0 }} />
                                    {event.time}
                                </span>
                                <span className="d-flex align-items-center gap-1">
                                    {/* ── ICON: location ── */}
                                    <FaLocationDot size={11} style={{ flexShrink: 0 }} />
                                    {event.location}
                                </span>
                                {event.parish && (
                                    <span className="d-flex align-items-center gap-1">
                                        {/* ── ICON: parish ── */}
                                        <FaChurch size={11} style={{ flexShrink: 0 }} />
                                        {event.parish}
                                    </span>
                                )}
                            </div>

                            <a href={`/events/${event.id}`}
                               className="btn btn-sm mt-3 fw-semibold rounded-pill px-3 d-inline-flex align-items-center gap-1"
                               style={{ background: '#eef2f7', color: 'var(--bethel-primary)', fontSize: '0.78rem' }}>
                                Learn More <FaArrowRight size={10} />
                            </a>
                        </div>

                    </div>
                </div>
            </div>
        </article>
    );
}

export default function UpcomingEvents({ events = [] }) {
    return (
        <section className="py-5 bg-bethel-light" aria-labelledby="events-heading">
            <div className="container">

                <div className="row mb-4 align-items-end">
                    <div className="col">
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--bethel-secondary)' }}>
                            What's Happening
                        </p>
                        <h2 id="events-heading" className="bethel-section-title mb-0">Upcoming Events</h2>
                        <div className="bethel-section-divider"></div>
                    </div>
                    <div className="col-auto">
                        <a href="/events"
                           className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-inline-flex align-items-center gap-1">
                            View All <FaArrowRight size={10} />
                        </a>
                    </div>
                </div>

                <div className="row g-4">
                    {events.length === 0 ? (
                        <div className="col-12">
                            <div className="card border-0 shadow-sm bethel-card">
                                <div className="card-body text-center py-5 text-muted">
                                    {/* ── ICON: empty state ── */}
                                    <FaCalendarPlus size={40} className="d-block mb-2 mx-auto" style={{ opacity: 0.25, color: 'var(--bethel-primary)' }} />
                                    <p className="mb-0">No upcoming events at the moment.</p>
                                    <small>Check back soon or <a href="/events">browse all events</a>.</small>
                                </div>
                            </div>
                        </div>
                    ) : (
                        events.slice(0, 6).map((event, i) => (
                            <EventCard key={event.id ?? i} event={event} />
                        ))
                    )}
                </div>

            </div>
        </section>
    );
}