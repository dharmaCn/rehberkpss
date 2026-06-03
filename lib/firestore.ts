import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  updateDoc,
  increment,
  serverTimestamp,
  deleteField,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { getTodayKey, getYesterdayKey } from './quiz';

export type CategoryKey = 'tarih' | 'cografya' | 'vatandaslik' | 'guncel';

export interface CategoryStat { correct: number; total: number }

export interface AnsweredItem { id: string; category: CategoryKey; correct: boolean }

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  totalScore: number;
  quizCount: number;
  bestDayScore: number;
  isGuest?: boolean;
  createdAt: unknown;
  // Engagement alanları (profil dokümanında map olarak tutulur)
  currentStreak?: number;
  longestStreak?: number;
  lastActiveDate?: string;
  perfectCount?: number;
  categoryStats?: Partial<Record<CategoryKey, CategoryStat>>;
  wrongQuestions?: Record<string, { category: CategoryKey; addedAt: unknown }>;
}

export interface QuizResult {
  uid: string;
  displayName: string;
  photoURL: string;
  score: number;
  correct: number;
  date: string;
  week: string;
  completedAt: unknown;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string;
  score: number;
  rank?: number;
}

function getWeekKey(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export async function ensureUserProfile(user: {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      displayName: user.displayName ?? 'Anonim',
      email: user.email ?? '',
      photoURL: user.photoURL ?? '',
      totalScore: 0,
      quizCount: 0,
      bestDayScore: 0,
      isGuest: user.isAnonymous ?? false,
      createdAt: serverTimestamp(),
    });
  }
}

export async function hasCompletedTodayQuiz(uid: string): Promise<boolean> {
  const today = getTodayKey();
  const ref = doc(db, 'results', `${uid}_${today}`);
  const snap = await getDoc(ref);
  return snap.exists();
}

export async function saveQuizResult(
  user: { uid: string; displayName: string | null; photoURL: string | null },
  score: number,
  correct: number
): Promise<void> {
  const today = getTodayKey();
  const week = getWeekKey();

  const resultRef = doc(db, 'results', `${user.uid}_${today}`);
  await setDoc(resultRef, {
    uid: user.uid,
    displayName: user.displayName ?? 'Anonim',
    photoURL: user.photoURL ?? '',
    score,
    correct,
    date: today,
    week,
    completedAt: serverTimestamp(),
  } satisfies Omit<QuizResult, 'completedAt'> & { completedAt: unknown });

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    totalScore: increment(score),
    quizCount: increment(1),
  });

  const userSnap = await getDoc(userRef);
  const userData = userSnap.data() as UserProfile;
  if (score > (userData.bestDayScore ?? 0)) {
    await updateDoc(userRef, { bestDayScore: score });
  }
}

export async function fetchLeaderboard(
  period: 'daily' | 'weekly' | 'alltime',
  count = 50
): Promise<LeaderboardEntry[]> {
  let q;

  if (period === 'daily') {
    const today = getTodayKey();
    q = query(
      collection(db, 'results'),
      where('date', '==', today),
      orderBy('score', 'desc'),
      limit(count)
    );
  } else if (period === 'weekly') {
    const week = getWeekKey();
    q = query(
      collection(db, 'results'),
      where('week', '==', week),
      orderBy('score', 'desc'),
      limit(count)
    );
  } else {
    q = query(
      collection(db, 'users'),
      orderBy('totalScore', 'desc'),
      limit(count)
    );
  }

  const snap = await getDocs(q);
  return snap.docs.map((d, i) => {
    const data = d.data();
    return {
      uid: data.uid,
      displayName: data.displayName,
      photoURL: data.photoURL ?? '',
      score: data.score ?? data.totalScore,
      rank: i + 1,
    };
  });
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function hasCompletedTodayCategoryQuiz(uid: string, category: string): Promise<boolean> {
  const today = getTodayKey();
  const ref = doc(db, 'categoryResults', `${uid}_${today}_${category}`);
  const snap = await getDoc(ref);
  return snap.exists();
}

export async function saveCategoryQuizResult(
  user: { uid: string; displayName: string | null; photoURL: string | null },
  category: string,
  score: number,
  correct: number
): Promise<void> {
  const today = getTodayKey();
  const week = getWeekKey();

  // Kategori quiz kaydı
  const catRef = doc(db, 'categoryResults', `${user.uid}_${today}_${category}`);
  await setDoc(catRef, {
    uid: user.uid,
    displayName: user.displayName ?? 'Anonim',
    photoURL: user.photoURL ?? '',
    score,
    correct,
    category,
    date: today,
    completedAt: serverTimestamp(),
  });

  // Günlük results dokümanını güncelle veya oluştur (liderboard için)
  const dailyRef = doc(db, 'results', `${user.uid}_${today}`);
  const dailySnap = await getDoc(dailyRef);
  if (dailySnap.exists()) {
    await updateDoc(dailyRef, { score: increment(score) });
  } else {
    // Ana quiz yapılmamışsa stub oluştur
    await setDoc(dailyRef, {
      uid: user.uid,
      displayName: user.displayName ?? 'Anonim',
      photoURL: user.photoURL ?? '',
      score,
      correct: 0,
      date: today,
      week,
      completedAt: serverTimestamp(),
    });
  }

  // Kullanıcı toplam puanı
  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, { totalScore: increment(score) });
}

export async function fetchUserRank(uid: string, period: 'daily' | 'weekly' | 'alltime'): Promise<number> {
  const board = await fetchLeaderboard(period, 200);
  const idx = board.findIndex((e) => e.uid === uid);
  return idx === -1 ? 999 : idx + 1;
}

/**
 * Bir quiz tamamlandığında çağrılır. Tek atomik updateDoc ile:
 * - Gün serisini (streak) günceller
 * - Kategori bazlı doğru/toplam istatistiğini artırır
 * - Yanlış yapılan soruları "wrongQuestions" havuzuna ekler, doğru yapılanları çıkarır
 * - Kusursuz quiz sayısını artırır
 * Tüm veri kullanıcı profili dokümanında map alanları olarak tutulur (ek güvenlik kuralı gerekmez).
 */
export async function recordQuizStats(
  uid: string,
  answered: AnsweredItem[],
  isPerfect: boolean
): Promise<{ currentStreak: number; longestStreak: number; isNewDay: boolean }> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  const data = (snap.exists() ? snap.data() : {}) as UserProfile;

  const today = getTodayKey();
  const updates: Record<string, unknown> = {};

  // --- Gün serisi ---
  let currentStreak = data.currentStreak ?? 0;
  let longestStreak = data.longestStreak ?? 0;
  const isNewDay = data.lastActiveDate !== today;
  if (isNewDay) {
    currentStreak = data.lastActiveDate === getYesterdayKey() ? currentStreak + 1 : 1;
    longestStreak = Math.max(longestStreak, currentStreak);
    updates.lastActiveDate = today;
    updates.currentStreak = currentStreak;
    updates.longestStreak = longestStreak;
  } else {
    currentStreak = data.currentStreak ?? 1;
    longestStreak = data.longestStreak ?? currentStreak;
  }

  // --- Kategori istatistiği + yanlış soru havuzu ---
  for (const a of answered) {
    updates[`categoryStats.${a.category}.total`] = increment(1);
    if (a.correct) {
      updates[`categoryStats.${a.category}.correct`] = increment(1);
      updates[`wrongQuestions.${a.id}`] = deleteField();
    } else {
      updates[`wrongQuestions.${a.id}`] = { category: a.category, addedAt: serverTimestamp() };
    }
  }

  if (isPerfect) updates.perfectCount = increment(1);

  try {
    await updateDoc(ref, updates);
  } catch {
    // istatistik kaydı başarısız olsa da quiz akışı bozulmamalı
  }

  return { currentStreak, longestStreak, isNewDay };
}

/** Yanlışlarım modunda bir soru doğru cevaplanınca havuzdan çıkarır. */
export async function removeWrongQuestion(uid: string, questionId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), { [`wrongQuestions.${questionId}`]: deleteField() });
  } catch {
    // sessizce geç
  }
}
