import React from 'react';
import SACRAMENTS from '@/config/sacraments';

/**
 * SacramentsDropdown
 * Renders inside the navbar's dropdown menu.
 * Pulls from the same SACRAMENTS config as QuickLinks.jsx.
 */
export default function SacramentsDropdown() {
    return (
        <>
            {SACRAMENTS.map(({ id, label, desc, href, Icon, color, bg }) => (
                <li key={id}>
                    <a
                        className="dropdown-item d-flex align-items-center gap-2 py-2"
                        href={href}
                        aria-label={desc}
                    >
                        {/* ── Icon badge — mirrors QuickLinks style ── */}
                        <span
                            style={{
                                width:          '28px',
                                height:         '28px',
                                borderRadius:   '6px',
                                background:     bg,
                                display:        'grid',
                                placeItems:     'center',
                                flexShrink:     0,
                            }}
                        >
                            <Icon size={14} color={color} aria-hidden="true" />
                        </span>

                        <span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a3c5e', display: 'block', lineHeight: 1.2 }}>
                                {label}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#888', lineHeight: 1 }}>
                                {desc}
                            </span>
                        </span>
                    </a>
                </li>
            ))}

            <li><hr className="dropdown-divider" /></li>
            <li>
                <a className="dropdown-item fw-semibold d-flex align-items-center gap-1"
                   href="/sacraments"
                   style={{ color: 'var(--bethel-primary)', fontSize: '0.875rem' }}>
                    View All Sacraments
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"/>
                    </svg>
                </a>
            </li>
        </>
    );
}