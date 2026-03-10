import './bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';

import Home                     from './pages/Home/home';
import Login                    from './pages/Auth/Login';
import Register                 from './pages/Auth/Register';
import SacramentsDropdown       from './components/SacramentsDropdown';
import NavBrand                 from './components/NavBrand';
import ThemeToggle              from './components/ThemeToggle';
import AnnouncementsPage        from './pages/Announcements/AnnouncementsPage';
import AnnouncementDetailPage   from './pages/Announcements/AnnouncementDetailPage';
import EventsPage               from './pages/Events/EventsPage';
import EventDetailPage          from './pages/Events/EventDetailPage';
import ProfilePage              from './pages/Profile/ProfilePage';
import SacramentsPage           from './pages/Sacraments/SacramentsPage';
import SacramentFormPage        from './pages/Sacraments/SacramentFormPage';
import MyBookingsPage           from './pages/Sacraments/MyBookingsPage';
import NotificationBell         from './components/NotificationBell';
import InboxPage                from './pages/Inbox/InboxPage';
import MassSchedulePage         from './pages/MassSchedule/MassSchedulePage';
import LivestreamPage           from './pages/Livestream/LivestreamPage';

const PAGE_REGISTRY = [
    { id: 'bethel-home',                Component: Home                     },
    { id: 'bethel-login',               Component: Login                    },
    { id: 'bethel-register',            Component: Register                 },
    { id: 'bethel-sacraments-nav',      Component: SacramentsDropdown       },
    { id: 'bethel-nav-brand',           Component: NavBrand                 },
    { id: 'bethel-nav-brand-mobile',    Component: NavBrand                 },
    { id: 'bethel-footer-brand',        Component: NavBrand                 },
    { id: 'bethel-theme-toggle',        Component: ThemeToggle              },
    { id: 'bethel-theme-toggle-mobile', Component: ThemeToggle              },
    { id: 'bethel-announcements',       Component: AnnouncementsPage        },
    { id: 'bethel-announcement-detail', Component: AnnouncementDetailPage   },
    { id: 'bethel-events-page',         Component: EventsPage               },
    { id: 'bethel-event-detail',        Component: EventDetailPage          },
    { id: 'bethel-profile',             Component: ProfilePage              },
    { id: 'bethel-sacraments-page',     Component: SacramentsPage           },
    { id: 'bethel-sacrament-form',      Component: SacramentFormPage        },
    { id: 'bethel-my-bookings',         Component: MyBookingsPage           },
    { id: 'bethel-notification-bell',   Component: NotificationBell         },
    { id: 'bethel-inbox',               Component: InboxPage                },
    { id: 'bethel-mass-schedule-page',  Component: MassSchedulePage         },
    { id: 'bethel-livestream-page',     Component: LivestreamPage           },
];

PAGE_REGISTRY.forEach(({ id, Component }) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Merge global page data with any data-* attributes on the element
    const globalProps = window.__PAGE_DATA__ ?? {};
    const elProps     = Object.fromEntries(
        Array.from(el.attributes)
            .filter(a => a.name.startsWith('data-'))
            .map(a => {
                const key = a.name.replace(/^data-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
                const val = a.value === 'true' ? true : a.value === 'false' ? false : a.value;
                return [key, val];
            })
    );
    createRoot(el).render(
        <React.StrictMode>
            <Component {...globalProps} {...elProps} />
        </React.StrictMode>
    );
});