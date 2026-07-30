import { AgsCategory, AGS_TOPIC_META } from '../constants/agsQuestions';
import { AGS_TOPIC_ORDER } from './agsQuiz';

export type AgsTitleId =
  | 'gelisim_uzman'
  | 'ogrenme_uzman'
  | 'ogretim_ilke_uzman'
  | 'olcme_uzman'
  | 'rehberlik_uzman'
  | 'sinif_uzman'
  | 'program_uzman'
  | 'teknoloji_uzman'
  | 'turkegitim_uzman'
  | 'egitim_bilimci';

export interface AgsTitleDef {
  id: AgsTitleId;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const TOPIC_TITLE: Record<AgsCategory, { id: AgsTitleId; name: string; icon: string }> = {
  'gelisim-psikolojisi': { id: 'gelisim_uzman', name: 'Gelişim Uzmanı', icon: 'body' },
  'ogrenme-psikolojisi': { id: 'ogrenme_uzman', name: 'Öğrenme Uzmanı', icon: 'bulb' },
  'ogretim-ilke-yontem': { id: 'ogretim_ilke_uzman', name: 'Yöntem Ustası', icon: 'list' },
  'olcme-degerlendirme': { id: 'olcme_uzman', name: 'Ölçme Uzmanı', icon: 'analytics' },
  rehberlik: { id: 'rehberlik_uzman', name: 'Rehber Ruhlu', icon: 'people' },
  'sinif-yonetimi': { id: 'sinif_uzman', name: 'Sınıf Kaptanı', icon: 'easel' },
  'program-gelistirme': { id: 'program_uzman', name: 'Program Mimarı', icon: 'construct' },
  'ogretim-teknolojileri': { id: 'teknoloji_uzman', name: 'Teknoloji Ustası', icon: 'hardware-chip' },
  'turk-egitim-sistemi': { id: 'turkegitim_uzman', name: 'Sistem Bilgini', icon: 'business' },
};

export const AGS_TITLES: Record<AgsTitleId, AgsTitleDef> = {
  gelisim_uzman: { id: 'gelisim_uzman', name: 'Gelişim Uzmanı', description: 'Gelişim Psikolojisinde üst düzey isabet', icon: 'body', color: AGS_TOPIC_META['gelisim-psikolojisi'].color },
  ogrenme_uzman: { id: 'ogrenme_uzman', name: 'Öğrenme Uzmanı', description: 'Öğrenme Psikolojisinde üst düzey isabet', icon: 'bulb', color: AGS_TOPIC_META['ogrenme-psikolojisi'].color },
  ogretim_ilke_uzman: { id: 'ogretim_ilke_uzman', name: 'Yöntem Ustası', description: 'Öğretim İlke ve Yöntemlerinde üst düzey isabet', icon: 'list', color: AGS_TOPIC_META['ogretim-ilke-yontem'].color },
  olcme_uzman: { id: 'olcme_uzman', name: 'Ölçme Uzmanı', description: 'Ölçme ve Değerlendirmede üst düzey isabet', icon: 'analytics', color: AGS_TOPIC_META['olcme-degerlendirme'].color },
  rehberlik_uzman: { id: 'rehberlik_uzman', name: 'Rehber Ruhlu', description: 'Rehberlikte üst düzey isabet', icon: 'people', color: AGS_TOPIC_META['rehberlik'].color },
  sinif_uzman: { id: 'sinif_uzman', name: 'Sınıf Kaptanı', description: 'Sınıf Yönetiminde üst düzey isabet', icon: 'easel', color: AGS_TOPIC_META['sinif-yonetimi'].color },
  program_uzman: { id: 'program_uzman', name: 'Program Mimarı', description: 'Program Geliştirmede üst düzey isabet', icon: 'construct', color: AGS_TOPIC_META['program-gelistirme'].color },
  teknoloji_uzman: { id: 'teknoloji_uzman', name: 'Teknoloji Ustası', description: 'Öğretim Teknolojilerinde üst düzey isabet', icon: 'hardware-chip', color: AGS_TOPIC_META['ogretim-teknolojileri'].color },
  turkegitim_uzman: { id: 'turkegitim_uzman', name: 'Sistem Bilgini', description: 'Türk Eğitim Sisteminde üst düzey isabet', icon: 'business', color: AGS_TOPIC_META['turk-egitim-sistemi'].color },
  egitim_bilimci: { id: 'egitim_bilimci', name: 'Eğitim Bilimci', description: 'Eğitim Bilimlerinin tüm alt dallarında dengeli bir performans', icon: 'school', color: '#8B5CF6' },
};

export type AgsCategoryStats = Record<AgsCategory, { correct: number; total: number }>;

function accuracy(stat: { correct: number; total: number } | undefined): number {
  if (!stat || stat.total === 0) return 0;
  return (stat.correct / stat.total) * 100;
}

function bestTopic(stats: AgsCategoryStats): { key: AgsCategory; acc: number } | null {
  let best: { key: AgsCategory; acc: number } | null = null;
  for (const key of AGS_TOPIC_ORDER) {
    const stat = stats[key];
    if (!stat || stat.total === 0) continue;
    const acc = accuracy(stat);
    if (!best || acc > best.acc) best = { key, acc };
  }
  return best;
}

export function evaluateAgsTitle(stats: AgsCategoryStats): AgsTitleId | null {
  const best = bestTopic(stats);

  if (best) {
    const stat = stats[best.key];
    if (stat.total >= 15 && best.acc >= 80) {
      return TOPIC_TITLE[best.key].id;
    }
  }

  const allAnswered = AGS_TOPIC_ORDER.every((key) => (stats[key]?.total ?? 0) >= 5);
  if (allAnswered) {
    const accs = AGS_TOPIC_ORDER.map((key) => accuracy(stats[key]));
    const spread = Math.max(...accs) - Math.min(...accs);
    if (spread < 20) return 'egitim_bilimci';
  }

  return null;
}
