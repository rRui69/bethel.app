@extends('layouts.app')

@section('title', 'Inbox')
@section('meta_description', 'Your notifications and message threads from parish staff.')

@push('head')
<script>
    window.__PAGE_DATA__ = {!! json_encode($pageData) !!};
</script>
@endpush

@section('content')
    <div id="bethel-inbox"></div>
@endsection