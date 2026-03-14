import React, { useState, useRef, useEffect } from 'react';


const HERO_IMAGE = '/images/ChurchHero.png';
const HERO_VIDEO = '/images/ChurchHero.mp4';
const FALLBACK_VERSE = {
    text:      'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
    reference: 'John 3:16',
};

// Verse of the Day — bible-api.com (github.com/seven1m/bible_api)
// Change TRANSLATION to: 'kjv' | 'web' | 'asv' | 'dra' | 'bbe' | 'darby'
const TRANSLATION = 'kjv';

const VERSE_LIST = [
    'john 3:16',          'john 14:6',          'john 11:25',         'john 1:1',
    'john 6:35',          'john 15:5',          'matthew 5:3',        'matthew 5:9',
    'matthew 11:28',      'matthew 28:19',      'luke 1:37',          'luke 6:31',
    'mark 10:27',         'romans 8:28',        'romans 8:38',        'romans 12:2',
    'philippians 4:13',   'philippians 4:6',    'galatians 5:22',     '1 corinthians 13:4',
    '1 corinthians 13:13','ephesians 2:8',      'ephesians 6:10',     '2 timothy 1:7',
    'hebrews 11:1',       'hebrews 13:8',       '1 john 4:8',         '1 john 4:19',
    '1 peter 5:7',        '2 corinthians 5:17', '2 corinthians 12:9', 'james 1:17',
    'colossians 3:16',    'psalm 23:1',         'psalm 46:1',         'psalm 119:105',
    'psalm 27:1',         'psalm 34:8',         'psalm 91:1',         'psalm 37:4',
    'proverbs 3:5',       'proverbs 3:6',       'proverbs 22:6',      'isaiah 40:31',
    'isaiah 41:10',       'isaiah 43:2',        'jeremiah 29:11',     'joshua 1:9',
    'micah 6:8',          'genesis 1:1',        'numbers 6:24',       'deuteronomy 31:6',
];

function getDayOfYear() {
    const now = new Date();
    return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86_400_000);
}

function getTodaysVerseRef() {
    return VERSE_LIST[getDayOfYear() % VERSE_LIST.length];
}

export default function HeroBanner({ parishes = [] }) {
    const [query, setQuery]       = useState('');
    const [open, setOpen]         = useState(false);
    const [selected, setSelected] = useState(null);
    const wrapperRef              = useRef(null);
    const [verse, setVerse]       = useState(null);       // null = still loading
    const [verseError, setVerseError] = useState(false);

    useEffect(() => {
        const ref = getTodaysVerseRef();
        const url = `https://bible-api.com/${encodeURIComponent(ref)}?translation=${TRANSLATION}`;

        fetch(url)
            .then(r => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then(data => {
                if (data?.text && data?.reference) {
                    setVerse({
                        text:      data.text.trim().replace(/\n/g, ' '),
                        reference: data.reference,
                    });
                } else {
                    setVerseError(true);
                }
            })
            .catch(() => setVerseError(true));
    }, []);

    const displayVerse = verseError ? FALLBACK_VERSE : verse;

    const filtered = query.length > 0
        ? parishes.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
        : [];
    useEffect(() => {
        function handler(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    function handleSelect(parish) {
        setSelected(parish);
        setQuery(parish.name);
        setOpen(false);
    }

    function handleKeyDown(e) {
        if (e.key === 'Escape') setOpen(false);
        if (e.key === 'Enter' && selected) {
            window.location.href = `/parish/${selected.id}`;
        }
    }

    // Determine which background mode is active
    const hasVideo = Boolean(HERO_VIDEO);
    const hasImage = Boolean(HERO_IMAGE);

    return (
        <section className="bethel-hero d-flex align-items-center" aria-label="Hero Banner">
            {hasVideo ? (
                <video
                    key={HERO_VIDEO}
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster={HERO_IMAGE || undefined}
                    aria-hidden="true"
                    style={{
                        position:       'absolute',
                        inset:          0,
                        width:          '100%',
                        height:         '100%',
                        objectFit:      'cover',
                        objectPosition: 'center',
                        zIndex:         0,
                    }}
                >
                    <source src={HERO_VIDEO} type="video/mp4" />
                </video>
            ) : hasImage ? (
                <div
                    aria-hidden="true"
                    style={{
                        position:           'absolute',
                        inset:              0,
                        backgroundImage:    `url(${HERO_IMAGE})`,
                        backgroundSize:     'cover',
                        backgroundPosition: 'center',
                        zIndex:             0,
                    }}
                />
            ) : null
            }
            {(hasVideo || hasImage) && (
                <div
                    aria-hidden="true"
                    style={{
                        position:   'absolute',
                        inset:      0,
                        background: 'rgba(10, 30, 60, 0.55)',
                        zIndex:     1,
                    }}
                />
            )}
            <div className="container position-relative" style={{ zIndex: 2 }}>
                <div className="row justify-content-center text-center">
                    <div className="col-lg-8 col-xl-7">

                        <p className="bethel-hero__eyebrow">Welcome to BethelApp</p>

                        <h1 className="bethel-hero__title">
                            "Verse of the Day"
                        </h1>

                        <p className="bethel-hero__subtitle">
                            Daily verse: Book | Chapter | Verse
                        </p>

                        {/* Parish Search */}
                        <div
                            className="bethel-hero__search position-relative mx-auto"
                            style={{ maxWidth: '520px' }}
                            ref={wrapperRef}
                        >
                            <div className="input-group input-group-lg shadow">
                                <span className="input-group-text bg-white border-0 pe-0">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-0 ps-2"
                                    placeholder="Search for your parish..."
                                    value={query}
                                    onChange={e => { setQuery(e.target.value); setOpen(true); }}
                                    onFocus={() => query && setOpen(true)}
                                    onKeyDown={handleKeyDown}
                                    aria-label="Search parishes"
                                    aria-autocomplete="list"
                                    aria-expanded={open}
                                />
                                <button
                                    className="btn px-4 fw-bold"
                                    style={{
                                        background:   'var(--bethel-secondary)',
                                        color:        'var(--bethel-primary)',
                                        borderRadius: '0 0.5rem 0.5rem 0',
                                    }}
                                    onClick={() => selected && (window.location.href = `/parish/${selected.id}`)}
                                >
                                    Find Parish
                                </button>
                            </div>

                            {/* Autocomplete Dropdown */}
                            {open && filtered.length > 0 && (
                                <ul className="bethel-hero__search list-group shadow text-start" role="listbox">
                                    {filtered.map(p => (
                                        <li
                                            key={p.id}
                                            className="list-group-item list-group-item-action d-flex align-items-center gap-2"
                                            role="option"
                                            style={{ cursor: 'pointer' }}
                                            onMouseDown={() => handleSelect(p)}
                                        >
                                            <i className="bi bi-geo-alt-fill text-primary"></i>
                                            <span>{p.name}</span>
                                            {p.location && (
                                                <small className="text-muted ms-auto">{p.location}</small>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {open && query.length > 2 && filtered.length === 0 && (
                                <div className="list-group shadow text-start">
                                    <div className="list-group-item text-muted" style={{ fontSize: '0.875rem' }}>
                                        <i className="bi bi-info-circle me-2"></i>No parishes found for "{query}"
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}