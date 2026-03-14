@extends('layouts.app')

@section('title', $pageData['announcement']['title'] ?? 'Announcement')
@section('meta_description', $pageData['announcement']['excerpt'] ?? 'View parish announcement.')

@push('preload')
<script>
    window.__PAGE_DATA__ = {!! json_encode($pageData) !!};
</script>
@endpush

@section('content')
    <div id="bethel-announcement-detail"></div>
@endsection