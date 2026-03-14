@extends('layouts.app')

@section('title', 'Mass Schedule')
@section('meta_description', 'View weekly mass schedules across all parishes in the diocese.')

@push('preload')
<script>
    window.__PAGE_DATA__ = {!! json_encode($pageData) !!};
</script>
@endpush

@section('content')
    <div id="bethel-mass-schedule-page"></div>
@endsection