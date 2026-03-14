@extends('layouts.admin')
@section('title', 'Mass Schedules')

@push('preload')
<script>
    window.__ADMIN_DATA__ = {!! json_encode($adminData) !!};
</script>
@endpush

@section('content')
@endsection