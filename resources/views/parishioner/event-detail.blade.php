@extends('layouts.app')

@section('title', $pageData['event']['title'] ?? 'Event Detail')
@section('meta_description', $pageData['event']['description'] ?? 'View event details.')

@push('head')
<script>
    window.__PAGE_DATA__ = {!! json_encode($pageData) !!};
</script>
@endpush

@section('content')
    <div id="bethel-event-detail"></div>
@endsection