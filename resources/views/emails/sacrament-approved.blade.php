<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sacrament Request Approved</title>
    <style>
        body    { margin:0; padding:0; background:#f4f6f9; font-family:'Segoe UI',Arial,sans-serif; }
        .wrap   { max-width:560px; margin:40px auto; background:#fff; border-radius:14px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
        .header { background:linear-gradient(135deg,#0f2744 0%,#1a5276 100%); padding:36px 40px 28px; text-align:center; }
        .logo   { font-size:1.6rem; font-weight:800; color:#fff; letter-spacing:.5px; }
        .logo span { color:#c8973a; }
        .subtitle { color:rgba(255,255,255,.7); font-size:.82rem; margin-top:4px; }
        .body   { padding:36px 40px; }
        .badge  { display:inline-flex; align-items:center; gap:6px; background:#d1fae5; color:#065f46;
                  border-radius:20px; padding:5px 14px; font-size:.82rem; font-weight:700; margin-bottom:16px; }
        .greeting { font-size:1rem; color:#1a3c5e; font-weight:600; margin-bottom:12px; }
        .text   { font-size:.9rem; color:#4b5563; line-height:1.65; margin-bottom:20px; }
        .details-box { background:#f8fafc; border:1px solid #e5e7eb; border-radius:10px;
                       padding:16px 20px; margin-bottom:20px; }
        .detail-row { display:flex; justify-content:space-between; font-size:.85rem;
                      padding:5px 0; border-bottom:1px solid #f1f5f9; }
        .detail-row:last-child { border-bottom:none; }
        .detail-label { color:#9ca3af; font-weight:600; }
        .detail-value { color:#1f2937; font-weight:500; }
        .divider { height:1px; background:#e5e7eb; margin:20px 0; }
        .footer { background:#f8f9fa; padding:20px 40px; text-align:center; }
        .footer-text { font-size:.75rem; color:#9ca3af; line-height:1.6; }
    </style>
</head>
<body>
<div class="wrap">
    <div class="header">
        <div class="logo">Bethel<span>App</span></div>
        <div class="subtitle">Digital Parish Management WebApp</div>
    </div>
    <div class="body">
        <div class="badge">✓ Request Approved</div>
        <p class="greeting">Hello, {{ $sacramentRequest->user?->first_name ?? 'Parishioner' }}!</p>
        <p class="text">
            Great news! Your <strong>{{ $sacramentRequest->sacrament_type }}</strong> request has been
            reviewed and <strong>approved</strong> by the parish. Please review the details below and
            make sure to complete any outstanding requirements.
        </p>

        <div class="details-box">
            <div class="detail-row">
                <span class="detail-label">Sacrament</span>
                <span class="detail-value">{{ $sacramentRequest->sacrament_type }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Preferred Date</span>
                <span class="detail-value">
                    {{ $sacramentRequest->preferred_date
                        ? \Carbon\Carbon::parse($sacramentRequest->preferred_date)->format('F d, Y')
                        : 'To be confirmed' }}
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Preferred Time</span>
                <span class="detail-value">
                    {{ $sacramentRequest->preferred_time
                        ? \Carbon\Carbon::createFromTimeString($sacramentRequest->preferred_time)->format('g:i A')
                        : 'To be confirmed' }}
                </span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Parish</span>
                <span class="detail-value">{{ $sacramentRequest->parish?->name ?? '—' }}</span>
            </div>
            @if($sacramentRequest->assigned_clergy_id)
            <div class="detail-row">
                <span class="detail-label">Assigned Clergy</span>
                <span class="detail-value">{{ $sacramentRequest->assignedClergy?->titled_name ?? '—' }}</span>
            </div>
            @endif
            @if($sacramentRequest->admin_notes)
            <div class="detail-row">
                <span class="detail-label">Notes from Parish</span>
                <span class="detail-value">{{ $sacramentRequest->admin_notes }}</span>
            </div>
            @endif
        </div>

        <p class="text">
            You can view and manage your request anytime by logging into BethelApp and
            checking <strong>My Bookings</strong>. If you have questions, please message
            the parish through the booking inbox.
        </p>

        <div class="divider"></div>
        <p class="text" style="font-size:.82rem;color:#9ca3af;">
            If you did not submit this request, please contact your parish immediately.
        </p>
    </div>
    <div class="footer">
        <p class="footer-text">
            © {{ date('Y') }} BethelApp — Diocesan Catholic Parish Portal<br>
            This is an automated message. Please do not reply to this email.
        </p>
    </div>
</div>
</body>
</html>
