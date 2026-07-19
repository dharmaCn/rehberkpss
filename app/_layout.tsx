import { useCallback, useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { isDemoMode } from '../lib/demoMode';
import { Colors } from '../constants/colors';
import SeasonResetModal from '../components/SeasonResetModal';
import { refreshComebackSchedule } from '../lib/notifications';
import { ONBOARDING_SEEN_KEY, OnboardingContext } from '../lib/onboarding';
import { initBootCanary, markBootSuccess } from '../lib/bootRecovery';

function RootLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const [onboardingSeen, setOnboardingSeen] = useState<boolean | null>(null);

  useEffect(() => {
    // Onboarding okuma da AsyncStorage'a dokunuyor — canary'yi bekle,
    // gerekirse self-heal temizliği önce çalışsın.
    initBootCanary()
      .then(() => AsyncStorage.getItem(ONBOARDING_SEEN_KEY))
      .then((v) => setOnboardingSeen(v === '1'))
      .catch(() => setOnboardingSeen(true));
  }, []);

  // Uygulama sağ salim mount olup auth + onboarding çözüldüyse boot canary'yi
  // sıfırla. 3sn bekleme, Hermes JS boot crash penceresini (yaklaşık 2sn)
  // güvenle geçtiğimizden emin olmak için.
  useEffect(() => {
    if (loading || onboardingSeen === null) return;
    const t = setTimeout(() => {
      markBootSuccess().catch(() => {});
    }, 3000);
    return () => clearTimeout(t);
  }, [loading, onboardingSeen]);

  // Senkron işaretleme: onboarding ekranı bunu çağırınca state hemen güncellenir,
  // AsyncStorage'ın async okuma turunu beklemek gerekmez (aksi halde yönlendirme
  // efekti eski "görülmedi" değeriyle çalışıp kullanıcıyı tekrar onboarding'e atıyordu).
  const markOnboardingSeen = useCallback(() => {
    setOnboardingSeen(true);
    AsyncStorage.setItem(ONBOARDING_SEEN_KEY, '1').catch(() => {});
  }, []);

  useEffect(() => {
    if (loading || onboardingSeen === null) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!onboardingSeen && !inOnboarding && !isDemoMode()) {
      router.replace('/onboarding');
      return;
    }
    const inAuth = segments[0] === '(auth)';
    if (!user && !inAuth && !inOnboarding && !isDemoMode()) {
      router.replace('/(auth)/login');
    } else if (user && (inAuth || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, onboardingSeen]);

  // Her app açılışında 3/5/7 günlük comeback push'larını yeniden planla.
  // İlk açılışın hemen ardından değil, birkaç saniye gecikmeyle — soğuk başlangıçtaki
  // en kritik pencerede native bildirim API çağrılarının JS/GC yükünü artırmaması için.
  useEffect(() => {
    const t = setTimeout(() => {
      refreshComebackSchedule().catch(() => {});
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  if (loading || onboardingSeen === null) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <OnboardingContext.Provider value={{ seen: onboardingSeen, markSeen: markOnboardingSeen }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }} />
        {user && !isDemoMode() ? <SeasonResetModal /> : null}
      </GestureHandlerRootView>
    </OnboardingContext.Provider>
  );
}

export default RootLayout;
