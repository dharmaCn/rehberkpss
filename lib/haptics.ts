import * as Haptics from 'expo-haptics';

// Native modül mevcut değilse (henüz yeni build alınmadıysa) sessizce no-op olur.
export async function hapticSuccess(): Promise<void> {
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
}
export async function hapticError(): Promise<void> {
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
}
export async function hapticLight(): Promise<void> {
  try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
}
