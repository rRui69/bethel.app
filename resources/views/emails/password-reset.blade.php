<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your BethelApp Password</title>
    <style>
        body    { margin: 0; padding: 0; background: #f4f6f9; font-family: 'Segoe UI', Arial, sans-serif; }
        .wrap   { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #0f2744 0%, #1a5276 100%); padding: 36px 40px 28px; text-align: center; }
        .logo   { font-size: 1.6rem; font-weight: 800; color: #fff; letter-spacing: 0.5px; }
        .logo span { color: #c8973a; }
        .subtitle { color: rgba(255,255,255,0.7); font-size: 0.82rem; margin-top: 4px; }
        .body   { padding: 36px 40px; }
        .greeting { font-size: 1rem; color: #1a3c5e; font-weight: 600; margin-bottom: 12px; }
        .text   { font-size: 0.9rem; color: #4b5563; line-height: 1.65; margin-bottom: 20px; }
        .btn-wrap { text-align: center; margin: 28px 0; }
        .btn    { display: inline-block; background: #1a3c5e; color: #fff !important; text-decoration: none; padding: 14px 36px; border-radius: 10px; font-weight: 700; font-size: 0.95rem; letter-spacing: 0.3px; }
        .btn:hover { background: #0f2744; }
        .link-fallback { font-size: 0.78rem; color: #9ca3af; text-align: center; margin-bottom: 20px; word-break: break-all; }
        .expiry { font-size: 0.82rem; color: #ef4444; font-weight: 600; text-align: center; margin-bottom: 24px; }
        .divider { height: 1px; background: #e5e7eb; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px 40px; text-align: center; }
        .footer-text { font-size: 0.75rem; color: #9ca3af; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="wrap">

        <div class="header">
            <div class="logo">Bethel<span>App</span></div>
            <div class="subtitle">House of God — Digital Parish Portal</div>
        </div>

        <div class="body">
            <p class="greeting">Hello, {{ $user->first_name ?? 'there' }}!</p>

            <p class="text">
                We received a request to reset the password for your BethelApp account.
                Click the button below to choose a new password.
            </p>

            <div class="btn-wrap">
                <a href="{{ $resetUrl }}" class="btn">Reset My Password</a>
            </div>

            <p class="expiry">⏱ This link expires in {{ $expireMinutes }} minutes.</p>

            <p class="link-fallback">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="color: #1a3c5e;">{{ $resetUrl }}</span>
            </p>

            <div class="divider"></div>

            <p class="text" style="font-size: 0.82rem; color: #9ca3af;">
                If you did not request a password reset, no action is needed —
                your password will remain unchanged.
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
