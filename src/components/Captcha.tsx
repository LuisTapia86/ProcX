'use client';

import { useEffect, useRef, useCallback } from 'react';
import Script from 'next/script';

const SITE_KEY = process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY;

interface CaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    grecaptcha: {
      render: (container: HTMLElement, options: object) => number;
      reset: (widgetId: number) => void;
      getResponse: (widgetId: number) => string;
    };
    onCaptchaLoad?: () => void;
  }
}

export default function Captcha({ onVerify, onExpire }: CaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  const renderCaptcha = useCallback(() => {
    if (!containerRef.current || !window.grecaptcha || !SITE_KEY) return;
    if (widgetIdRef.current !== null) return; // Already rendered

    widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: onVerify,
      'expired-callback': onExpire,
    });
  }, [onVerify, onExpire]);

  useEffect(() => {
    // If grecaptcha is already loaded, render immediately
    if (window.grecaptcha) {
      renderCaptcha();
    } else {
      // Set callback for when script loads
      window.onCaptchaLoad = renderCaptcha;
    }

    return () => {
      window.onCaptchaLoad = undefined;
    };
  }, [renderCaptcha]);

  // Don't render if no site key
  if (!SITE_KEY) {
    return null;
  }

  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/api.js?onload=onCaptchaLoad&render=explicit"
        strategy="lazyOnload"
      />
      <div ref={containerRef} className="flex justify-center" />
    </>
  );
}

/**
 * Verify CAPTCHA token with server
 */
export async function verifyCaptchaToken(token: string | null): Promise<{ success: boolean; error?: string }> {
  // If no site key configured, CAPTCHA is disabled
  if (!SITE_KEY) {
    return { success: true };
  }

  if (!token) {
    return { success: false, error: 'Please complete the CAPTCHA' };
  }

  try {
    const response = await fetch('/api/verify-captcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    return data;
  } catch {
    return { success: false, error: 'CAPTCHA verification failed' };
  }
}

/**
 * Check if CAPTCHA is enabled (client-side check based on site key presence)
 */
export function isCaptchaEnabled(): boolean {
  return Boolean(SITE_KEY);
}
