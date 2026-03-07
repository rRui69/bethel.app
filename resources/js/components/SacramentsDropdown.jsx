import React, { useState, useEffect } from 'react';
import ICON_MAP from '@/config/iconMap';
import { FaChevronRight, FaSpinner } from 'react-icons/fa6';

/**
 * SacramentsDropdown
 * Fetches active sacrament types from the DB on mount.
 * Shows first 3 in the dropdown, then a "View All" link.
 */
export default function SacramentsDropdown() {
    const [sacraments, setSacraments] = useState([]);
    const [loading,    setLoading]    = useState(true);

    useEffect(() => {
        fetch('/api/sacrament-types')
            .then(r => r.json())
            .then(json => setSacraments(json.data ?? []))
            .catch(() => setSacraments([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <li className="dropdown-item d-flex align-items-center gap-2 py-2"
                style={{ color: '#888', fontSize: '0.82rem', pointerEvents: 'none' }}>
                <FaSpinner size={12} style={{ animation: 'spin 1s linear infinite' }} />
                Loading…
            </li>
        );
    }

    if (sacraments.length === 0) {
        return (
            <li className="dropdown-item py-2"
                style={{ color: '#888', fontSize: '0.82rem', pointerEvents: 'none' }}>
                No sacraments available.
            </li>
        );
    }

    // Show first 3 in the dropdown; rest are on /sacraments
    const visible = sacraments.slice(0, 3);

    return (
        <>
            {visible.map(({ id, name, description, href, icon, icon_color, icon_bg }) => {
                const Icon = ICON_MAP[icon]?.Icon ?? ICON_MAP['hands'].Icon;
                return (
                    <li key={id}>
                        <a
                            className="dropdown-item d-flex align-items-center gap-2 py-2"
                            href={href}
                            aria-label={description}
                        >
                            <span style={{
                                width: '28px', height: '28px', borderRadius: '6px',
                                background: icon_bg, display: 'grid',
                                placeItems: 'center', flexShrink: 0,
                            }}>
                                <Icon size={14} color={icon_color} aria-hidden="true" />
                            </span>

                            <span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1a3c5e', display: 'block', lineHeight: 1.2 }}>
                                    {name}
                                </span>
                                {description && (
                                    <span style={{ fontSize: '0.72rem', color: '#888', lineHeight: 1 }}>
                                        {description}
                                    </span>
                                )}
                            </span>
                        </a>
                    </li>
                );
            })}

            {sacraments.length > 3 && (
                <li>
                    <span style={{ fontSize: '0.72rem', color: '#aaa', padding: '2px 16px', display: 'block' }}>
                        +{sacraments.length - 3} more available
                    </span>
                </li>
            )}

            <li><hr className="dropdown-divider" /></li>
            <li>
                <a className="dropdown-item fw-semibold d-flex align-items-center gap-1"
                   href="/sacraments"
                   style={{ color: 'var(--bethel-primary)', fontSize: '0.875rem' }}>
                    View All Sacraments
                    <FaChevronRight size={10} />
                </a>
            </li>
        </>
    );
}