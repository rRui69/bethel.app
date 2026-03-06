import './bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';

import Home                   from './pages/Home/home';
import Login                  from './pages/Auth/Login';
import Register               from './pages/Auth/Register';
import SacramentsDropdown     from './components/SacramentsDropdown';
import NavBrand               from './components/NavBrand';
import AnnouncementsPage      from './pages/Announcements/AnnouncementsPage';
import AnnouncementDetailPage from './pages/Announcements/AnnouncementDetailPage';
import EventsPage             from './pages/Events/EventsPage';
import EventDetailPage        from './pages/Events/EventDetailPage';
import AdminApp               from './pages/Admin/AdminApp';

const PAGE_REGISTRY = [
    { id: 'bethel-home',                Component: Home                   },
    { id: 'bethel-login',               Component: Login                  },
    { id: 'bethel-register',            Component: Register               },
    { id: 'bethel-sacraments-nav',      Component: SacramentsDropdown     },
    { id: 'bethel-nav-brand',           Component: NavBrand               },
    { id: 'bethel-nav-brand-mobile',    Component: NavBrand               },
    { id: 'bethel-footer-brand',        Component: NavBrand               },
    { id: 'bethel-announcements',       Component: AnnouncementsPage      },
    { id: 'bethel-announcement-detail', Component: AnnouncementDetailPage },
    { id: 'bethel-events-page',         Component: EventsPage             },
    { id: 'bethel-event-detail',        Component: EventDetailPage        },
    { id: 'bethel-admin-app',           Component: AdminApp               },
];

PAGE_REGISTRY.forEach(({ id, Component }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const props = window.__PAGE_DATA__ ?? {};
    createRoot(el).render(
        <React.StrictMode>
            <Component {...props} />
        </React.StrictMode>
    );
});