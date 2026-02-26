<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <meta name="description" content="@yield('meta_description', 'BethelApp — Your one-stop hub for parish life.')">

    <title>@yield('title', 'BethelApp') — Parish Hub</title>

    {{-- Favicon --}}
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet">

    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
    @stack('head')
</head>
<body>

    @include('partials.navbar')

    <main id="main-content" role="main">
        @yield('content')
    </main>

    @include('partials.footer')

    @stack('scripts')

</body>
</html>