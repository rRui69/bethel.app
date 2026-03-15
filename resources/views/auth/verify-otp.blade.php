@extends('layouts.app')

@section('title', 'Verify Your Email — BethelApp')
@section('meta_description', 'Enter your verification code to activate your BethelApp account.')

@push('preload')
<script>
    window.__PAGE_DATA__ = {
        email:     @json($email),
        firstName: @json($firstName),
    };
</script>
@endpush

@section('content')
    <div id="bethel-otp-verification"></div>
@endsection
