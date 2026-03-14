import React, { useState, useEffect, useRef } from 'react';
import {
    FaLocationDot, FaPhone, FaEnvelope, FaChurch,
    FaChevronLeft, FaChevronRight, FaCalendarDays,
    FaBullhorn, FaUsers, FaCirclePlay,
} from 'react-icons/fa6';

const FALLBACK_IMG = 'https://placehold.co/1200x500/1a3c5e/ffffff?text=Parish';

const NAV_ITEMS = [
    { id: 'section-announcements', icon: FaBullhorn,     label: 'Announcements' },
    { id: 'section-schedule',      icon: FaCalendarDays, label: 'Mass Schedule' },
    { id: 'section-events',        icon: FaCalendarDays, label: 'Events' },
    { id: 'section-clergy',        icon: FaUsers,        label: 'Clergy' },
    { id: 'section-livestream',    icon: FaCirclePlay,   label: 'Livestream' },
];

function scrollToSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 80; // navbar height approx
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
}

export default function ParishHeader({ parish }) {
    const images  = parish.images?.length ? parish.images : [FALLBACK_IMG];
    const [idx, setIdx]           = useState(0);
    const [fading, setFading]     = useState(false);
    const timerRef                = useRef(null);

    const go = (dir) => {
        setFading(true);
        setTimeout(() => {
            setIdx(i => (i + dir + images.length) % images.length);
            setFading(false);
        }, 200);
    };

    // Auto-advance if multiple images
    useEffect(() => {
        if (images.length < 2) return;
        timerRef.current = setInterval(() => go(1), 5000);
        return () => clearInterval(timerRef.current);
    }, [images.length]);

    return (
        <div className="parish-header">
            {/* ── Image carousel ─────────────────────────── */}
            <div className="parish-header__carousel" aria-label="Parish photos">
                <div
                    className={`parish-header__img ${fading ? 'parish-header__img--fading' : ''}`}
                    style={{ backgroundImage: `url(${images[idx]})` }}
                    role="img"
                    aria-label={`${parish.name} — photo ${idx + 1} of ${images.length}`}
                />
                <div className="parish-header__overlay" />

                {images.length > 1 && (
                    <>
                        <button
                            className="parish-header__arrow parish-header__arrow--left"
                            onClick={() => go(-1)}
                            aria-label="Previous image"
                        >
                            <FaChevronLeft size={14} />
                        </button>
                        <button
                            className="parish-header__arrow parish-header__arrow--right"
                            onClick={() => go(1)}
                            aria-label="Next image"
                        >
                            <FaChevronRight size={14} />
                        </button>

                        {/* Dots */}
                        <div className="parish-header__dots" aria-hidden="true">
                            {images.map((_, i) => (
                                <button
                                    key={i}
                                    className={`parish-header__dot ${i === idx ? 'active' : ''}`}
                                    onClick={() => { setFading(true); setTimeout(() => { setIdx(i); setFading(false); }, 200); }}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Parish identity overlaid on image */}
                <div className="parish-header__identity container">
                    <div className="parish-header__icon-wrap">
                        <FaChurch size={28} aria-hidden="true" />
                    </div>
                    <h1 className="parish-header__name">{parish.name}</h1>
                    {parish.diocese && (
                        <p className="parish-header__diocese">{parish.diocese}</p>
                    )}
                </div>
            </div>

            {/* ── Info strip ─────────────────────────────── */}
            <div className="parish-header__info-strip">
                <div className="container">
                    <div className="parish-header__info-row">
                        {parish.address && (
                            <span className="parish-header__info-item">
                                <FaLocationDot size={13} aria-hidden="true" />
                                {parish.address}
                            </span>
                        )}
                        {parish.phone && (
                            <span className="parish-header__info-item">
                                <FaPhone size={12} aria-hidden="true" />
                                {parish.phone}
                            </span>
                        )}
                        {parish.email && (
                            <span className="parish-header__info-item">
                                <FaEnvelope size={12} aria-hidden="true" />
                                {parish.email}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Description ────────────────────────────── */}
            {parish.description && (
                <div className="parish-header__desc-wrap container">
                    <p className="parish-header__desc">{parish.description}</p>
                </div>
            )}

            {/* ── Quick-nav buttons ───────────────────────── */}
            <div className="parish-header__quicknav">
                <div className="container">
                    <div className="parish-header__quicknav-row">
                        {NAV_ITEMS.map(({ id, icon: Icon, label }) => (
                            <button
                                key={id}
                                className="parish-quicknav-btn"
                                onClick={() => scrollToSection(id)}
                            >
                                <Icon size={15} aria-hidden="true" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}