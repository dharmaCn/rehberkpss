// KPSS sınav tarihi — resmî takvim açıklandıkça buradan güncelle.
// Ay 0-indekslidir: 6 = Temmuz.
export const KPSS_EXAM_DATE = new Date(2026, 6, 12); // 12 Temmuz 2026 (Pazar)
export const KPSS_EXAM_LABEL = 'KPSS 2026 • Lisans';

/** Bugünden sınava kalan tam gün sayısı (geçmişse negatif). */
export function daysUntilExam(from: Date = new Date()): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(KPSS_EXAM_DATE.getFullYear(), KPSS_EXAM_DATE.getMonth(), KPSS_EXAM_DATE.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
