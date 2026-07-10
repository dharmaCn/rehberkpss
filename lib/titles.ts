import { getCategoryColor } from './quiz';

export type CategoryKey = 'tarih' | 'cografya' | 'vatandaslik' | 'guncel';

export type TitleId =
  | 'tarih_ust'
  | 'cografya_ust'
  | 'vatandaslik_ust'
  | 'guncel_ust'
  | 'dort_yonlu'
  | 'yukselen_yildiz'
  | 'azimli'
  | 'saglam_temel'
  | 'tarih_orta'
  | 'cografya_orta'
  | 'vatandaslik_orta'
  | 'guncel_orta';

export interface TitleDef {
  id: TitleId;
  name: string;
  description: string;
  icon: string; // Ionicons name
  color: string;
}

export const TITLES: Record<TitleId, TitleDef> = {
  tarih_ust: {
    id: 'tarih_ust',
    name: 'Tarih Üstadı',
    description: 'Tarih sorularında üst düzey isabet',
    icon: 'library',
    color: getCategoryColor('tarih'),
  },
  cografya_ust: {
    id: 'cografya_ust',
    name: 'Coğrafya Haritacısı',
    description: 'Coğrafya sorularında üst düzey isabet',
    icon: 'map',
    color: getCategoryColor('cografya'),
  },
  vatandaslik_ust: {
    id: 'vatandaslik_ust',
    name: 'Vatandaşlık Hukukçusu',
    description: 'Vatandaşlık sorularında üst düzey isabet',
    icon: 'shield-checkmark',
    color: getCategoryColor('vatandaslik'),
  },
  guncel_ust: {
    id: 'guncel_ust',
    name: 'Güncel Analisti',
    description: 'Güncel sorularında üst düzey isabet',
    icon: 'newspaper',
    color: getCategoryColor('guncel'),
  },
  dort_yonlu: {
    id: 'dort_yonlu',
    name: 'Dört Yönlü Aday',
    description: 'Dört derste de dengeli bir performans',
    icon: 'compass',
    color: '#8B5CF6',
  },
  yukselen_yildiz: {
    id: 'yukselen_yildiz',
    name: 'Yükselen Yıldız',
    description: 'Bu hafta geçen haftaya göre belirgin şekilde yükselişte',
    icon: 'trending-up',
    color: '#EC4899',
  },
  azimli: {
    id: 'azimli',
    name: 'Azimli Aday',
    description: 'Uzun bir seriyi hiç bozmadan sürdürüyor',
    icon: 'flame',
    color: '#F97316',
  },
  saglam_temel: {
    id: 'saglam_temel',
    name: 'Sağlam Temel',
    description: 'Az soruya rağmen istikrarlı yüksek doğruluk',
    icon: 'bar-chart',
    color: '#0EA5E9',
  },
  tarih_orta: {
    id: 'tarih_orta',
    name: 'Tarih Kâşifi',
    description: 'Tarih sorularında öne çıkıyor',
    icon: 'search',
    color: getCategoryColor('tarih'),
  },
  cografya_orta: {
    id: 'cografya_orta',
    name: 'Coğrafya Gezgini',
    description: 'Coğrafya sorularında öne çıkıyor',
    icon: 'compass-outline',
    color: getCategoryColor('cografya'),
  },
  vatandaslik_orta: {
    id: 'vatandaslik_orta',
    name: 'Vatandaşlık Bilgini',
    description: 'Vatandaşlık sorularında öne çıkıyor',
    icon: 'document-text',
    color: getCategoryColor('vatandaslik'),
  },
  guncel_orta: {
    id: 'guncel_orta',
    name: 'Güncel Takipçisi',
    description: 'Güncel sorularında öne çıkıyor',
    icon: 'radio',
    color: getCategoryColor('guncel'),
  },
};

const CATEGORY_TITLES: Record<CategoryKey, { orta: TitleId; ust: TitleId }> = {
  tarih: { orta: 'tarih_orta', ust: 'tarih_ust' },
  cografya: { orta: 'cografya_orta', ust: 'cografya_ust' },
  vatandaslik: { orta: 'vatandaslik_orta', ust: 'vatandaslik_ust' },
  guncel: { orta: 'guncel_orta', ust: 'guncel_ust' },
};

const CATEGORY_KEYS: CategoryKey[] = ['tarih', 'cografya', 'vatandaslik', 'guncel'];

export interface TitleEvalInput {
  categoryStats: Record<CategoryKey, { correct: number; total: number }>;
  currentStreak: number;
  weeklyAccuracy: number | null;
  previousWeeklyAccuracy: number | null;
}

function accuracy(stat: { correct: number; total: number } | undefined): number {
  if (!stat || stat.total === 0) return 0;
  return (stat.correct / stat.total) * 100;
}

function bestCategory(categoryStats: TitleEvalInput['categoryStats']): { key: CategoryKey; acc: number } | null {
  let best: { key: CategoryKey; acc: number } | null = null;
  for (const key of CATEGORY_KEYS) {
    const stat = categoryStats[key];
    if (!stat || stat.total === 0) continue;
    const acc = accuracy(stat);
    if (!best || acc > best.acc) best = { key, acc };
  }
  return best;
}

export function evaluateTitle(input: TitleEvalInput): TitleId | null {
  const { categoryStats, currentStreak, weeklyAccuracy, previousWeeklyAccuracy } = input;
  const best = bestCategory(categoryStats);

  // 1. Category "Üstadı" tier
  if (best) {
    const stat = categoryStats[best.key];
    if (stat.total >= 20 && best.acc >= 85) {
      return CATEGORY_TITLES[best.key].ust;
    }
  }

  // 2. Dört Yönlü Aday
  const allAnswered = CATEGORY_KEYS.every((key) => (categoryStats[key]?.total ?? 0) >= 8);
  if (allAnswered) {
    const accs = CATEGORY_KEYS.map((key) => accuracy(categoryStats[key]));
    const spread = Math.max(...accs) - Math.min(...accs);
    if (spread < 15) return 'dort_yonlu';
  }

  // 3. Yükselen Yıldız
  if (weeklyAccuracy !== null && previousWeeklyAccuracy !== null && weeklyAccuracy - previousWeeklyAccuracy >= 15) {
    return 'yukselen_yildiz';
  }

  // 4. Azimli Aday
  if (currentStreak >= 14) return 'azimli';

  // 5. Sağlam Temel
  const totalAnswered = CATEGORY_KEYS.reduce((sum, key) => sum + (categoryStats[key]?.total ?? 0), 0);
  const totalCorrect = CATEGORY_KEYS.reduce((sum, key) => sum + (categoryStats[key]?.correct ?? 0), 0);
  if (totalAnswered >= 5 && totalAnswered < 30 && (totalCorrect / totalAnswered) * 100 >= 85) {
    return 'saglam_temel';
  }

  // 6. Category "orta" tier
  if (best) {
    const stat = categoryStats[best.key];
    if (stat.total >= 5 && best.acc >= 60) {
      return CATEGORY_TITLES[best.key].orta;
    }
  }

  // 7. No title yet
  return null;
}
