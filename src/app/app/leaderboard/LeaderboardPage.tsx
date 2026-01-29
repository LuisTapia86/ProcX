'use client';

import { useTranslations } from '@/lib/i18n';
import AppLayout from '@/components/AppLayout';

interface LeaderboardEntry {
  userId: string;
  name: string;
  points: number;
  rank: number;
}

interface LeaderboardPageProps {
  userId: string;
  leaderboard: LeaderboardEntry[];
  userRank: number | null;
  userPoints: number;
  periodName: string | null;
}

export default function LeaderboardPage({
  userId,
  leaderboard,
  userRank,
  userPoints,
  periodName,
}: LeaderboardPageProps) {
  const t = useTranslations();

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (rank === 2) return 'bg-gray-100 text-gray-700 border-gray-300';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-white';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900">{t.leaderboard.title}</h1>
          {periodName && (
            <p className="text-gray-600 mt-1">{periodName}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">{t.leaderboard.updatedDaily}</p>
        </div>

        {/* User's Position */}
        {userRank && (
          <div className="card bg-primary-50 border-primary-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-primary-600">{t.leaderboard.yourPosition}</p>
                <p className="text-3xl font-bold text-primary-700">#{userRank}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-primary-600">{t.leaderboard.points}</p>
                <p className="text-3xl font-bold text-primary-700">{userPoints}</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">{t.leaderboard.top100}</h2>

          {leaderboard.length === 0 ? (
            <p className="text-center text-gray-500 py-8">{t.leaderboard.noData}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      {t.leaderboard.rank}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      {t.leaderboard.user}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      {t.leaderboard.points}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => {
                    const isCurrentUser = entry.userId === userId;

                    return (
                      <tr
                        key={entry.userId}
                        className={`border-b ${getRankStyle(entry.rank)} ${isCurrentUser ? 'font-semibold' : ''}`}
                      >
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                            entry.rank <= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {entry.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {entry.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-primary-600 text-sm">{t.leaderboard.you}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {entry.points.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
