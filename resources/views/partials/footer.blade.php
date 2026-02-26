<footer class="bethel-footer" role="contentinfo">
    <div class="container">
        <div class="row g-4">

            {{-- Column --}}
            <div class="col-lg-4 col-md-6">
                {{--
                =============================================================
                    FOOTER BRAND LOGO — same toggle pattern as navbar.
                ============================================================= 
                --}}

                {{-- PNG/SVG --}}
                {{--
                <div class="d-flex align-items-center gap-2 mb-3">
                    <img
                        src="{{ asset('images/bethel-logo.png') }}"
                        alt="BethelApp Logo"
                        height="36"
                        style="object-fit:contain; filter: brightness(0) invert(1);"
                    />
                    <span class="bethel-footer__brand">Bethel<span class="brand-accent">App</span></span>
                </div>
                --}}

                {{-- Bootstrap Icon --}}
                <div id="bethel-footer-brand"></div>

                <p style="font-size:0.875rem;line-height:1.7;max-width:280px;">
                    Your one-stop hub for parish life. Connect with your parish, schedule sacraments, and stay updated.
                </p>
            </div>

            {{-- Quick Links --}}
            <div class="col-lg-2 col-md-6 col-6">
                <h6 class="bethel-footer__heading">Quick Links</h6>
                <a href="{{ url('/') }}">Home</a>
                <a href="{{ url('/mass-schedule') }}">Mass Schedule</a>
                <a href="{{ url('/announcements') }}">Announcements</a>
                <a href="{{ url('/events') }}">Events</a>
                <a href="{{ url('/contact') }}">Contact Us</a>
            </div>

            {{-- Sacraments --}}
            <div class="col-lg-2 col-md-6 col-6">
                <h6 class="bethel-footer__heading">Sacraments</h6>
                <a href="{{ url('/sacraments/baptism') }}">Baptism</a>
                <a href="{{ url('/sacraments/marriage') }}">Marriage</a>
                <a href="{{ url('/sacraments/confirmation') }}">Confirmation</a>
                <a href="{{ url('/sacraments/confession') }}">Confession</a>
                <a href="{{ url('/sacraments/communion') }}">First Communion</a>
                <a href="{{ url('/sacraments/anointing') }}">Anointing</a>
            </div>

            {{-- Contact --}}
            <div class="col-lg-4 col-md-6">
                <h6 class="bethel-footer__heading">Get In Touch</h6>
                <div class="d-flex flex-column gap-2">
                    <div class="d-flex align-items-start gap-2" style="font-size:0.875rem;">
                        <i class="bi bi-envelope mt-1" style="color:var(--bethel-secondary);flex-shrink:0;"></i>
                        <span>helpdesk@bethelapp.com</span>
                    </div>
                    <div class="d-flex align-items-start gap-2" style="font-size:0.875rem;">
                        <i class="bi bi-telephone mt-1" style="color:var(--bethel-secondary);flex-shrink:0;"></i>
                        <span>+63 9123-4321</span>
                    </div>
                    <div class="d-flex align-items-start gap-2" style="font-size:0.875rem;">
                        <i class="bi bi-geo-alt mt-1" style="color:var(--bethel-secondary);flex-shrink:0;"></i>
                        <span>Philippines</span>
                    </div>
                </div>
            </div>

        </div>

        {{-- Bottom Bar --}}
        <div class="bethel-footer__bottom d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2">
            <span>© {{ date('Y') }} BethelApp. All rights reserved.</span>
        </div>

    </div>
</footer>