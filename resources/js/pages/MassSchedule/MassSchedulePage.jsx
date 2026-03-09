import React, { useState, useEffect, useCallback } from 'react';
import { FaChurch, FaClock, FaLocationDot, FaUser, FaVideo, FaTriangleExclamation } from 'react-icons/fa6';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const TYPE_COLORS = {
    Regular:    { bg: 'rgba(26,60,94,0.07)',   accent: '#1a3c5e' },
    Family:     { bg: 'rgba(16,185,129,0.07)', accent: '#059669' },
    Youth:      { bg: 'rgba(139,92,246,0.07)', accent: '#7c3aed' },
    Daily:      { bg: 'rgba(245,158,11,0.07)', accent: '#b45309' },
    Evening:    { bg: 'rgba(99,102,241,0.07)', accent: '#4338ca' },
    Midday:     { bg: 'rgba(6,182,212,0.07)',  accent: '#0e7490' },
    Anticipated:{ bg: 'rgba(236,72,153,0.07)', accent: '#be185d' },
    Pilgrimage: { bg: 'rgba(239,68,68,0.07)',  accent: '#dc2626' },
};

function MassCard({ entry }) {
    const theme = TYPE_COLORS[entry.type] || TYPE_COLORS.Regular;
    const cancelled = entry.is_cancelled;

    return (
        <div style={{
            background: cancelled ? 'rgba(239,68,68,0.04)' : theme.bg,
            border: `1px solid ${cancelled ? 'rgba(239,68,68,0.2)' : 'var(--border-color, #e5e7eb)'}`,
            borderLeft: `4px solid ${cancelled ? '#ef4444' : theme.accent}`,
            borderRadius: '10px',
            padding: '16px 18px',
            opacity: cancelled ? 0.75 : 1,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Time + Type row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '1rem', color: cancelled ? '#9ca3af' : 'var(--text-color, #111)' }}>
                            <FaClock size={13} style={{ color: cancelled ? '#9ca3af' : theme.accent, flexShrink: 0 }} />
                            <span style={{ textDecoration: cancelled ? 'line-through' : 'none' }}>
                                {entry.start_time}{entry.end_time ? ` – ${entry.end_time}` : ''}
                            </span>
                        </div>
                        <span style={{
                            padding: '2px 9px', borderRadius: '20px', fontSize: '0.73rem', fontWeight: 600,
                            background: cancelled ? 'rgba(239,68,68,0.1)' : `${theme.accent}18`,
                            color: cancelled ? '#dc2626' : theme.accent,
                            border: `1px solid ${cancelled ? 'rgba(239,68,68,0.25)' : `${theme.accent}30`}`,
                        }}>
                            {cancelled ? 'CANCELLED' : entry.type}
                        </span>
                    </div>

                    {/* Meta row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                        {entry.parish && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <FaChurch size={11} style={{ flexShrink: 0 }} /> {entry.parish}
                            </span>
                        )}
                        {entry.city && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <FaLocationDot size={11} style={{ flexShrink: 0 }} /> {entry.city}
                            </span>
                        )}
                        {entry.celebrant && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <FaUser size={11} style={{ flexShrink: 0 }} /> {entry.celebrant}
                            </span>
                        )}
                    </div>

                    {/* Cancellation reason */}
                    {cancelled && entry.cancel_reason && (
                        <div style={{
                            marginTop: '8px', display: 'flex', alignItems: 'flex-start', gap: '7px',
                            fontSize: '0.82rem', color: '#dc2626',
                            padding: '8px 10px', borderRadius: '6px',
                            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                        }}>
                            <FaTriangleExclamation size={12} style={{ marginTop: '1px', flexShrink: 0 }} />
                            {entry.cancel_reason}
                        </div>
                    )}
                </div>

                {/* Watch Live button */}
                {!cancelled && entry.livestream_url && (
                    <a href={entry.livestream_url} target="_blank" rel="noopener noreferrer" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '7px',
                        padding: '8px 16px', borderRadius: '8px', flexShrink: 0,
                        background: '#ef4444', color: '#fff',
                        fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none',
                        transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        <FaVideo size={12} /> Watch Live
                    </a>
                )}
            </div>
        </div>
    );
}

function DaySection({ dayName, entries, isToday }) {
    if (entries.length === 0) return null;
    return (
        <div style={{ marginBottom: '32px' }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '16px',
            }}>
                <div style={{
                    padding: '6px 16px', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem',
                    background: isToday ? 'var(--primary, #1a3c5e)' : 'var(--bg-subtle, rgba(0,0,0,0.04))',
                    color: isToday ? '#fff' : 'var(--text-color, #111)',
                    border: isToday ? 'none' : '1px solid var(--border-color, #e5e7eb)',
                }}>
                    {dayName}
                    {isToday && <span style={{ marginLeft: '6px', fontSize: '0.72rem', opacity: 0.8 }}>— Today</span>}
                </div>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color, #e5e7eb)' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {entries.length} {entries.length === 1 ? 'mass' : 'masses'}
                </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {entries.map((entry, i) => <MassCard key={i} entry={entry} />)}
            </div>
        </div>
    );
}

export default function MassSchedulePage() {
    const { parishes = [] } = window.__PAGE_DATA__ || {};

    const [schedules,   setSchedules]   = useState(null);
    const [days,        setDays]        = useState(DAYS);
    const [weekStart,   setWeekStart]   = useState('');
    const [loading,     setLoading]     = useState(true);
    const [parishId,    setParishId]    = useState('');
    const [dayFilter,   setDayFilter]   = useState('');

    const todayDow = new Date().getDay(); // 0=Sun

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (parishId)  params.append('parish_id',  parishId);
            if (dayFilter !== '') params.append('day_of_week', dayFilter);

            const res  = await fetch(`/api/mass-schedules/public?${params}`);
            const data = await res.json();
            setSchedules(data.schedules);
            setDays(data.days || DAYS);
            setWeekStart(data.week_start);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [parishId, dayFilter]);

    useEffect(() => { load(); }, [load]);

    const totalCount = schedules
        ? Object.values(schedules).reduce((sum, day) => sum + day.length, 0)
        : 0;

    return (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>

            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                    Mass Schedule
                </h1>
                <p style={{ margin: '8px 0 0', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                    Weekly mass schedules across all parishes
                    {weekStart && <span> · Week of {new Date(weekStart + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>}
                </p>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex', gap: '12px', flexWrap: 'wrap',
                marginBottom: '32px', padding: '16px 20px',
                background: 'var(--card-bg, #fff)',
                border: '1px solid var(--border-color, #e5e7eb)',
                borderRadius: '12px',
            }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '6px' }}>Parish</label>
                    <select value={parishId} onChange={e => setParishId(e.target.value)} style={{
                        width: '100%', padding: '8px 12px', borderRadius: '8px', fontSize: '0.875rem',
                        border: '1.5px solid var(--border-color, #d1d5db)',
                        background: 'var(--input-bg, #fff)', color: 'var(--text-color, #111)',
                    }}>
                        <option value="">All Parishes</option>
                        {parishes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div style={{ minWidth: 160 }}>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '6px' }}>Day</label>
                    <select value={dayFilter} onChange={e => setDayFilter(e.target.value)} style={{
                        width: '100%', padding: '8px 12px', borderRadius: '8px', fontSize: '0.875rem',
                        border: '1.5px solid var(--border-color, #d1d5db)',
                        background: 'var(--input-bg, #fff)', color: 'var(--text-color, #111)',
                    }}>
                        <option value="">All Days</option>
                        {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                    </select>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    Loading schedules…
                </div>
            ) : totalCount === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '64px 32px',
                    background: 'var(--card-bg, #fff)',
                    border: '1px solid var(--border-color, #e5e7eb)',
                    borderRadius: '12px', color: 'var(--text-muted)',
                }}>
                    <FaChurch size={36} style={{ opacity: 0.2, marginBottom: '16px' }} />
                    <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '6px' }}>No schedules found</div>
                    <div style={{ fontSize: '0.875rem' }}>Try changing your filters above.</div>
                </div>
            ) : (
                schedules && days.map((dayName, i) => (
                    <DaySection
                        key={i}
                        dayName={dayName}
                        entries={schedules[i] || []}
                        isToday={i === todayDow}
                    />
                ))
            )}
        </div>
    );
}