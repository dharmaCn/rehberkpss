export type AgsCategory =
  | 'gelisim-psikolojisi'
  | 'ogrenme-psikolojisi'
  | 'ogretim-ilke-yontem'
  | 'olcme-degerlendirme'
  | 'rehberlik'
  | 'sinif-yonetimi'
  | 'program-gelistirme'
  | 'ogretim-teknolojileri'
  | 'turk-egitim-sistemi';

export const AGS_TOPIC_META: Record<AgsCategory, { label: string; color: string }> = {
  'gelisim-psikolojisi': { label: 'Gelişim Psikolojisi', color: '#EC4899' },
  'ogrenme-psikolojisi': { label: 'Öğrenme Psikolojisi', color: '#8B5CF6' },
  'ogretim-ilke-yontem': { label: 'Öğretim İlke ve Yöntemleri', color: '#3B82F6' },
  'olcme-degerlendirme': { label: 'Ölçme ve Değerlendirme', color: '#06B6D4' },
  'rehberlik': { label: 'Rehberlik', color: '#10B981' },
  'sinif-yonetimi': { label: 'Sınıf Yönetimi', color: '#F59E0B' },
  'program-gelistirme': { label: 'Program Geliştirme', color: '#EF4444' },
  'ogretim-teknolojileri': { label: 'Öğretim Teknolojileri ve Materyal Tasarımı', color: '#6366F1' },
  'turk-egitim-sistemi': { label: 'Türk Eğitim Sistemi ve Okul Yönetimi', color: '#14B8A6' },
};

export const AGS_TOPIC_ORDER: AgsCategory[] = [
  'gelisim-psikolojisi',
  'ogrenme-psikolojisi',
  'ogretim-ilke-yontem',
  'olcme-degerlendirme',
  'rehberlik',
  'sinif-yonetimi',
  'program-gelistirme',
  'ogretim-teknolojileri',
  'turk-egitim-sistemi',
];
