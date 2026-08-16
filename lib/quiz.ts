import { QUESTION_POOL, Question } from '../constants/questions';

export { getTodayKey } from './dateKey';
export { getCategoryLabel, getCategoryColor } from './categoryMeta';

export function getDailyQuestions(): Question[] {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

  // Deterministik shuffle — aynı gün herkes aynı 10 soruyu görür
  const shuffled = [...QUESTION_POOL];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, 10);
}

export function calculateScore(
  correct: boolean,
  timeRemaining: number,
  totalTime: number
): number {
  if (!correct) return 0;
  const base = 100;
  const speedBonus = Math.floor((timeRemaining / totalTime) * 50);
  return base + speedBonus;
}

export function eveningQuizDoneKey(dateKey: string): string {
  return `eveningQuizDone:${dateKey}`;
}

export function getEveningQuizQuestions(): Question[] {
  const today = new Date();
  // Günlük quizden farklı bir seed — aynı gün herkes aynı 10 soruyu görür
  const seed = (today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()) * 10 + 7;

  const shuffled = [...QUESTION_POOL];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, 10);
}

export function getDailyCategoryQuestions(category: Question['category'], count = 5): Question[] {
  const today = new Date();
  // Category seed değişkeni ana quizden farklı olsun
  const catOffset = { tarih: 1, cografya: 2, vatandaslik: 3, guncel: 4 }[category];
  const seed =
    (today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()) * 10 +
    catOffset;

  const pool = QUESTION_POOL.filter((q) => q.category === category);
  const shuffled = [...pool];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

export const CATEGORY_SCORE_MULTIPLIER = 0.2;
