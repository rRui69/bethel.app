import React from 'react';
import {
    FaHandsPraying, 
    FaUsers,
    FaChurch,
    FaCalendarPlus, 
    FaBullhorn, 
    FaArrowRight,
} from 'react-icons/fa6';

import { 
    PiCertificateFill ,
} from "react-icons/pi";

const CARDS = [
    {
        id:       'sacraments',
        label:    'Pending Sacrament Requests For Review',
        key:      'pending_sacrament_requests',
        icon:     PiCertificateFill ,
        iconBg:   'rgba(200,151,58,0.15)',
        iconColor:'#c8973a',
        accent:   '#c8973a',
        link:     '/admin/sacraments',
        linkText: 'Review Requests',
    },
    {
        id:       'parishioners',
        label:    'Total Registered Parishioners',
        key:      'total_parishioners',
        icon:     FaUsers,
        iconBg:   'rgba(59,130,246,0.15)',
        iconColor:'#3b82f6',
        accent:   '#3b82f6',
        link:     '/admin/parishioners',
        linkText: 'View All',
    },
    {
        id:       'Events',
        label:    'Scheduled Events',
        key:      'active_events',
        icon:     FaChurch,
        iconBg:   'rgba(16,185,129,0.15)',
        iconColor:'#10b981',
        accent:   '#10b981',
        link:     '/admin/sacraments',
        linkText: 'Manage Schedule',
    },
];

function StatCard({ card, value }) {
    const { label, icon: Icon, iconBg, iconColor, accent, link, linkText } = card;

    return (
        <div className="col-lg-3 col-md-6">
            <div className="admin-stat-card" style={{ '--card-accent': accent }}>
                <div className="d-flex flex-column align-items-center justify-content-center text-center"
                    style={{ minHeight: "120px" }}>
                    
                    <div className="stat-card__icon mb-2" style={{ background: iconBg }}>
                        <Icon size={50} color={iconColor} />
                    </div>

                    <div className="stat-card__value">{value ?? 0}</div>
                    <div className="stat-card__label">{label}</div>
                </div>
                <div className="stat-card__action">
                    <a href={link} className="stat-card__link">
                        {linkText} <FaArrowRight size={10} />
                    </a>
                </div>
            </div>
        </div>
    );
}

function QuickActionCard({ stats }) {
    return (
        <div className="col-lg-3 col-md-6">
            <div className="admin-stat-card quick-action-card" style={{ '--card-accent': '#c8973a' }}>
                <div className="d-flex align-items-center gap-2 mb-1">
                    <div className="stat-card__icon" style={{ background: 'rgba(200,151,58,0.2)', width: 40, height: 40, marginBottom: 0 }}>
                        <FaCalendarPlus size={18} color="#c8973a" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                            Quick Create
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {stats?.active_events ?? 0} events · {stats?.active_announcements ?? 0} posts active
                        </div>
                    </div>
                </div>

                <div className="stat-card__action" style={{ flexDirection: 'column', gap: '0.5rem', alignItems: 'stretch' }}>
                    <div className="d-flex gap-2">
                        <a href="/admin/events/create" className="quick-action-btn primary">
                            <FaCalendarPlus size={20} /> New Event
                        </a>
                    </div>
                    <div className="d-flex gap-2">
                        <a href="/admin/announcements/create" className="quick-action-btn secondary">
                            <FaBullhorn size={20} /> Announcement
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function StatCards({ stats }) {
    return (
        <div className="row g-3 mb-4">
            {CARDS.map(card => (
                <StatCard key={card.id} card={card} value={stats?.[card.key]} />
            ))}
            <QuickActionCard stats={stats} />
        </div>
    );
}