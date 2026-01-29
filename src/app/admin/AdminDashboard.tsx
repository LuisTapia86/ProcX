'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';
import AppLayout from '@/components/AppLayout';
import type { Tables } from '@/types/database';

interface AdminDashboardProps {
  totalUsers: number;
  activeSubscribers: number;
  totalRevenue: number;
  creatorFee: number;
  rewardPool: number;
  currentPeriod: Tables<'reward_periods'> | null;
}

export default function AdminDashboard({
  totalUsers,
  activeSubscribers,
  totalRevenue,
  creatorFee,
  rewardPool,
  currentPeriod,
}: AdminDashboardProps) {
  const t = useTranslations();

  return (
    <AppLayout isAdmin>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">{t.admin.dashboard}</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">{t.admin.totalUsers}</p>
            <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
          </div>

          <div className="card">
            <p className="text-sm text-gray-600 mb-1">{t.admin.activeSubscribers}</p>
            <p className="text-3xl font-bold text-primary-600">{activeSubscribers}</p>
          </div>

          <div className="card">
            <p className="text-sm text-gray-600 mb-1">{t.admin.revenue}</p>
            <p className="text-3xl font-bold text-green-600">${totalRevenue.toLocaleString()} MXN</p>
            <p className="text-xs text-gray-500 mt-1">
              {t.admin.revenue} (20%): ${creatorFee.toLocaleString()} MXN
            </p>
          </div>

          <div className="card">
            <p className="text-sm text-gray-600 mb-1">{t.admin.rewardPool}</p>
            <p className="text-3xl font-bold text-purple-600">${rewardPool.toLocaleString()} MXN</p>
          </div>
        </div>

        {/* Current Period */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {currentPeriod ? t.admin.periodActive : 'No Active Period'}
            </h2>
            {currentPeriod && (
              <span className="badge badge-success">{currentPeriod.period_name}</span>
            )}
          </div>

          {currentPeriod && (
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Start Date</p>
                <p className="font-medium">{new Date(currentPeriod.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600">End Date</p>
                <p className="font-medium">{new Date(currentPeriod.end_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-600">Subscribers</p>
                <p className="font-medium">{currentPeriod.total_subscribers}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/admin/challenges" className="card hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-gray-900 mb-2">{t.admin.manageChallenges}</h3>
            <p className="text-sm text-gray-600">Create, edit, and manage challenge catalog</p>
          </Link>

          <Link href="/admin/periods" className="card hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-gray-900 mb-2">{t.admin.managePeriods}</h3>
            <p className="text-sm text-gray-600">Manage reward periods and generate winners</p>
          </Link>

          <div className="card opacity-75">
            <h3 className="font-semibold text-gray-900 mb-2">{t.admin.manageUsers}</h3>
            <p className="text-sm text-gray-600">View and manage user accounts</p>
            <span className="text-xs text-gray-400">(Coming soon)</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
