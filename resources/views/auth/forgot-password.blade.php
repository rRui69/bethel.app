@extends('layouts.app')

@section('title', 'Forgot Password — BethelApp')
@section('meta_description', 'Request a password reset link for your BethelApp account.')

@section('content')
<div class="bethel-auth-page d-flex align-items-center justify-content-center" style="min-height: calc(100vh - 140px); padding: 2rem 1rem;">
    <div class="bethel-auth-card" style="width: 100%; max-width: 440px; padding: 2.5rem; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">

        {{-- Logo --}}
        <div class="text-center mb-4">
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--bethel-primary);">
                Bethel<span style="color: var(--bethel-secondary);">App</span>
            </div>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">Reset your password</p>
        </div>

        @if (session('status'))
            <div class="alert alert-success d-flex align-items-center gap-2 mb-3" style="font-size: 0.875rem;">
                <i class="bi bi-check-circle-fill"></i>
                {{ session('status') }}
            </div>
        @endif

        <p style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.6;">
            Enter the email address linked to your account and we'll send you a password reset link.
        </p>

        <form method="POST" action="{{ route('password.email') }}">
            @csrf

            <div class="mb-3">
                <label for="email" class="form-label fw-semibold" style="font-size: 0.85rem;">Email Address</label>
                <input
                    id="email" type="email" name="email"
                    value="{{ old('email') }}"
                    class="form-control bethel-float-input @error('email') is-invalid @enderror"
                    placeholder="your@email.com"
                    required autofocus
                />
                @error('email')
                    <div class="invalid-feedback">{{ $message }}</div>
                @enderror
            </div>

            <button type="submit" class="btn w-100 fw-bold py-2 mt-2"
                style="background: var(--bethel-primary); color: #fff; border-radius: 10px;">
                Send Reset Link
            </button>
        </form>

        <div class="text-center mt-3">
            <a href="{{ route('login') }}" style="font-size: 0.82rem; color: var(--bethel-primary);">
                ← Back to Sign In
            </a>
        </div>
    </div>
</div>
@endsection
