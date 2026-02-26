import React, { useState } from 'react';

/**
 * FloatInput — Reusable floating label input
 * Used by both Login.jsx and Register.jsx
 *
 * Props:
 *   label        — floating label text
 *   type         — input type (text, password, email, date, tel)
 *   name         — field name
 *   value        — controlled value
 *   onChange     — change handler
 *   error        — error string (shows below input)
 *   required     — appends * to label
 *   icon         — react-icons component (optional)
 *   rightElement — JSX for right side (e.g. password toggle)
 *   disabled     — disables input
 */
export default function FloatInput({
    label,
    type = 'text',
    name,
    value,
    onChange,
    error,
    required = false,
    icon: Icon,
    rightElement,
    disabled = false,
    autoComplete,
}) {
    const [focused, setFocused] = useState(false);

    // Float up when focused OR has a value
    // For date inputs, always float since browser shows its own UI
    const isFloated = focused || (value && value.toString().length > 0) || type === 'date';

    return (
        <div className="bethel-float-group">

            {/* Left icon */}
            {Icon && (
                <span className="bethel-float-icon">
                    <Icon size={14} aria-hidden="true" />
                </span>
            )}

            {/* Input */}
            <input
                type={type}
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                required={required}
                disabled={disabled}
                autoComplete={autoComplete ?? name}
                placeholder=" "
                className={[
                    'bethel-float-input',
                    Icon ? 'has-icon' : '',
                    error ? 'is-invalid' : '',
                ].join(' ')}
                style={{ paddingRight: rightElement ? '3rem' : undefined }}
            />

            {/* Floating label */}
            <span className={[
                'bethel-float-label-text',
                isFloated ? 'floated' : '',
                Icon ? 'has-icon' : '',
            ].join(' ')}>
                {label}{required && <span style={{ color: '#ef4444', marginLeft: '2px' }}>*</span>}
            </span>

            {/* Right element (e.g. password toggle button) */}
            {rightElement}

            {/* Error message */}
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