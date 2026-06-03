export interface League {
  id: string;
  name: string;
  icon: string;
  color: string;
  min: number; // bu lige girmek için gereken toplam puan
}

// Toplam puana göre lig basamakları
export const LEAGUES: League[] = [
  { id: 'bronz', name: 'Bronz', icon: '🥉', color: '#CD7F32', min: 0 },
  { id: 'gumus', name: 'Gümüş', icon: '🥈', color: '#9CA3AF', min: 1000 },
  { id: 'altin', name: 'Altın', icon: '🥇', color: '#F59E0B', min: 3000 },
  { id: 'platin', name: 'Platin', icon: '💎', color: '#22D3EE', min: 7000 },
  { id: 'elmas', name: 'Elmas', icon: '👑', color: '#A78BFA', min: 15000 },
];

export interface LeagueInfo {
  league: League;
  next: League | null;
  /** Mevcut lig içindeki ilerleme yüzdesi (0-100). Son ligde 100. */
  progressPct: number;
  /** Bir üst lige kalan puan. Son ligde 0. */
  toNext: number;
}

export function getLeague(totalScore: number): LeagueInfo {
  let idx = 0;
  for (let i = LEAGUES.length - 1; i >= 0; i--) {
    if (totalScore >= LEAGUES[i].min) { idx = i; break; }
  }
  const league = LEAGUES[idx];
  const next = idx < LEAGUES.length - 1 ? LEAGUES[idx + 1] : null;
  if (!next) return { league, next: null, progressPct: 100, toNext: 0 };
  const span = next.min - league.min;
  const into = totalScore - league.min;
  return {
    league,
    next,
    progressPct: Math.max(0, Math.min(100, Math.round((into / span) * 100))),
    toNext: Math.max(0, next.min - totalScore),
  };
}
