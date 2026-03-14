@extends('layouts.admin')

@section('title', 'Parish Announcements')

@push('preload')
<script>
    window.__ADMIN_DATA__ = {{ Js::from($adminData) }};
</script>
@endpush

@section('content')
@endsection