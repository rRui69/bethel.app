import React from 'react';
import StatCards  from './StatCards';
import ParishTable from './ParishTable';

export default function Dashboard({ stats, parishes }) {
    return (
        <div>
            {/* Page Header */}
            <div className="admin-page-header">
                <h1 className="admin-page-header__title">Dashboard Overview</h1>
                <p className="admin-page-header__sub">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Stat Cards */}
            <StatCards stats={stats} />

            {/* Parish Status Table */}
            <ParishTable parishes={parishes} />
        </div>
    );
}