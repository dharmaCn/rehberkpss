import AsyncStorage from '@react-native-async-storage/async-storage';

// Arka arkaya crash koruması: build 34'te (v1.3.1) bir grup kullanıcıda
// eski AsyncStorage verisi Hermes JS boot'unda EXC_BAD_ACCESS'e yol açtı.
// Bu modül boot canary tutar; iki başarısız açılıştan sonra local depoyu
// tamamen temizler ki uygulama fresh install gibi başlasın (self-heal).

const COUNTER_KEY = '__boot_attempt_count';
const CRASH_THRESHOLD = 2;
const KEEP_KEYS = new Set<string>([COUNTER_KEY]);

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
