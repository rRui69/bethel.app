@extends('layouts.app')

@section('title', ($pageData['clergyData']['titled_name'] ?? 'Clergy Profile') . ' — BethelApp')
@section('meta_description', 'Learn about ' . ($pageData['clergyData']['titled_name'] ?? 'this clergy member') . ' and view their schedule at ' . ($pageData['parishData']['name'] ?? 'the parish') . '.')

@push('preload')
<script>
    window.__PAGE_DATA__ = {!! json_encode($pageData) !!};
</script>
@endpush

@section('content')
    <div id="bethel-clergy-profile"></div>
@endsection