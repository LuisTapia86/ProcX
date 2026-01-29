'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/lib/i18n';
import AppLayout from '@/components/AppLayout';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Tables, TablesInsert, TablesUpdate } from '@/types/database';

interface AdminChallengesPageProps {
  challenges: Tables<'challenge_catalog'>[];
}

type Difficulty = 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard' | 'extreme';

const DIFFICULTY_OPTIONS: Difficulty[] = ['very_easy', 'easy', 'medium', 'hard', 'very_hard', 'extreme'];

const POINTS_MAP: Record<Difficulty, number> = {
  very_easy: 5,
  easy: 8,
  medium: 12,
  hard: 18,
  very_hard: 25,
  extreme: 35,
};

export default function AdminChallengesPage({ challenges }: AdminChallengesPageProps) {
  const t = useTranslations();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [nameEs, setNameEs] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descEs, setDescEs] = useState('');
  const [descEn, setDescEn] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setNameEs('');
    setNameEn('');
    setDescEs('');
    setDescEn('');
    setDifficulty('medium');
    setIsActive(true);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (challenge: Tables<'challenge_catalog'>) => {
    setNameEs(challenge.name_es);
    setNameEn(challenge.name_en);
    setDescEs(challenge.description_es || '');
    setDescEn(challenge.description_en || '');
    setDifficulty(challenge.difficulty as Difficulty);
    setIsActive(challenge.is_active);
    setEditingId(challenge.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase: SupabaseClient<Database> = createClient();

      if (editingId) {
        const updateData: TablesUpdate<'challenge_catalog'> = {
          name_es: nameEs,
          name_en: nameEn,
          description_es: descEs || null,
          description_en: descEn || null,
          difficulty,
          points_per_checkin: POINTS_MAP[difficulty],
          is_active: isActive,
        };

        const { error: updateError } = await supabase
          .from('challenge_catalog')
          .update(updateData)
          .eq('id', editingId);

        if (updateError) throw updateError;
      } else {
        const insertData: TablesInsert<'challenge_catalog'> = {
          name_es: nameEs,
          name_en: nameEn,
          description_es: descEs || null,
          description_en: descEn || null,
          difficulty,
          points_per_checkin: POINTS_MAP[difficulty],
          is_active: isActive,
        };

        const { error: insertError } = await supabase
          .from('challenge_catalog')
          .insert(insertData);

        if (insertError) throw insertError;
      }

      resetForm();
      router.refresh();
    } catch {
      setError(t.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;

    setLoading(true);
    try {
      const supabase: SupabaseClient<Database> = createClient();
      const { error: deleteError } = await supabase
        .from('challenge_catalog')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      router.refresh();
    } catch {
      setError(t.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout isAdmin>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">{t.admin.manageChallenges}</h1>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            {t.admin.createChallenge}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Challenge Form */}
        {showForm && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? t.admin.editChallenge : t.admin.createChallenge}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (Spanish) *
                  </label>
                  <input
                    type="text"
                    value={nameEs}
                    onChange={(e) => setNameEs(e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (English) *
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Spanish)
                  </label>
                  <textarea
                    value={descEs}
                    onChange={(e) => setDescEs(e.target.value)}
                    className="input"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (English)
                  </label>
                  <textarea
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    className="input"
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty *
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="input"
                  >
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {t.challenges.difficulty[d]} ({POINTS_MAP[d]} pts)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active (visible to users)
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? t.common.loading : t.common.save}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  {t.common.cancel}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Challenges List */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Difficulty</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Points</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {challenges.map((challenge) => (
                  <tr key={challenge.id} className="border-b">
                    <td className="py-3 px-4">
                      <p className="font-medium">{challenge.name_en}</p>
                      <p className="text-sm text-gray-500">{challenge.name_es}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge badge-info">
                        {t.challenges.difficulty[challenge.difficulty as keyof typeof t.challenges.difficulty]}
                      </span>
                    </td>
                    <td className="py-3 px-4">{challenge.points_per_checkin}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${challenge.is_active ? 'badge-success' : 'badge-error'}`}>
                        {challenge.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEdit(challenge)}
                        className="text-primary-600 hover:underline mr-4"
                      >
                        {t.common.edit}
                      </button>
                      <button
                        onClick={() => handleDelete(challenge.id)}
                        className="text-red-600 hover:underline"
                      >
                        {t.common.delete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
