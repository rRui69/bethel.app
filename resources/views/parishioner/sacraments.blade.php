@extends('layouts.app')

@section('title', 'Sacraments')
@section('meta_description', 'Book a sacramental appointment with your parish — Baptism, Wedding, Confirmation, and more.')

@push('head')
<script>
    window.__PAGE_DATA__ = {!! json_encode($pageData) !!};
</script>
@endpush

@section('content')
    <div id="bethel-sacraments-page"></div>
@endsection