import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/admin.css';
import './bootstrap';

import React from 'react';
import { createRoot } from 'react-dom/client';
import AdminApp from './pages/Admin/AdminApp';

const el = document.getElementById('bethel-admin');

if (el) {
    const data = window.__ADMIN_DATA__ ?? {};
    createRoot(el).render(
        <React.StrictMode>
            <AdminApp
                stats={data.stats}
                admin={data.admin}
                parishes={data.parishes}
                clergy={data.clergy}
                notifications={data.notifications}
                paymentStats={data.payment_stats}
                userStats={data.user_stats}
                recentPayments={data.recent_payments}
                recentUsers={data.recent_users}
            />
        </React.StrictMode>
    );
}
