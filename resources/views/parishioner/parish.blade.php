@extends('layouts.app')

@section('title', ($pageData['parishData']['name'] ?? 'Parish') . ' — BethelApp')
@section('meta_description', 'View mass schedules, announcements, events, and clergy for ' . ($pageData['parishData']['name'] ?? 'this parish') . '.')

@push('preload')
<script>
    window.__PAGE_DATA__ = {!! json_encode($pageData) !!};
</script>
@endpush

@section('content')
    <div id="bethel-parish-page"></div>
@endsection