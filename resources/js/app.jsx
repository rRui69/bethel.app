import './bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/app.css';
import React from 'react';
import { createRoot } from 'react-dom/client';

import Home                from './pages/Home/home';
import Login               from './pages/Auth/Login';
import Register            from './pages/Auth/Register';
import SacramentsDropdown  from './components/SacramentsDropdown';
import NavBrand            from './components/NavBrand';

/*
PAGE REGISTRY
{ id }  must match the <div id="..."> in the Blade view exactly.
*/
const PAGE_REGISTRY = [
    { id: 'bethel-home',                Component: Home               },
    { id: 'bethel-login',               Component: Login              },
    { id: 'bethel-register',            Component: Register           },
    { id: 'bethel-sacraments-nav',      Component: SacramentsDropdown },
    { id: 'bethel-nav-brand',           Component: NavBrand           },
    { id: 'bethel-nav-brand-mobile',    Component: NavBrand           },
    { id: 'bethel-footer-brand',       Component: NavBrand           },
    // Future pages:
    // { id: 'bethel-mass-schedule',   Component: MassSchedule       },
    // { id: 'bethel-events',          Component: Events             },
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