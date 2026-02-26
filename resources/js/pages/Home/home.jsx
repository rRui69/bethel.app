import React from 'react';
import HeroBanner      from './HeroBanner';
import MassSchedule    from './MassSchedule';
import AnnouncementCards from './AnnouncementCards';
import UpcomingEvents  from './UpcomingEvents';
import QuickLinks      from './QuickLinks';

export default function Home({ parishes = [], announcements = [], schedules = [], events = [] }) {
    return (
        <>
            <HeroBanner parishes={parishes} />
            <QuickLinks />
            <AnnouncementCards announcements={announcements} />
            <MassSchedule schedules={schedules} />
            <UpcomingEvents events={events} />
        </>
    );
}