import React, { useState } from 'react';
// ── React Icons ────────────────────────────────────────────────────────────
import { FaSun, FaLocationDot, FaUser, FaChurch, FaCalendarXmark, FaArrowRight } from 'react-icons/fa6';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function MassSchedule({ schedules = [] }) {
    const today = DAYS[new Date().getDay()];
    const [activeDay, setActiveDay] = useState(today);

    const daySchedules = schedules.filter(s => s.day === activeDay);

    return (
        <section className="py-5" aria-labelledby="schedule-heading">
            <div className="container">

                <div className="row mb-4 align-items-end">
                    <div className="col">
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--bethel-secondary)' }}>
                            Weekly Times
                        </p>
                        <h2 id="schedule-heading" className="bethel-section-title mb-0">Mass Schedule</h2>
                        <div className="bethel-section-divider"></div>
                    </div>
                    <div className="col-auto">
                        <a href="/mass-schedule"
                           className="btn btn-sm btn-outline-secondary rounded-pill px-3 d-inline-flex align-items-center gap-1">
                            Full Schedule <FaArrowRight size={10} />
                        </a>
                    </div>
                </div>

                {/* Day Selector */}
                <div className="d-flex gap-2 flex-wrap mb-4" role="tablist" aria-label="Select day of week">
                    {DAYS.map(day => (
                        <button
                            key={day}
                            role="tab"
                            aria-selected={activeDay === day}
                            onClick={() => setActiveDay(day)}
                            className={`bethel-schedule-pill ${activeDay === day ? 'active' : ''}`}
                        >
                            {/* ── ICON: day selector pill icon ── */}
                            <FaSun size={10} aria-hidden="true" />
                            {day}
                            {day === today && activeDay !== day && (
                                <span className="badge rounded-pill ms-1"
                                      style={{ fontSize: '0.55rem', background: 'var(--bethel-secondary)', color: 'var(--bethel-primary)', padding: '1px 5px' }}>
                                    Today
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Schedule Grid */}
                {daySchedules.length === 0 ? (
                    <div className="card border-0 shadow-sm bethel-card">
                        <div className="card-body text-center py-5 text-muted">
                            {/* ── ICON: empty state ── */}
                            <FaCalendarXmark size={40} className="d-block mb-2 mx-auto" style={{ opacity: 0.25, color: 'var(--bethel-primary)' }} />
                            <p className="mb-0">No mass scheduled for <strong>{activeDay}</strong>.</p>
                            <small>Check other days or view the full schedule.</small>
                        </div>
                    </div>
                ) : (
                    <div className="row g-3">
                        {daySchedules.map((s, i) => (
                            <div key={i} className="col-sm-6 col-md-4 col-lg-3">
                                <div className="card border-0 shadow-sm bethel-card h-100">
                                    <div className="card-body p-3">
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <div className="bethel-event-date text-center" style={{ minWidth: '48px' }}>
                                                <span className="bethel-event-date__month" style={{ fontSize: '0.55rem' }}>MASS</span>
                                                <span className="bethel-event-date__day" style={{ fontSize: '1rem' }}>
                                                    {s.time.replace(':00', '').replace(' AM', '').replace(' PM', '')}
                                                </span>
                                                <span className="bethel-event-date__month" style={{ fontSize: '0.55rem' }}>
                                                    {s.time.includes('AM') ? 'AM' : 'PM'}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="fw-bold" style={{ fontSize: '0.85rem', color: 'var(--bethel-primary)' }}>
                                                    {s.parish}
                                                </div>
                                                <small className="text-muted">{s.type || 'Regular Mass'}</small>
                                            </div>
                                        </div>

                                        {/* ── Meta info rows ── */}
                                        <div className="d-flex flex-column gap-1 mt-2">
                                            <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.75rem', color: '#888' }}>
                                                {/* ── ICON: location ── */}
                                                <FaLocationDot size={11} style={{ flexShrink: 0 }} />
                                                <span>{s.location}</span>
                                            </div>
                                            {s.celebrant && (
                                                <div className="d-flex align-items-center gap-1" style={{ fontSize: '0.75rem', color: '#888' }}>
                                                    {/* ── ICON: celebrant ── */}
                                                    <FaUser size={10} style={{ flexShrink: 0 }} />
                                                    <span>{s.celebrant}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </section>
    );
}