@extends('layouts.app')

@section('title', 'Parish Announcements')
@section('meta_description', 'Stay informed with the latest news and updates from your diocese.')

@push('head')
<script>
    window.__PAGE_DATA__ = {!! json_encode($pageData) !!};
</script>
@endpush

@section('content')
    <div id="bethel-announcements"></div>
@endsection