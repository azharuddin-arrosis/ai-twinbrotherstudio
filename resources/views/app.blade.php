<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <link rel="preconnect" href="https://fonts.bunny.net" />
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&family=jetbrains-mono:400,500" rel="stylesheet" />
    @inertiaHead
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])

    @if(env('GA_MEASUREMENT_ID'))
    {{-- Google Analytics 4 — hanya load jika GA_MEASUREMENT_ID diset --}}
    <script async src="https://www.googletagmanager.com/gtag/js?id={{ env('GA_MEASUREMENT_ID') }}"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '{{ env('GA_MEASUREMENT_ID') }}', {
            send_page_view: false  // kita handle manual via Inertia navigate event
        });
    </script>
    @endif
</head>
<body class="antialiased bg-white text-gray-900">
    @inertia
</body>
</html>
