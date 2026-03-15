<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify Your BethelApp Account</title>
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
        .otp-wrap { text-align: center; margin: 28px 0; }
        .otp-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; margin-bottom: 10px; }
        .otp-code { display: inline-block; background: #f8f6f0; border: 2px dashed #c8973a; border-radius: 12px; padding: 18px 36px; font-size: 2rem; font-weight: 800; color: #1a3c5e; letter-spacing: 6px; font-family: 'Courier New', monospace; }
        .verse-label { margin-top: 10px; font-size: 0.78rem; color: #9ca3af; font-style: italic; }
        .expiry { font-size: 0.82rem; color: #ef4444; font-weight: 600; text-align: center; margin-bottom: 24px; }
        .tip    { background: #f0f7ff; border-left: 4px solid #1a3c5e; border-radius: 0 8px 8px 0; padding: 14px 18px; font-size: 0.82rem; color: #374151; margin-bottom: 24px; }
        .footer { background: #f8f9fa; padding: 20px 40px; text-align: center; }
        .footer-text { font-size: 0.75rem; color: #9ca3af; line-height: 1.6; }
        .divider { height: 1px; background: #e5e7eb; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="wrap">
        {{-- Header --}}
        <div class="header">
            <div class="logo">Bethel<span>App</span></div>
            <div class="subtitle">Digital Parish Management WebApp</div>
        </div>

        {{-- Body --}}
        <div class="body">
            <p class="greeting">Hello, {{ $firstName }}!</p>

            <p class="text">
                Welcome to BethelApp. To complete your registration and activate your account,
                please enter the verification code below on the confirmation page.
            </p>

            {{-- OTP Code --}}
            <div class="otp-wrap">
                <div class="otp-label">Your Verification Code</div>
                <div class="otp-code">{{ $otpCode }}</div>
            </div>

            <p class="expiry">This code expires in 15 minutes.</p>

            <div class="tip">
                <strong>Tip:</strong> Enter this code exactly as shown, uppercase letters and numbers only, no spaces or special characters.
            </div>

            <div class="divider"></div>

            <p class="text" style="font-size: 0.82rem; color: #9ca3af;">
                If you did not create an account on BethelApp, you can safely ignore this email.
                No action is needed.
            </p>
        </div>

        {{-- Footer --}}
        <div class="footer">
            <p class="footer-text">
                {{ date('Y') }} BethelApp — Diocesan Catholic Parish Portal<br>
                This is an automated message. Please do not reply to this email.
            </p>
        </div>

    </div>
</body>
</html>
