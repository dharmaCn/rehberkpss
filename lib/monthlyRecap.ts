import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { getMonthKey } from './dateKey';

export { getMonthKey };

export interface MonthlyRecap {
  monthKey: string;
  totalQuestions: number;
  daysActive: number;
}

// Ay içindeki toplam soru sayısı, `results/{uid}_{date}` dokümanlarındaki
// mainTotal + eveningTotal alanlarının toplamı — kategori quiz'leri (categoryResults
// koleksiyonu) v1'de dahil değil, bu yüzden bir alt sınır/yaklaşık değerdir.
export async function fetchMonthlyRecap(uid: string, monthKey: string): Promise<MonthlyRecap> {
  const q = query(collection(db, 'results'), where('uid', '==', uid));
  const snap = await getDocs(q);

  let totalQuestions = 0;
  let daysActive = 0;

  snap.docs.forEach((d) => {
    const data = d.data() as { date?: string; mainTotal?: number; eveningTotal?: number };
    if (!data.date || !data.date.startsWith(monthKey)) return;
    daysActive += 1;
    totalQuestions += (data.mainTotal ?? 0) + (data.eveningTotal ?? 0);
  });

  return { monthKey, totalQuestions, daysActive };
}

// Bu ayın hemen öncesindeki tamamlanmış ay ("Mart bitti, şimdi Nisan'dayız" → Mart)
export function previousMonthKey(date = new Date()): string {
  const prev = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  return getMonthKey(prev);
}

export function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const names = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];
  return `${names[month - 1]} ${year}`;
}
