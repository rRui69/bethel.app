import React, { useState, useMemo } from 'react';
import { FaMagnifyingGlass, FaUser, FaArrowRight, FaStar } from 'react-icons/fa6';

const PLACEHOLDER_AVATAR = 'https://placehold.co/200x200/1a3c5e/ffffff?text=Clergy';

function ClergyCard({ clergy, parishId }) {
    const href    = `/parish/${parishId}/clergy/${clergy.id}`;
    const imgSrc  = clergy.image ?? PLACEHOLDER_AVATAR;

    return (
        <article className="parish-clergy-card">
            <a href={href} className="parish-clergy-card__link" aria-label={`View profile of ${clergy.titled_name}`}>
                <div className="parish-clergy-card__img-wrap">
                    <img
                        src={imgSrc}
                        alt={clergy.titled_name}
                        className="parish-clergy-card__img"
                        loading="lazy"
                        onError={e => { e.currentTarget.src = PLACEHOLDER_AVATAR; }}
                    />
                </div>

                <div className="parish-clergy-card__body">
                    <p className="parish-clergy-card__title-badge">{clergy.title}</p>
                    <h3 className="parish-clergy-card__name">{clergy.name}</h3>

                    {clergy.specialization && (
                        <p className="parish-clergy-card__spec">
                            <FaStar size={10} aria-hidden="true" />
                            {clergy.specialization}
                        </p>
                    )}

                    {clergy.bio && (
                        <p className="parish-clergy-card__bio">{clergy.bio}</p>
                    )}

                    <span className="parish-clergy-card__cta">
                        View Profile <FaArrowRight size={11} />
                    </span>
                </div>
            </a>
        </article>
    );
}

export default function ParishClergy({ clergy = [], parishId }) {
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return clergy;
        return clergy.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.titled_name.toLowerCase().includes(q) ||
            (c.specialization ?? '').toLowerCase().includes(q)
        );
    }, [clergy, query]);

    return (
        <div className="parish-clergy">
            {/* Search bar */}
            <div className="parish-clergy__search-wrap">
                <div className="parish-clergy__search">
                    <FaMagnifyingGlass size={14} className="parish-clergy__search-icon" aria-hidden="true" />
                    <input
                        type="text"
                        className="parish-clergy__search-input"
                        placeholder="Search clergy by name or specialization…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        aria-label="Search clergy"
                    />
                    {query && (
                        <button
                            className="parish-clergy__search-clear"
                            onClick={() => setQuery('')}
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
                <div className="parish-clergy__empty">
                    <FaUser size={36} aria-hidden="true" />
                    <p>
                        {query
                            ? `No clergy found for "${query}"`
                            : 'No clergy assigned to this parish yet.'}
                    </p>
                </div>
            ) : (
                <div className="parish-clergy__grid">
                    {filtered.map(c => (
                        <ClergyCard key={c.id} clergy={c} parishId={parishId} />
                    ))}
                </div>
            )}
        </div>
    );
}