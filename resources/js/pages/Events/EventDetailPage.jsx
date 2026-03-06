import React from 'react';
import {
    FaCalendarDays, FaClock, FaLocationDot, FaChurch,
    FaBookOpen, FaUsers, FaPeopleLine, FaArrowLeft,
} from 'react-icons/fa6';

const TYPE_COLORS = { Community: 'success', Liturgy: 'warning', Youth: 'info' };
const TYPE_ICONS  = { Community: FaUsers,   Liturgy: FaBookOpen,    Youth: FaPeopleLine };

export default function EventDetailPage({ event }) {
    if (!event) {
        return (
            <div className="container py-5 text-center text-muted">
                <FaCalendarDays size={48} className="d-block mx-auto mb-3 opacity-25" />
                <h5>Event not found</h5>
            </div>
        );
    }

    const color = TYPE_COLORS[event.type] ?? 'secondary';
    const Icon  = TYPE_ICONS[event.type]  ?? FaCalendarDays;

    return (
        <>
            {/* Hero */}
            <section className={`py-5 bg-${color} text-white`}>
                <div className="container">
                    <a
                        href="/events"
                        className="d-inline-flex align-items-center gap-2 text-white text-decoration-none opacity-75 mb-3"
                        style={{ fontSize: '0.875rem' }}
                    >
                        <FaArrowLeft size={12} /> Back to Events
                    </a>
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <Icon size={32} />
                        <h1 className="fw-bold mb-0">{event.title}</h1>
                    </div>
                    <span
                        className="badge text-white border border-white border-opacity-50"
                        style={{ background: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}
                    >
                        {event.type}
                    </span>
                </div>
            </section>

            {/* Content */}
            <section className="py-5">
                <div className="container">
                    <div className="row g-4">

                        {/* Detail card */}
                        <div className="col-12 col-lg-4 order-lg-2">
                            <div className="card shadow-sm border-0 sticky-top" style={{ top: '1.5rem' }}>
                                {/* Date block header */}
                                <div className={`card-header bg-${color} text-white border-0 d-flex align-items-center gap-3 py-3`}>
                                    <div
                                        className="d-flex flex-column align-items-center justify-content-center rounded-2 bg-white flex-shrink-0 p-2"
                                        style={{ width: 56, minHeight: 60 }}
                                    >
                                        <div style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: `var(--bs-${color})` }}>
                                            {event.month}
                                        </div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, color: `var(--bs-${color})` }}>
                                            {event.day_num}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="fw-bold">{event.day}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>{event.date_display}</div>
                                    </div>
                                </div>

                                <div className="card-body p-0">
                                    <ul className="list-group list-group-flush">
                                        {event.time && (
                                            <li className="list-group-item d-flex align-items-center gap-3 py-3">
                                                <FaClock size={14} className={`text-${color} flex-shrink-0`} />
                                                <div>
                                                    <div className="fw-semibold small">Time</div>
                                                    <div className="text-muted small">
                                                        {event.time}{event.end_time ? ` – ${event.end_time}` : ''}
                                                    </div>
                                                </div>
                                            </li>
                                        )}
                                        {event.location && (
                                            <li className="list-group-item d-flex align-items-center gap-3 py-3">
                                                <FaLocationDot size={14} className={`text-${color} flex-shrink-0`} />
                                                <div>
                                                    <div className="fw-semibold small">Location</div>
                                                    <div className="text-muted small">{event.location}</div>
                                                </div>
                                            </li>
                                        )}
                                        {event.parish && (
                                            <li className="list-group-item d-flex align-items-center gap-3 py-3">
                                                <FaChurch size={14} className={`text-${color} flex-shrink-0`} />
                                                <div>
                                                    <div className="fw-semibold small">Parish</div>
                                                    <div className="text-muted small">
                                                        {event.parish}{event.city ? `, ${event.city}` : ''}
                                                    </div>
                                                </div>
                                            </li>
                                        )}
                                        {event.celebrant && (
                                            <li className="list-group-item d-flex align-items-center gap-3 py-3">
                                                <FaBookOpen size={14} className={`text-${color} flex-shrink-0`} />
                                                <div>
                                                    <div className="fw-semibold small">Celebrant</div>
                                                    <div className="text-muted small">{event.celebrant}</div>
                                                </div>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="col-12 col-lg-8 order-lg-1">
                            <h2 className="h5 fw-bold mb-3">About this Event</h2>
                            {event.description ? (
                                <p className="text-muted lh-lg" style={{ whiteSpace: 'pre-wrap' }}>
                                    {event.description}
                                </p>
                            ) : (
                                <p className="text-muted fst-italic">No additional details provided.</p>
                            )}

                            <hr className="my-4" />

                            <a href="/events" className={`btn btn-outline-${color} d-inline-flex align-items-center gap-2`}>
                                <FaArrowLeft size={12} /> View All Events
                            </a>
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
}