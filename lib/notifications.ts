import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'notif_enabled';

const DAILY_MESSAGES = [
  { title: 'KPSS Quiz', body: 'Bugünkü 10 soru hazır 📚' },
  { title: 'Serini bozma!', body: 'Bugün de gel, kaldığın yerden devam et 🔥' },
  { title: 'KPSS Quiz', body: '10 dakikan var mı? Bugünkü dozun seni bekliyor 💪' },
];

const COMEBACK_MESSAGES = [
  { title: 'Soruların seni özledi 🥺', body: '30 saniyen var mı? Bugünkü 10 soru hazır.' },
  { title: 'Geri dön! 🔥', body: 'Serini kaybetmeden tekrar başlayabilirsin.' },
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function isEnabled(): Promise<boolean> {
  const v = await AsyncStorage.getItem(STORAGE_KEY);
  return v === '1';
}

export async function setEnabledFlag(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
}

async function requestPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily', {
      name: 'Günlük Hatırlatma',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const cur = await Notifications.getPermissionsAsync();
  if (cur.granted) return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

async function scheduleDaily(): Promise<void> {
  const msg = DAILY_MESSAGES[Math.floor(Math.random() * DAILY_MESSAGES.length)];
  await Notifications.scheduleNotificationAsync({
    identifier: 'daily-reminder',
    content: { title: msg.title, body: msg.body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: 20,
      minute: 0,
      repeats: true,
    },
  });
}

async function scheduleWeeklySummary(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: 'weekly-summary',
    content: { title: 'Bu hafta nasıldı?', body: 'Haftalık özetini görmek için aç 📈' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      weekday: 1, // Sunday=1 in iOS calendar weekday
      hour: 19,
      minute: 30,
      repeats: true,
    },
  });
}

async function scheduleComeback(): Promise<void> {
  // 3, 5, 7 days from now — rescheduled on every app open
  const days = [3, 5, 7];
  for (let i = 0; i < days.length; i++) {
    const msg = COMEBACK_MESSAGES[i % COMEBACK_MESSAGES.length];
    await Notifications.scheduleNotificationAsync({
      identifier: `comeback-${days[i]}`,
      content: { title: msg.title, body: msg.body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: days[i] * 86400,
        repeats: false,
      },
    });
  }
}

export async function enableAll(): Promise<boolean> {
  const ok = await requestPermission();
  if (!ok) return false;
  await Notifications.cancelAllScheduledNotificationsAsync();
  await scheduleDaily();
  await scheduleWeeklySummary();
  await scheduleComeback();
  await setEnabledFlag(true);
  return true;
}

export async function refreshComebackSchedule(): Promise<void> {
  if (!(await isEnabled())) return;
  // Cancel just the comeback ones and reschedule
  for (const id of ['comeback-3', 'comeback-5', 'comeback-7']) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // ignore
    }
  }
  await scheduleComeback();
}

export async function disableAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await setEnabledFlag(false);
}
