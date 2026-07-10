// Arkadaşla Düello — v1.4.0
// Veri modeli:
//   duels/{autoId} → {
//     from, to, fromName, toName, category, questionIds[5],
//     status: 'pending' | 'completed' | 'expired',
//     fromScore, fromCorrect, fromTimeMs,          (meydan okuyan, oluştururken yazar)
//     toScore?, toCorrect?, toTimeMs?,             (rakip tamamlayınca)
//     fromSeenResult?: boolean,                    (meydan okuyan sonucu gördü + istatistiğini işledi)
//     createdAt, completedAt?
//   }
// Akış: meydan okuyan 5 soruyu çözer → duel dokümanı kendi sonucuyla oluşur →
// rakip uygulamayı açınca ana ekranda/profilde görür → aynı soruları çözer →
// status 'completed'. 48 saat cevaplanmazsa meydan okuyan hükmen kazanır ('expired').

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  updateDoc,
  deleteDoc,
  increment,
  arrayUnion,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { QUESTION_POOL, Question } from '../constants/questions';
import { BadgeId } from './badges';

export type DuelCategory = Question['category'] | 'karisik';
export type DuelStatus = 'pending' | 'completed' | 'expired';

export const DUEL_QUESTION_COUNT = 5;
export const DUEL_EXPIRY_MS = 48 * 60 * 60 * 1000;
export const DUEL_WIN_XP = 25;

export interface DuelSideResult {
  score: number;
  correct: number;
  timeMs: number; // toplam düşünme süresi (düşük olan berabere durumunda kazanır)
}

export interface Duel {
  id: string;
  from: string;
  to: string;
  fromName: string;
  toName: string;
  category: DuelCategory;
  questionIds: string[];
  status: DuelStatus;
  fromScore: number;
  fromCorrect: number;
  fromTimeMs: number;
  toScore?: number;
  toCorrect?: number;
  toTimeMs?: number;
  fromSeenResult?: boolean;
  createdAt?: Timestamp;
}

export const DUEL_CATEGORY_LABELS: Record<DuelCategory, string> = {
  tarih: 'Tarih',
  cografya: 'Coğrafya',
  vatandaslik: 'Vatandaşlık',
  guncel: 'Güncel',
  karisik: 'Karışık',
};

// ─── Soru seçimi ───

export function pickDuelQuestions(category: DuelCategory): Question[] {
  const pool =
    category === 'karisik' ? QUESTION_POOL : QUESTION_POOL.filter((q) => q.category === category);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, DUEL_QUESTION_COUNT);
}

export function questionsByIds(ids: string[]): Question[] {
  const map = new Map(QUESTION_POOL.map((q) => [q.id, q]));
  return ids.map((id) => map.get(id)).filter((q): q is Question => q !== undefined);
}

// ─── CRUD ───

export async function createDuel(
  me: { uid: string; name: string },
  opponent: { uid: string; name: string },
  category: DuelCategory,
  questionIds: string[],
  result: DuelSideResult
): Promise<string> {
  const ref = await addDoc(collection(db, 'duels'), {
    from: me.uid,
    to: opponent.uid,
    fromName: me.name,
    toName: opponent.name,
    category,
    questionIds,
    status: 'pending',
    fromScore: result.score,
    fromCorrect: result.correct,
    fromTimeMs: result.timeMs,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getDuel(id: string): Promise<Duel | null> {
  const snap = await getDoc(doc(db, 'duels', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Duel, 'id'>) };
}

export async function completeDuel(duelId: string, result: DuelSideResult): Promise<void> {
  await updateDoc(doc(db, 'duels', duelId), {
    status: 'completed',
    toScore: result.score,
    toCorrect: result.correct,
    toTimeMs: result.timeMs,
    completedAt: serverTimestamp(),
  });
}

export async function markDuelExpired(duelId: string): Promise<void> {
  await updateDoc(doc(db, 'duels', duelId), { status: 'expired' });
}

export async function markFromSeenResult(duelId: string): Promise<void> {
  await updateDoc(doc(db, 'duels', duelId), { fromSeenResult: true });
}

export async function deleteDuel(duelId: string): Promise<void> {
  await deleteDoc(doc(db, 'duels', duelId));
}

// Bana gelen + benim gönderdiğim düellolar (istemci tarafında birleşip sıralanır)
export async function fetchMyDuels(uid: string, max = 20): Promise<Duel[]> {
  const [incoming, outgoing] = await Promise.all([
    getDocs(query(collection(db, 'duels'), where('to', '==', uid), limit(max))),
    getDocs(query(collection(db, 'duels'), where('from', '==', uid), limit(max))),
  ]);
  const all = [...incoming.docs, ...outgoing.docs].map(
    (d) => ({ id: d.id, ...(d.data() as Omit<Duel, 'id'>) })
  );
  return all.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
}

// ─── Durum yardımcıları ───

export function isDuelExpired(duel: Duel): boolean {
  if (duel.status !== 'pending') return false;
  const created = duel.createdAt?.toMillis();
  if (!created) return false;
  return Date.now() - created > DUEL_EXPIRY_MS;
}

export type DuelOutcome = 'from' | 'to' | 'draw';

// Kazanan: yüksek skor; eşitse az toplam süre; yine eşitse berabere.
// 'expired' düelloda meydan okuyan hükmen kazanır.
export function duelWinner(duel: Duel): DuelOutcome {
  if (duel.status === 'expired') return 'from';
  const toScore = duel.toScore ?? 0;
  if (duel.fromScore !== toScore) return duel.fromScore > toScore ? 'from' : 'to';
  const toTime = duel.toTimeMs ?? Number.MAX_SAFE_INTEGER;
  if (duel.fromTimeMs !== toTime) return duel.fromTimeMs < toTime ? 'from' : 'to';
  return 'draw';
}

export function didIWin(duel: Duel, myUid: string): boolean | null {
  const w = duelWinner(duel);
  if (w === 'draw') return null;
  return (w === 'from') === (duel.from === myUid);
}

// ─── İstatistik + rozet ───
// Her kullanıcı SADECE kendi profilini günceller (Firestore rules gereği):
// rakip düelloyu tamamladığı anda, meydan okuyan da sonucu ilk gördüğünde çağırır.

export interface DuelStatsResult {
  newBadges: BadgeId[];
  duelStreak: number;
}

export async function applyDuelOutcomeToMyStats(
  myUid: string,
  won: boolean | null,
  existingBadges: BadgeId[],
  currentDuelWins: number,
  currentDuelStreak: number
): Promise<DuelStatsResult> {
  const newStreak = won === true ? currentDuelStreak + 1 : won === false ? 0 : currentDuelStreak;
  const newWins = currentDuelWins + (won === true ? 1 : 0);

  const newBadges: BadgeId[] = [];
  const has = (id: BadgeId) => existingBadges.includes(id) || newBadges.includes(id);
  if (!has('duel_first')) newBadges.push('duel_first');
  if (newWins >= 3 && !has('duel_win_3')) newBadges.push('duel_win_3');
  if (newWins >= 10 && !has('duel_win_10')) newBadges.push('duel_win_10');
  if (newStreak >= 5 && !has('duel_streak_5')) newBadges.push('duel_streak_5');

  const patch: Record<string, unknown> = {
    duelCount: increment(1),
    duelWins: increment(won === true ? 1 : 0),
    duelStreak: newStreak,
  };
  if (won === true) {
    patch.totalScore = increment(DUEL_WIN_XP);
    patch.seasonScore = increment(DUEL_WIN_XP);
  }
  if (newBadges.length > 0) patch.badges = arrayUnion(...newBadges);

  await updateDoc(doc(db, 'users', myUid), patch);
  return { newBadges, duelStreak: newStreak };
}
