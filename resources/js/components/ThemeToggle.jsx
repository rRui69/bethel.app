import React, { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa6';

const STORAGE_KEY = 'bethel-theme';

function getInitialTheme() {
    // Read what the inline <head> script already applied
    return document.documentElement.getAttribute('data-theme') || 'light';
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState(getInitialTheme);

    // Sync whenever theme changes
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [theme]);

    const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');

    const isDark = theme === 'dark';

    return (
        <button
            className="bethel-theme-btn"
            onClick={toggle}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {isDark
                ? <FaSun  size={15} color="#c8973a" />
                : <FaMoon size={15} color="rgba(255,255,255,0.85)" />
            }
        </button>
    );
}