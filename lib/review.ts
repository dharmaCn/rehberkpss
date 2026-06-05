import * as StoreReview from 'expo-store-review';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage anahtarları
const KEY_QUIZ_COUNT = 'review_quiz_count';
const KEY_PROMPTED = 'review_prompted';
const KEY_LAST_PROMPT = 'review_last_prompt';

// Kaçıncı quiz'den sonra native değerlendirme diyaloğunu tetikleyelim
const PROMPT_AFTER_QUIZ = 2;
// İki tetik denemesi arasındaki minimum gün (Apple zaten sınırlar, biz de güvenceye alalım)
const MIN_DAYS_BETWEEN_PROMPTS = 60;

function daysSince(iso: string | null): number {
  if (!iso) return Infinity;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return Infinity;
  return (Date.now() - then) / (1000 * 60 * 60 * 24);
}

/**
 * Quiz tamamlandığında çağrılır. Bitirilen quiz sayısını artırır ve
 * koşullar uygunsa (yeterli quiz bitirilmiş + daha önce sorulmamış) native
 * değerlendirme diyaloğunu tetikler. Hatalar sessizce yutulur.
 */
export async function recordQuizCompletedAndMaybePrompt(): Promise<void> {
  try {
    const countRaw = await AsyncStorage.getItem(KEY_QUIZ_COUNT);
    const count = (parseInt(countRaw ?? '0', 10) || 0) + 1;
    await AsyncStorage.setItem(KEY_QUIZ_COUNT, String(count));

    if (count < PROMPT_AFTER_QUIZ) return;

    const prompted = await AsyncStorage.getItem(KEY_PROMPTED);
    if (prompted === '1') return;

    const lastPrompt = await AsyncStorage.getItem(KEY_LAST_PROMPT);
    if (daysSince(lastPrompt) < MIN_DAYS_BETWEEN_PROMPTS) return;

    const available = await StoreReview.isAvailableAsync();
    if (!available) return;

    await AsyncStorage.setItem(KEY_LAST_PROMPT, new Date().toISOString());
    await StoreReview.requestReview();
    await AsyncStorage.setItem(KEY_PROMPTED, '1');
  } catch {
    // Değerlendirme akışı kritik değil; sessizce geç
  }
}

/**
 * "Bizi Değerlendir" linki için. Önce native diyaloğu dener; mağaza
 * sayfası tanımlıysa (yayından sonra app.json'a eklenir) mağazayı açar.
 */
export async function openStoreReview(): Promise<void> {
  try {
    if (await StoreReview.hasAction()) {
      await StoreReview.requestReview();
      return;
    }
    const url = await StoreReview.storeUrl();
    if (url) {
      await Linking.openURL(url);
    }
  } catch {
    // Mağaza henüz yayında değilse veya hata olursa sessizce geç
  }
}
