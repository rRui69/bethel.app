@extends('layouts.admin')

@section('title', 'User Management')

@push('head')
<script>
    window.__ADMIN_DATA__ = {!! json_encode($adminData) !!};
</script>
@endpush