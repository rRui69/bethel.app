import React, { useState, useEffect, useRef } from 'react';
import { FaShieldHalved, FaArrowRight, FaRotate } from 'react-icons/fa6';
import { BiSolidBible } from "react-icons/bi";

const RESEND_COOLDOWN = 60; // seconds before Resend is available again

export default function OtpVerification({ email = '', firstName = '' }) {
    const [otp,       setOtp]       = useState('');
    const [loading,   setLoading]   = useState(false);
    const [error,     setError]     = useState('');
    const [success,   setSuccess]   = useState('');
    const [cooldown,  setCooldown]  = useState(0);
    const inputRef = useRef();

    // Start cooldown timer after page loads (OTP was just sent on registration)
    useEffect(() => {
        setCooldown(RESEND_COOLDOWN);
    }, []);

    // Countdown tick
    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!otp.trim()) { setError('Please enter the verification code.'); return; }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await window.axios.post('/verify-otp', { otp: otp.trim().toUpperCase() });
            if (res.data?.redirect_url) {
                setSuccess('Verified! Redirecting…');
                setTimeout(() => { window.location.href = res.data.redirect_url; }, 800);
            }
        } catch (err) {
            const msg = err.response?.data?.message ?? err.response?.data?.errors?.otp?.[0];
            setError(msg ?? 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        if (cooldown > 0) return;
        setError('');
        setSuccess('');

        try {
            await window.axios.post('/verify-otp/resend');
            setSuccess('A new code has been sent to your email.');
            setCooldown(RESEND_COOLDOWN);
            setOtp('');
            inputRef.current?.focus();
        } catch (err) {
            const msg = err.response?.data?.message;
            setError(msg ?? 'Could not resend. Please try again shortly.');
        }
    }

    function handleChange(e) {
        // Allow only alphanumeric, auto uppercase
        const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
        setOtp(val);
        setError('');
    }

    return (
        <div className="bethel-auth-page d-flex align-items-center justify-content-center"
             style={{ minHeight: 'calc(100vh - 140px)', padding: '2rem 1rem' }}>

            <div className="bethel-auth-card"
                 style={{ width: '100%', maxWidth: 460, padding: '2.5rem',
                          borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>

                {/* Logo */}
                <div className="text-center mb-4">
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--bethel-primary)' }}>
                        Bethel<span style={{ color: 'var(--bethel-secondary)' }}>App</span>
                    </div>
                </div>

                {/* Icon */}
                <div className="text-center mb-3">
                    <div style={{
                        width: 64, height: 64, borderRadius: 16, margin: '0 auto 14px',
                        background: 'rgba(26,60,94,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--bethel-primary)',
                    }}>
                        <FaShieldHalved size={28} />
                    </div>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 800,
                                 color: 'var(--bethel-primary)', margin: '0 0 6px' }}>
                        Verify Your Email
                    </h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                        {firstName ? `Hi ${firstName}! We` : 'We'} sent a verification code to<br/>
                        <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                    </p>
                </div>

                {/* Bible verse hint
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 14px', borderRadius: 10, marginBottom: '1.5rem',
                    background: 'rgba(200,151,58,0.08)',
                    border: '1px solid rgba(200,151,58,0.25)',
                }}>
                    <BiSolidBible size={14} style={{ color: 'var(--bethel-secondary)', flexShrink: 0 }} />
                    <p style={{ fontSize: '0.78rem', color: 'var(--bethel-secondary)', margin: 0, fontWeight: 600 }}>
                        Your code is a Bible verse reference — e.g. <strong>JOHN316</strong>, <strong>PSALM231</strong>
                    </p>
                </div>
                */}

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate>
                    <div className="mb-3">
                        <label style={{ fontSize: '0.85rem', fontWeight: 600,
                                        color: 'var(--text-primary)', display: 'block', marginBottom: 6 }}>
                            Verification Code
                        </label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={otp}
                            onChange={handleChange}
                            placeholder="Enter your code"
                            className="form-control bethel-float-input"
                            autoFocus
                            autoComplete="one-time-code"
                            spellCheck={false}
                            style={{
                                textAlign: 'center',
                                fontSize: '1.5rem',
                                fontWeight: 800,
                                letterSpacing: '6px',
                                fontFamily: "'Courier New', monospace",
                                padding: '14px 20px',
                                borderRadius: 12,
                                borderColor: error ? '#ef4444' : undefined,
                            }}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3"
                             style={{ fontSize: '0.82rem', borderRadius: 10 }}>
                            <i className="bi bi-exclamation-circle-fill" />
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="alert alert-success d-flex align-items-center gap-2 py-2 mb-3"
                             style={{ fontSize: '0.82rem', borderRadius: 10 }}>
                            <i className="bi bi-check-circle-fill" />
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !otp}
                        className="btn w-100 fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                        style={{
                            background: 'var(--bethel-primary)', color: '#fff',
                            borderRadius: 10, fontSize: '0.95rem',
                            opacity: (loading || !otp) ? 0.7 : 1,
                        }}>
                        {loading ? (
                            <><span className="spinner-border spinner-border-sm" /> Verifying…</>
                        ) : (
                            <> Verify Code <FaArrowRight size={13} /></>
                        )}
                    </button>
                </form>

                {/* Resend */}
                <div className="text-center mt-4">
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                        Didn't receive a code? Check your spam folder first.
                    </p>
                    <button
                        onClick={handleResend}
                        disabled={cooldown > 0}
                        className="btn btn-sm d-inline-flex align-items-center gap-2"
                        style={{
                            background: 'transparent',
                            border: '1.5px solid var(--bethel-primary)',
                            color: 'var(--bethel-primary)',
                            borderRadius: 8, fontWeight: 600, fontSize: '0.82rem',
                            opacity: cooldown > 0 ? 0.5 : 1,
                            cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                        }}>
                        <FaRotate size={11} />
                        {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
                    </button>
                </div>

                {/* Expiry notice */}
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)',
                            textAlign: 'center', marginTop: '1rem' }}>
                    ⏱ Code expires in 15 minutes
                </p>

            </div>
        </div>
    );
}
