@extends('layouts.app')

@section('title', 'Find Your Parish — BethelApp')
@section('meta_description', 'BethelApp — Find your parish, view mass schedules, announcements, and book sacramental appointments.')

@section('content')

    @push('preload')
    <script>
        window.__PAGE_DATA__ = {!! json_encode($pageData) !!};
    </script>
    @endpush

    {{-- Hero search only — parish details live on /parish/{id} --}}
    <div id="bethel-home"></div>

@endsection