@extends('layouts.app')
@section('title', 'Coming Soon')
@section('content')
<div class="d-flex align-items-center justify-content-center" style="min-height:60vh;">
    <div class="text-center">
        <i class="bi bi-hammer fs-1 d-block mb-3" style="color:var(--bethel-secondary);"></i>
        <h2 class="fw-bold" style="color:var(--bethel-primary);">Coming Soon</h2>
        <p class="text-muted">This page is under construction. Check back later!</p>
        <a href="{{ url('/') }}" class="btn rounded-pill px-4 mt-2"
           style="background:var(--bethel-primary);color:#fff;">← Back to Home</a>
    </div>
</div>
@endsection