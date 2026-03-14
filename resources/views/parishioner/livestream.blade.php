@extends('layouts.app')

@section('title', 'Livestream')
@section('meta_description', 'Watch live Mass and church events from our parishes.')

@push('preload')
<script>
    window.__PAGE_DATA__ = {!! json_encode($pageData) !!};
</script>
@endpush

@section('content')
    <div id="bethel-livestream-page"></div>
@endsection