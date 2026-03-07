import React, { useState, useEffect, useCallback } from 'react';
import {
    FaPlus, FaPencil, FaTrash, FaToggleOn, FaToggleOff,
    FaListCheck, FaEye, FaEyeSlash, FaGripVertical,
    FaChevronUp, FaChevronDown, FaCheck, FaXmark,
    FaCircleInfo, FaTriangleExclamation,
} from 'react-icons/fa6';
import { ICON_MAP, ICON_OPTIONS, COLOR_PRESETS } from '@/config/iconMap';

// ─────────────────────────────────────────────────────────────
// Field type definitions
// ─────────────────────────────────────────────────────────────
const FIELD_TYPES = [
    { type: 'short_text', label: 'Short Text',   hint: 'Single line answer' },
    { type: 'long_text',  label: 'Paragraph',    hint: 'Multi-line answer'  },
    { type: 'date',       label: 'Date',         hint: 'Date picker'        },
    { type: 'time',       label: 'Time',         hint: 'Time picker'        },
    { type: 'number',     label: 'Number',       hint: 'Numeric input'      },
    { type: 'phone',      label: 'Phone',        hint: 'Phone number'       },
    { type: 'radio',      label: 'Multiple Choice', hint: 'Choose one'      },
    { type: 'checkbox',   label: 'Checkboxes',   hint: 'Choose multiple'    },
    { type: 'file',       label: 'File Upload',  hint: 'Documents/images'   },
];

const TYPE_BADGE_COLOR = {
    short_text: '#3b82f6', long_text: '#8b5cf6', date: '#10b981',
    time: '#f59e0b', number: '#6366f1', phone: '#06b6d4',
    radio: '#ec4899', checkbox: '#f97316', file: '#64748b',
};

// Fixed fields always shown on every form (not in form_schema)
const FIXED_FIELDS = [
    'Parishioner Name (from account)',
    'Contact Number (from account)',
    'Parish Selection',
    'Preferred Date',
    'Preferred Time',
    'Number of Participants',
];

function uid() {
    return 'f_' + Math.random().toString(36).slice(2, 9);
}

// ─────────────────────────────────────────────────────────────
// IconPicker
// ─────────────────────────────────────────────────────────────
function IconPicker({ value, color, bg, onIconChange }) {
    const [open, setOpen] = useState(false);

    const SelectedIcon = ICON_MAP[value]?.Icon ?? ICON_MAP['hands'].Icon;

    return (
        <div style={{ position: 'relative' }}>
            <button
                type="button"
                className="um-btn um-btn--outline"
                onClick={() => setOpen(o => !o)}
                style={{ gap: 10, padding: '0.45rem 1rem' }}
            >
                <span style={{
                    width: 28, height: 28, borderRadius: 6,
                    background: bg, display: 'grid', placeItems: 'center', flexShrink: 0,
                }}>
                    <SelectedIcon size={14} color={color} />
                </span>
                <span style={{ fontSize: '0.8rem' }}>{ICON_MAP[value]?.label ?? 'Pick icon'}</span>
                <FaChevronDown size={10} />
            </button>

            {open && (
                <div style={{
                    position: 'absolute', top: '110%', left: 0, zIndex: 100,
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    borderRadius: 10, padding: '0.75rem',
                    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 6, width: 260,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                }}>
                    {ICON_OPTIONS.map(({ key, Icon, label }) => (
                        <button
                            key={key}
                            title={label}
                            type="button"
                            onClick={() => { onIconChange(key); setOpen(false); }}
                            style={{
                                width: 40, height: 40, borderRadius: 8, border: 'none', cursor: 'pointer',
                                background: value === key ? 'var(--admin-accent)' : 'var(--bg-hover)',
                                display: 'grid', placeItems: 'center',
                                transition: 'background 0.15s',
                            }}
                        >
                            <Icon size={16} color={value === key ? '#fff' : 'var(--text-secondary)'} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// ColorPicker
// ─────────────────────────────────────────────────────────────
function ColorPresets({ selected_color, selected_bg, onChange }) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {COLOR_PRESETS.map(p => {
                const active = p.color === selected_color && p.bg === selected_bg;
                return (
                    <button
                        key={p.label}
                        type="button"
                        title={p.label}
                        onClick={() => onChange(p.color, p.bg)}
                        style={{
                            width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
                            background: p.bg,
                            outline: active ? `2px solid ${p.color}` : '2px solid transparent',
                            outlineOffset: 2, transition: 'outline 0.1s',
                            display: 'grid', placeItems: 'center',
                        }}
                    >
                        <div style={{ width: 12, height: 12, borderRadius: 3, background: p.color }} />
                    </button>
                );
            })}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// FieldEditor — inline edit for a single custom field
// ─────────────────────────────────────────────────────────────
function FieldEditor({ field, onChange, onDelete, onMove, isFirst, isLast }) {
    const [expanded, setExpanded] = useState(field._isNew ?? false);
    const typeDef = FIELD_TYPES.find(t => t.type === field.type) ?? FIELD_TYPES[0];

    const set = (key, val) => onChange({ ...field, [key]: val });

    const addOption = () => set('options', [...(field.options ?? []), '']);
    const updateOption = (i, val) => {
        const opts = [...(field.options ?? [])];
        opts[i] = val;
        set('options', opts);
    };
    const removeOption = (i) => set('options', (field.options ?? []).filter((_, idx) => idx !== i));

    const hasOptions = field.type === 'radio' || field.type === 'checkbox';

    return (
        <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 10, marginBottom: 8, overflow: 'hidden',
            borderLeft: `3px solid ${TYPE_BADGE_COLOR[field.type] ?? '#888'}`,
        }}>
            {/* Header row */}
            <div
                style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '0.6rem 0.875rem', cursor: 'pointer',
                }}
                onClick={() => setExpanded(e => !e)}
            >
                <FaGripVertical size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />

                <span style={{
                    fontSize: '0.68rem', fontWeight: 700,
                    color: '#fff', background: TYPE_BADGE_COLOR[field.type] ?? '#888',
                    borderRadius: 4, padding: '2px 7px', flexShrink: 0,
                }}>
                    {typeDef.label}
                </span>

                <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: field.label ? 600 : 400 }}>
                    {field.label || <em style={{ color: 'var(--text-muted)' }}>Untitled field</em>}
                </span>

                {field.required && (
                    <span style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>Required</span>
                )}

                {/* Move up/down */}
                <button type="button" className="um-btn um-btn--outline" disabled={isFirst}
                    style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                    onClick={e => { e.stopPropagation(); onMove('up'); }}>
                    <FaChevronUp size={9} />
                </button>
                <button type="button" className="um-btn um-btn--outline" disabled={isLast}
                    style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                    onClick={e => { e.stopPropagation(); onMove('down'); }}>
                    <FaChevronDown size={9} />
                </button>

                <button type="button" className="um-btn um-btn--danger"
                    style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                    onClick={e => { e.stopPropagation(); onDelete(); }}>
                    <FaTrash size={10} />
                </button>
            </div>

            {/* Expanded editor */}
            {expanded && (
                <div style={{ padding: '0 0.875rem 0.875rem', borderTop: '1px solid var(--border-color)' }}>
                    <div className="um-grid-2" style={{ paddingTop: '0.75rem' }}>
                        <div className="um-field">
                            <label className="um-label">Field Label <span style={{ color: '#ef4444' }}>*</span></label>
                            <input className="um-input" value={field.label}
                                onChange={e => set('label', e.target.value)}
                                placeholder="e.g. Child's Full Name" />
                        </div>
                        {field.type !== 'radio' && field.type !== 'checkbox' && field.type !== 'file' && (
                            <div className="um-field">
                                <label className="um-label">Placeholder text</label>
                                <input className="um-input" value={field.placeholder ?? ''}
                                    onChange={e => set('placeholder', e.target.value)}
                                    placeholder="Hint shown inside input" />
                            </div>
                        )}
                    </div>

                    {/* Options for radio/checkbox */}
                    {hasOptions && (
                        <div className="um-field">
                            <label className="um-label">Options</label>
                            {(field.options ?? []).map((opt, i) => (
                                <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                                    <div style={{
                                        width: 16, height: 16, borderRadius: field.type === 'radio' ? '50%' : 4,
                                        border: '2px solid var(--border-color)', flexShrink: 0, marginTop: 9,
                                    }} />
                                    <input className="um-input" value={opt}
                                        onChange={e => updateOption(i, e.target.value)}
                                        placeholder={`Option ${i + 1}`} style={{ flex: 1 }} />
                                    <button type="button" className="um-btn um-btn--outline"
                                        style={{ padding: '4px 8px' }}
                                        onClick={() => removeOption(i)}>
                                        <FaXmark size={11} />
                                    </button>
                                </div>
                            ))}
                            <button type="button" className="um-btn um-btn--outline" onClick={addOption}
                                style={{ fontSize: '0.78rem', marginTop: 4 }}>
                                <FaPlus size={10} /> Add Option
                            </button>
                        </div>
                    )}

                    {/* Required toggle */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        <div
                            onClick={() => set('required', !field.required)}
                            style={{
                                width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
                                background: field.required ? 'var(--admin-accent)' : 'var(--border-color)',
                                position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                            }}>
                            <div style={{
                                position: 'absolute', top: 3, left: field.required ? 18 : 3,
                                width: 14, height: 14, borderRadius: '50%', background: '#fff',
                                transition: 'left 0.2s',
                            }} />
                        </div>
                        Required field
                    </label>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// AddFieldPanel — type picker
// ─────────────────────────────────────────────────────────────
function AddFieldPanel({ onAdd, onClose }) {
    return (
        <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: 10, padding: '1rem', marginBottom: 8,
        }}>
            <p className="um-section-label" style={{ marginBottom: '0.5rem' }}>Choose field type</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {FIELD_TYPES.map(ft => (
                    <button key={ft.type} type="button"
                        onClick={() => onAdd(ft.type)}
                        style={{
                            padding: '0.5rem 0.4rem', border: '1px solid var(--border-color)',
                            borderRadius: 8, background: 'var(--bg-hover)',
                            cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--admin-accent)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>{ft.label}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{ft.hint}</div>
                    </button>
                ))}
            </div>
            <div style={{ marginTop: 8, textAlign: 'right' }}>
                <button type="button" className="um-btn um-btn--outline" onClick={onClose} style={{ fontSize: '0.78rem' }}>
                    Cancel
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Builder Modal
// ─────────────────────────────────────────────────────────────
function BuilderModal({ initial, onSave, onClose, saving }) {
    const [tab, setTab] = useState('info');
    const [form, setForm] = useState({
        name: '', description: '', icon: 'hands',
        icon_color: '#1a3c5e', icon_bg: '#dbeafe',
        is_active: true, sort_order: 0,
        fields: [],
        ...(initial ?? {}),
    });
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [errors, setErrors] = useState({});

    const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

    const addField = (type) => {
        const newField = { id: uid(), type, label: '', placeholder: '', required: false, options: [], _isNew: true };
        setForm(p => ({ ...p, fields: [...p.fields, newField] }));
        setShowAddPanel(false);
    };

    const updateField = (i, updated) => {
        const fields = [...form.fields];
        fields[i] = { ...updated, _isNew: false };
        setForm(p => ({ ...p, fields }));
    };

    const deleteField = (i) => setForm(p => ({ ...p, fields: p.fields.filter((_, idx) => idx !== i) }));

    const moveField = (i, dir) => {
        const fields = [...form.fields];
        const j = dir === 'up' ? i - 1 : i + 1;
        if (j < 0 || j >= fields.length) return;
        [fields[i], fields[j]] = [fields[j], fields[i]];
        setForm(p => ({ ...p, fields }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required.';
        // Validate each field has a label
        form.fields.forEach((f, i) => {
            if (!f.label.trim()) e[`field_${i}`] = `Field ${i + 1} needs a label.`;
            if ((f.type === 'radio' || f.type === 'checkbox') && (f.options ?? []).filter(o => o.trim()).length < 2) {
                e[`field_${i}_opts`] = `Field ${i + 1} needs at least 2 options.`;
            }
        });
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = () => {
        if (!validate()) { setTab('info'); return; }
        const payload = {
            name:        form.name.trim(),
            description: form.description.trim(),
            icon:        form.icon,
            icon_color:  form.icon_color,
            icon_bg:     form.icon_bg,
            is_active:   form.is_active,
            sort_order:  form.sort_order ?? 0,
            form_schema: {
                fields: form.fields.map(({ _isNew, ...rest }) => ({
                    ...rest,
                    options: rest.options?.filter(o => o.trim()) ?? [],
                })),
            },
        };
        onSave(payload);
    };

    const CurrentIcon = ICON_MAP[form.icon]?.Icon ?? ICON_MAP['hands'].Icon;

    return (
        <div className="um-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="um-modal um-modal--wide" style={{ maxWidth: 780, maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>

                {/* Header */}
                <div className="um-modal__header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 8,
                            background: form.icon_bg, display: 'grid', placeItems: 'center',
                        }}>
                            <CurrentIcon size={16} color={form.icon_color} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                {form.name || 'New Sacrament'}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {initial ? 'Edit sacrament type' : 'Create new sacrament type'}
                            </div>
                        </div>
                    </div>
                    <button className="um-modal__close" onClick={onClose}><FaXmark size={14} /></button>
                </div>

                {/* Tabs */}
                <div className="um-tabs">
                    <button className={`um-tab${tab === 'info' ? ' um-tab--active' : ''}`} onClick={() => setTab('info')}>
                        <FaCircleInfo size={11} /> Basic Info
                        {Object.keys(errors).some(k => k === 'name') && (
                            <span style={{ color: '#ef4444', marginLeft: 4 }}>⚠</span>
                        )}
                    </button>
                    <button className={`um-tab${tab === 'fields' ? ' um-tab--active' : ''}`} onClick={() => setTab('fields')}>
                        <FaListCheck size={11} /> Form Fields
                        <span style={{
                            marginLeft: 6, fontSize: '0.68rem', fontWeight: 700,
                            background: 'var(--bg-hover)', borderRadius: 10, padding: '1px 6px',
                            color: 'var(--text-muted)',
                        }}>
                            {FIXED_FIELDS.length + form.fields.length}
                        </span>
                        {Object.keys(errors).some(k => k.startsWith('field_')) && (
                            <span style={{ color: '#ef4444', marginLeft: 4 }}>⚠</span>
                        )}
                    </button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>

                    {/* ── Info Tab ── */}
                    {tab === 'info' && (
                        <>
                            <div className="um-field">
                                <label className="um-label">Sacrament Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input className={`um-input${errors.name ? ' um-input--invalid' : ''}`}
                                    value={form.name} onChange={e => { set('name', e.target.value); setErrors(p => ({...p, name: ''})); }}
                                    placeholder="e.g. Baptism, Wedding, Confirmation" />
                                {errors.name && <div className="um-field-error">{errors.name}</div>}
                            </div>

                            <div className="um-field">
                                <label className="um-label">Description</label>
                                <textarea className="um-input" rows={2} value={form.description}
                                    onChange={e => set('description', e.target.value)}
                                    placeholder="Short description shown to parishioners"
                                    style={{ resize: 'vertical' }} />
                            </div>

                            <div className="um-grid-2">
                                <div className="um-field">
                                    <label className="um-label">Icon</label>
                                    <IconPicker value={form.icon} color={form.icon_color} bg={form.icon_bg}
                                        onIconChange={key => set('icon', key)} />
                                </div>
                                <div className="um-field">
                                    <label className="um-label">Color Theme</label>
                                    <ColorPresets
                                        selected_color={form.icon_color}
                                        selected_bg={form.icon_bg}
                                        onChange={(c, bg) => setForm(p => ({ ...p, icon_color: c, icon_bg: bg }))}
                                    />
                                </div>
                            </div>

                            <div className="um-grid-2">
                                <div className="um-field">
                                    <label className="um-label">Display Order</label>
                                    <input type="number" className="um-input" min={0} value={form.sort_order}
                                        onChange={e => set('sort_order', parseInt(e.target.value) || 0)} />
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                        Lower number = shown first
                                    </div>
                                </div>
                                <div className="um-field">
                                    <label className="um-label">Visibility</label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginTop: 6 }}>
                                        <div
                                            onClick={() => set('is_active', !form.is_active)}
                                            style={{
                                                width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
                                                background: form.is_active ? 'var(--admin-accent)' : 'var(--border-color)',
                                                position: 'relative', transition: 'background 0.2s',
                                            }}>
                                            <div style={{
                                                position: 'absolute', top: 4, left: form.is_active ? 20 : 4,
                                                width: 14, height: 14, borderRadius: '50%', background: '#fff',
                                                transition: 'left 0.2s',
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                            {form.is_active ? 'Active — visible to parishioners' : 'Inactive — hidden from public'}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Preview chip */}
                            <div className="um-section-label" style={{ marginTop: '1.25rem' }}>Preview</div>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 12,
                                background: 'var(--bg-hover)', borderRadius: 12, padding: '0.75rem 1rem',
                            }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%',
                                    background: form.icon_bg, display: 'grid', placeItems: 'center',
                                }}>
                                    <CurrentIcon size={22} color={form.icon_color} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                        {form.name || 'Sacrament Name'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {form.description || 'Description'}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ── Fields Tab ── */}
                    {tab === 'fields' && (
                        <>
                            {/* Fixed fields — always present */}
                            <div className="um-section-label">Fixed Fields (always collected)</div>
                            <div style={{
                                background: 'var(--bg-hover)', borderRadius: 10,
                                padding: '0.75rem 1rem', marginBottom: '1.25rem',
                                border: '1px dashed var(--border-color)',
                            }}>
                                {FIXED_FIELDS.map(f => (
                                    <div key={f} style={{
                                        display: 'flex', alignItems: 'center', gap: 8,
                                        padding: '4px 0', fontSize: '0.82rem', color: 'var(--text-muted)',
                                    }}>
                                        <FaCheck size={10} style={{ color: '#10b981', flexShrink: 0 }} />
                                        {f}
                                    </div>
                                ))}
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
                                    These fields are automatically added to every form. You cannot remove them.
                                </div>
                            </div>

                            {/* Custom fields */}
                            <div className="um-section-label">Custom Fields ({form.fields.length})</div>

                            {form.fields.length === 0 && !showAddPanel && (
                                <div style={{
                                    textAlign: 'center', padding: '2rem',
                                    border: '2px dashed var(--border-color)', borderRadius: 10,
                                    color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12,
                                }}>
                                    No custom fields yet.<br />
                                    <span style={{ fontSize: '0.78rem' }}>Click "Add Field" to collect additional information.</span>
                                </div>
                            )}

                            {form.fields.map((field, i) => (
                                <div key={field.id}>
                                    <FieldEditor
                                        field={field}
                                        onChange={updated => updateField(i, updated)}
                                        onDelete={() => deleteField(i)}
                                        onMove={dir => moveField(i, dir)}
                                        isFirst={i === 0}
                                        isLast={i === form.fields.length - 1}
                                    />
                                    {errors[`field_${i}`] && (
                                        <div className="um-field-error" style={{ marginTop: -6, marginBottom: 6 }}>
                                            <FaTriangleExclamation size={10} /> {errors[`field_${i}`]}
                                        </div>
                                    )}
                                    {errors[`field_${i}_opts`] && (
                                        <div className="um-field-error" style={{ marginTop: -6, marginBottom: 6 }}>
                                            <FaTriangleExclamation size={10} /> {errors[`field_${i}_opts`]}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {showAddPanel
                                ? <AddFieldPanel onAdd={addField} onClose={() => setShowAddPanel(false)} />
                                : (
                                    <button type="button" className="um-btn um-btn--outline um-btn--full"
                                        onClick={() => setShowAddPanel(true)}
                                        style={{ borderStyle: 'dashed', marginTop: 4 }}>
                                        <FaPlus size={11} /> Add Field
                                    </button>
                                )
                            }
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="um-modal__footer">
                    <button className="um-btn um-btn--outline" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className="um-btn um-btn--primary" onClick={handleSave} disabled={saving}>
                        <FaCheck size={11} /> {saving ? 'Saving…' : (initial ? 'Save Changes' : 'Create Sacrament')}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// SacramentTypeCard
// ─────────────────────────────────────────────────────────────
function SacramentTypeCard({ type, onEdit, onToggle, onDelete }) {
    const IconComp = ICON_MAP[type.icon]?.Icon ?? ICON_MAP['hands'].Icon;

    return (
        <div className="admin-table-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{
                width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                background: type.icon_bg, display: 'grid', placeItems: 'center',
            }}>
                <IconComp size={22} color={type.icon_color} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {type.name}
                    </span>
                    <span style={{
                        fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                        background: type.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)',
                        color: type.is_active ? '#10b981' : '#ef4444',
                    }}>
                        {type.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>

                {type.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '3px 0 4px', lineHeight: 1.4 }}>
                        {type.description}
                    </p>
                )}

                <div style={{ display: 'flex', gap: 12, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>{type.field_count} custom field{type.field_count !== 1 ? 's' : ''}</span>
                    <span>/{type.slug}</span>
                    <span>Created {type.created_at}</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="um-btn um-btn--outline" onClick={() => onToggle(type)}
                    title={type.is_active ? 'Deactivate' : 'Activate'}
                    style={{ padding: '6px 10px' }}>
                    {type.is_active ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                </button>
                <button className="um-btn um-btn--outline" onClick={() => onEdit(type)}
                    style={{ padding: '6px 10px' }}>
                    <FaPencil size={12} />
                </button>
                <button className="um-btn um-btn--danger" onClick={() => onDelete(type)}
                    style={{ padding: '6px 10px' }}>
                    <FaTrash size={12} />
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
export default function SacramentTypes() {
    const [types,   setTypes]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal,   setModal]   = useState(null); // null | { mode: 'create'|'edit', data?: {} }
    const [saving,  setSaving]  = useState(false);
    const [toast,   setToast]   = useState(null); // { type, msg }
    const [confirm, setConfirm] = useState(null); // type to delete

    const load = useCallback(() => {
        setLoading(true);
        axios.get('/admin/api/sacrament-types')
            .then(r => setTypes(r.data.data))
            .catch(() => showToast('error', 'Failed to load sacrament types.'))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const showToast = (type, msg) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 3500);
    };

    const handleSave = async (payload) => {
        setSaving(true);
        try {
            if (modal.mode === 'edit') {
                await axios.patch(`/admin/api/sacrament-types/${modal.data.id}`, payload);
                showToast('success', 'Sacrament updated.');
            } else {
                await axios.post('/admin/api/sacrament-types', payload);
                showToast('success', 'Sacrament created.');
            }
            setModal(null);
            load();
        } catch (err) {
            const msg = err.response?.data?.message || 'Save failed.';
            showToast('error', msg);
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (type) => {
        try {
            const res = await axios.patch(`/admin/api/sacrament-types/${type.id}/toggle`);
            setTypes(prev => prev.map(t => t.id === type.id ? { ...t, is_active: res.data.is_active } : t));
            showToast('success', res.data.message);
        } catch {
            showToast('error', 'Toggle failed.');
        }
    };

    const handleDelete = async () => {
        if (!confirm) return;
        try {
            await axios.delete(`/admin/api/sacrament-types/${confirm.id}`);
            setTypes(prev => prev.filter(t => t.id !== confirm.id));
            showToast('success', `"${confirm.name}" deleted.`);
        } catch {
            showToast('error', 'Delete failed.');
        } finally {
            setConfirm(null);
        }
    };

    return (
        <>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
                    padding: '0.75rem 1.25rem', borderRadius: 10, fontWeight: 600,
                    fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 10,
                    background: toast.type === 'success' ? 'rgba(16,185,129,0.95)' : 'rgba(239,68,68,0.95)',
                    color: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}>
                    {toast.type === 'success' ? <FaCheck size={13} /> : <FaTriangleExclamation size={13} />}
                    {toast.msg}
                </div>
            )}

            {/* Page header */}
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-header__title">Manage Sacraments</h1>
                    <p className="admin-page-header__sub">
                        Create and configure sacrament types and their custom forms.
                    </p>
                </div>
                <button className="um-btn um-btn--primary" onClick={() => setModal({ mode: 'create' })}>
                    <FaPlus size={12} /> New Sacrament
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="um-modal-loading" style={{ paddingTop: '3rem' }}>Loading…</div>
            ) : types.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <FaListCheck size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No sacrament types yet.</p>
                    <button className="um-btn um-btn--primary" onClick={() => setModal({ mode: 'create' })}
                        style={{ marginTop: 12 }}>
                        <FaPlus size={12} /> Create First Sacrament
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {types.map(type => (
                        <SacramentTypeCard
                            key={type.id}
                            type={type}
                            onEdit={t => setModal({ mode: 'edit', data: t })}
                            onToggle={handleToggle}
                            onDelete={t => setConfirm(t)}
                        />
                    ))}
                </div>
            )}

            {/* Builder modal */}
            {modal && (
                <BuilderModal
                    initial={modal.mode === 'edit' ? {
                        ...modal.data,
                        fields: modal.data.form_schema?.fields ?? [],
                    } : null}
                    onSave={handleSave}
                    onClose={() => setModal(null)}
                    saving={saving}
                />
            )}

            {/* Delete confirm */}
            {confirm && (
                <div className="um-overlay" onClick={e => e.target === e.currentTarget && setConfirm(null)}>
                    <div className="um-modal" style={{ maxWidth: 420 }}>
                        <div className="um-modal__header">
                            <span style={{ fontWeight: 700, color: '#ef4444' }}>Delete Sacrament Type?</span>
                            <button className="um-modal__close" onClick={() => setConfirm(null)}><FaXmark size={14} /></button>
                        </div>
                        <div className="um-modal__body" style={{ padding: '1rem 1.5rem' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                Deleting <strong>"{confirm.name}"</strong> will remove the form template.
                                Existing requests will not be deleted but will lose their type link.
                            </p>
                        </div>
                        <div className="um-modal__footer">
                            <button className="um-btn um-btn--outline" onClick={() => setConfirm(null)}>Cancel</button>
                            <button className="um-btn um-btn--danger" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}