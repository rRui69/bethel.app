@extends('layouts.app')

@section('title', 'Reset Password — BethelApp')
@section('meta_description', 'Choose a new password for your BethelApp account.')

@section('content')
<div class="bethel-auth-page d-flex align-items-center justify-content-center" style="min-height: calc(100vh - 140px); padding: 2rem 1rem;">
    <div class="bethel-auth-card" style="width: 100%; max-width: 440px; padding: 2.5rem; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">

        {{-- Logo --}}
        <div class="text-center mb-4">
            <div style="font-size: 1.5rem; font-weight: 800; color: var(--bethel-primary);">
                Bethel<span style="color: var(--bethel-secondary);">App</span>
            </div>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 4px;">Choose a new password</p>
        </div>

        <form method="POST" action="{{ route('password.store') }}">
            @csrf
            <input type="hidden" name="token" value="{{ $request->route('token') }}">

            <div class="mb-3">
                <label for="email" class="form-label fw-semibold" style="font-size: 0.85rem;">Email Address</label>
                <input
                    id="email" type="email" name="email"
                    value="{{ old('email', $request->email) }}"
                    class="form-control bethel-float-input @error('email') is-invalid @enderror"
                    required autofocus autocomplete="username"
                />
                @error('email')
                    <div class="invalid-feedback">{{ $message }}</div>
                @enderror
            </div>

            <div class="mb-3">
                <label for="password" class="form-label fw-semibold" style="font-size: 0.85rem;">New Password</label>
                <input
                    id="password" type="password" name="password"
                    class="form-control bethel-float-input @error('password') is-invalid @enderror"
                    required autocomplete="new-password"
                />
                @error('password')
                    <div class="invalid-feedback">{{ $message }}</div>
                @enderror
            </div>

            <div class="mb-4">
                <label for="password_confirmation" class="form-label fw-semibold" style="font-size: 0.85rem;">Confirm New Password</label>
                <input
                    id="password_confirmation" type="password" name="password_confirmation"
                    class="form-control bethel-float-input"
                    required autocomplete="new-password"
                />
            </div>

            <button type="submit" class="btn w-100 fw-bold py-2"
                style="background: var(--bethel-primary); color: #fff; border-radius: 10px;">
                Reset Password
            </button>
        </form>
    </div>
</div>
@endsection
