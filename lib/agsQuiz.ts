import { AGS_QUESTION_POOL, AgsQuestion } from '../constants/agsQuestions';
import { AgsCategory } from '../constants/agsTopicMeta';

export { AGS_TOPIC_ORDER } from '../constants/agsTopicMeta';
export { getAgsTopicLabel, getAgsTopicColor } from './agsCategoryMeta';
import { AGS_TOPIC_ORDER } from '../constants/agsTopicMeta';

export function getAgsTopicQuestionCount(cat: AgsCategory): number {
  return AGS_QUESTION_POOL.filter((q) => q.category === cat).length;
}

// Her gün aynı 5 soru gösterilsin diye ders quizlerindeki gibi deterministik seed kullanılır.
export function getDailyAgsQuestions(category: AgsCategory, count = 5): AgsQuestion[] {
  const today = new Date();
  const topicOffset = AGS_TOPIC_ORDER.indexOf(category) + 1;
  const seed =
    (today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()) * 100 +
    topicOffset;

  const pool = AGS_QUESTION_POOL.filter((q) => q.category === category);
  const shuffled = [...pool];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}
