import React from 'react';
import { FaBullhorn, FaCalendar, FaChurch, FaArrowLeft } from 'react-icons/fa6';

const CATEGORY_COLORS = {
    'Parish News': 'primary',
    'Community':   'success',
    'Liturgy':     'warning',
    'Youth':       'info',
    'General':     'secondary',
};

export default function AnnouncementDetailPage({ announcement }) {
    if (!announcement) {
        return (
            <div className="container py-5 text-center text-muted">
                <FaBullhorn size={48} className="d-block mx-auto mb-3 opacity-25" />
                <h5>Announcement not found</h5>
            </div>
        );
    }

    const color = CATEGORY_COLORS[announcement.category] ?? 'secondary';

    return (
        <>
            {/* Hero */}
            <section className={`py-5 bg-${color} text-white`}>
                <div className="container">
                    <a
                        href="/announcements"
                        className="d-inline-flex align-items-center gap-2 text-white text-decoration-none opacity-75 mb-3"
                        style={{ fontSize: '0.875rem' }}
                    >
                        <FaArrowLeft size={12} /> Back to Announcements
                    </a>
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <FaBullhorn size={32} />
                        <h1 className="fw-bold mb-0" style={{ lineHeight: 1.2 }}>{announcement.title}</h1>
                    </div>
                    <div className="d-flex align-items-center gap-3 mt-2" style={{ fontSize: '0.875rem', opacity: 0.85 }}>
                        {announcement.date && (
                            <span className="d-flex align-items-center gap-1">
                                <FaCalendar size={11} /> {announcement.date}
                            </span>
                        )}
                        {announcement.parish && (
                            <span className="d-flex align-items-center gap-1">
                                <FaChurch size={11} /> {announcement.parish}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-5">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-lg-8">

                            {/* Category badge */}
                            <div className="mb-4">
                                <span className={`badge bg-${color}`}>{announcement.category}</span>
                            </div>

                            {/* Excerpt */}
                            {announcement.excerpt && (
                                <p
                                    className="lead text-muted mb-4 pb-4 border-bottom"
                                    style={{ lineHeight: 1.7 }}
                                >
                                    {announcement.excerpt}
                                </p>
                            )}

                            {/* Full body */}
                            <div
                                className="text-muted"
                                style={{ whiteSpace: 'pre-wrap', lineHeight: 1.85, fontSize: '1rem' }}
                            >
                                {announcement.body}
                            </div>

                            <hr className="my-5" />

                            {/* Meta footer */}
                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                <div className="text-muted small d-flex align-items-center gap-3">
                                    {announcement.date && (
                                        <span><FaCalendar size={11} className="me-1" />{announcement.date}</span>
                                    )}
                                    {announcement.parish && (
                                        <span><FaChurch size={11} className="me-1" />{announcement.parish}</span>
                                    )}
                                </div>
                                <a
                                    href="/announcements"
                                    className={`btn btn-outline-${color} d-inline-flex align-items-center gap-2`}
                                >
                                    <FaArrowLeft size={12} /> All Announcements
                                </a>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}