import { NextRequest, NextResponse } from 'next/server';

const ENABLE_CAPTCHA = process.env.ENABLE_CAPTCHA === 'true';
const CAPTCHA_SECRET_KEY = process.env.CAPTCHA_SECRET_KEY;
const CAPTCHA_VERIFY_URL = process.env.CAPTCHA_VERIFY_URL || 'https://www.google.com/recaptcha/api/siteverify';

export async function POST(request: NextRequest) {
  // Skip verification if CAPTCHA is disabled
  if (!ENABLE_CAPTCHA) {
    return NextResponse.json({ success: true, message: 'CAPTCHA disabled' });
  }

  // Check if secret key is configured
  if (!CAPTCHA_SECRET_KEY) {
    console.error('[CAPTCHA] Secret key not configured');
    return NextResponse.json(
      { success: false, error: 'CAPTCHA not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'CAPTCHA token required' },
        { status: 400 }
      );
    }

    // Verify with provider (Google reCAPTCHA or hCaptcha)
    const verifyResponse = await fetch(CAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: CAPTCHA_SECRET_KEY,
        response: token,
      }),
    });

    const verifyData = await verifyResponse.json();

    if (verifyData.success) {
      return NextResponse.json({ success: true });
    }

    console.error('[CAPTCHA] Verification failed:', verifyData['error-codes']);
    return NextResponse.json(
      { success: false, error: 'CAPTCHA verification failed' },
      { status: 400 }
    );
  } catch (err) {
    console.error('[CAPTCHA] Exception:', err);
    return NextResponse.json(
      { success: false, error: 'CAPTCHA verification error' },
      { status: 500 }
    );
  }
}
