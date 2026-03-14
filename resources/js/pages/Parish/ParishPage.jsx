import React from 'react';
import { FaBullhorn, FaCalendarDays, FaCalendarCheck, FaUsers, FaCirclePlay } from 'react-icons/fa6';
import ParishHeader        from './ParishHeader';
import ParishAnnouncements from './ParishAnnouncements';
import ParishCalendar      from './ParishCalendar';
import ParishClergy        from './ParishClergy';

// Reuse the livestream widget from the homepage — it already polls /api/livestreams/active
import LivestreamWidget from '../Home/LivestreamWidget';

function SectionHeading({ icon: Icon, label, id }) {
    return (
        <div className="parish-section-heading" id={id}>
            <div className="parish-section-heading__icon">
                <Icon size={18} aria-hidden="true" />
            </div>
            <h2 className="parish-section-heading__text">{label}</h2>
            <div className="parish-section-divider" />
        </div>
    );
}

export default function ParishPage({
    parishData     = {},
    announcements  = [],
    events         = [],
    massSchedules  = [],
    clergy         = [],
    livestreams    = [],
}) {
    return (
        <div className="parish-page">
            {/* ── Header: carousel + info strip + quick-nav ── */}
            <ParishHeader parish={parishData} />

            <div className="container parish-page__content">

                {/* ── Announcements ─────────────────────────── */}
                <section className="parish-page__section" aria-labelledby="section-announcements">
                    <SectionHeading
                        icon={FaBullhorn}
                        label="Announcements"
                        id="section-announcements"
                    />
                    <ParishAnnouncements announcements={announcements} />
                </section>

                {/* ── Mass Schedule (calendar) ───────────────── */}
                <section className="parish-page__section" aria-labelledby="section-schedule">
                    <SectionHeading
                        icon={FaCalendarDays}
                        label="Mass Schedule"
                        id="section-schedule"
                    />
                    <ParishCalendar massSchedules={massSchedules} events={[]} />
                </section>

                {/* ── Parish Events (calendar) ───────────────── */}
                <section className="parish-page__section" aria-labelledby="section-events">
                    <SectionHeading
                        icon={FaCalendarCheck}
                        label="Parish Events"
                        id="section-events"
                    />
                    <ParishCalendar massSchedules={[]} events={events} />
                </section>

                {/* ── Clergy ────────────────────────────────── */}
                <section className="parish-page__section" aria-labelledby="section-clergy">
                    <SectionHeading
                        icon={FaUsers}
                        label="Our Clergy"
                        id="section-clergy"
                    />
                    <ParishClergy clergy={clergy} parishId={parishData.id} />
                </section>

                {/* ── Livestream ────────────────────────────── */}
                <section className="parish-page__section parish-page__section--livestream" aria-labelledby="section-livestream">
                    <SectionHeading
                        icon={FaCirclePlay}
                        label="Live &amp; Broadcasts"
                        id="section-livestream"
                    />
                    {/* LivestreamWidget is self-contained — it polls its own endpoint */}
                    <LivestreamWidget />
                </section>

            </div>
        </div>
    );
}