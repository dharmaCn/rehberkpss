// Seviye / XP sistemi — kullanıcının tüm zamanlar puanı (totalScore) XP olarak kullanılır.
// Ek yazma/migrasyon gerektirmez: mevcut kullanıcılar puanlarına göre otomatik seviyelenir.

export interface LevelInfo {
  level: number;        // 1-10
  title: string;        // unvan
  emoji: string;
  xp: number;           // toplam XP (= totalScore)
  currentFloor: number; // bu seviyenin başlangıç eşiği
  nextThreshold: number | null; // sonraki seviye eşiği (max seviyede null)
  progress: number;     // 0-1, sonraki seviyeye ilerleme (max seviyede 1)
}

export const LEVELS: { threshold: number; title: string; emoji: string }[] = [
  { threshold: 0, title: 'Çaylak', emoji: '🌱' },
  { threshold: 300, title: 'Meraklı', emoji: '🔍' },
  { threshold: 800, title: 'Çalışkan', emoji: '📚' },
  { threshold: 1600, title: 'Azimli', emoji: '💪' },
  { threshold: 2800, title: 'Bilgili', emoji: '🧠' },
  { threshold: 4500, title: 'Uzman', emoji: '🎓' },
  { threshold: 7000, title: 'Usta', emoji: '⚔️' },
  { threshold: 10500, title: 'Bilge', emoji: '🦉' },
  { threshold: 15000, title: 'Efsane', emoji: '🔥' },
  { threshold: 21000, title: 'Şampiyon', emoji: '🏆' },
];

export function getLevelInfo(totalScore: number): LevelInfo {
  const xp = Math.max(0, totalScore || 0);
  let idx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].threshold) { idx = i; break; }
  }
  const current = LEVELS[idx];
  const next = idx + 1 < LEVELS.length ? LEVELS[idx + 1] : null;
  const progress = next
    ? Math.min(1, (xp - current.threshold) / (next.threshold - current.threshold))
    : 1;
  return {
    level: idx + 1,
    title: current.title,
    emoji: current.emoji,
    xp,
    currentFloor: current.threshold,
    nextThreshold: next ? next.threshold : null,
    progress,
  };
}
