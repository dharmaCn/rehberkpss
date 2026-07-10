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
  where,
  arrayUnion,
  deleteDoc,
  addDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { getTodayKey } from './quiz';
import { guestDisplayName, isGuestDisplayName } from './guestName';
import { SEASON_ID } from '../constants/season';
import { BadgeId, evaluateNewBadges } from './badges';
import { CategoryKey, TitleId, evaluateTitle } from './titles';

export interface ProfileMeta {
  examDate?: string;
  targetScore?: number;
}

export interface MissionsState {
  firstQuiz: boolean;
  profileComplete: boolean;
  firstShare: boolean;
  threeDayStreak: boolean;
  completed: boolean;
}

export interface StreakFreezeState {
  available: number;
  autoUsedAt: string | null;
}

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
  // v1.1
  seasonId?: string;
  seasonScore?: number;
  currentStreak?: number;
  longestStreak?: number;
  lastQuizDate?: string;
  badges?: BadgeId[];
  profileMeta?: ProfileMeta;
  missions?: MissionsState;
  streakFreeze?: StreakFreezeState;
  // v1.4 — düello
  duelCount?: number;
  duelWins?: number;
  duelStreak?: number;
  // v1.5 — Aday Kimliği (unvan)
  categoryStats?: Record<CategoryKey, { correct: number; total: number }>;
  weeklyCorrect?: number;
  weeklyTotal?: number;
  weeklyKey?: string;
  previousWeeklyAccuracy?: number | null;
  titleId?: TitleId | null;
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
  titleId?: TitleId | null;
}

function getWeekKey(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function yesterdayKey(today: string): string {
  const d = new Date(today + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DEFAULT_MISSIONS: MissionsState = {
  firstQuiz: false,
  profileComplete: false,
  firstShare: false,
  threeDayStreak: false,
  completed: false,
};

const DEFAULT_FREEZE: StreakFreezeState = { available: 2, autoUsedAt: null };

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
      seasonId: SEASON_ID,
      seasonScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastQuizDate: '',
      badges: [],
      profileMeta: {},
      missions: DEFAULT_MISSIONS,
      streakFreeze: DEFAULT_FREEZE,
      categoryStats: {},
      weeklyCorrect: 0,
      weeklyTotal: 0,
      weeklyKey: getWeekKey(),
      previousWeeklyAccuracy: null,
      titleId: null,
    });
  } else {
    // Migrate existing users to v1.1 schema if missing fields
    const data = snap.data() as Partial<UserProfile>;
    const patch: Record<string, unknown> = {};
    if (data.seasonId !== SEASON_ID) {
      patch.seasonId = SEASON_ID;
      patch.seasonScore = 0;
    }
    if (data.currentStreak === undefined) patch.currentStreak = 0;
    if (data.longestStreak === undefined) patch.longestStreak = 0;
    if (data.lastQuizDate === undefined) patch.lastQuizDate = '';
    if (data.badges === undefined) patch.badges = [];
    if (data.profileMeta === undefined) patch.profileMeta = {};
    if (data.missions === undefined) patch.missions = DEFAULT_MISSIONS;
    if (data.streakFreeze === undefined) patch.streakFreeze = DEFAULT_FREEZE;
    if (data.categoryStats === undefined) patch.categoryStats = {};
    if (data.weeklyCorrect === undefined) patch.weeklyCorrect = 0;
    if (data.weeklyTotal === undefined) patch.weeklyTotal = 0;
    if (data.weeklyKey === undefined) patch.weeklyKey = getWeekKey();
    if (data.previousWeeklyAccuracy === undefined) patch.previousWeeklyAccuracy = null;
    if (data.titleId === undefined) patch.titleId = null;
    if (Object.keys(patch).length > 0) {
      await updateDoc(ref, patch);
    }
  }
}

export async function hasCompletedTodayQuiz(uid: string): Promise<boolean> {
  const today = getTodayKey();
  const ref = doc(db, 'results', `${uid}_${today}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return false;
  const data = snap.data() as { mainCompleted?: boolean };
  return data.mainCompleted === true;
}

export interface StreakUpdateOutcome {
  currentStreak: number;
  longestStreak: number;
  freezeUsed: boolean;
  brokenFromPrev: number;
}

function computeStreakUpdate(
  today: string,
  prevDate: string,
  prevStreak: number,
  prevLongest: number,
  freezeAvailable: number
): StreakUpdateOutcome & { newFreezeAvailable: number } {
  if (!prevDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(prevLongest, 1),
      freezeUsed: false,
      brokenFromPrev: 0,
      newFreezeAvailable: freezeAvailable,
    };
  }
  if (prevDate === today) {
    return {
      currentStreak: prevStreak,
      longestStreak: prevLongest,
      freezeUsed: false,
      brokenFromPrev: 0,
      newFreezeAvailable: freezeAvailable,
    };
  }
  const y = yesterdayKey(today);
  if (prevDate === y) {
    const c = prevStreak + 1;
    return {
      currentStreak: c,
      longestStreak: Math.max(prevLongest, c),
      freezeUsed: false,
      brokenFromPrev: 0,
      // Bonus freeze every 7 days, cap 3
      newFreezeAvailable: c > 0 && c % 7 === 0 ? Math.min(3, freezeAvailable + 1) : freezeAvailable,
    };
  }
  // Streak about to break — freeze can only cover exactly 1 missed day
  const dayBeforeY = yesterdayKey(y);
  if (prevDate === dayBeforeY && freezeAvailable > 0 && prevStreak > 0) {
    return {
      currentStreak: prevStreak + 1,
      longestStreak: Math.max(prevLongest, prevStreak + 1),
      freezeUsed: true,
      brokenFromPrev: prevStreak,
      newFreezeAvailable: freezeAvailable - 1,
    };
  }
  return {
    currentStreak: 1,
    longestStreak: Math.max(prevLongest, 1),
    freezeUsed: false,
    brokenFromPrev: prevStreak,
    newFreezeAvailable: freezeAvailable,
  };
}

export interface SaveResultOutcome {
  newBadges: BadgeId[];
  streak: StreakUpdateOutcome;
  isPerfect: boolean;
  percentile?: number;
}

export async function saveQuizResult(
  user: { uid: string; displayName: string | null; photoURL: string | null },
  score: number,
  correct: number,
  totalQuestions = 10
): Promise<SaveResultOutcome> {
  const today = getTodayKey();
  const week = getWeekKey();

  const resultRef = doc(db, 'results', `${user.uid}_${today}`);
  const existing = await getDoc(resultRef);
  if (existing.exists()) {
    // Daha önce kategori quizinden gelen stub varsa, ana quiz alanlarını güncelle (mevcut score'un üstüne ekle).
    await updateDoc(resultRef, {
      mainCompleted: true,
      mainScore: score,
      score: increment(score),
      correct,
      week,
      seasonId: SEASON_ID,
      completedAt: serverTimestamp(),
    });
  } else {
    await setDoc(resultRef, {
      uid: user.uid,
      displayName: user.displayName ?? 'Anonim',
      photoURL: user.photoURL ?? '',
      score,
      mainScore: score,
      mainCompleted: true,
      correct,
      date: today,
      week,
      seasonId: SEASON_ID,
      completedAt: serverTimestamp(),
    });
  }

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  const userData = (userSnap.data() ?? {}) as Partial<UserProfile>;

  const prevStreak = userData.currentStreak ?? 0;
  const prevLongest = userData.longestStreak ?? 0;
  const prevDate = userData.lastQuizDate ?? '';
  const freeze = userData.streakFreeze ?? DEFAULT_FREEZE;
  const existingBadges = (userData.badges ?? []) as BadgeId[];

  const streakUpd = computeStreakUpdate(today, prevDate, prevStreak, prevLongest, freeze.available);

  const nextQuizCount = (userData.quizCount ?? 0) + 1;
  const newBadges = evaluateNewBadges({
    currentStreak: streakUpd.currentStreak,
    quizCount: nextQuizCount,
    lastCorrect: correct,
    lastTotal: totalQuestions,
    existing: existingBadges,
  });

  const missions = userData.missions ?? DEFAULT_MISSIONS;
  const missionPatch: Partial<MissionsState> = {};
  if (!missions.firstQuiz) missionPatch.firstQuiz = true;
  if (!missions.threeDayStreak && streakUpd.currentStreak >= 3) missionPatch.threeDayStreak = true;
  const mergedMissions = { ...missions, ...missionPatch };
  if (!mergedMissions.completed && mergedMissions.firstQuiz && mergedMissions.profileComplete && mergedMissions.firstShare && mergedMissions.threeDayStreak) {
    mergedMissions.completed = true;
    if (!existingBadges.includes('first_week')) newBadges.push('first_week');
  }

  const patch: Record<string, unknown> = {
    totalScore: increment(score),
    seasonScore: increment(score),
    seasonId: SEASON_ID,
    quizCount: increment(1),
    currentStreak: streakUpd.currentStreak,
    longestStreak: streakUpd.longestStreak,
    lastQuizDate: today,
    streakFreeze: {
      available: streakUpd.newFreezeAvailable,
      autoUsedAt: streakUpd.freezeUsed ? today : freeze.autoUsedAt,
    },
    missions: mergedMissions,
  };
  if (newBadges.length > 0) patch.badges = arrayUnion(...newBadges);
  if (score > (userData.bestDayScore ?? 0)) patch.bestDayScore = score;

  await updateDoc(userRef, patch);

  // percentile: how many today's results have score <= this score
  let percentile: number | undefined;
  try {
    const todaysQ = query(collection(db, 'results'), where('date', '==', today));
    const todaysSnap = await getDocs(todaysQ);
    const scores = todaysSnap.docs.map((d) => (d.data() as { score: number }).score);
    if (scores.length > 1) {
      const beaten = scores.filter((s) => s < score).length;
      percentile = Math.round((beaten / scores.length) * 100);
    }
  } catch {
    // ignore
  }

  return {
    newBadges,
    streak: streakUpd,
    isPerfect: correct === totalQuestions,
    percentile,
  };
}

export async function hasCompletedTodayEveningQuiz(uid: string): Promise<boolean> {
  const today = getTodayKey();
  const ref = doc(db, 'results', `${uid}_${today}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return false;
  const data = snap.data() as { eveningCompleted?: boolean };
  return data.eveningCompleted === true;
}

// Akşam Sınavı puanı günlük/haftalık/sezon sıralamasına dahil olsun diye aynı `results`
// dokümanındaki `score` alanına eklenir; streak/badge/mainCompleted mantığına dokunmaz.
export async function saveEveningQuizResult(
  user: { uid: string; displayName: string | null; photoURL: string | null },
  score: number,
  correct: number
): Promise<void> {
  const today = getTodayKey();
  const week = getWeekKey();
  const resultRef = doc(db, 'results', `${user.uid}_${today}`);
  const existing = await getDoc(resultRef);
  if (existing.exists()) {
    await updateDoc(resultRef, {
      eveningCompleted: true,
      eveningScore: score,
      eveningCorrect: correct,
      score: increment(score),
      week,
      seasonId: SEASON_ID,
    });
  } else {
    await setDoc(resultRef, {
      uid: user.uid,
      displayName: user.displayName ?? 'Anonim',
      photoURL: user.photoURL ?? '',
      score,
      correct,
      eveningCompleted: true,
      eveningScore: score,
      eveningCorrect: correct,
      date: today,
      week,
      seasonId: SEASON_ID,
      completedAt: serverTimestamp(),
    });
  }

  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    totalScore: increment(score),
    seasonScore: increment(score),
  });
}

export async function fetchLeaderboard(
  period: 'daily' | 'weekly' | 'alltime',
  count = 10
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
      where('seasonId', '==', SEASON_ID),
      orderBy('seasonScore', 'desc'),
      limit(count)
    );
  }

  const snap = await getDocs(q);
  return snap.docs.map((d, i) => {
    const data = d.data() as Record<string, unknown>;
    const score = (data.score as number | undefined) ?? (data.seasonScore as number | undefined) ?? 0;
    const uid = data.uid as string;
    const rawName = data.displayName as string | undefined;
    // Eski "Misafir #XXXXX" isimlerini de kapsayarak sıralamada daha doğal görünsün diye
    // deterministik bir takma adla değiştiriyoruz (aynı uid her zaman aynı adı alır).
    const displayName = isGuestDisplayName(rawName) ? guestDisplayName(uid) : rawName!;
    return {
      uid,
      displayName,
      photoURL: (data.photoURL as string) ?? '',
      score,
      rank: i + 1,
      titleId: period === 'alltime' ? ((data.titleId as TitleId | null | undefined) ?? null) : undefined,
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

const EMPTY_CATEGORY_STATS: Record<CategoryKey, { correct: number; total: number }> = {
  tarih: { correct: 0, total: 0 },
  cografya: { correct: 0, total: 0 },
  vatandaslik: { correct: 0, total: 0 },
  guncel: { correct: 0, total: 0 },
};

export async function saveCategoryQuizResult(
  user: { uid: string; displayName: string | null; photoURL: string | null },
  category: string,
  score: number,
  correct: number,
  total: number
): Promise<void> {
  const today = getTodayKey();
  const week = getWeekKey();

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

  const dailyRef = doc(db, 'results', `${user.uid}_${today}`);
  const dailySnap = await getDoc(dailyRef);
  if (dailySnap.exists()) {
    await updateDoc(dailyRef, { score: increment(score) });
  } else {
    // Ana quiz henüz çözülmemiş — stub oluştur ama mainCompleted=false bırak.
    await setDoc(dailyRef, {
      uid: user.uid,
      displayName: user.displayName ?? 'Anonim',
      photoURL: user.photoURL ?? '',
      score,
      mainCompleted: false,
      correct: 0,
      date: today,
      week,
      seasonId: SEASON_ID,
      completedAt: serverTimestamp(),
    });
  }

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  const userData = (userSnap.data() ?? {}) as Partial<UserProfile>;

  const catKey = category as CategoryKey;
  const prevStats = userData.categoryStats ?? EMPTY_CATEGORY_STATS;
  const prevForCat = prevStats[catKey] ?? { correct: 0, total: 0 };
  const newCategoryStats: Record<CategoryKey, { correct: number; total: number }> = {
    ...EMPTY_CATEGORY_STATS,
    ...prevStats,
    [catKey]: { correct: prevForCat.correct + correct, total: prevForCat.total + total },
  };

  const currentWeekKey = getWeekKey();
  const rolledOver = (userData.weeklyKey ?? currentWeekKey) !== currentWeekKey;
  const prevWeeklyCorrect = rolledOver ? 0 : userData.weeklyCorrect ?? 0;
  const prevWeeklyTotal = rolledOver ? 0 : userData.weeklyTotal ?? 0;
  const previousWeeklyAccuracy = rolledOver
    ? (userData.weeklyTotal ?? 0) > 0
      ? ((userData.weeklyCorrect ?? 0) / (userData.weeklyTotal ?? 1)) * 100
      : null
    : userData.previousWeeklyAccuracy ?? null;

  const newWeeklyCorrect = prevWeeklyCorrect + correct;
  const newWeeklyTotal = prevWeeklyTotal + total;
  const weeklyAccuracy = newWeeklyTotal > 0 ? (newWeeklyCorrect / newWeeklyTotal) * 100 : null;

  const newTitleId = evaluateTitle({
    categoryStats: newCategoryStats,
    currentStreak: userData.currentStreak ?? 0,
    weeklyAccuracy,
    previousWeeklyAccuracy,
  });

  await updateDoc(userRef, {
    totalScore: increment(score),
    seasonScore: increment(score),
    seasonId: SEASON_ID,
    categoryStats: newCategoryStats,
    weeklyCorrect: newWeeklyCorrect,
    weeklyTotal: newWeeklyTotal,
    weeklyKey: currentWeekKey,
    previousWeeklyAccuracy,
    titleId: newTitleId,
  });
}

export async function fetchUserRank(uid: string, period: 'daily' | 'weekly' | 'alltime'): Promise<number> {
  const board = await fetchLeaderboard(period, 200);
  const idx = board.findIndex((e) => e.uid === uid);
  return idx === -1 ? 999 : idx + 1;
}

// ---- v1.1 additions ----

export async function fetchWeeklyResults(uid: string): Promise<{ date: string; score: number; correct: number }[]> {
  const today = new Date();
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
  }
  const results: { date: string; score: number; correct: number }[] = [];
  for (const date of dates) {
    const snap = await getDoc(doc(db, 'results', `${uid}_${date}`));
    if (snap.exists()) {
      const d = snap.data() as { score: number; correct: number };
      results.push({ date, score: d.score ?? 0, correct: d.correct ?? 0 });
    } else {
      results.push({ date, score: 0, correct: 0 });
    }
  }
  return results;
}

export async function updateUserDisplayName(uid: string, displayName: string): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { displayName });
}

export async function updateProfileMeta(uid: string, meta: ProfileMeta): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { profileMeta: meta });
  // also flip profileComplete mission
  const snap = await getDoc(doc(db, 'users', uid));
  const data = snap.data() as Partial<UserProfile>;
  const missions = data.missions ?? DEFAULT_MISSIONS;
  if (!missions.profileComplete) {
    await updateDoc(doc(db, 'users', uid), {
      missions: { ...missions, profileComplete: true },
    });
  }
}

export async function markShareMission(uid: string): Promise<void> {
  const snap = await getDoc(doc(db, 'users', uid));
  const data = snap.data() as Partial<UserProfile>;
  const missions = data.missions ?? DEFAULT_MISSIONS;
  if (!missions.firstShare) {
    await updateDoc(doc(db, 'users', uid), {
      missions: { ...missions, firstShare: true },
    });
  }
}

export interface WrongQuestionDoc {
  questionId: string;
  lastWrongAt: unknown;
  wrongCount: number;
  mastered: boolean;
}

export async function logWrongQuestion(uid: string, questionId: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'wrongQuestions', questionId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const d = snap.data() as WrongQuestionDoc;
    await updateDoc(ref, {
      wrongCount: (d.wrongCount ?? 0) + 1,
      lastWrongAt: serverTimestamp(),
      mastered: false,
    });
  } else {
    await setDoc(ref, {
      questionId,
      lastWrongAt: serverTimestamp(),
      wrongCount: 1,
      mastered: false,
    });
  }
}

export async function markQuestionMastered(uid: string, questionId: string): Promise<void> {
  const ref = doc(db, 'users', uid, 'wrongQuestions', questionId);
  await updateDoc(ref, { mastered: true });
}

export type QuestionReportReason = 'wrong_answer' | 'unclear' | 'typo' | 'other';

export async function reportQuestion(params: {
  uid: string;
  questionId: string;
  category: string;
  question: string;
  userAnswerIndex: number;
  correctIndex: number;
  reason: QuestionReportReason;
  note?: string;
}): Promise<void> {
  await addDoc(collection(db, 'questionReports'), {
    uid: params.uid,
    questionId: params.questionId,
    category: params.category,
    question: params.question,
    userAnswerIndex: params.userAnswerIndex,
    correctIndex: params.correctIndex,
    reason: params.reason,
    note: params.note ?? '',
    createdAt: serverTimestamp(),
  });
}

export async function clearMasteredQuestion(uid: string, questionId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'wrongQuestions', questionId));
}

export async function fetchWrongQuestionIds(uid: string, max = 50): Promise<string[]> {
  const q = query(
    collection(db, 'users', uid, 'wrongQuestions'),
    where('mastered', '==', false),
    limit(max)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => (d.data() as WrongQuestionDoc).questionId);
}

/**
 * Aralıklı tekrar: en az `minDays` gün önce yanlış yapılmış ve hâlâ öğrenilmemiş
 * soruların sayısını döndürür (ana ekrandaki "Tekrar Zamanı" kartı için).
 * Firestore'da bileşik indeks gerektirmemek için filtre istemci tarafında yapılır.
 */
export async function fetchDueWrongCount(uid: string, minDays = 2): Promise<number> {
  const q = query(
    collection(db, 'users', uid, 'wrongQuestions'),
    where('mastered', '==', false),
    limit(100)
  );
  const snap = await getDocs(q);
  const cutoff = Date.now() - minDays * 24 * 60 * 60 * 1000;
  let due = 0;
  snap.docs.forEach((d) => {
    const data = d.data() as WrongQuestionDoc & { lastWrongAt?: { toMillis?: () => number } };
    const ts = data.lastWrongAt?.toMillis?.();
    // Zaman damgası yoksa (eski kayıt) tekrar edilebilir say
    if (ts === undefined || ts <= cutoff) due++;
  });
  return due;
}

// ---- Genel Kültür & Güncel Bilgiler (eser/sanat soruları) ----

export interface ArtStat {
  total: number;
  correct: number;
  percentCorrect: number; // 0-100
  alreadyAnswered: boolean;
}

/**
 * Eser sorusuna verilen cevabı kaydeder ve güncel istatistiği döndürür.
 * Aynı soruyu daha önce cevaplamışsa sayacı tekrar artırmaz (kullanıcı başına 1 kez).
 */
export async function recordArtAnswer(
  uid: string,
  questionId: string,
  isCorrect: boolean
): Promise<ArtStat> {
  const statRef = doc(db, 'artStats', questionId);
  const userAnsRef = doc(db, 'users', uid, 'artAnswers', questionId);

  let alreadyAnswered = false;
  try {
    const prev = await getDoc(userAnsRef);
    alreadyAnswered = prev.exists();
  } catch {
    // ignore
  }

  if (!alreadyAnswered) {
    // Kullanıcının kendi cevap kaydı önce ve ayrı try/catch ile yazılır: sayaç
    // yazması (artStats) başarısız olsa bile "cevapladım" durumu kaybolmamalı.
    try {
      await setDoc(userAnsRef, {
        questionId,
        correct: isCorrect,
        answeredAt: serverTimestamp(),
      });
    } catch {
      // ignore — bir sonraki sayfa yüklemesinde tekrar denenecek
    }
    try {
      // Sayaç dokümanı yoksa oluştur, varsa artır
      await setDoc(
        statRef,
        { total: increment(1), correct: increment(isCorrect ? 1 : 0) },
        { merge: true }
      );
    } catch {
      // ignore — istatistik kaydı başarısız olsa da UI çalışır
    }
  }

  return fetchArtStat(questionId, alreadyAnswered);
}

export async function fetchArtStat(questionId: string, alreadyAnswered = false): Promise<ArtStat> {
  try {
    const snap = await getDoc(doc(db, 'artStats', questionId));
    if (snap.exists()) {
      const d = snap.data() as { total?: number; correct?: number };
      const total = d.total ?? 0;
      const correct = d.correct ?? 0;
      return {
        total,
        correct,
        percentCorrect: total > 0 ? Math.round((correct / total) * 100) : 0,
        alreadyAnswered,
      };
    }
  } catch {
    // ignore
  }
  return { total: 0, correct: 0, percentCorrect: 0, alreadyAnswered };
}

export async function hasAnsweredDailyArt(uid: string, questionId: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'artAnswers', questionId));
    return snap.exists();
  } catch {
    return false;
  }
}
