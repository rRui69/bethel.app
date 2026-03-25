<nav class="navbar navbar-expand-lg bethel-navbar sticky-top" aria-label="Main navigation">
    <div class="container">

{{--
============================================================
    NAVBAR BRAND LOGO
    Only one should be active.
============================================================
--}}

        {{--
            PNG or SVG logo
            Drop file in: public/images/bethel-logo.png (or .svg)
            Uncomment the block below and comment out Bootstrap Icon
            height at 36px --}}
        {{--
        <a class="navbar-brand" href="{{ url('/') }}">
            <img
                src="{{ asset('images/bethel-logo.png') }}"
                alt="BethelApp Logo"
                height="36"
                style="object-fit:contain;"
            />
            Bethel<span class="brand-accent">App</span>
        </a>
        --}}

        {{--
            Bootstrap Icon as brand mark
            Change 'bi-house-heart-fill' to any icon at:
            https://icons.getbootstrap.com
            ex: bi-church, bi-stars, bi-globe, bi-cross, bi-heart-pulse
        --}}
        <div id="bethel-nav-brand"></div>

        {{-- Mobile --}}
        <button class="navbar-toggler border-0 p-1" type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#bethelNavOffcanvas"
                aria-controls="bethelNavOffcanvas"
                aria-label="Toggle navigation">
            <i class="bi bi-list text-white fs-4"></i>
        </button>

        {{-- Desktop Nav --}}
        <div class="d-none d-lg-flex align-items-center w-100" id="desktopNav">
            <ul class="navbar-nav mx-auto gap-1">
                <li class="nav-item">
                    <a class="nav-link {{ request()->is('/') ? 'active' : '' }}"
                       href="{{ url('/') }}">Home</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {{ request()->is('mass-schedule*') ? 'active' : '' }}"
                       href="{{ url('/mass-schedule') }}">Mass Schedule</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {{ request()->is('announcements*') ? 'active' : '' }}"
                       href="{{ url('/announcements') }}">Announcements</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link {{ request()->is('events*') ? 'active' : '' }}"
                       href="{{ url('/events') }}">Events</a>
                </li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle {{ request()->is('sacraments*') ? 'active' : '' }}"
                    href="#" role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false">Sacraments</a>

                    {{--SacramentsDropdown.jsx renders the list.
                        Changing icons/labels in config/sacraments.js updates this
                        AND the QuickLinks cards on the homepage simultaneously. --}}
                    <ul class="dropdown-menu" style="min-width: 240px;">
                        <div id="bethel-sacraments-nav"></div>
                    </ul>
                </li>

                <!-- <li class="nav-item">
                    <a class="nav-link {{ request()->is('contact*') ? 'active' : '' }}"
                       href="{{ url('/contact') }}">Contact Us</a>
                </li> -->
            </ul>

            {{-- Auth Section --}}
            <div class="d-flex align-items-center gap-2">
                {{-- Theme toggle --}}
                <div id="bethel-theme-toggle"></div>
                      {{-- Notification Bell --}}
                @auth
                    <div id="bethel-notification-bell" style="background: var(--bethel-secondary);" data-is-auth="true"></div>
                @endauth
          @auth
                    {{-- Logged-in user dropdown --}}
                    <div class="dropdown">
                        <button class="btn d-flex align-items-center gap-2 text-white p-0 border-0"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false">
                            <div style="width:34px;height:34px;border-radius:50%;background:var(--bethel-secondary);display:grid;place-items:center;font-size:0.85rem;font-weight:700;color:var(--bethel-primary);">
                                {{ strtoupper(substr(auth()->user()->first_name, 0, 1)) }}
                            </div>
                            <span class="d-none d-xl-block" style="font-size:0.875rem;font-weight:500;">
                                {{ auth()->user()->first_name }} {{ auth()->user()->last_name }}
                            </span>
                            <i class="bi bi-chevron-down" style="font-size:0.65rem;"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li class="px-3 py-2 border-bottom">
                                <div class="fw-semibold" style="font-size:0.9rem;">{{ auth()->user()->first_name }} {{ auth()->user()->last_name }}</div>
                                <div class="text-muted" style="font-size:0.78rem;">{{ auth()->user()->email }}</div>
                            </li>
                            <li><a class="dropdown-item" href="{{ url('/inbox') }}">
                                <i class="bi bi-envelope me-2"></i>Inbox</a></li>
                            <li><a class="dropdown-item" href="{{ url('/profile') }}">
                                <i class="bi bi-person me-2"></i>View / Edit Profile</a></li>
                            <li><a class="dropdown-item" href="{{ url('/my-bookings') }}">
                                <i class="bi bi-calendar-check me-2"></i>My Bookings</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <form method="POST" action="{{ route('logout') }}">
                                    @csrf
                                    <button type="submit" class="dropdown-item text-danger">
                                        <i class="bi bi-box-arrow-right me-2"></i>Logout
                                    </button>
                                </form>
                            </li>
                        </ul>
                    </div>
                @else
                    <a href="{{ url('/login') }}" class="nav-link text-white-50 d-none d-lg-block"
                       style="font-size:0.875rem;">Login</a>
                    <a href="{{ url('/register') }}" class="nav-link btn-register rounded-pill">
                        Register
                    </a>
                @endauth
            </div>
        </div>

    </div>
</nav>

{{-- For Mobile --}}
<div class="offcanvas offcanvas-end text-bg-dark" tabindex="-1"
     id="bethelNavOffcanvas"
     style="background: var(--bethel-primary) !important; width: 280px;">
    <div class="offcanvas-header border-bottom" style="border-color: rgba(255,255,255,0.1) !important;">
        <div id="bethel-nav-brand-mobile"></div>
        <div class="d-flex align-items-center gap-2">
            <div id="bethel-theme-toggle-mobile"></div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
    </div>
    <div class="offcanvas-body px-0">
        <ul class="navbar-nav px-3 gap-1">
            <li class="nav-item"><a class="nav-link" href="{{ url('/') }}"><i class="bi bi-house me-2"></i>Home</a></li>
            <li class="nav-item"><a class="nav-link" href="{{ url('/mass-schedule') }}"><i class="bi bi-clock me-2"></i>Mass Schedule</a></li>
            <li class="nav-item"><a class="nav-link" href="{{ url('/announcements') }}"><i class="bi bi-megaphone me-2"></i>Announcements</a></li>
            <li class="nav-item"><a class="nav-link" href="{{ url('/events') }}"><i class="bi bi-calendar-event me-2"></i>Events</a></li>
            <li class="nav-item"><a class="nav-link" href="{{ url('/sacraments') }}"><i class="bi bi-flower1 me-2"></i>Sacraments</a></li>
        {{--<li class="nav-item"><a class="nav-link" href="{{ url('/contact') }}"><i class="bi bi-envelope me-2"></i>Contact Us</a></li>--}}
            <li class="nav-item"><a class="nav-link" href="{{ url('/livestream') }}"><i class="bi bi-tower-broadcast me-2"></i>Livestream</a></li>
        </ul>
        <div class="px-3 pt-3 mt-2" style="border-top:1px solid rgba(255,255,255,0.1);">
            @auth
                {{-- User info strip --}}
                <div class="d-flex align-items-center gap-2 mb-3 pb-3" style="border-bottom:1px solid rgba(255,255,255,0.1);">
                    <div style="width:38px;height:38px;border-radius:50%;background:var(--bethel-secondary);display:grid;place-items:center;font-size:0.9rem;font-weight:700;color:var(--bethel-primary);flex-shrink:0;">
                        {{ strtoupper(substr(auth()->user()->first_name, 0, 1)) }}
                    </div>
                    <div style="min-width:0;">
                        <div style="font-weight:600;font-size:0.875rem;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                            {{ auth()->user()->first_name }} {{ auth()->user()->last_name }}
                        </div>
                        <div style="font-size:0.72rem;color:rgba(255,255,255,0.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                            {{ auth()->user()->email }}
                        </div>
                    </div>
                </div>

                {{-- Auth nav links --}}
                <a href="{{ url('/inbox') }}" class="nav-link d-flex align-items-center gap-2 mb-1 px-2 py-2 rounded" style="color:#fff;">
                    <i class="bi bi-envelope"></i> Inbox
                </a>
                <a href="{{ url('/my-bookings') }}" class="nav-link d-flex align-items-center gap-2 mb-1 px-2 py-2 rounded" style="color:#fff;">
                    <i class="bi bi-calendar-check"></i> My Bookings
                </a>
                <a href="{{ url('/profile') }}" class="nav-link d-flex align-items-center gap-2 mb-1 px-2 py-2 rounded" style="color:#fff;">
                    <i class="bi bi-person"></i> My Profile
                </a>

                {{-- Logout --}}
                <div class="mt-2 pt-2" style="border-top:1px solid rgba(255,255,255,0.1);">
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="btn w-100 d-flex align-items-center justify-content-center gap-2"
                                style="background:rgba(239,68,68,0.15);color:#fca5a5;border:1px solid rgba(239,68,68,0.3);font-weight:600;border-radius:8px;padding:0.55rem;">
                            <i class="bi bi-box-arrow-right"></i> Logout
                        </button>
                    </form>
                </div>
            @else
                <a href="{{ url('/login') }}" class="btn btn-outline-light w-100 mb-2">Login</a>
                <a href="{{ url('/register') }}" class="btn w-100"
                   style="background:var(--bethel-secondary);color:var(--bethel-primary);font-weight:700;">Register</a>
            @endauth
        </div>
    </div>
</div>
