import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { db } from './firebase';

export type AppVersionInfo = {
  latestVersion: string;
  releaseNotes?: string;
};

const DISMISS_KEY_PREFIX = 'update_dismissed_';
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function getCurrentVersion(): string {
  return Constants.expoConfig?.version ?? '0.0.0';
}

export function isNewer(latest: string, current: string): boolean {
  const pa = latest.split('.').map((n) => parseInt(n, 10) || 0);
  const pb = current.split('.').map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const a = pa[i] || 0;
    const b = pb[i] || 0;
    if (a !== b) return a > b;
  }
  return false;
}

export async function fetchAppVersionInfo(): Promise<AppVersionInfo | null> {
  try {
    const snap = await getDoc(doc(db, 'config', 'appVersion'));
    if (!snap.exists()) return null;
    const data = snap.data() as { latestVersion?: unknown; releaseNotes?: unknown };
    if (typeof data.latestVersion !== 'string') return null;
    return {
      latestVersion: data.latestVersion,
      releaseNotes: typeof data.releaseNotes === 'string' ? data.releaseNotes : undefined,
    };
  } catch {
    return null;
  }
}

export async function isDismissed(version: string): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(DISMISS_KEY_PREFIX + version);
    if (!raw) return false;
    const ts = parseInt(raw, 10) || 0;
    return Date.now() - ts < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

export async function dismissVersion(version: string): Promise<void> {
  try {
    await AsyncStorage.setItem(DISMISS_KEY_PREFIX + version, String(Date.now()));
  } catch {}
}
