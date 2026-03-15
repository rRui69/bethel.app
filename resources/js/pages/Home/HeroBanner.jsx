import React, { useState, useRef, useEffect } from 'react';


const HERO_IMAGE = '/images/ChurchHero.png';
const HERO_VIDEO = '/images/ChurchHero.mp4';
// Verse pool — each entry has embedded text (shown instantly) + API coords for wldeh/bible-api.
// API: https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-kjv/books/{book}/chapters/{chapter}/verses/{verse}.json
// One verse is selected per day deterministically via getDayOfYear() % VERSE_LIST.length.
const VERSE_LIST = [
    { book: 'john',          chapter: 3,   verse: 16,  reference: 'John 3:16',           text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.' },
    { book: 'john',          chapter: 14,  verse: 6,   reference: 'John 14:6',            text: 'Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.' },
    { book: 'john',          chapter: 11,  verse: 25,  reference: 'John 11:25',           text: 'Jesus said unto her, I am the resurrection, and the life: he that believeth in me, though he were dead, yet shall he live.' },
    { book: 'john',          chapter: 1,   verse: 1,   reference: 'John 1:1',             text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
    { book: 'john',          chapter: 6,   verse: 35,  reference: 'John 6:35',            text: 'And Jesus said unto them, I am the bread of life: he that cometh to me shall never hunger; and he that believeth on me shall never thirst.' },
    { book: 'john',          chapter: 15,  verse: 5,   reference: 'John 15:5',            text: 'I am the vine, ye are the branches: He that abideth in me, and I in him, the same bringeth forth much fruit: for without me ye can do nothing.' },
    { book: 'matthew',       chapter: 5,   verse: 3,   reference: 'Matthew 5:3',          text: 'Blessed are the poor in spirit: for theirs is the kingdom of heaven.' },
    { book: 'matthew',       chapter: 5,   verse: 9,   reference: 'Matthew 5:9',          text: 'Blessed are the peacemakers: for they shall be called the children of God.' },
    { book: 'matthew',       chapter: 11,  verse: 28,  reference: 'Matthew 11:28',        text: 'Come unto me, all ye that labour and are heavy laden, and I will give you rest.' },
    { book: 'matthew',       chapter: 28,  verse: 19,  reference: 'Matthew 28:19',        text: 'Go ye therefore, and teach all nations, baptizing them in the name of the Father, and of the Son, and of the Holy Ghost.' },
    { book: 'luke',          chapter: 1,   verse: 37,  reference: 'Luke 1:37',            text: 'For with God nothing shall be impossible.' },
    { book: 'luke',          chapter: 6,   verse: 31,  reference: 'Luke 6:31',            text: 'And as ye would that men should do to you, do ye also to them likewise.' },
    { book: 'mark',          chapter: 10,  verse: 27,  reference: 'Mark 10:27',           text: 'And Jesus looking upon them saith, With men it is impossible, but not with God: for with God all things are possible.' },
    { book: 'romans',        chapter: 8,   verse: 28,  reference: 'Romans 8:28',          text: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.' },
    { book: 'romans',        chapter: 8,   verse: 38,  reference: 'Romans 8:38',          text: 'For I am persuaded, that neither death, nor life, nor angels, nor principalities, nor powers, nor things present, nor things to come, shall be able to separate us from the love of God.' },
    { book: 'romans',        chapter: 12,  verse: 2,   reference: 'Romans 12:2',          text: 'And be not conformed to this world: but be ye transformed by the renewing of your mind, that ye may prove what is that good, and acceptable, and perfect, will of God.' },
    { book: 'philippians',   chapter: 4,   verse: 13,  reference: 'Philippians 4:13',     text: 'I can do all things through Christ which strengtheneth me.' },
    { book: 'philippians',   chapter: 4,   verse: 6,   reference: 'Philippians 4:6',      text: 'Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.' },
    { book: 'galatians',     chapter: 5,   verse: 22,  reference: 'Galatians 5:22',       text: 'But the fruit of the Spirit is love, joy, peace, longsuffering, gentleness, goodness, faith.' },
    { book: '1-corinthians', chapter: 13,  verse: 4,   reference: '1 Corinthians 13:4',   text: 'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up.' },
    { book: '1-corinthians', chapter: 13,  verse: 13,  reference: '1 Corinthians 13:13',  text: 'And now abideth faith, hope, charity, these three; but the greatest of these is charity.' },
    { book: 'ephesians',     chapter: 2,   verse: 8,   reference: 'Ephesians 2:8',        text: 'For by grace are ye saved through faith; and that not of yourselves: it is the gift of God.' },
    { book: 'ephesians',     chapter: 6,   verse: 10,  reference: 'Ephesians 6:10',       text: 'Finally, my brethren, be strong in the Lord, and in the power of his might.' },
    { book: '2-timothy',     chapter: 1,   verse: 7,   reference: '2 Timothy 1:7',        text: 'For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.' },
    { book: 'hebrews',       chapter: 11,  verse: 1,   reference: 'Hebrews 11:1',         text: 'Now faith is the substance of things hoped for, the evidence of things not seen.' },
    { book: 'hebrews',       chapter: 13,  verse: 8,   reference: 'Hebrews 13:8',         text: 'Jesus Christ the same yesterday, and to day, and for ever.' },
    { book: '1-john',        chapter: 4,   verse: 8,   reference: '1 John 4:8',           text: 'He that loveth not knoweth not God; for God is love.' },
    { book: '1-john',        chapter: 4,   verse: 19,  reference: '1 John 4:19',          text: 'We love him, because he first loved us.' },
    { book: '1-peter',       chapter: 5,   verse: 7,   reference: '1 Peter 5:7',          text: 'Casting all your care upon him; for he careth for you.' },
    { book: '2-corinthians', chapter: 5,   verse: 17,  reference: '2 Corinthians 5:17',   text: 'Therefore if any man be in Christ, he is a new creature: old things are passed away; behold, all things are become new.' },
    { book: '2-corinthians', chapter: 12,  verse: 9,   reference: '2 Corinthians 12:9',   text: 'And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness.' },
    { book: 'james',         chapter: 1,   verse: 17,  reference: 'James 1:17',           text: 'Every good gift and every perfect gift is from above, and cometh down from the Father of lights.' },
    { book: 'colossians',    chapter: 3,   verse: 16,  reference: 'Colossians 3:16',      text: 'Let the word of Christ dwell in you richly in all wisdom; teaching and admonishing one another in psalms and hymns and spiritual songs.' },
    { book: 'psalms',        chapter: 23,  verse: 1,   reference: 'Psalm 23:1',           text: 'The LORD is my shepherd; I shall not want.' },
    { book: 'psalms',        chapter: 46,  verse: 1,   reference: 'Psalm 46:1',           text: 'God is our refuge and strength, a very present help in trouble.' },
    { book: 'psalms',        chapter: 119, verse: 105, reference: 'Psalm 119:105',        text: 'Thy word is a lamp unto my feet, and a light unto my path.' },
    { book: 'psalms',        chapter: 27,  verse: 1,   reference: 'Psalm 27:1',           text: 'The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?' },
    { book: 'psalms',        chapter: 34,  verse: 8,   reference: 'Psalm 34:8',           text: 'O taste and see that the LORD is good: blessed is the man that trusteth in him.' },
    { book: 'psalms',        chapter: 91,  verse: 1,   reference: 'Psalm 91:1',           text: 'He that dwelleth in the secret place of the most High shall abide under the shadow of the Almighty.' },
    { book: 'psalms',        chapter: 37,  verse: 4,   reference: 'Psalm 37:4',           text: 'Delight thyself also in the LORD; and he shall give thee the desires of thine heart.' },
    { book: 'proverbs',      chapter: 3,   verse: 5,   reference: 'Proverbs 3:5',         text: 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.' },
    { book: 'proverbs',      chapter: 3,   verse: 6,   reference: 'Proverbs 3:6',         text: 'In all thy ways acknowledge him, and he shall direct thy paths.' },
    { book: 'proverbs',      chapter: 22,  verse: 6,   reference: 'Proverbs 22:6',        text: 'Train up a child in the way he should go: and when he is old, he will not depart from it.' },
    { book: 'isaiah',        chapter: 40,  verse: 31,  reference: 'Isaiah 40:31',         text: 'But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.' },
    { book: 'isaiah',        chapter: 41,  verse: 10,  reference: 'Isaiah 41:10',         text: 'Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.' },
    { book: 'isaiah',        chapter: 43,  verse: 2,   reference: 'Isaiah 43:2',          text: 'When thou passest through the waters, I will be with thee; and through the rivers, they shall not overflow thee.' },
    { book: 'jeremiah',      chapter: 29,  verse: 11,  reference: 'Jeremiah 29:11',       text: 'For I know the thoughts that I think toward you, saith the LORD, thoughts of peace, and not of evil, to give you an expected end.' },
    { book: 'joshua',        chapter: 1,   verse: 9,   reference: 'Joshua 1:9',           text: 'Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.' },
    { book: 'micah',         chapter: 6,   verse: 8,   reference: 'Micah 6:8',            text: 'He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?' },
    { book: 'genesis',       chapter: 1,   verse: 1,   reference: 'Genesis 1:1',          text: 'In the beginning God created the heaven and the earth.' },
    { book: 'numbers',       chapter: 6,   verse: 24,  reference: 'Numbers 6:24',         text: 'The LORD bless thee, and keep thee.' },
    { book: 'deuteronomy',   chapter: 31,  verse: 6,   reference: 'Deuteronomy 31:6',     text: 'Be strong and of a good courage, fear not, nor be afraid of them: for the LORD thy God, he it is that doth go with thee; he will not fail thee, nor forsake thee.' },
];

const JSDELIVR_BASE = 'https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/en-kjv/books';

function getDayOfYear() {
    const now = new Date();
    return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86_400_000);
}

export default function HeroBanner({ parishes = [] }) {
    const [query, setQuery]       = useState('');
    const [open, setOpen]         = useState(false);
    const [selected, setSelected] = useState(null);
    const wrapperRef              = useRef(null);
    // Verse of the day — pick today's entry deterministically
    const todayEntry = VERSE_LIST[getDayOfYear() % VERSE_LIST.length];

    // Start with embedded text (shown instantly, never blank)
    const [displayVerse, setDisplayVerse] = useState({
        text:      todayEntry.text,
        reference: todayEntry.reference,
    });

    // Attempt to upgrade with live KJV text from wldeh/bible-api via jsDelivr CDN
    useEffect(() => {
        const { book, chapter, verse, reference } = todayEntry;
        const url = `${JSDELIVR_BASE}/${book}/chapters/${chapter}/verses/${verse}.json`;

        fetch(url)
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(data => {
                if (data?.text) {
                    setDisplayVerse({
                        text:      data.text.trim().replace(/\n/g, ' '),
                        reference: reference,
                    });
                }
            })
            .catch(() => { /* keep embedded fallback silently */ });
    }, []);

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
                            &ldquo;{displayVerse.text}&rdquo;
                        </h1>

                        <p className="bethel-hero__subtitle">
                            — {displayVerse.reference}
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
