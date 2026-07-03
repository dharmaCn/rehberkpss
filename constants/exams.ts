// KPSS 2026 takvimi — ÖSYM duyurularına göre güncelle.
// Tarihler değişirse sadece bu dosyayı düzenle.

export interface KpssExamPreset {
  id: string;
  label: string;
  date: string; // YYYY-MM-DD
}

export const KPSS_EXAMS: KpssExamPreset[] = [
  { id: 'lisans',      label: 'KPSS Lisans',       date: '2026-09-06' },
  { id: 'onlisans',    label: 'KPSS Önlisans',     date: '2026-10-04' },
  { id: 'ortaogretim', label: 'KPSS Ortaöğretim',  date: '2026-10-25' },
  { id: 'belirsiz',    label: 'Henüz duyurulmadı / Sonra belirleyeceğim', date: '' },
];

export const TARGET_SCORES = [70, 75, 80, 85, 90, 95];
