@extends('layouts.app')

@section('title', 'Upcoming Events')
@section('meta_description', 'Browse upcoming community, liturgical, and youth events across the diocese.')

@push('head')
<script>
    window.__PAGE_DATA__ = {!! json_encode($pageData) !!};
</script>
@endpush

@section('content')
    <div id="bethel-events-page"></div>
@endsection