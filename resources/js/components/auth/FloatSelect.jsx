import React, { useState } from 'react';

/**
 * FloatSelect — Floating label select dropdown
 */
export default function FloatSelect({
    label,
    name,
    value,
    onChange,
    error,
    required = false,
    options = [],  // [{ value, label }]
    disabled = false,
}) {
    const [focused, setFocused] = useState(false);
    const isFloated = focused || (value && value.length > 0);

    return (
        <div className="bethel-float-group">

            {/* Chevron icon */}
            <span style={{
                position: 'absolute',
                right: '0.9rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#9ca3af',
            }}>
                <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </span>

            <select
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                required={required}
                disabled={disabled}
                className={['bethel-float-select', error ? 'is-invalid' : ''].join(' ')}
            >
                <option value=""></option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            <span className={['bethel-float-label-text', isFloated ? 'floated' : ''].join(' ')}>
                {label}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
            </span>

            {error && (
                <span className="bethel-field-error">
                    <svg width="11" height="11" viewBox="0 0 20 20" fill="#ef4444">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {Array.isArray(error) ? error[0] : error}
                </span>
            )}
        </div>
    );
}