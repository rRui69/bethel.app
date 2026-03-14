import React, { useState, useMemo } from 'react';
import {
    FaChevronLeft, FaChevronRight, FaCalendarDays,
    FaCalendarWeek, FaCircle,
} from 'react-icons/fa6';

/*
 * ParishCalendar
 *
 * Renders mass schedules + events on a month or week calendar grid.
 *
 * massSchedules: array of schedule objects from the server
 *   - schedule_type: 'recurring' | 'one_time'
 *   - day_of_week:   0-6 (recurring only)
 *   - specific_date: 'YYYY-MM-DD' (one_time only)
 *   - start_time, type, celebrant
 *
 * events: array of event objects
 *   - date: 'YYYY-MM-DD', title, type, time
 */

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
];

// Colour coding per type
const TYPE_COLORS = {
    Regular:    '#1a3c5e',
    Daily:      '#0e7490',
    Family:     '#7c3aed',
    Youth:      '#d97706',
    Evening:    '#1e40af',
    Midday:     '#059669',
    Anticipated:'#be185d',
    Pilgrimage: '#9a3412',
    // Events
    Community:  '#065f46',
    Liturgy:    '#1e40af',
    Default:    '#374151',
};

function typeColor(type) {
    return TYPE_COLORS[type] ?? TYPE_COLORS.Default;
}

/** Expand recurring schedules + one-time into concrete {date, ...} entries for a given month */
function expandSchedules(massSchedules, events, year, month) {
    const entries = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let d = 1; d <= daysInMonth; d++) {
        const date  = new Date(year, month, d);
        const dow   = date.getDay();
        const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

        // Recurring mass schedules — match day_of_week
        massSchedules
            .filter(s => s.schedule_type === 'recurring' && s.day_of_week === dow)
            .forEach(s => entries.push({ date: dateStr, kind: 'mass', ...s }));

        // One-time mass schedules
        massSchedules
            .filter(s => s.schedule_type === 'one_time' && s.specific_date === dateStr)
            .forEach(s => entries.push({ date: dateStr, kind: 'mass', ...s }));

        // Events
        events
            .filter(e => e.date === dateStr)
            .forEach(e => entries.push({ date: dateStr, kind: 'event', ...e }));
    }

    return entries;
}

/** Get all 7 dates of the week containing `anchor` date */
function weekDates(anchor) {
    const d   = new Date(anchor);
    const dow = d.getDay();
    const sun = new Date(d);
    sun.setDate(d.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(sun);
        day.setDate(sun.getDate() + i);
        return day;
    });
}

function toDateStr(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

function DayCell({ dateStr, entries, isToday, isOtherMonth }) {
    const day = parseInt(dateStr.slice(8), 10);
    const MAX_DOTS = 3;
    const visible = entries.slice(0, MAX_DOTS);
    const extra   = entries.length - MAX_DOTS;

    return (
        <div className={`parish-cal-cell ${isToday ? 'parish-cal-cell--today' : ''} ${isOtherMonth ? 'parish-cal-cell--faded' : ''}`}>
            <span className="parish-cal-cell__num">{day}</span>
            <div className="parish-cal-cell__entries">
                {visible.map((e, i) => (
                    <div
                        key={i}
                        className="parish-cal-entry"
                        title={e.kind === 'mass'
                            ? `${e.type} Mass — ${e.start_time}${e.celebrant ? ' | ' + e.celebrant : ''}`
                            : `${e.title} — ${e.time ?? ''}`}
                        style={{ '--entry-color': typeColor(e.type) }}
                    >
                        <FaCircle size={5} style={{ color: typeColor(e.type), flexShrink: 0 }} />
                        <span className="parish-cal-entry__label">
                            {e.kind === 'mass' ? `${e.type} ${e.start_time}` : e.title}
                        </span>
                    </div>
                ))}
                {extra > 0 && (
                    <div className="parish-cal-entry parish-cal-entry--more">
                        +{extra} more
                    </div>
                )}
            </div>
        </div>
    );
}

function MonthGrid({ year, month, allEntries }) {
    const today    = toDateStr(new Date());
    const firstDow = new Date(year, month, 1).getDay();
    const daysInM  = new Date(year, month + 1, 0).getDate();

    // Leading cells from prev month
    const prevDays = new Date(year, month, 0).getDate();
    const leadingCells = Array.from({ length: firstDow }, (_, i) => {
        const d = prevDays - firstDow + 1 + i;
        const y = month === 0 ? year - 1 : year;
        const m = month === 0 ? 12 : month;
        return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    });

    const currentCells = Array.from({ length: daysInM }, (_, i) => {
        const d = i + 1;
        return `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    });

    const total = leadingCells.length + currentCells.length;
    const trailingCount = total % 7 === 0 ? 0 : 7 - (total % 7);
    const trailingCells = Array.from({ length: trailingCount }, (_, i) => {
        const d = i + 1;
        const y = month === 11 ? year + 1 : year;
        const m = month === 11 ? 1 : month + 2;
        return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    });

    const allCells = [
        ...leadingCells.map(d => ({ dateStr: d, other: true })),
        ...currentCells.map(d => ({ dateStr: d, other: false })),
        ...trailingCells.map(d => ({ dateStr: d, other: true })),
    ];

    const byDate = useMemo(() => {
        const map = {};
        allEntries.forEach(e => {
            if (!map[e.date]) map[e.date] = [];
            map[e.date].push(e);
        });
        return map;
    }, [allEntries]);

    return (
        <div className="parish-cal-grid">
            {DAYS_SHORT.map(d => (
                <div key={d} className="parish-cal-header-cell">{d}</div>
            ))}
            {allCells.map(({ dateStr, other }, i) => (
                <DayCell
                    key={i}
                    dateStr={dateStr}
                    entries={byDate[dateStr] ?? []}
                    isToday={dateStr === today}
                    isOtherMonth={other}
                />
            ))}
        </div>
    );
}

function WeekGrid({ anchor, allEntriesMap }) {
    const today = toDateStr(new Date());
    const dates = weekDates(anchor);

    return (
        <div className="parish-week-grid">
            {dates.map((date, i) => {
                const dateStr = toDateStr(date);
                const entries = allEntriesMap[dateStr] ?? [];
                const isToday = dateStr === today;
                return (
                    <div key={i} className={`parish-week-col ${isToday ? 'parish-week-col--today' : ''}`}>
                        <div className="parish-week-col__header">
                            <span className="parish-week-col__dow">{DAYS_SHORT[date.getDay()]}</span>
                            <span className={`parish-week-col__num ${isToday ? 'today' : ''}`}>
                                {date.getDate()}
                            </span>
                        </div>
                        <div className="parish-week-col__entries">
                            {entries.length === 0 && (
                                <span className="parish-week-empty">—</span>
                            )}
                            {entries.map((e, j) => (
                                <div
                                    key={j}
                                    className="parish-week-entry"
                                    style={{ '--entry-color': typeColor(e.type) }}
                                    title={e.kind === 'mass'
                                        ? `${e.type} Mass — ${e.start_time}${e.celebrant ? ' | ' + e.celebrant : ''}`
                                        : `${e.title} — ${e.time ?? ''}`}
                                >
                                    <span className="parish-week-entry__time">
                                        {e.kind === 'mass' ? e.start_time : (e.time ?? 'TBA')}
                                    </span>
                                    <span className="parish-week-entry__label">
                                        {e.kind === 'mass' ? `${e.type} Mass` : e.title}
                                    </span>
                                    {e.kind === 'mass' && e.celebrant && (
                                        <span className="parish-week-entry__sub">{e.celebrant}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function ParishCalendar({ massSchedules = [], events = [] }) {
    const today    = new Date();
    const [view, setView]   = useState('month'); // 'month' | 'week'
    const [year, setYear]   = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth());
    // weekAnchor for week view — always Mon/Sun reference
    const [weekAnchor, setWeekAnchor] = useState(today);

    // Expand all entries for the current month
    const monthEntries = useMemo(
        () => expandSchedules(massSchedules, events, year, month),
        [massSchedules, events, year, month]
    );

    // For week view, expand ±1 month around anchor to capture boundary weeks
    const weekEntriesMap = useMemo(() => {
        const d = new Date(weekAnchor);
        const entries = [
            ...expandSchedules(massSchedules, events, d.getFullYear(), d.getMonth()),
        ];
        if (d.getDate() <= 7) {
            const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1);
            entries.push(...expandSchedules(massSchedules, events, prev.getFullYear(), prev.getMonth()));
        }
        if (d.getDate() >= 24) {
            const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
            entries.push(...expandSchedules(massSchedules, events, next.getFullYear(), next.getMonth()));
        }
        const map = {};
        entries.forEach(e => {
            if (!map[e.date]) map[e.date] = [];
            map[e.date].push(e);
        });
        return map;
    }, [massSchedules, events, weekAnchor]);

    function prevMonth() {
        if (month === 0) { setYear(y => y - 1); setMonth(11); }
        else setMonth(m => m - 1);
    }
    function nextMonth() {
        if (month === 11) { setYear(y => y + 1); setMonth(0); }
        else setMonth(m => m + 1);
    }
    function prevWeek() {
        setWeekAnchor(d => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; });
    }
    function nextWeek() {
        setWeekAnchor(d => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; });
    }
    function goToday() {
        setYear(today.getFullYear());
        setMonth(today.getMonth());
        setWeekAnchor(new Date());
    }

    const weekLabel = (() => {
        const dates = weekDates(weekAnchor);
        const s = dates[0], e = dates[6];
        if (s.getMonth() === e.getMonth())
            return `${MONTHS[s.getMonth()]} ${s.getDate()}–${e.getDate()}, ${s.getFullYear()}`;
        return `${MONTHS[s.getMonth()]} ${s.getDate()} – ${MONTHS[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
    })();

    return (
        <div className="parish-calendar">
            {/* Toolbar */}
            <div className="parish-cal-toolbar">
                <div className="parish-cal-toolbar__nav">
                    <button
                        className="parish-cal-nav-btn"
                        onClick={view === 'month' ? prevMonth : prevWeek}
                        aria-label="Previous"
                    >
                        <FaChevronLeft size={12} />
                    </button>
                    <span className="parish-cal-toolbar__label">
                        {view === 'month'
                            ? `${MONTHS[month]} ${year}`
                            : weekLabel}
                    </span>
                    <button
                        className="parish-cal-nav-btn"
                        onClick={view === 'month' ? nextMonth : nextWeek}
                        aria-label="Next"
                    >
                        <FaChevronRight size={12} />
                    </button>
                </div>

                <div className="parish-cal-toolbar__right">
                    <button className="parish-cal-today-btn" onClick={goToday}>
                        Today
                    </button>
                    <div className="parish-cal-view-toggle" role="group" aria-label="Calendar view">
                        <button
                            className={`parish-cal-toggle-btn ${view === 'month' ? 'active' : ''}`}
                            onClick={() => setView('month')}
                            aria-pressed={view === 'month'}
                        >
                            <FaCalendarDays size={13} /> Month
                        </button>
                        <button
                            className={`parish-cal-toggle-btn ${view === 'week' ? 'active' : ''}`}
                            onClick={() => setView('week')}
                            aria-pressed={view === 'week'}
                        >
                            <FaCalendarWeek size={13} /> Week
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar grid */}
            {view === 'month'
                ? <MonthGrid year={year} month={month} allEntries={monthEntries} />
                : <WeekGrid anchor={weekAnchor} allEntriesMap={weekEntriesMap} />
            }

            {/* Legend */}
            <div className="parish-cal-legend">
                {[['mass', 'Regular'], ['mass', 'Youth'], ['mass', 'Family'], ['event', 'Community'], ['event', 'Liturgy']].map(([kind, type]) => (
                    <span key={type} className="parish-cal-legend-item">
                        <FaCircle size={7} style={{ color: typeColor(type) }} />
                        {kind === 'mass' ? `${type} Mass` : type}
                    </span>
                ))}
            </div>
        </div>
    );
}