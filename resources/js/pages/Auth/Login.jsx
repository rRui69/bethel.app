import React, { useState } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa6';
import FloatInput from '@/components/auth/FloatInput';

export default function Login() {
    const [formData, setFormData]           = useState({ username: '', password: '', remember: false });
    const [showPassword, setShowPassword]   = useState(false);
    const [errors, setErrors]               = useState({});
    const [generalError, setGeneralError]   = useState('');
    const [loading, setLoading]             = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (generalError) setGeneralError('');
    };

    // Client-side validation
    const validate = () => {
        const e = {};
        if (!formData.username.trim()) e.username = 'Username is required.';
        if (!formData.password)        e.password = 'Password is required.';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const clientErrors = validate();
        if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return; }

        setLoading(true);
        setErrors({});
        setGeneralError('');

        try {
            const response = await window.axios.post('/login', {
                username: formData.username,
                password: formData.password,
                remember: formData.remember,
            });

            if (response.data?.redirect_url) {
                window.location.href = response.data.redirect_url;
            } else {
                window.location.href = '/';
            }

        } catch (err) {
            if (err.response?.status === 422) {
                const serverErrors = err.response.data.errors ?? {};
                setErrors(serverErrors);
                if (err.response.data.message && !serverErrors.username) {
                    setGeneralError(err.response.data.message);
                }
            } else {
                setGeneralError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bethel-auth-page">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-9 col-md-7 col-lg-5 col-xl-4">

                        <div className="bethel-auth-card">

                            {/* Brand mark */}
                            <div className="text-center mb-4">
                                <div style={{
                                    width: '56px', height: '56px',
                                    background: 'var(--bethel-primary)',
                                    borderRadius: '14px',
                                    display: 'grid', placeItems: 'center',
                                    margin: '0 auto 1rem',
                                    boxShadow: '0 8px 24px rgba(26,60,94,0.25)',
                                }}>
                                    <span style={{ color: 'var(--bethel-secondary)', fontSize: '1.4rem', fontWeight: 800, lineHeight: 1 }}>B</span>
                                </div>
                                <h1 className="bethel-auth-title d-inline-block">Sign In</h1>
                                <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.875rem' }}>
                                    Welcome back to{' '}
                                    <strong style={{ color: 'var(--bethel-primary)' }}>BethelApp</strong>
                                </p>
                            </div>

                            {/* General error */}
                            {generalError && (
                                <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2"
                                     style={{ fontSize: '0.85rem', borderRadius: '0.625rem', border: 'none', background: '#fef2f2', color: '#dc2626' }}>
                                    <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    {generalError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} noValidate>

                                {/* Username */}
                                <FloatInput
                                    label="Username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    error={errors.username}
                                    required
                                    icon={FaUser}
                                    autoComplete="username"
                                />

                                {/* Password */}
                                <FloatInput
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                    required
                                    icon={FaLock}
                                    autoComplete="current-password"
                                    rightElement={
                                        <button
                                            type="button"
                                            className="bethel-pwd-toggle"
                                            onClick={() => setShowPassword(p => !p)}
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            tabIndex={-1}
                                        >
                                            {showPassword
                                                ? <FaEyeSlash size={15} />
                                                : <FaEye size={15} />}
                                        </button>
                                    }
                                />

                                {/* Remember Me + Forgot Password */}
                                <div className="d-flex justify-content-between align-items-center mb-4 mt-1">
                                    <label className="d-flex align-items-center gap-2 mb-0"
                                           style={{ cursor: 'pointer', fontSize: '0.82rem', color: '#6b7280', userSelect: 'none' }}>
                                        <input
                                            type="checkbox"
                                            name="remember"
                                            checked={formData.remember}
                                            onChange={handleChange}
                                            style={{ accentColor: 'var(--bethel-primary)', width: '15px', height: '15px', cursor: 'pointer' }}
                                        />
                                        Remember me
                                    </label>
                                    <a href="/forgot-password"
                                       style={{ fontSize: '0.82rem', color: 'var(--bethel-primary)', textDecoration: 'none', fontWeight: 600 }}>
                                        Forgot password?
                                    </a>
                                </div>

                                {/* Submit */}
                                <button type="submit" className="bethel-auth-btn" disabled={loading}>
                                    {loading ? (
                                        <span className="d-flex align-items-center justify-content-center gap-2">
                                            <span className="spinner-border spinner-border-sm" role="status" />
                                            Signing in...
                                        </span>
                                    ) : 'Sign In'}
                                </button>

                                {/* Register link */}
                                <div className="bethel-auth-divider">
                                    <span>or</span>
                                </div>
                                <p className="text-center mb-0" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    No account?{' '}
                                    <a href="/register"
                                       style={{ color: 'var(--bethel-primary)', fontWeight: 700, textDecoration: 'underline' }}>
                                        Register now
                                    </a>
                                </p>

                            </form>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}