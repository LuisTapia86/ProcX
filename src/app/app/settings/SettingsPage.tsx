'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLanguage, type Language } from '@/lib/i18n';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/types/database';

interface SettingsPageProps {
  profile: Tables<'profiles'> | null;
  subscription: Tables<'subscriptions'> | null;
}

export default function SettingsPage({ profile, subscription }: SettingsPageProps) {
  const t = useTranslations();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const hasActiveSubscription = subscription?.status === 'active';

  const handleLanguageChange = async (newLanguage: Language) => {
    setLanguage(newLanguage);

    // Update in database
    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ language: newLanguage })
      .eq('id', profile?.id || '');
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const { url, error } = await response.json();

      if (error) {
        setMessage(error);
        return;
      }

      window.location.href = url;
    } catch {
      setMessage(t.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const { url, error } = await response.json();

      if (error) {
        setMessage(error);
        return;
      }

      window.location.href = url;
    } catch {
      setMessage(t.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'es' ? 'es-MX' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.settings.title}</h1>

        {message && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {message}
          </div>
        )}

        {/* Language Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">{t.settings.language}</h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleLanguageChange('es')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                language === 'es'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">🇲🇽</span>
              <p className="mt-2 font-medium">{t.settings.spanish}</p>
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                language === 'en'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">🇺🇸</span>
              <p className="mt-2 font-medium">{t.settings.english}</p>
            </button>
          </div>
        </div>

        {/* Subscription Settings */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">{t.settings.subscription}</h2>

          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600">{t.settings.subscription}</span>
            <span className={`badge ${hasActiveSubscription ? 'badge-success' : 'badge-error'}`}>
              {hasActiveSubscription ? t.settings.active : t.settings.inactive}
            </span>
          </div>

          {subscription?.current_period_end && hasActiveSubscription && (
            <p className="text-sm text-gray-500 mb-4">
              {language === 'es' ? 'Válida hasta:' : 'Valid until:'}{' '}
              {formatDate(subscription.current_period_end)}
            </p>
          )}

          {hasActiveSubscription ? (
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="btn-secondary w-full"
            >
              {loading ? t.common.loading : t.settings.manageSubscription}
            </button>
          ) : (
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? t.common.loading : t.settings.subscribe} - $99 MXN/mes
            </button>
          )}
        </div>

        {/* Account Info */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">{t.settings.account}</h2>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">{t.settings.email}</span>
              <span className="font-medium">{profile?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t.settings.memberSince}</span>
              <span className="font-medium">
                {profile?.created_at ? formatDate(profile.created_at) : '-'}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Link (if admin) */}
        {profile?.role === 'admin' && (
          <div className="card bg-red-50 border-red-200">
            <a href="/admin" className="btn-danger block text-center">
              {t.admin.dashboard}
            </a>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
