import React, { useState, useEffect, useCallback } from 'react';
import { FaChurch, FaClock, FaLocationDot, FaUser, FaVideo, FaTriangleExclamation } from 'react-icons/fa6';

const DAYS       = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const PRIMARY = '#1a3c5e';

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

/* ─── Mass Card ─────────────────────────────────────────────────────────── */
function MassCard({ entry }) {
    const theme     = TYPE_COLORS[entry.type] || TYPE_COLORS.Regular;
    const cancelled = entry.is_cancelled;

    return (
        <div style={{
            background:   cancelled ? 'rgba(239,68,68,0.04)' : theme.bg,
            border:       `1px solid ${cancelled ? 'rgba(239,68,68,0.2)' : 'var(--border-color,#e5e7eb)'}`,
            borderLeft:   `4px solid ${cancelled ? '#ef4444' : theme.accent}`,
            borderRadius: '10px',
            padding:      '16px 18px',
            opacity:       cancelled ? 0.75 : 1,
        }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px', flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:0 }}>

                    {/* Time + Type */}
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px', flexWrap:'wrap' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px', fontWeight:700, fontSize:'1rem', color: cancelled ? '#9ca3af' : 'var(--text-color,#111)' }}>
                            <FaClock size={13} style={{ color: cancelled ? '#9ca3af' : theme.accent, flexShrink:0 }} />
                            <span style={{ textDecoration: cancelled ? 'line-through' : 'none' }}>
                                {entry.start_time}{entry.end_time ? ` – ${entry.end_time}` : ''}
                            </span>
                        </div>
                        <span style={{
                            padding:'2px 9px', borderRadius:'20px', fontSize:'0.73rem', fontWeight:600,
                            background: cancelled ? 'rgba(239,68,68,0.1)' : `${theme.accent}18`,
                            color:      cancelled ? '#dc2626' : theme.accent,
                            border:     `1px solid ${cancelled ? 'rgba(239,68,68,0.25)' : `${theme.accent}30`}`,
                        }}>
                            {cancelled ? 'CANCELLED' : entry.type}
                        </span>
                    </div>

                    {/* Meta */}
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'12px', fontSize:'0.83rem', color:'var(--text-muted)' }}>
                        {entry.parish    && <span style={{ display:'flex', alignItems:'center', gap:'5px' }}><FaChurch      size={11} style={{ flexShrink:0 }} />{entry.parish}</span>}
                        {entry.city      && <span style={{ display:'flex', alignItems:'center', gap:'5px' }}><FaLocationDot size={11} style={{ flexShrink:0 }} />{entry.city}</span>}
                        {entry.celebrant && <span style={{ display:'flex', alignItems:'center', gap:'5px' }}><FaUser        size={11} style={{ flexShrink:0 }} />{entry.celebrant}</span>}
                    </div>

                    {/* Cancel reason */}
                    {cancelled && entry.cancel_reason && (
                        <div style={{
                            marginTop:'8px', display:'flex', alignItems:'flex-start', gap:'7px',
                            fontSize:'0.82rem', color:'#dc2626',
                            padding:'8px 10px', borderRadius:'6px',
                            background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)',
                        }}>
                            <FaTriangleExclamation size={12} style={{ marginTop:'1px', flexShrink:0 }} />
                            {entry.cancel_reason}
                        </div>
                    )}
                </div>

                {/* Watch Live */}
                {!cancelled && entry.livestream_url && (
                    <a href={entry.livestream_url} target="_blank" rel="noopener noreferrer" style={{
                        display:'inline-flex', alignItems:'center', gap:'7px',
                        padding:'8px 16px', borderRadius:'8px', flexShrink:0,
                        background:'#ef4444', color:'#fff',
                        fontSize:'0.8rem', fontWeight:600, textDecoration:'none', transition:'opacity 0.15s',
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

/* ─── Day Tab Bar ────────────────────────────────────────────────────────── */
function DayTabBar({ schedules, selectedDay, todayDow, onSelect }) {
    return (
        <div style={{
            width:           '100%',
            background:      'var(--card-bg,#fff)',
            border:          '1px solid var(--border-color,#e5e7eb)',
            borderRadius:    '14px',
            overflow:        'hidden',
            marginBottom:    '24px',
        }}>
            {/* Table header row */}
            <div style={{
                display:             'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                background:          'rgba(26,60,94,0.03)',
                borderBottom:        '2px solid var(--border-color,#e5e7eb)',
            }}>
                {DAYS.map((day, i) => (
                    <div key={i} style={{
                        padding:     '8px 4px',
                        textAlign:   'center',
                        fontSize:    '0.68rem',
                        fontWeight:   700,
                        textTransform:'uppercase',
                        letterSpacing:'0.07em',
                        color:       'var(--text-muted,#6b7280)',
                        borderRight: i < 6 ? '1px solid var(--border-color,#e5e7eb)' : 'none',
                    }}>
                        {DAYS_SHORT[i]}
                    </div>
                ))}
            </div>

            {/* Clickable day cells */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)' }}>
            {DAYS.map((day, i) => {
                const isSelected = selectedDay === i;
                const isToday    = todayDow === i;
                const count      = schedules ? (schedules[i] || []).length : 0;

                return (
                    <button
                        key={i}
                        onClick={() => onSelect(i)}
                        style={{
                            position:       'relative',
                            display:        'flex',
                            flexDirection:  'column',
                            alignItems:     'center',
                            justifyContent: 'center',
                            gap:            '6px',
                            padding:        '14px 6px',
                            border:         'none',
                            borderRight:    i < 6 ? '1px solid var(--border-color,#e5e7eb)' : 'none',
                            borderBottom:   isSelected ? `3px solid ${PRIMARY}` : '3px solid transparent',
                            background:     isSelected ? `rgba(26,60,94,0.07)` : 'transparent',
                            cursor:         'pointer',
                            transition:     'background 0.15s',
                        }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(26,60,94,0.04)'; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                    >
                        {/* Today dot */}
                        {isToday && (
                            <span style={{
                                position:     'absolute',
                                top:          '6px',
                                width:        '6px', height:'6px',
                                borderRadius: '50%',
                                background:   PRIMARY,
                            }} />
                        )}

                        {/* Full day name */}
                        <span style={{
                            fontSize:  '0.85rem',
                            fontWeight: isSelected ? 700 : 500,
                            color:      isSelected ? PRIMARY : 'var(--text-color,#111)',
                            whiteSpace: 'nowrap',
                            overflow:   'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth:   '100%',
                        }}>
                            {day}
                        </span>

                        {/* Count badge */}
                        <span style={{
                            minWidth:    '20px',
                            padding:     '1px 6px',
                            borderRadius:'20px',
                            fontSize:    '0.7rem',
                            fontWeight:   700,
                            textAlign:   'center',
                            background:   count > 0
                                ? (isSelected ? PRIMARY : 'rgba(26,60,94,0.1)')
                                : 'rgba(0,0,0,0.05)',
                            color:        count > 0
                                ? (isSelected ? '#fff' : PRIMARY)
                                : 'var(--text-muted,#9ca3af)',
                        }}>
                            {count}
                        </span>
                    </button>
                );
            })}
            </div>
        </div>
    );
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function MassSchedulePage() {
    const { parishes = [] } = window.__PAGE_DATA__ || {};

    const todayDow = new Date().getDay();

    const [schedules,    setSchedules]    = useState(null);
    const [weekStart,    setWeekStart]    = useState('');
    const [loading,      setLoading]      = useState(true);
    const [parishId,     setParishId]     = useState('');
    const [selectedDay,  setSelectedDay]  = useState(todayDow);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (parishId) params.append('parish_id', parishId);

            const res  = await fetch(`${window.location.origin}/api/mass-schedules/public?${params}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            setSchedules(data.schedules);
            setWeekStart(data.week_start);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [parishId]);

    useEffect(() => { load(); }, [load]);

    const activeEntries = schedules ? (schedules[selectedDay] || []) : [];

    const weekLabel = weekStart
        ? new Date(weekStart + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : '';

    return (
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px' }}>

            {/* ── Header ── */}
            <div style={{ marginBottom: '28px', display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
                <div>
                    <h1 style={{ margin:0, fontSize:'1.75rem', fontWeight:800, letterSpacing:'-0.02em' }}>
                        Mass Schedule
                    </h1>
                    <p style={{ margin:'6px 0 0', fontSize:'0.92rem', color:'var(--text-muted)' }}>
                        Weekly schedules across all parishes
                        {weekLabel && <span style={{ marginLeft:'6px', opacity:0.7 }}>· Week of {weekLabel}</span>}
                    </p>
                </div>

                {/* Parish filter — moved to header row */}
                <div style={{ minWidth: 200 }}>
                    <label style={{
                        display:'block', fontSize:'0.72rem', fontWeight:700,
                        textTransform:'uppercase', letterSpacing:'0.06em',
                        color:'var(--text-muted)', marginBottom:'5px',
                    }}>
                        Filter by Parish
                    </label>
                    <select
                        value={parishId}
                        onChange={e => setParishId(e.target.value)}
                        style={{
                            width:'100%', padding:'8px 12px', borderRadius:'8px', fontSize:'0.875rem',
                            border:'1.5px solid var(--border-color,#d1d5db)',
                            background:'var(--input-bg,#fff)', color:'var(--text-color,#111)',
                        }}
                    >
                        <option value="">All Parishes</option>
                        {parishes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>

            {/* ── Day Tab Bar ── */}
            {loading ? (
                /* skeleton tabs while loading */
                <div style={{
                    background:'var(--card-bg,#fff)',
                    border:'1px solid var(--border-color,#e5e7eb)',
                    borderRadius:'14px', overflow:'hidden', marginBottom:'24px',
                }}>
                    {/* header row skeleton */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', background:'rgba(26,60,94,0.03)', borderBottom:'2px solid var(--border-color,#e5e7eb)' }}>
                        {DAYS_SHORT.map(d => (
                            <div key={d} style={{ padding:'8px 4px', textAlign:'center' }}>
                                <div style={{ height:'10px', borderRadius:'4px', background:'rgba(0,0,0,0.08)', margin:'0 auto', width:'60%' }} />
                            </div>
                        ))}
                    </div>
                    {/* cell row skeleton */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
                        {DAYS_SHORT.map(d => (
                            <div key={d} style={{ padding:'14px 6px', textAlign:'center', borderRight:'1px solid var(--border-color,#e5e7eb)' }}>
                                <div style={{ height:'14px', borderRadius:'4px', background:'rgba(0,0,0,0.06)', margin:'0 auto 8px', width:'80%' }} />
                                <div style={{ height:'18px', borderRadius:'10px', background:'rgba(0,0,0,0.04)', margin:'0 auto', width:'28px' }} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <DayTabBar
                    schedules={schedules}
                    selectedDay={selectedDay}
                    todayDow={todayDow}
                    onSelect={setSelectedDay}
                />
            )}

            {/* ── Selected Day Label ── */}
            {!loading && (
                <div style={{
                    display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px',
                }}>
                    <span style={{
                        padding:'5px 14px', borderRadius:'20px', fontWeight:700, fontSize:'0.88rem',
                        background: PRIMARY, color:'#fff',
                    }}>
                        {DAYS[selectedDay]}
                        {selectedDay === todayDow && (
                            <span style={{ marginLeft:'6px', fontSize:'0.72rem', opacity:0.8 }}>— Today</span>
                        )}
                    </span>
                    <div style={{ flex:1, height:'1px', background:'var(--border-color,#e5e7eb)' }} />
                    <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', whiteSpace:'nowrap' }}>
                        {activeEntries.length} {activeEntries.length === 1 ? 'mass' : 'masses'}
                    </span>
                </div>
            )}

            {/* ── Content ── */}
            {loading ? (
                <div style={{ textAlign:'center', padding:'64px', color:'var(--text-muted)', fontSize:'0.9rem' }}>
                    Loading schedules…
                </div>
            ) : activeEntries.length === 0 ? (
                <div style={{
                    textAlign:'center', padding:'64px 32px',
                    background:'var(--card-bg,#fff)',
                    border:'1px solid var(--border-color,#e5e7eb)',
                    borderRadius:'12px', color:'var(--text-muted)',
                }}>
                    <FaChurch size={36} style={{ opacity:0.2, marginBottom:'16px' }} />
                    <div style={{ fontWeight:600, fontSize:'1rem', marginBottom:'6px' }}>
                        No masses on {DAYS[selectedDay]}
                    </div>
                    <div style={{ fontSize:'0.875rem' }}>
                        Select another day or change the parish filter.
                    </div>
                </div>
            ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    {activeEntries.map((entry, i) => (
                        <MassCard key={i} entry={entry} />
                    ))}
                </div>
            )}
        </div>
    );
}