import React, { useState } from 'react';
import {
    FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope,
    FaPhone, FaLocationDot, FaCheck, FaArrowLeft, FaArrowRight,
} from 'react-icons/fa6';
import FloatInput  from '@/components/auth/FloatInput';
import FloatSelect from '@/components/auth/FloatSelect';

// ── Step config ────────────────────────────────────────────────────────────
const STEPS = [
    { number: 1, label: 'Credentials'  },
    { number: 2, label: 'Personal'     },
    { number: 3, label: 'Contact'      },
];

const GENDER_OPTIONS = [
    { value: 'Male',               label: 'Male'               },
    { value: 'Female',             label: 'Female'             },
    { value: 'Prefer not to say',  label: 'Prefer not to say'  },
];

// Initial form state
const INITIAL_DATA = {
    // Step 1
    username:              '',
    email:                 '',
    password:              '',
    password_confirmation: '',
    // Step 2
    first_name:  '',
    middle_name: '',
    last_name:   '',
    birth_date:  '',
    gender:      '',
    // Step 3
    phone:          '',
    country:        'Philippines',
    province:       '',
    city:           '',
    barangay:       '',
    street_address: '',
    zip_code:       '',
};

// ── Step Indicator ─────────────────────────────────────────────────────────
function StepIndicator({ currentStep }) {
    return (
        <div className="bethel-steps mb-4">
            {STEPS.map((step, index) => {
                const isDone   = currentStep > step.number;
                const isActive = currentStep === step.number;
                return (
                    <React.Fragment key={step.number}>
                        <div className={`bethel-step-item ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`}>
                            <div className="bethel-step-circle">
                                {isDone
                                    ? <FaCheck size={13} />
                                    : step.number}
                            </div>
                            <span className="bethel-step-label">{step.label}</span>
                        </div>
                        {index < STEPS.length - 1 && (
                            <div className={`bethel-step-connector ${currentStep > step.number ? 'completed' : ''}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function Register() {
    const [currentStep, setCurrentStep]             = useState(1);
    const [formData, setFormData]                   = useState(INITIAL_DATA);
    const [errors, setErrors]                       = useState({});
    const [showPassword, setShowPassword]           = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading]                     = useState(false);
    const [generalError, setGeneralError]           = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        if (generalError) setGeneralError('');
    };

    // ── Per-step validation ────────────────────────────────────────────────
    const validateStep = (step) => {
        const e = {};

        if (step === 1) {
            if (!formData.username.trim())
                e.username = 'Username is required.';
            else if (formData.username.length < 3)
                e.username = 'Username must be at least 3 characters.';
            else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username))
                e.username = 'Only letters, numbers, dots, dashes and underscores allowed.';

            if (!formData.email.trim())
                e.email = 'Email is required.';
            else if (!/\S+@\S+\.\S+/.test(formData.email))
                e.email = 'Enter a valid email address.';

            if (!formData.password)
                e.password = 'Password is required.';
            else if (formData.password.length < 8)
                e.password = 'Password must be at least 8 characters.';

            if (!formData.password_confirmation)
                e.password_confirmation = 'Please confirm your password.';
            else if (formData.password !== formData.password_confirmation)
                e.password_confirmation = 'Passwords do not match.';
        }

        if (step === 2) {
            if (!formData.first_name.trim()) e.first_name  = 'First name is required.';
            if (!formData.last_name.trim())  e.last_name   = 'Last name is required.';
            if (!formData.birth_date)        e.birth_date  = 'Date of birth is required.';
            if (!formData.gender)            e.gender      = 'Please select a gender.';
        }

        if (step === 3) {
            if (!formData.phone.trim())    e.phone    = 'Phone number is required.';
            if (!formData.country.trim())  e.country  = 'Country is required.';
            if (!formData.city.trim())     e.city     = 'City / Municipality is required.';
            if (!formData.barangay.trim()) e.barangay = 'Barangay is required.';
        }

        return e;
    };

    const handleNext = () => {
        const stepErrors = validateStep(currentStep);
        if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); return; }
        setErrors({});
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setErrors({});
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const stepErrors = validateStep(3);
        if (Object.keys(stepErrors).length > 0) { setErrors(stepErrors); return; }

        setLoading(true);
        setGeneralError('');

        try {
            await window.axios.post('/register', formData);
            window.location.href = '/';
        } catch (err) {
            if (err.response?.status === 422) {
                const serverErrors = err.response.data.errors ?? {};
                setErrors(serverErrors);

                // Jump back to the step that has the error
                const step1Fields = ['username', 'email', 'password', 'password_confirmation'];
                const step2Fields = ['first_name', 'middle_name', 'last_name', 'birth_date', 'gender'];
                if (step1Fields.some(f => serverErrors[f]))      setCurrentStep(1);
                else if (step2Fields.some(f => serverErrors[f])) setCurrentStep(2);
            } else {
                setGeneralError('Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Step 1 — Credentials ───────────────────────────────────────────────
    const renderStep1 = () => (
        <>
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
            <FloatInput
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                icon={FaEnvelope}
                autoComplete="email"
            />
            <FloatInput
                label="Password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                icon={FaLock}
                autoComplete="new-password"
                rightElement={
                    <button type="button" className="bethel-pwd-toggle"
                            onClick={() => setShowPassword(p => !p)}
                            aria-label="Toggle password" tabIndex={-1}>
                        {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                    </button>
                }
            />
            <FloatInput
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                error={errors.password_confirmation}
                required
                icon={FaLock}
                autoComplete="new-password"
                rightElement={
                    <button type="button" className="bethel-pwd-toggle"
                            onClick={() => setShowConfirmPassword(p => !p)}
                            aria-label="Toggle confirm password" tabIndex={-1}>
                        {showConfirmPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                    </button>
                }
            />
        </>
    );

    // ── Step 2 — Personal Info ─────────────────────────────────────────────
    const renderStep2 = () => (
        <>
            <div className="row g-2">
                <div className="col-6">
                    <FloatInput label="First Name" name="first_name" value={formData.first_name}
                                onChange={handleChange} error={errors.first_name} required />
                </div>
                <div className="col-6">
                    <FloatInput label="Last Name" name="last_name" value={formData.last_name}
                                onChange={handleChange} error={errors.last_name} required />
                </div>
            </div>
            <FloatInput
                label="Middle Name (optional)"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                error={errors.middle_name}
            />
            <FloatInput
                label="Date of Birth"
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                error={errors.birth_date}
                required
            />
            <FloatSelect
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                error={errors.gender}
                required
                options={GENDER_OPTIONS}
            />
        </>
    );

    // ── Step 3 — Contact ───────────────────────────────────────────────────
    const renderStep3 = () => (
        <>
            <FloatInput
                label="Phone Number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                required
                icon={FaPhone}
            />
            <FloatInput
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                error={errors.country}
                required
                icon={FaLocationDot}
            />
            <FloatInput
                label="Province / State (optional)"
                name="province"
                value={formData.province}
                onChange={handleChange}
                error={errors.province}
            />
            <div className="row g-2">
                <div className="col-7">
                    <FloatInput label="City / Municipality" name="city" value={formData.city}
                                onChange={handleChange} error={errors.city} required />
                </div>
                <div className="col-5">
                    <FloatInput label="Zip Code" name="zip_code" value={formData.zip_code}
                                onChange={handleChange} error={errors.zip_code} />
                </div>
            </div>
            <FloatInput
                label="Barangay"
                name="barangay"
                value={formData.barangay}
                onChange={handleChange}
                error={errors.barangay}
                required
            />
            <FloatInput
                label="Street Address / House No. (optional)"
                name="street_address"
                value={formData.street_address}
                onChange={handleChange}
                error={errors.street_address}
            />
        </>
    );

    // ── Render ─────────────────────────────────────────────────────────────
    const stepTitles = ['Create Account', 'Personal Info', 'Contact Details'];

    return (
        <div className="bethel-auth-page">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">

                        <div className="bethel-auth-card">

                            {/* Header */}
                            <div className="text-center mb-4">
                                <div style={{
                                    width: '56px', height: '56px',
                                    background: 'var(--bethel-primary)',
                                    borderRadius: '14px',
                                    display: 'grid', placeItems: 'center',
                                    margin: '0 auto 1rem',
                                    boxShadow: '0 8px 24px rgba(26,60,94,0.25)',
                                }}>
                                    <span style={{ color: 'var(--bethel-secondary)', fontSize: '1.4rem', fontWeight: 800 }}>B</span>
                                </div>
                                <h1 className="bethel-auth-title d-inline-block">
                                    {stepTitles[currentStep - 1]}
                                </h1>
                                <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.85rem' }}>
                                    Join <strong style={{ color: 'var(--bethel-primary)' }}>BethelApp</strong>
                                    {' '}— Step {currentStep} of {STEPS.length}
                                </p>
                            </div>

                            {/* Step indicator */}
                            <StepIndicator currentStep={currentStep} />

                            {/* General error */}
                            {generalError && (
                                <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2"
                                     style={{ fontSize: '0.85rem', borderRadius: '0.625rem', border: 'none', background: '#fef2f2', color: '#dc2626' }}>
                                    {generalError}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} noValidate>
                                {currentStep === 1 && renderStep1()}
                                {currentStep === 2 && renderStep2()}
                                {currentStep === 3 && renderStep3()}

                                {/* Navigation buttons */}
                                <div className={`d-flex gap-2 mt-3 ${currentStep > 1 ? 'justify-content-between' : ''}`}>

                                    {/* Back button */}
                                    {currentStep > 1 && (
                                        <button type="button" className="bethel-auth-btn-outline d-flex align-items-center justify-content-center gap-2"
                                                onClick={handleBack} style={{ width: 'auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
                                            <FaArrowLeft size={12} /> Back
                                        </button>
                                    )}

                                    {/* Next / Submit button */}
                                    {currentStep < STEPS.length ? (
                                        <button type="button" className="bethel-auth-btn d-flex align-items-center justify-content-center gap-2"
                                                onClick={handleNext}>
                                            Next <FaArrowRight size={12} />
                                        </button>
                                    ) : (
                                        <button type="submit" className="bethel-auth-btn d-flex align-items-center justify-content-center gap-2"
                                                disabled={loading}>
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" />
                                                    Creating account...
                                                </>
                                            ) : (
                                                <><FaCheck size={12} /> Create Account</>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Login link */}
                                {currentStep === 1 && (
                                    <p className="text-center mt-3 mb-0" style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                        Already have an account?{' '}
                                        <a href="/login" style={{ color: 'var(--bethel-primary)', fontWeight: 700, textDecoration: 'underline' }}>
                                            Sign in
                                        </a>
                                    </p>
                                )}
                            </form>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}