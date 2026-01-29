'use client';

import Link from 'next/link';
import { useTranslations, useLanguage } from '@/lib/i18n';
import AppLayout from '@/components/AppLayout';
import type { Tables } from '@/types/database';

interface AppDashboardProps {
  profile: Tables<'profiles'> | null;
  subscription: Tables<'subscriptions'> | null;
  activeChallenges: (Tables<'user_challenges'> & { challenge_catalog: Tables<'challenge_catalog'> })[];
  currentPeriod: Tables<'reward_periods'> | null;
  monthlyPoints: number;
}

export default function AppDashboard({
  profile,
  subscription,
  activeChallenges,
  currentPeriod,
  monthlyPoints,
}: AppDashboardProps) {
  const t = useTranslations();
  const { language } = useLanguage();

  const hasActiveSubscription = subscription?.status === 'active';

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'es' ? 'Hola' : 'Hello'}, {profile?.full_name || profile?.email?.split('@')[0]}!
          </h1>
          {!hasActiveSubscription && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-yellow-800 text-sm mb-3">{t.errors.subscriptionRequired}</p>
              <Link href="/app/settings" className="btn-primary text-sm">
                {t.settings.subscribe}
              </Link>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Monthly Points */}
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">{t.leaderboard.points}</p>
            <p className="text-3xl font-bold text-primary-600">{monthlyPoints}</p>
            <p className="text-xs text-gray-500 mt-1">
              {currentPeriod?.period_name || t.rewards.thisMonth}
            </p>
          </div>

          {/* Active Challenges */}
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">{t.challenges.active}</p>
            <p className="text-3xl font-bold text-primary-600">{activeChallenges.length}/3</p>
            <Link href="/app/challenges" className="text-xs text-primary-600 hover:underline mt-1 block">
              {t.challenges.exploreCatalog}
            </Link>
          </div>

          {/* Reward Pool */}
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">{t.rewards.currentPool}</p>
            <p className="text-3xl font-bold text-green-600">
              ${currentPeriod?.reward_pool_mxn?.toLocaleString() || '0'} MXN
            </p>
            <Link href="/app/rewards" className="text-xs text-primary-600 hover:underline mt-1 block">
              {t.rewards.distribution}
            </Link>
          </div>
        </div>

        {/* Active Challenges List */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{t.challenges.title}</h2>
            <Link href="/app/challenges" className="text-sm text-primary-600 hover:underline">
              {t.challenges.catalog}
            </Link>
          </div>

          {activeChallenges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>{t.challenges.noActiveChallenges}</p>
              <Link href="/app/challenges" className="btn-primary mt-4 inline-block">
                {t.challenges.exploreCatalog}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeChallenges.map((uc) => {
                const challenge = uc.challenge_catalog;
                const name = language === 'es' ? challenge.name_es : challenge.name_en;
                const difficultyLabel = t.challenges.difficulty[challenge.difficulty as keyof typeof t.challenges.difficulty];

                return (
                  <div key={uc.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{name}</h3>
                        <p className="text-sm text-gray-500">
                          {difficultyLabel} • {challenge.points_per_checkin} {t.challenges.points}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary-600">
                          {t.challenges.streak}: {uc.current_streak} {t.challenges.days}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
