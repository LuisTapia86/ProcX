'use client';

import Link from 'next/link';
import { useTranslations, useLanguage } from '@/lib/i18n';
import AppLayout from '@/components/AppLayout';
import type { Tables } from '@/types/database';

// Prize distribution percentages
const PRIZE_DISTRIBUTION = {
  3: [50, 30, 20],
  5: [35, 25, 18, 12, 10],
  10: [25, 18, 14, 11, 9, 7, 6, 5, 3, 2],
};

interface RewardsPageProps {
  currentPeriod: Tables<'reward_periods'> | null;
  pastPeriods: (Tables<'reward_periods'> & {
    winners: (Tables<'winners'> & { profiles: { full_name: string | null; email: string } })[];
  })[];
  pendingPrizes: Tables<'winners'>[];
}

export default function RewardsPage({
  currentPeriod,
  pastPeriods,
  pendingPrizes,
}: RewardsPageProps) {
  const t = useTranslations();
  const { language } = useLanguage();

  // Determine number of winners based on pool
  const getWinnerCount = (pool: number) => {
    if (pool < 5000) return 3;
    if (pool < 20000) return 5;
    return 10;
  };

  const winnerCount = currentPeriod ? getWinnerCount(currentPeriod.reward_pool_mxn) : 3;
  const distribution = PRIZE_DISTRIBUTION[winnerCount as keyof typeof PRIZE_DISTRIBUTION];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Pending Prizes Alert */}
        {pendingPrizes.length > 0 && (
          <div className="card bg-green-50 border-green-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-semibold text-green-800">{t.rewards.prizesPending}</h2>
                <p className="text-sm text-green-600">{t.rewards.kycRequired}</p>
              </div>
              <Link href="/app/settings" className="btn-primary">
                {t.rewards.claimPrize}
              </Link>
            </div>
          </div>
        )}

        {/* Current Pool */}
        <div className="card text-center">
          <p className="text-sm text-gray-600 mb-2">{t.rewards.currentPool}</p>
          <p className="text-5xl font-bold text-green-600 mb-2">
            ${currentPeriod?.reward_pool_mxn?.toLocaleString() || '0'} MXN
          </p>
          <p className="text-sm text-gray-500">{t.rewards.thisMonth}</p>
          <p className="text-xs text-gray-400 mt-2">{t.rewards.poolExplanation}</p>
        </div>

        {/* Prize Distribution */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">
            {t.rewards.distribution} ({winnerCount} {t.rewards.winners})
          </h2>

          <div className="space-y-3">
            {distribution.map((percentage, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-500' :
                    'bg-primary-500'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-medium">
                    {index + 1}{language === 'es' ? '°' : ''} {t.rewards.place}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-primary-600">{percentage}%</span>
                  {currentPeriod && (
                    <span className="text-sm text-gray-500 ml-2">
                      (~${Math.round(currentPeriod.reward_pool_mxn * percentage / 100).toLocaleString()} MXN)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Winner History */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">{t.rewards.historyTitle}</h2>

          {pastPeriods.length === 0 ? (
            <p className="text-center text-gray-500 py-4">{t.rewards.noHistory}</p>
          ) : (
            <div className="space-y-6">
              {pastPeriods.map((period) => (
                <div key={period.id} className="border-b pb-4 last:border-b-0">
                  <h3 className="font-semibold text-gray-900 mb-2">{period.period_name}</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {t.rewards.currentPool}: ${period.reward_pool_mxn.toLocaleString()} MXN
                  </p>

                  <div className="space-y-2">
                    {period.winners
                      .sort((a, b) => a.rank - b.rank)
                      .slice(0, 3)
                      .map((winner) => (
                        <div key={winner.id} className="flex justify-between items-center text-sm">
                          <span>
                            #{winner.rank} - {winner.profiles?.full_name || winner.profiles?.email?.split('@')[0]}
                          </span>
                          <span className="font-medium text-green-600">
                            ${winner.prize_amount_mxn.toLocaleString()} MXN
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
