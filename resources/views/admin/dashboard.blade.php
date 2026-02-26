@extends('layouts.admin')
@section('title', 'Dashboard')

@push('head')
<script>
    window.__ADMIN_DATA__ = {!! json_encode($adminData) !!};
</script>
@endpush

@section('content')

@endsection