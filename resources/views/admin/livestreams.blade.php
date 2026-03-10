@extends('layouts.admin')
@section('title', 'Livestreams')

@push('head')
<script>
    window.__ADMIN_DATA__ = {!! json_encode($adminData) !!};
</script>
@endpush

@section('content')
@endsection