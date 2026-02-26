import React, { useState, useRef, useEffect } from 'react';

export default function HeroBanner({ parishes = [] }) {
    const [query, setQuery]         = useState('');
    const [open, setOpen]           = useState(false);
    const [selected, setSelected]   = useState(null);
    const wrapperRef                = useRef(null);

    const filtered = query.length > 0
        ? parishes.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
        : [];

    // Close dropdown on outside click
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
    }

    return (
        <section className="bethel-hero d-flex align-items-center" aria-label="Hero Banner">
            <div className="container position-relative">
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
                        <div className="bethel-hero__search position-relative mx-auto" style={{ maxWidth: '520px' }} ref={wrapperRef}>
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
                                    style={{ background: 'var(--bethel-secondary)', color: 'var(--bethel-primary)', borderRadius: '0 0.5rem 0.5rem 0' }}
                                    onClick={() => selected && (window.location.href = `/parishes/${selected.id}`)}
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