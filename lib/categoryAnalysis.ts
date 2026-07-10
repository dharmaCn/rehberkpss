import { CategoryKey } from './titles';
import { getCategoryLabel, getCategoryColor } from './quiz';

export interface CategoryBreakdownEntry {
  key: CategoryKey;
  label: string;
  color: string;
  accuracy: number;
  total: number;
}

const CATEGORY_KEYS: CategoryKey[] = ['tarih', 'cografya', 'vatandaslik', 'guncel'];

export function getCategoryBreakdown(
  categoryStats: Record<CategoryKey, { correct: number; total: number }> | undefined
): CategoryBreakdownEntry[] {
  if (!categoryStats) return [];
  const entries: CategoryBreakdownEntry[] = [];
  for (const key of CATEGORY_KEYS) {
    const stat = categoryStats[key];
    if (!stat || stat.total < 3) continue;
    entries.push({
      key,
      label: getCategoryLabel(key),
      color: getCategoryColor(key),
      accuracy: (stat.correct / stat.total) * 100,
      total: stat.total,
    });
  }
  entries.sort((a, b) => a.accuracy - b.accuracy);
  return entries;
}
