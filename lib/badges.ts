export type BadgeId =
  | 'streak_3'
  | 'streak_7'
  | 'streak_30'
  | 'streak_100'
  | 'perfect_score'
  | 'quiz_10'
  | 'quiz_50'
  | 'quiz_100'
  | 'first_week'
  | 'duel_first'
  | 'duel_win_3'
  | 'duel_win_10'
  | 'duel_streak_5';

export interface BadgeDef {
  id: BadgeId;
  title: string;
  description: string;
  icon: string; // Ionicons name
  color: string;
}

export const BADGES: Record<BadgeId, BadgeDef> = {
  streak_3: {
    id: 'streak_3',
    title: '3 Gün Serisi',
    description: 'Peş peşe 3 gün quiz çözdün',
    icon: 'flame-outline',
    color: '#F59E0B',
  },
  streak_7: {
    id: 'streak_7',
    title: '7 Gün Serisi',
    description: 'Bir hafta hiç ara vermedin',
    icon: 'flame',
    color: '#F97316',
  },
  streak_30: {
    id: 'streak_30',
    title: '30 Gün Serisi',
    description: 'Bir ay boyunca her gün geldin',
    icon: 'trophy-outline',
    color: '#EF4444',
  },
  streak_100: {
    id: 'streak_100',
    title: '100 Gün Serisi',
    description: 'Efsanesin — 100 gün üst üste',
    icon: 'trophy',
    color: '#DC2626',
  },
  perfect_score: {
    id: 'perfect_score',
    title: 'Tam İsabet',
    description: 'Bir günde 10/10 yaptın',
    icon: 'star',
    color: '#FACC15',
  },
  quiz_10: {
    id: 'quiz_10',
    title: '10 Quiz',
    description: '10 quiz tamamladın',
    icon: 'ribbon-outline',
    color: '#10B981',
  },
  quiz_50: {
    id: 'quiz_50',
    title: '50 Quiz',
    description: '50 quiz tamamladın',
    icon: 'ribbon',
    color: '#059669',
  },
  quiz_100: {
    id: 'quiz_100',
    title: '100 Quiz',
    description: '100 quiz tamamladın',
    icon: 'medal',
    color: '#4F46E5',
  },
  first_week: {
    id: 'first_week',
    title: 'Hoş Geldin',
    description: 'İlk hafta görevlerini tamamladın',
    icon: 'sparkles',
    color: '#8B5CF6',
  },
  duel_first: {
    id: 'duel_first',
    title: 'İlk Düello',
    description: 'İlk düellonu tamamladın',
    icon: 'flash-outline',
    color: '#06B6D4',
  },
  duel_win_3: {
    id: 'duel_win_3',
    title: '3 Galibiyet',
    description: '3 düello kazandın',
    icon: 'flash',
    color: '#0EA5E9',
  },
  duel_win_10: {
    id: 'duel_win_10',
    title: 'Düello Ustası',
    description: '10 düello kazandın',
    icon: 'shield-checkmark',
    color: '#2563EB',
  },
  duel_streak_5: {
    id: 'duel_streak_5',
    title: 'Yenilmez',
    description: 'Üst üste 5 düello kazandın',
    icon: 'skull-outline',
    color: '#7C3AED',
  },
};

export interface BadgeEvalInput {
  currentStreak: number;
  quizCount: number;
  lastCorrect: number;
  lastTotal: number;
  existing: BadgeId[];
}

export function evaluateNewBadges(input: BadgeEvalInput): BadgeId[] {
  const earned: BadgeId[] = [];
  const has = (id: BadgeId) => input.existing.includes(id);

  if (input.currentStreak >= 3 && !has('streak_3')) earned.push('streak_3');
  if (input.currentStreak >= 7 && !has('streak_7')) earned.push('streak_7');
  if (input.currentStreak >= 30 && !has('streak_30')) earned.push('streak_30');
  if (input.currentStreak >= 100 && !has('streak_100')) earned.push('streak_100');

  if (input.quizCount >= 10 && !has('quiz_10')) earned.push('quiz_10');
  if (input.quizCount >= 50 && !has('quiz_50')) earned.push('quiz_50');
  if (input.quizCount >= 100 && !has('quiz_100')) earned.push('quiz_100');

  if (input.lastTotal > 0 && input.lastCorrect === input.lastTotal && !has('perfect_score')) {
    earned.push('perfect_score');
  }

  return earned;
}
