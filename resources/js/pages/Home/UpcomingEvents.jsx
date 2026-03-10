import React from 'react';
import { FaClock, FaLocationDot, FaChurch, FaCalendarPlus, FaArrowRight } from 'react-icons/fa6';

const EVENTS_BG = '/images/lithur.png';
const OVERLAY_ALPHA = 0.72;

const SHOW_EVENT_IMAGE      = false;
const EVENT_IMAGE_HEIGHT    = 160;
const EVENT_PLACEHOLDER_IMG = 'https://placehold.co/600x400/1a3c5e/ffffff?text=Event';

const EVENT_COLORS = {
    'Liturgy':     { badge: '#dbeafe', text: '#1e40af' },
    'Community':   { badge: '#d1fae5', text: '#065f46' },
    'Youth':       { badge: '#fef3c7', text: '#78350f' },
    'Sacramental': { badge: '#ede9fe', text: '#4a1d96' },
    'Default':     { badge: '#f3f4f6', text: '#374151' },
};

// Whether the bg image is active
const hasBg = Boolean(EVENTS_BG);

function EventCard({ event }) {
    const date  = new Date(event.date);
    const day   = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const { badge, text } = EVENT_COLORS[event.type] ?? EVENT_COLORS['Default'];
    const eventImage = event.image || EVENT_PLACEHOLDER_IMG;

    return (
        <article className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm bethel-card h-100">
                {SHOW_EVENT_IMAGE && (
                    <div
                        style={{
                            height: `${EVENT_IMAGE_HEIGHT}px`,
                            backgroundImage: `url(${eventImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: 'var(--bethel-radius, 0.75rem) var(--bethel-radius, 0.75rem) 0 0',
                        }}
                        role="img"
                        aria-label={event.title}
                    >
                        <div style={{
                            height: '100%',
                            background: 'linear-gradient(to top, rgba(15,39,68,0.5) 0%, transparent 50%)',
                            borderRadius: 'inherit',
                        }} />
                    </div>
                )}

                <div className="card-body p-4">
                    <div className="d-flex gap-3">

                        {/* Date */}
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

                            <div className="d-flex flex-column gap-1" style={{ fontSize: '0.775rem', color: '#888' }}>
                                <span className="d-flex align-items-center gap-1">
                                    <FaClock size={11} style={{ flexShrink: 0 }} />
                                    {event.time}
                                </span>
                                <span className="d-flex align-items-center gap-1">
                                    <FaLocationDot size={11} style={{ flexShrink: 0 }} />
                                    {event.location}
                                </span>
                                {event.parish && (
                                    <span className="d-flex align-items-center gap-1">
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
        <section
            className={`py-5 ${!hasBg ? 'bg-bethel-light' : ''}`}
            aria-labelledby="events-heading"
            style={hasBg ? {
                position:             'relative',
                backgroundImage:      `url(${EVENTS_BG})`,    /* ← image source */
                backgroundSize:       'cover',
                backgroundPosition:   'center',
                backgroundAttachment: 'fixed',  /* ← remove for plain scroll */
            } : {}}
        >
            {hasBg && (
                <div
                    aria-hidden="true"
                    style={{
                        position:   'absolute',
                        inset:      0,
                        background: `rgba(10, 25, 50, ${OVERLAY_ALPHA})`,
                        zIndex:     0,
                    }}
                />
            )}

            {/* CONTENT */}
            <div className="container" style={{ position: 'relative', zIndex: 1 }}>

                <div className="row mb-4 align-items-end">
                    <div className="col">

                        <p style={{
                            fontSize: '0.75rem', fontWeight: 700,
                            letterSpacing: '2px', textTransform: 'uppercase',
                            color: 'var(--bethel-secondary)',
                        }}>
                            BethelApp
                        </p>
                        <h2
                            id="events-heading"
                            className="bethel-section-title mb-0"
                            style={hasBg ? { color: '#ffffff' } : {}}
                        >
                            Upcoming Events
                        </h2>
                        <div className="bethel-section-divider"></div>
                    </div>
                    <div className="col-auto">
                        <a href="/events"
                           className={`btn btn-sm rounded-pill px-3 d-inline-flex align-items-center gap-1 ${
                               hasBg ? 'btn-outline-light' : 'btn-outline-secondary'
                           }`}>
                            View All <FaArrowRight size={10} />
                        </a>
                    </div>
                </div>

                <div className="row g-4">
                    {events.length === 0 ? (
                        <div className="col-12">
                            <div className="card border-0 shadow-sm bethel-card">
                                <div className="card-body text-center py-5 text-muted">
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