import React from 'react';

// ── CHANGE YOUR BRAND ICON HERE ───────────────────────────────────
// Browse icons: https://react-icons.github.io/react-icons
// Then swap the import and the <BrandIcon /> usage below.
// ─────────────────────────────────────────────────────────────────
import { FaChurch } from 'react-icons/fa6';  

// ── BRAND CONFIG ──────────────────────────────────────────────────
// Edit these values to update the brand across navbar + anywhere
// else NavBrand is used.
const BRAND = {
    href:       '/',
    nameFirst:  'Bethel',
    nameLast:   'App',           // this part gets the gold color
    iconSize:   20,
    iconColor:  '#1a3c5e',       // icon color (navy)
    badgeBg:    '#c8973a',       // icon badge background (gold)

    // ── use PNG/SVG  ──
    // 1. Drop your file in public/images/bethel-logo.png
    // 2. Set useCustomImage: true
    // 3. Set imageSrc to the path
    useCustomImage: false,
    imageSrc:       '/images/bethel-logo.png',
    imageHeight:    36,
};

export default function NavBrand() {
    return (
            <a href={BRAND.href}
            className="navbar-brand d-flex align-items-center gap-2"
            style={{ textDecoration: 'none' }}
            >

            {/* ── Icon / Logo ───────────────────────────────────────
                Toggle between React Icon and custom PNG/SVG.
                To switch: set BRAND.useCustomImage = true above.
            ──────────────────────────────────────────────────────── */}
            {BRAND.useCustomImage ? (
                <img
                    src={BRAND.imageSrc}
                    alt="BethelApp Logo"
                    height={BRAND.imageHeight}
                    style={{ objectFit: 'contain' }}
                />
            ) : (
                <span
                    className="brand-icon"
                    style={{
                        width:        '36px',
                        height:       '36px',
                        background:   BRAND.badgeBg,
                        borderRadius: '8px',
                        display:      'grid',
                        placeItems:   'center',
                        flexShrink:   0,
                    }}
                >
                    {/* ── SWAP ICON HERE ── */}
                    <FaChurch
                        size={BRAND.iconSize}
                        color={BRAND.iconColor}
                        aria-hidden="true"
                    />
                </span>
            )}

            {/* ── Brand Name ── */}
            <span style={{ fontWeight: 700, fontSize: '1.3rem', letterSpacing: '-0.3px', color: '#fff' }}>
                {BRAND.nameFirst}
                <span style={{ color: BRAND.badgeBg }}>{BRAND.nameLast}</span>
            </span>
        </a>
    );
}