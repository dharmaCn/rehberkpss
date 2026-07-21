import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Arka arkaya crash koruması: build 34'te (v1.3.1) bir grup kullanıcıda
// eski AsyncStorage verisi Hermes JS boot'unda EXC_BAD_ACCESS'e yol açtı.
// Bu modül iki katman içerir:
// 1. Sürüm süpürmesi: uygulama sürümü değiştiyse (güncelleme), eski sürümün
//    yazdığı app cache anahtarları daha hiçbir kod onları okumadan silinir —
//    crash hiç oluşmaz. Firebase oturumu ve onboarding bayrağı korunur.
// 2. Boot canary: yine de iki başarısız açılış olursa nuclear reset
//    (oturum dahil her şey silinir, fresh install gibi başlar).

const COUNTER_KEY = '__boot_attempt_count';
const VERSION_KEY = '__last_run_version';
const CRASH_THRESHOLD = 2;
const KEEP_KEYS = new Set<string>([COUNTER_KEY]);

// Sürüm süpürmesinde korunanlar: canary + sürüm kaydı + onboarding bayrağı
// + Firebase auth persistence (kullanıcı çıkışa düşmesin).
function keepOnVersionSweep(key: string): boolean {
  return (
    key === COUNTER_KEY ||
    key === VERSION_KEY ||
    key === 'onboardingSeen' ||
    key.startsWith('firebase:')
  );
}

async function runVersionSweep(): Promise<void> {
  const current = Constants.expoConfig?.version ?? '';
  let stored: string | null = null;
  try {
    stored = await AsyncStorage.getItem(VERSION_KEY);
  } catch {
    stored = null;
  }
  if (stored === current) return;
  try {
    // stored === null iki durumda olur: taze kurulum (depo zaten boş, süpürme
    // zararsız) ya da bu anahtarı hiç yazmamış eski sürümden güncelleme (asıl
    // crash yaşayan grup) — her iki durumda da süpürmek güvenli ve gerekli.
    const keys = await AsyncStorage.getAllKeys();
    const toRemove = keys.filter((k) => !keepOnVersionSweep(k));
    if (toRemove.length > 0) await AsyncStorage.multiRemove(toRemove);
    await AsyncStorage.setItem(VERSION_KEY, current);
  } catch {}
}

let bootReadyPromise: Promise<void> | null = null;
let successMarked = false;

async function performRecovery(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const toRemove = keys.filter((k) => !KEEP_KEYS.has(k));
    if (toRemove.length > 0) {
      await AsyncStorage.multiRemove(toRemove);
    }
  } catch {
    // AsyncStorage native yaması exception'ı yakalayıp callback'e döndürür;
    // yine de bir şey ters giderse sessizce geç, en kötü self-heal atlanır.
  }
}

async function runBootCanary(): Promise<void> {
  await runVersionSweep();
  let count = 0;
  try {
    const raw = await AsyncStorage.getItem(COUNTER_KEY);
    count = raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    count = 0;
  }
  if (count >= CRASH_THRESHOLD) {
    await performRecovery();
    try {
      await AsyncStorage.setItem(COUNTER_KEY, '1');
    } catch {}
    return;
  }
  try {
    await AsyncStorage.setItem(COUNTER_KEY, String(count + 1));
  } catch {}
}

export function initBootCanary(): Promise<void> {
  if (!bootReadyPromise) {
    bootReadyPromise = runBootCanary();
  }
  return bootReadyPromise;
}

export async function markBootSuccess(): Promise<void> {
  if (successMarked) return;
  successMarked = true;
  try {
    await AsyncStorage.setItem(COUNTER_KEY, '0');
  } catch {}
}
