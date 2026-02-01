'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInAction } from '@/lib/auth/actions';
import Captcha, { isCaptchaEnabled } from '@/components/Captcha';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCaptchaVerify = useCallback((token: string) => {
    setCaptchaToken(token);
  }, []);

  const handleCaptchaExpire = useCallback(() => {
    setCaptchaToken(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Login] Form submitted');

    // Prevent double submit
    if (loading) return;

    setError('');

    // Client-side validation (quick feedback)
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    // Check CAPTCHA on client (server will verify too)
    if (isCaptchaEnabled() && !captchaToken) {
      setError('Please complete the CAPTCHA');
      return;
    }

    setLoading(true);
    console.log('[Login] Calling signInAction...');

    try {
      // Call Server Action - CAPTCHA verified server-side
      const result = await signInAction(email, password, captchaToken);
      console.log('[Login] signInAction result:', result);

      if (!result.success) {
        setError(result.error || 'Login failed');
        return;
      }

      // Success - redirect to dashboard
      router.push('/app');
      router.refresh();
    } catch (err) {
      console.error('[Login] Exception:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Log In</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your password"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            {/* CAPTCHA - only renders if NEXT_PUBLIC_CAPTCHA_SITE_KEY is set */}
            <Captcha onVerify={handleCaptchaVerify} onExpire={handleCaptchaExpire} />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-blue-600 hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
