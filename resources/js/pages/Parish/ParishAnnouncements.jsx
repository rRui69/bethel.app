import React, { useState } from 'react';
import { FaBullhorn, FaCalendar, FaNewspaper } from 'react-icons/fa6';

const PLACEHOLDER_IMG = 'https://placehold.co/600x300/1a3c5e/ffffff?text=Announcement';

const CATEGORY_COLORS = {
    'Parish News':  { bg: '#dbeafe', text: '#1e40af' },
    'Community':    { bg: '#d1fae5', text: '#065f46' },
    'Liturgy':      { bg: '#ede9fe', text: '#4c1d95' },
    'Default':      { bg: '#f3f4f6', text: '#374151' },
};

function catStyle(category) {
    return CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Default;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric',
    });
}

function AnnouncementCard({ item }) {
    const { bg, text } = catStyle(item.category);
    const img = item.image ?? PLACEHOLDER_IMG;

    return (
        <article className="parish-ann-card">
            <a href={`/announcements/${item.id}`} className="parish-ann-card__link">
                <div
                    className="parish-ann-card__img"
                    style={{ backgroundImage: `url(${img})` }}
                    role="img"
                    aria-label={item.title}
                />
                <div className="parish-ann-card__body">
                    {item.category && (
                        <span
                            className="parish-ann-card__badge"
                            style={{ background: bg, color: text }}
                        >
                            {item.category}
                        </span>
                    )}
                    <h3 className="parish-ann-card__title">{item.title}</h3>
                    {item.excerpt && (
                        <p className="parish-ann-card__excerpt">{item.excerpt}</p>
                    )}
                    <div className="parish-ann-card__meta">
                        <FaCalendar size={11} aria-hidden="true" />
                        {formatDate(item.date)}
                    </div>
                </div>
            </a>
        </article>
    );
}

const PAGE_SIZE = 6;

export default function ParishAnnouncements({ announcements = [] }) {
    const [shown, setShown] = useState(PAGE_SIZE);

    const visible = announcements.slice(0, shown);
    const hasMore = shown < announcements.length;

    return (
        <div className="parish-announcements">
            {announcements.length === 0 ? (
                <div className="parish-section-empty">
                    <FaNewspaper size={38} aria-hidden="true" />
                    <p>No announcements at the moment. Check back soon!</p>
                </div>
            ) : (
                <>
                    <div className="parish-ann-grid">
                        {visible.map(a => (
                            <AnnouncementCard key={a.id} item={a} />
                        ))}
                    </div>
                    {hasMore && (
                        <div className="parish-ann-more">
                            <button
                                className="parish-load-more-btn"
                                onClick={() => setShown(s => s + PAGE_SIZE)}
                            >
                                Load more announcements
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}