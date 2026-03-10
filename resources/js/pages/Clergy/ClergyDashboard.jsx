import React, { useState, useEffect, useCallback } from 'react';
import {
    FaHandsPraying, FaBookOpen, FaCheck, FaX,
    FaChurch, FaCircleCheck, FaBan, FaCalendarDays,
    FaClock, FaUser, FaLocationDot, FaCircle,
    FaEnvelope, FaPhone, FaUsers, FaFileLines,
} from 'react-icons/fa6';

const card = {
    background: 'var(--card-bg, #fff)',
    border: '1px solid var(--border-color, #e5e7eb)',
    borderRadius: '12px',
    overflow: 'hidden',
};

function Badge({ variant, children }) {
    const map = {
        pending:    { bg: 'rgba(245,158,11,0.1)',  color: '#b45309', border: 'rgba(245,158,11,0.3)'  },
        confirmed:  { bg: 'rgba(16,185,129,0.1)',  color: '#065f46', border: 'rgba(16,185,129,0.3)'  },
        declined:   { bg: 'rgba(239,68,68,0.1)',   color: '#991b1b', border: 'rgba(239,68,68,0.3)'   },
        approved:   { bg: 'rgba(16,185,129,0.1)',  color: '#065f46', border: 'rgba(16,185,129,0.3)'  },
        rejected:   { bg: 'rgba(239,68,68,0.1)',   color: '#991b1b', border: 'rgba(239,68,68,0.3)'   },
        unassigned: { bg: 'rgba(107,114,128,0.1)', color: '#374151', border: 'rgba(107,114,128,0.3)' },
    };
    const t = map[variant?.toLowerCase()] || map.unassigned;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '4px 10px', borderRadius: '20px',
            fontSize: '0.78rem', fontWeight: 600,
            background: t.bg, color: t.color, border: `1px solid ${t.border}`,
            textTransform: 'capitalize', whiteSpace: 'nowrap',
        }}>
            <FaCircle size={5} />{children}
        </span>
    );
}

function EmptyState({ icon: Icon, title, body }) {
    return (
        <div style={{ textAlign: 'center', padding: '64px 32px', color: 'var(--text-muted)' }}>
            <div style={{
                width: 64, height: 64, borderRadius: '16px', margin: '0 auto 20px',
                background: 'var(--bg-subtle, rgba(0,0,0,0.03))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={28} style={{ opacity: 0.4 }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '8px' }}>{title}</div>
            <div style={{ fontSize: '0.875rem', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>{body}</div>
        </div>
    );
}

function AssignmentCard({ assignment, onView }) {
    const canRespond = assignment.clergy_status === 'pending' || assignment.clergy_status === 'unassigned';
    return (
        <div style={{
            ...card, padding: '20px 24px',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            gap: '16px', flexWrap: 'wrap', transition: 'box-shadow 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
                    background: canRespond
                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                        : 'linear-gradient(135deg, #1a3c5e, #2563a8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <FaHandsPraying size={18} color="rgba(255,255,255,0.95)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.975rem', marginBottom: '6px' }}>
                        {assignment.sacrament_type}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaCalendarDays size={11} /> {assignment.preferred_date}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaClock size={11} /> {assignment.preferred_time}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaUser size={11} /> {assignment.parishioner?.name}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaLocationDot size={11} /> {assignment.parish}
                        </span>
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <Badge variant={assignment.clergy_status}>{assignment.clergy_status}</Badge>
                <button onClick={() => onView(assignment)} style={{
                    padding: '8px 18px', borderRadius: '8px', fontSize: '0.83rem', fontWeight: 600,
                    border: '1.5px solid var(--border-color, #d1d5db)',
                    background: 'transparent', color: 'var(--text-color, #111)', cursor: 'pointer',
                }}>
                    View
                </button>
            </div>
        </div>
    );
}

function AssignmentModal({ assignment, onRespond, onClose, responding }) {
    const canRespond = assignment.clergy_status === 'pending' || assignment.clergy_status === 'unassigned';
    const row = (label, value, subValue) => (
        <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '0.925rem', fontWeight: 500 }}>{value || '—'}</div>
            {subValue && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{subValue}</div>}
        </div>
    );
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }} onClick={onClose}>
            <div style={{
                background: 'var(--card-bg, #fff)', borderRadius: '16px',
                width: '100%', maxWidth: 560,
                boxShadow: '0 25px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
            }} onClick={e => e.stopPropagation()}>

                <div style={{
                    padding: '24px 28px',
                    background: 'linear-gradient(135deg, #0f2744, #2563a8)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: 42, height: 42, borderRadius: '10px',
                            background: 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <FaHandsPraying size={18} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Assignment Details</div>
                            <div style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: '2px' }}>{assignment.sacrament_type}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        width: 32, height: 32, borderRadius: '8px', border: 'none',
                        background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <FaX size={13} />
                    </button>
                </div>

                <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {row('Date',           assignment.preferred_date)}
                    {row('Time',           assignment.preferred_time)}
                    {row('Parishioner',    assignment.parishioner?.name, assignment.parishioner?.email)}
                    {row('Parish',         assignment.parish)}
                    <div>{row('Request Status', <Badge variant={assignment.status}>{assignment.status}</Badge>)}</div>
                    <div>{row('My Response',    <Badge variant={assignment.clergy_status}>{assignment.clergy_status}</Badge>)}</div>
                    {assignment.participants > 1 && row('Participants', assignment.participants)}
                    {assignment.admin_notes && (
                        <div style={{ gridColumn: '1 / -1' }}>
                            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: '8px' }}>Admin Notes</div>
                            <div style={{
                                padding: '14px 16px', borderRadius: '10px',
                                background: 'var(--bg-subtle, rgba(0,0,0,0.03))',
                                border: '1px solid var(--border-color, #e5e7eb)',
                                fontSize: '0.875rem', lineHeight: 1.6,
                            }}>
                                {assignment.admin_notes}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{
                    padding: '16px 28px', borderTop: '1px solid var(--border-color, #e5e7eb)',
                    display: 'flex', justifyContent: 'flex-end', gap: '10px',
                }}>
                    <button onClick={onClose} style={{
                        padding: '9px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500,
                        border: '1.5px solid var(--border-color, #d1d5db)',
                        background: 'transparent', color: 'var(--text-color, #111)', cursor: 'pointer',
                    }}>Close</button>
                    {canRespond && (
                        <>
                            <button onClick={() => onRespond(assignment.id, 'declined')} disabled={responding} style={{
                                padding: '9px 20px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600,
                                border: 'none', background: 'rgba(239,68,68,0.1)', color: '#dc2626',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px',
                                opacity: responding ? 0.6 : 1,
                            }}>
                                <FaBan size={12} /> Decline
                            </button>
                            <button onClick={() => onRespond(assignment.id, 'confirmed')} disabled={responding} style={{
                                padding: '9px 24px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600,
                                border: 'none', background: 'var(--primary, #1a3c5e)', color: '#fff',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px',
                                opacity: responding ? 0.6 : 1,
                            }}>
                                <FaCircleCheck size={13} /> {responding ? 'Saving…' : 'Confirm Assignment'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function AssignmentsTab({ admin }) {
    const [assignments, setAssignments] = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [filter,      setFilter]      = useState('all');
    const [selected,    setSelected]    = useState(null);
    const [responding,  setResponding]  = useState(false);
    const [toast,       setToast]       = useState('');

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = filter !== 'all' ? { clergy_status: filter } : {};
            const { data } = await axios.get('/admin/api/clergy-assignments', { params });
            setAssignments(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, [filter]);

    useEffect(() => { load(); }, [load]);

    const handleRespond = async (id, response) => {
        setResponding(true);
        try {
            await axios.post(`/admin/api/clergy-assignments/${id}/respond`, { response });
            setAssignments(prev => prev.map(a => a.id === id ? { ...a, clergy_status: response } : a));
            showToast(`Assignment ${response} successfully.`);
            setSelected(null);
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to respond. Please try again.');
        } finally { setResponding(false); }
    };

    const filters = [
        { value: 'all', label: 'All' }, { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' }, { value: 'declined', label: 'Declined' },
    ];

    const pending   = assignments.filter(a => a.clergy_status === 'pending' || a.clergy_status === 'unassigned').length;
    const confirmed = assignments.filter(a => a.clergy_status === 'confirmed').length;

    return (
        <>
            {toast && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px',
                    borderRadius: '8px', marginBottom: '24px',
                    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                    color: '#065f46', fontSize: '0.875rem',
                }}>
                    <FaCheck size={13} /> {toast}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
                {[
                    { label: 'Total Assigned',    value: assignments.length, color: '#1a3c5e' },
                    { label: 'Awaiting Response', value: pending,            color: '#b45309' },
                    { label: 'Confirmed',         value: confirmed,          color: '#059669' },
                ].map(s => (
                    <div key={s.label} style={{ ...card, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '4px' }}>{s.label}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                        </div>
                        <FaHandsPraying size={28} style={{ opacity: 0.07 }} />
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {filters.map(f => (
                    <button key={f.value} type="button" onClick={() => setFilter(f.value)} style={{
                        padding: '7px 18px', borderRadius: '20px', fontSize: '0.83rem', fontWeight: 600,
                        border: '1.5px solid',
                        borderColor: filter === f.value ? 'var(--primary, #1a3c5e)' : 'var(--border-color, #d1d5db)',
                        background: filter === f.value ? 'var(--primary, #1a3c5e)' : 'transparent',
                        color: filter === f.value ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer', transition: 'all 0.15s',
                    }}>{f.label}</button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading assignments…</div>
            ) : assignments.length === 0 ? (
                <div style={card}><EmptyState icon={FaHandsPraying} title="No assignments found" body="You have no sacrament assignments yet. They will appear here once parish staff assigns you." /></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {assignments.map(a => <AssignmentCard key={a.id} assignment={a} onView={setSelected} />)}
                </div>
            )}

            {selected && (
                <AssignmentModal assignment={selected} onRespond={handleRespond} onClose={() => setSelected(null)} responding={responding} />
            )}
        </>
    );
}

// ── Record Detail Modal ────────────────────────────────────────
function RecordDetailModal({ record, onClose }) {
    const sectionLabel = {
        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: 'var(--text-muted)',
        marginBottom: '14px', paddingBottom: '8px',
        borderBottom: '1px solid var(--border-color, #e5e7eb)',
    };

    const row = (Icon, label, value) => value && value !== '—' ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
            <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: 'var(--bg-subtle, rgba(0,0,0,0.04))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={13} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{value}</div>
            </div>
        </div>
    ) : null;

    const paymentColors = {
        unpaid:    { bg: '#f1f5f9', color: '#64748b' },
        submitted: { bg: '#fef9c3', color: '#92400e' },
        verified:  { bg: '#d1fae5', color: '#065f46' },
        rejected:  { bg: '#fee2e2', color: '#991b1b' },
    };
    const pc = paymentColors[record.payment_status] ?? paymentColors.unpaid;

    // Build a map of fieldId → label from the schema
    const schemaMap = Object.fromEntries(
        (record.field_schema ?? []).map(f => [f.id, f])
    );

    const hasCustomDetails = record.details && Object.keys(record.details).length > 0;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
        }} onClick={onClose}>
            <div style={{
                background: 'var(--card-bg, #fff)', borderRadius: '16px',
                width: '100%', maxWidth: 600, maxHeight: '90vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 25px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '24px 28px',
                    background: 'linear-gradient(135deg, #0f2744, #2563a8)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: 'rgba(255,255,255,0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <FaBookOpen size={20} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{record.sacrament_type}</div>
                            <div style={{ fontSize: '0.82rem', opacity: 0.75, marginTop: 2 }}>
                                Sacramental Record · {record.recorded_at}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        width: 32, height: 32, borderRadius: 8, border: 'none',
                        background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <FaX size={13} />
                    </button>
                </div>

                {/* Status bar */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                    padding: '12px 28px',
                    background: 'var(--bg-subtle, rgba(0,0,0,0.02))',
                    borderBottom: '1px solid var(--border-color, #e5e7eb)',
                    flexShrink: 0,
                }}>
                    <Badge variant={record.status}>{record.status}</Badge>
                    <Badge variant={record.clergy_status}>{record.clergy_status}</Badge>
                    <span style={{
                        fontSize: '0.72rem', fontWeight: 600,
                        padding: '4px 10px', borderRadius: 20,
                        background: pc.bg, color: pc.color,
                    }}>
                        Payment: {record.payment_status}
                    </span>
                </div>

                {/* Scrollable body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

                    {/* Event details */}
                    <div style={sectionLabel}>Event Details</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginBottom: 24 }}>
                        {row(FaCalendarDays, 'Date',         record.preferred_date)}
                        {row(FaClock,       'Time',         record.preferred_time)}
                        {row(FaUsers,       'Participants', record.participants > 1 ? String(record.participants) : null)}
                        {row(FaLocationDot, 'Parish',       record.parish?.name)}
                        {row(FaLocationDot, 'Parish City',  record.parish?.city)}
                    </div>

                    {/* Parishioner */}
                    <div style={sectionLabel}>Parishioner</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', marginBottom: 24 }}>
                        {row(FaUser,    'Name',     record.parishioner?.name)}
                        {row(FaEnvelope,'Email',    record.parishioner?.email)}
                        {row(FaPhone,   'Phone',    record.parishioner?.phone)}
                        {row(FaLocationDot, 'City', record.parishioner?.city)}
                        {row(FaLocationDot, 'Barangay', record.parishioner?.barangay)}
                    </div>

                    {/* Submitted form data */}
                    {hasCustomDetails && (
                        <>
                            <div style={sectionLabel}>Submitted Information</div>
                            <div style={{
                                background: 'var(--bg-subtle, rgba(0,0,0,0.02))',
                                border: '1px solid var(--border-color, #e5e7eb)',
                                borderRadius: 10, padding: '16px 20px',
                                marginBottom: 24,
                                display: 'flex', flexDirection: 'column', gap: 12,
                            }}>
                                {Object.entries(record.details).map(([key, val]) => {
                                    const field = schemaMap[key];
                                    const label = field?.label ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                    const isImage = typeof val === 'string' && val.startsWith('http');
                                    const display = Array.isArray(val) ? val.join(', ') : (val || '—');
                                    return (
                                        <div key={key}>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 4 }}>
                                                {label}
                                            </div>
                                            {isImage ? (
                                                <a href={val} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
                                                    <img src={val} alt={label} style={{
                                                        maxWidth: '100%', maxHeight: 140, borderRadius: 8,
                                                        objectFit: 'contain', border: '1px solid #e5e7eb',
                                                        background: '#f8fafc', display: 'block', cursor: 'zoom-in',
                                                    }} />
                                                </a>
                                            ) : (
                                                <div style={{ fontSize: '0.88rem', fontWeight: 500 }}>{display}</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Admin notes */}
                    {record.admin_notes && (
                        <>
                            <div style={sectionLabel}>Admin Notes</div>
                            <div style={{
                                padding: '14px 16px', borderRadius: 10,
                                background: 'rgba(245,158,11,0.06)',
                                border: '1px solid rgba(245,158,11,0.2)',
                                fontSize: '0.875rem', lineHeight: 1.6,
                                color: 'var(--text-primary)',
                            }}>
                                {record.admin_notes}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 28px', borderTop: '1px solid var(--border-color, #e5e7eb)',
                    display: 'flex', justifyContent: 'flex-end', flexShrink: 0,
                }}>
                    <button onClick={onClose} style={{
                        padding: '9px 24px', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600,
                        border: '1.5px solid var(--border-color, #d1d5db)',
                        background: 'transparent', color: 'var(--text-color, #111)', cursor: 'pointer',
                    }}>Close</button>
                </div>
            </div>
        </div>
    );
}

function RecordsTab() {
    const [records,        setRecords]        = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);

    useEffect(() => {
        axios.get('/admin/api/clergy-records')
            .then(({ data }) => setRecords(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading records…</div>;

    if (records.length === 0) return (
        <div style={card}><EmptyState icon={FaBookOpen} title="No records yet" body="Completed sacrament requests assigned to you will appear here as read-only records." /></div>
    );

    return (
        <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {records.map(r => (
                <div key={r.id} style={{ ...card, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
                        background: 'linear-gradient(135deg, #1a3c5e, #2563a8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <FaBookOpen size={17} color="rgba(255,255,255,0.9)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '5px' }}>{r.sacrament_type}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaCalendarDays size={11} /> {r.preferred_date}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaUser size={11} /> {r.parishioner?.name ?? r.parishioner}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaLocationDot size={11} /> {r.parish?.name ?? r.parish}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Badge variant={r.clergy_status}>{r.clergy_status}</Badge>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{r.recorded_at}</span>
                        <button
                            onClick={() => setSelectedRecord(r)}
                            style={{
                                padding: '7px 16px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600,
                                border: '1.5px solid var(--border-color, #d1d5db)',
                                background: 'transparent', color: 'var(--text-color, #111)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                            }}
                        >
                            <FaFileLines size={12} /> View Details
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {selectedRecord && (
            <RecordDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
        )}
        </>
    );
}

function ProfileBanner() {
    const [profile, setProfile] = useState(null);
    useEffect(() => { axios.get('/admin/api/clergy-profile').then(({ data }) => setProfile(data)).catch(console.error); }, []);
    if (!profile) return null;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #0f2744 0%, #1a3c5e 50%, #2563a8 100%)',
            borderRadius: '16px', padding: '28px 32px', marginBottom: '32px', color: '#fff',
            display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap',
            boxShadow: '0 8px 32px rgba(26,60,94,0.25)',
        }}>
            <div style={{
                width: 72, height: 72, borderRadius: '18px',
                background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                <FaChurch size={30} color="rgba(255,255,255,0.95)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '1.4rem', marginBottom: '6px', letterSpacing: '-0.01em' }}>
                    {profile.titled_name}
                </div>
                <div style={{ opacity: 0.75, fontSize: '0.9rem', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FaLocationDot size={12} /> {profile.parish}
                    </span>
                    {profile.specialization && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FaHandsPraying size={12} /> {profile.specialization}
                        </span>
                    )}
                </div>
            </div>
            <div style={{
                textAlign: 'center',
                background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px', padding: '16px 28px', minWidth: 120,
            }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>{profile.schedule?.length ?? 0}</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>Schedule Slots</div>
            </div>
        </div>
    );
}

export default function ClergyDashboard({ admin }) {
    const [tab, setTab] = useState('assignments');
    const tabs = [
        { id: 'assignments', label: 'My Assignments',      icon: FaHandsPraying },
        { id: 'records',     label: 'Sacramental Records', icon: FaBookOpen     },
    ];

    return (
        <div style={{ padding: '32px', maxWidth: 1100 }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Clergy Dashboard</h1>
            <p style={{ margin: '6px 0 28px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                View and respond to your assigned sacramental duties
            </p>

            <ProfileBanner />

            <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid var(--border-color, #e5e7eb)', marginBottom: '28px' }}>
                {tabs.map(t => (
                    <button key={t.id} type="button" onClick={() => setTab(t.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '12px 20px', border: 'none', background: 'transparent',
                        borderBottom: tab === t.id ? '2px solid var(--primary, #1a3c5e)' : '2px solid transparent',
                        marginBottom: '-2px',
                        color: tab === t.id ? 'var(--primary, #1a3c5e)' : 'var(--text-muted)',
                        fontWeight: tab === t.id ? 700 : 400, fontSize: '0.9rem',
                        cursor: 'pointer', transition: 'color 0.15s',
                    }}>
                        <t.icon size={14} /> {t.label}
                    </button>
                ))}
            </div>

            {tab === 'assignments' && <AssignmentsTab admin={admin} />}
            {tab === 'records'     && <RecordsTab />}
        </div>
    );
}