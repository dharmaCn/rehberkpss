import { AgsCategory } from '../constants/agsQuestions';
import { AGS_TOPIC_ORDER, getAgsTopicLabel, getAgsTopicColor } from './agsQuiz';

export interface AgsCategoryBreakdownEntry {
  key: AgsCategory;
  label: string;
  color: string;
  accuracy: number;
  total: number;
}

export function getAgsCategoryBreakdown(
  agsCategoryStats: Record<AgsCategory, { correct: number; total: number }> | undefined
): AgsCategoryBreakdownEntry[] {
  if (!agsCategoryStats) return [];
  const entries: AgsCategoryBreakdownEntry[] = [];
  for (const key of AGS_TOPIC_ORDER) {
    const stat = agsCategoryStats[key];
    if (!stat || stat.total < 3) continue;
    entries.push({
      key,
      label: getAgsTopicLabel(key),
      color: getAgsTopicColor(key),
      accuracy: (stat.correct / stat.total) * 100,
      total: stat.total,
    });
  }
  entries.sort((a, b) => a.accuracy - b.accuracy);
  return entries;
}
