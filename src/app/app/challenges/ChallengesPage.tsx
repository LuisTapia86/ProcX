'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLanguage } from '@/lib/i18n';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/lib/supabase/client';
import type { Tables } from '@/types/database';

interface ChallengesPageProps {
  userId: string;
  hasSubscription: boolean;
  catalog: Tables<'challenge_catalog'>[];
  userChallenges: (Tables<'user_challenges'> & { challenge_catalog: Tables<'challenge_catalog'> })[];
  checkedInChallenges: Set<string>;
}

export default function ChallengesPage({
  userId,
  hasSubscription,
  catalog,
  userChallenges,
  checkedInChallenges,
}: ChallengesPageProps) {
  const t = useTranslations();
  const { language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const activeChallenges = userChallenges.filter(uc => uc.status === 'active');
  const activeChallengeIds = new Set(activeChallenges.map(uc => uc.challenge_id));

  const handleJoinChallenge = async (challengeId: string) => {
    if (!hasSubscription) {
      setError(t.errors.subscriptionRequired);
      return;
    }

    if (activeChallenges.length >= 3) {
      setError(t.challenges.maxActive);
      return;
    }

    setLoading(challengeId);
    setError('');

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase
        .from('user_challenges')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          status: 'active',
        });

      if (insertError) throw insertError;

      router.refresh();
    } catch {
      setError(t.errors.generic);
    } finally {
      setLoading(null);
    }
  };

  const handleCheckin = async (userChallengeId: string) => {
    if (!hasSubscription) {
      setError(t.errors.subscriptionRequired);
      return;
    }

    setLoading(userChallengeId);
    setError('');

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userChallengeId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || t.errors.generic);
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.generic);
    } finally {
      setLoading(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      very_easy: 'bg-green-100 text-green-800',
      easy: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-orange-100 text-orange-800',
      very_hard: 'bg-red-100 text-red-800',
      extreme: 'bg-purple-100 text-purple-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Active Challenges */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">{t.challenges.title} ({activeChallenges.length}/3)</h2>

          {activeChallenges.length === 0 ? (
            <p className="text-gray-500 text-center py-4">{t.challenges.noActiveChallenges}</p>
          ) : (
            <div className="space-y-4">
              {activeChallenges.map((uc) => {
                const challenge = uc.challenge_catalog;
                const name = language === 'es' ? challenge.name_es : challenge.name_en;
                const description = language === 'es' ? challenge.description_es : challenge.description_en;
                const isCheckedIn = checkedInChallenges.has(uc.id);
                const isLoading = loading === uc.id;

                return (
                  <div key={uc.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{name}</h3>
                        <p className="text-sm text-gray-500">{description}</p>
                      </div>
                      <span className={`badge ${getDifficultyColor(challenge.difficulty)}`}>
                        {t.challenges.difficulty[challenge.difficulty as keyof typeof t.challenges.difficulty]}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{t.challenges.streak}:</span> {uc.current_streak} {t.challenges.days} |{' '}
                        <span className="font-medium">{challenge.points_per_checkin}</span> {t.challenges.points}
                      </div>

                      <button
                        onClick={() => handleCheckin(uc.id)}
                        disabled={isCheckedIn || isLoading}
                        className={isCheckedIn ? 'btn-secondary' : 'btn-primary'}
                      >
                        {isLoading ? t.common.loading : isCheckedIn ? t.challenges.checkinDone : t.challenges.checkin}
                      </button>
                    </div>

                    <p className="text-xs text-orange-600 mt-2">{t.challenges.missWarning}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Challenge Catalog */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">{t.challenges.catalog}</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {catalog.map((challenge) => {
              const name = language === 'es' ? challenge.name_es : challenge.name_en;
              const description = language === 'es' ? challenge.description_es : challenge.description_en;
              const isJoined = activeChallengeIds.has(challenge.id);
              const isLoading = loading === challenge.id;

              return (
                <div key={challenge.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{name}</h3>
                    <span className={`badge ${getDifficultyColor(challenge.difficulty)}`}>
                      {t.challenges.difficulty[challenge.difficulty as keyof typeof t.challenges.difficulty]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{description}</p>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-primary-600 font-medium">
                      {challenge.points_per_checkin} {t.challenges.points}/{language === 'es' ? 'día' : 'day'}
                    </span>

                    <button
                      onClick={() => handleJoinChallenge(challenge.id)}
                      disabled={isJoined || isLoading || activeChallenges.length >= 3}
                      className={isJoined ? 'btn-secondary' : 'btn-primary'}
                    >
                      {isLoading ? t.common.loading : isJoined ? t.challenges.alreadyJoined : t.challenges.join}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
