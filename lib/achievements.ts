import type { UserProfile, CategoryKey } from './firestore';

export interface Achievement {
  id: string;
  icon: string;
  title: string;
  desc: string;
  /** Kazanıldı mı? */
  earned: (ctx: AchievementCtx) => boolean;
  /** Kilitliyken ilerleme (örn. 23/50). Boolean rozetlerde undefined. */
  progress?: (ctx: AchievementCtx) => { current: number; target: number };
}

export interface AchievementCtx {
  quizCount: number;
  totalScore: number;
  longestStreak: number;
  perfectCount: number;
  bestCategoryAccuracy: number; // 0-100, en az 20 soru çözülen kategoriler arasında
}

export function buildAchievementCtx(p: UserProfile | null): AchievementCtx {
  const stats = p?.categoryStats ?? {};
  let bestCategoryAccuracy = 0;
  for (const cat of Object.keys(stats) as CategoryKey[]) {
    const s = stats[cat];
    if (s && s.total >= 20) {
      bestCategoryAccuracy = Math.max(bestCategoryAccuracy, Math.round((s.correct / s.total) * 100));
    }
  }
  return {
    quizCount: p?.quizCount ?? 0,
    totalScore: p?.totalScore ?? 0,
    longestStreak: p?.longestStreak ?? 0,
    perfectCount: p?.perfectCount ?? 0,
    bestCategoryAccuracy,
  };
}

const countAch = (
  id: string,
  icon: string,
  title: string,
  desc: string,
  target: number,
  pick: (c: AchievementCtx) => number
): Achievement => ({
  id,
  icon,
  title,
  desc,
  earned: (c) => pick(c) >= target,
  progress: (c) => ({ current: Math.min(pick(c), target), target }),
});

export const ACHIEVEMENTS: Achievement[] = [
  countAch('first', '🎯', 'İlk Adım', 'İlk quizini çöz', 1, (c) => c.quizCount),
  countAch('warmup', '🔥', 'Isınıyoruz', '10 quiz çöz', 10, (c) => c.quizCount),
  countAch('marathon', '🏃', 'Maratoncu', '50 quiz çöz', 50, (c) => c.quizCount),
  countAch('hundred', '💯', 'Azimli', '100 quiz çöz', 100, (c) => c.quizCount),

  countAch('streak3', '📅', '3 Gün Seri', '3 gün üst üste çöz', 3, (c) => c.longestStreak),
  countAch('streak7', '🗓️', 'Haftalık Seri', '7 gün üst üste çöz', 7, (c) => c.longestStreak),
  countAch('streak30', '🌟', 'Aylık Efsane', '30 gün üst üste çöz', 30, (c) => c.longestStreak),

  countAch('perfect', '✨', 'Kusursuz', 'Bir quizde tüm soruları doğru yap', 1, (c) => c.perfectCount),

  countAch('score1k', '⭐', 'Puan Avcısı', '1.000 puana ulaş', 1000, (c) => c.totalScore),
  countAch('score5k', '👑', 'Puan Canavarı', '5.000 puana ulaş', 5000, (c) => c.totalScore),
  countAch('score10k', '🧠', 'Bilgin', '10.000 puana ulaş', 10000, (c) => c.totalScore),

  countAch('master', '📚', 'Konu Uzmanı', 'Bir derste %80 başarıya ulaş', 80, (c) => c.bestCategoryAccuracy),
];
