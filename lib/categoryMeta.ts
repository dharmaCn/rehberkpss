export type QuestionCategory = 'tarih' | 'cografya' | 'vatandaslik' | 'guncel';

export function getCategoryLabel(cat: QuestionCategory): string {
  const map = { tarih: 'Tarih', cografya: 'Coğrafya', vatandaslik: 'Vatandaşlık', guncel: 'Güncel' };
  return map[cat];
}

export function getCategoryColor(cat: QuestionCategory): string {
  const map = { tarih: '#EF4444', cografya: '#10B981', vatandaslik: '#4F46E5', guncel: '#F59E0B' };
  return map[cat];
}
