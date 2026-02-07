'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Script from 'next/script';

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

declare global {
  interface Window {
    grecaptcha: {
      render: (container: HTMLElement, options: object) => number;
      reset: (widgetId: number) => void;
      getResponse: (widgetId: number) => string;
    };
    onRecaptchaLoad?: () => void;
  }
}

/**
 * Recaptcha field component that renders both the widget and a hidden input.
 * The hidden input ensures the token is included in FormData for native form actions.
 */
export default function RecaptchaField() {
  const [token, setToken] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  const handleVerify = useCallback((responseToken: string) => {
    setToken(responseToken);
  }, []);

  const handleExpire = useCallback(() => {
    setToken(null);
  }, []);

  const renderCaptcha = useCallback(() => {
    if (!containerRef.current || !window.grecaptcha || !SITE_KEY) return;
    if (widgetIdRef.current !== null) return; // Already rendered

    widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: handleVerify,
      'expired-callback': handleExpire,
    });
  }, [handleVerify, handleExpire]);

  useEffect(() => {
    // If grecaptcha is already loaded, render immediately
    if (window.grecaptcha) {
      renderCaptcha();
    } else {
      // Set callback for when script loads
      window.onRecaptchaLoad = renderCaptcha;
    }

    return () => {
      window.onRecaptchaLoad = undefined;
    };
  }, [renderCaptcha]);

  // Don't render if no site key configured
  if (!SITE_KEY) {
    return null;
  }

  return (
    <>
      <Script
        src="https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit"
        strategy="lazyOnload"
      />
      <div ref={containerRef} className="flex justify-center" />
      <input type="hidden" name="captchaToken" value={token ?? ''} />
    </>
  );
}

/**
 * Check if CAPTCHA is enabled (client-side check based on site key presence)
 */
export function isRecaptchaEnabled(): boolean {
  return Boolean(SITE_KEY);
}
