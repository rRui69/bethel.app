@extends('layouts.app')

@section('title', $pageData['sacramentType']['name'] . ' Request')
@section('meta_description', 'Submit a ' . $pageData['sacramentType']['name'] . ' request to your parish.')

@push('preload')
<script>
    window.__PAGE_DATA__ = {!! json_encode($pageData) !!};
</script>
@endpush

@section('content')
    <div id="bethel-sacrament-form"></div>
@endsection