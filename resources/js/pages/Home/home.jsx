import React from 'react';
import HeroBanner from './HeroBanner';

/**
 * Homepage — search-hero only.
 * All parish content (schedules, announcements, events, clergy)
 * lives on /parish/{id}.
 */
export default function Home({ parishes = [] }) {
    return <HeroBanner parishes={parishes} />;
}