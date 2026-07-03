import * as Sharing from 'expo-sharing';
import { Share, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import type { RefObject } from 'react';
import type { View } from 'react-native';

const APP_STORE_URL = 'https://apps.apple.com/tr/app/kpss-quiz/id6753145867';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.rehberkpss.app';

export const STORE_URLS = { ios: APP_STORE_URL, android: PLAY_STORE_URL };

export function buildChallengeUrl(uid: string, score: number, date: string): string {
  const params = new URLSearchParams({ from: uid, score: String(score), date });
  return `rehberkpss://challenge?${params.toString()}`;
}

export async function captureAndShare(
  ref: RefObject<View | null>,
  message: string
): Promise<boolean> {
  if (!ref.current) return false;
  try {
    const uri = await captureRef(ref, { format: 'png', quality: 1, result: 'tmpfile' });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { dialogTitle: message, mimeType: 'image/png' });
      return true;
    }
    await Share.share({ url: uri, message });
    return true;
  } catch {
    return false;
  }
}

export async function shareInvite(displayName: string): Promise<boolean> {
  const storeLink = Platform.OS === 'android' ? PLAY_STORE_URL : APP_STORE_URL;
  const message = `${displayName ? displayName + ' ' : ''}KPSS Quiz'te seni bekliyor! Her gün 10 soru, sıralamada yarış. 📚\n\n${storeLink}`;
  try {
    const result = await Share.share({ message });
    // iOS: sadece gerçekten bir hedefe paylaşıldıysa activityType dolu olur.
    // Cancel basıldığında action 'sharedAction' bile gelse activityType null/empty olabilir.
    if (result.action === Share.sharedAction) {
      const at = (result as { activityType?: string | null }).activityType;
      return !!at && at.length > 0;
    }
    return false;
  } catch {
    return false;
  }
}
