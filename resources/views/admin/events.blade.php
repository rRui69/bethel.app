@extends('layouts.admin')

@section('title', 'Events')

@push('head')
<script>
    window.__ADMIN_DATA__ = {{ Js::from($adminData) }};
</script>
@endpush

@section('content')
@endsection 