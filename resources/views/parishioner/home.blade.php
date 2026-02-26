@extends('layouts.app')

@section('title', 'Home')
@section('meta_description', 'BethelApp — Find your parish, view mass schedules, announcements, and book sacramental appointments.')

@section('content')

    {{-- Pass PHP data to React via window object --}}
    @push('head')
    <script>
        window.__PAGE_DATA__ = {!! json_encode($pageData) !!};
    </script>
    @endpush

    {{-- React root: Home page here --}}
    <div id="bethel-home"></div>

@endsection