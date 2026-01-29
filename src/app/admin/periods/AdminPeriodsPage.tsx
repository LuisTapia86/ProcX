'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/types/database';

interface WinnerWithProfile {
  id: string;
  user_id: string;
  rank: number;
  total_points: number;
  prize_amount_mxn: number;
  payout_status: 'pending' | 'processing' | 'paid' | 'failed';
  profiles: { full_name: string | null; email: string };
}

interface PeriodWithWinners extends Tables<'reward_periods'> {
  winners: WinnerWithProfile[];
}

interface AdminPeriodsPageProps {
  periods: PeriodWithWinners[];
  activeSubscribers: number;
}

export default function AdminPeriodsPage({ periods, activeSubscribers }: AdminPeriodsPageProps) {
  const t = useTranslations();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const activePeriod = periods.find(p => p.status === 'active');

  const handleCreatePeriod = async () => {
    if (activePeriod) {
      setError('There is already an active period. Close it first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const supabase = createClient();

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const periodName = now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

      const totalRevenue = activeSubscribers * 99;
      const creatorFee = totalRevenue * 0.2;
      const rewardPool = totalRevenue * 0.8;

      const { error: insertError } = await supabase
        .from('reward_periods')
        .insert({
          period_name: periodName,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          status: 'active',
          total_revenue_mxn: totalRevenue,
          creator_fee_mxn: creatorFee,
          reward_pool_mxn: rewardPool,
          total_subscribers: activeSubscribers,
        });

      if (insertError) throw insertError;

      setSuccess('Period created successfully');
      router.refresh();
    } catch {
      setError(t.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePeriod = async (periodId: string) => {
    if (!confirm('Are you sure you want to close this period and generate winners?')) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/close-period', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t.errors.generic);
      }

      setSuccess('Period closed and winners generated successfully');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout isAdmin>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{t.admin.managePeriods}</h1>
          {!activePeriod && (
            <button
              onClick={handleCreatePeriod}
              disabled={loading}
              className="btn-primary"
            >
              Create New Period
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg">
            {success}
          </div>
        )}

        {/* Current Stats */}
        <div className="card bg-blue-50">
          <h2 className="text-lg font-semibold mb-2">Current Month Stats</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Active Subscribers</p>
              <p className="text-2xl font-bold">{activeSubscribers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Projected Revenue</p>
              <p className="text-2xl font-bold">${(activeSubscribers * 99).toLocaleString()} MXN</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Projected Pool (80%)</p>
              <p className="text-2xl font-bold">${(activeSubscribers * 99 * 0.8).toLocaleString()} MXN</p>
            </div>
          </div>
        </div>

        {/* Periods List */}
        <div className="space-y-4">
          {periods.map((period) => (
            <div key={period.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{period.period_name}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${
                    period.status === 'active' ? 'badge-success' :
                    period.status === 'closed' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    {period.status}
                  </span>
                  {period.status === 'active' && (
                    <button
                      onClick={() => handleClosePeriod(period.id)}
                      disabled={loading}
                      className="btn-danger text-sm"
                    >
                      {t.admin.closePeriod}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Total Revenue</p>
                  <p className="font-medium">${period.total_revenue_mxn.toLocaleString()} MXN</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Creator Fee (20%)</p>
                  <p className="font-medium">${period.creator_fee_mxn.toLocaleString()} MXN</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reward Pool (80%)</p>
                  <p className="font-medium">${period.reward_pool_mxn.toLocaleString()} MXN</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Subscribers</p>
                  <p className="font-medium">{period.total_subscribers}</p>
                </div>
              </div>

              {/* Winners */}
              {period.winners && period.winners.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Winners</h4>
                  <div className="space-y-2">
                    {period.winners
                      .sort((a, b) => a.rank - b.rank)
                      .map((winner) => (
                        <div key={winner.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <span>
                            #{winner.rank} - {winner.profiles?.full_name || winner.profiles?.email}
                            <span className="text-gray-500 ml-2">({winner.total_points} pts)</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-green-600">
                              ${winner.prize_amount_mxn.toLocaleString()} MXN
                            </span>
                            <span className={`badge ${
                              winner.payout_status === 'paid' ? 'badge-success' :
                              winner.payout_status === 'processing' ? 'badge-warning' :
                              'badge-info'
                            }`}>
                              {winner.payout_status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
