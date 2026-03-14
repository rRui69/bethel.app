import React from 'react';
import {
    FaChevronLeft, FaChurch, FaUser, FaStar,
    FaCalendarDays, FaCalendarCheck, FaUserTie,
} from 'react-icons/fa6';

// Reuse the full-featured calendar from the parish page —
// it already handles both recurring mass schedules and event-style entries.
import ParishCalendar from './ParishCalendar';

const PLACEHOLDER_AVATAR = 'https://placehold.co/400x480/1a3c5e/ffffff?text=Clergy';

// ── Breadcrumb ────────────────────────────────────────────────
function Breadcrumb({ parish, clergyName }) {
    return (
        <nav className="clergy-profile__breadcrumb" aria-label="Breadcrumb">
            <ol className="clergy-profile__breadcrumb-list">
                <li>
                    <a href="/" className="clergy-profile__breadcrumb-link">Home</a>
                </li>
                <li aria-hidden="true" className="clergy-profile__breadcrumb-sep">›</li>
                <li>
                    <a
                        href={`/parish/${parish.id}`}
                        className="clergy-profile__breadcrumb-link"
                    >
                        {parish.name}
                    </a>
                </li>
                <li aria-hidden="true" className="clergy-profile__breadcrumb-sep">›</li>
                <li aria-current="page" className="clergy-profile__breadcrumb-current">
                    {clergyName}
                </li>
            </ol>
        </nav>
    );
}

// ── Profile hero ──────────────────────────────────────────────
function ProfileHero({ clergy, parish }) {
    const imgSrc = clergy.image ?? PLACEHOLDER_AVATAR;

    return (
        <div className="clergy-profile__hero">
            {/* Back button */}
            <div className="container">
                <a
                    href={`/parish/${parish.id}#section-clergy`}
                    className="clergy-profile__back-btn"
                    aria-label={`Back to ${parish.name}`}
                >
                    <FaChevronLeft size={13} aria-hidden="true" />
                    Back to {parish.name}
                </a>
            </div>

            {/* Hero card */}
            <div className="container">
                <div className="clergy-profile__card">

                    {/* ── Image column ──────────────────────── */}
                    <div className="clergy-profile__img-col">
                        <div className="clergy-profile__img-frame">
                            <img
                                src={imgSrc}
                                alt={clergy.titled_name}
                                className="clergy-profile__img"
                                onError={e => { e.currentTarget.src = PLACEHOLDER_AVATAR; }}
                            />
                        </div>
                    </div>

                    {/* ── Info column ───────────────────────── */}
                    <div className="clergy-profile__info-col">

                        {/* Title badge */}
                        {clergy.title && (
                            <span className="clergy-profile__title-badge">
                                {clergy.title}
                            </span>
                        )}

                        {/* Name */}
                        <h1 className="clergy-profile__name">{clergy.name}</h1>

                        {/* Parish + role */}
                        <div className="clergy-profile__meta-row">
                            <span className="clergy-profile__meta-item">
                                <FaChurch size={13} aria-hidden="true" />
                                {parish.name}
                            </span>
                            <span className="clergy-profile__meta-item">
                                <FaUserTie size={13} aria-hidden="true" />
                                Clergymen
                            </span>
                            {clergy.age !== null && clergy.age !== undefined && (
                                <span className="clergy-profile__meta-item">
                                    <FaUser size={12} aria-hidden="true" />
                                    Age {clergy.age}
                                </span>
                            )}
                        </div>

                        {/* Specialization */}
                        {clergy.specialization && (
                            <div className="clergy-profile__spec">
                                <FaStar size={12} aria-hidden="true" />
                                <span>{clergy.specialization}</span>
                            </div>
                        )}

                        {/* Divider */}
                        <hr className="clergy-profile__divider" />

                        {/* Biography */}
                        {clergy.bio ? (
                            <p className="clergy-profile__bio">{clergy.bio}</p>
                        ) : (
                            <p className="clergy-profile__bio clergy-profile__bio--empty">
                                No biography available yet.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Section heading (matches parish page style) ───────────────
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

// ── Main component ────────────────────────────────────────────
export default function ClergyProfilePage({
    clergyData           = {},
    parishData           = {},
    massSchedules        = [],
    sacramentAssignments = [],
}) {
    const hasMassSchedules   = massSchedules.length > 0;
    const hasSacraments      = sacramentAssignments.length > 0;
    const hasAnySchedule     = hasMassSchedules || hasSacraments;

    return (
        <div className="clergy-profile-page">

            {/* Breadcrumb */}
            <div className="clergy-profile__breadcrumb-wrap">
                <div className="container">
                    <Breadcrumb parish={parishData} clergyName={clergyData.titled_name ?? clergyData.name} />
                </div>
            </div>

            {/* Hero: image + identity + bio */}
            <ProfileHero clergy={clergyData} parish={parishData} />

            {/* ── Schedule section ─────────────────────────── */}
            <div className="container clergy-profile__content">

                {/* Mass Schedule Calendar */}
                {hasMassSchedules && (
                    <section className="parish-page__section" aria-labelledby="clergy-mass-schedule">
                        <SectionHeading
                            icon={FaCalendarDays}
                            label="Mass Schedule"
                            id="clergy-mass-schedule"
                        />
                        <ParishCalendar massSchedules={massSchedules} events={[]} />
                    </section>
                )}

                {/* Sacrament Assignments Calendar */}
                {hasSacraments && (
                    <section className="parish-page__section" aria-labelledby="clergy-sacraments">
                        <SectionHeading
                            icon={FaCalendarCheck}
                            label="Sacramental Duties"
                            id="clergy-sacraments"
                        />
                        {/*
                            sacramentAssignments have concrete preferred_dates,
                            so they pass into ParishCalendar as "events".
                            The calendar renders them identically to parish events.
                        */}
                        <ParishCalendar massSchedules={[]} events={sacramentAssignments} />
                    </section>
                )}

                {/* Empty state — no schedule at all */}
                {!hasAnySchedule && (
                    <section className="parish-page__section">
                        <SectionHeading
                            icon={FaCalendarDays}
                            label="Schedule"
                            id="clergy-schedule"
                        />
                        <div className="parish-section-empty">
                            <FaCalendarDays size={40} aria-hidden="true" />
                            <p>No schedule assigned yet. Check back soon.</p>
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
}