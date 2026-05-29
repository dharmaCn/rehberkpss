import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { enableDemo } from '../../lib/demoMode';
import { signInGuestAsync, signInWithGoogleAsync } from '../../lib/firebase';
import { ensureUserProfile } from '../../lib/firestore';
import { Colors } from '../../constants/colors';

export default function LoginScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const [guestLoading, setGuestLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  async function handleGuest() {
    setGuestLoading(true);
    try {
      const user = await signInGuestAsync();
      if (user) {
        await ensureUserProfile({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          isAnonymous: true,
        });
      }
      Alert.alert('Hoş geldin! 👋', `${user?.displayName ?? 'Misafir'} olarak giriş yaptın.`);
    } catch (e) {
      Alert.alert('Hata', String(e));
    } finally {
      setGuestLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogleAsync();
      if (user) {
        await ensureUserProfile({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          isAnonymous: false,
        });
        // useAuth onAuthStateChanged tetiklenir, _layout.tsx otomatik yönlendirir
      }
    } catch {
      // kullanıcı iptal ettiyse veya hata varsa sessizce devam et
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleDemo() {
    enableDemo();
    router.replace('/(tabs)');
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.hero}>
        <View style={[styles.logoBox, { backgroundColor: Colors.primary }]}>
          <Text style={styles.logoText}>K</Text>
        </View>
        <Text style={[styles.appName, { color: c.text }]}>KPSS Quiz</Text>
        <Text style={[styles.tagline, { color: c.textSecondary }]}>
          Her gün 10 soru,{'\n'}her gün bir adım öne çık.
        </Text>
      </View>

      <View style={styles.features}>
        {[
          { icon: '🏆', label: 'Günlük sıralama' },
          { icon: '📊', label: 'Haftalık & tüm zamanlar' },
          { icon: '⚡', label: 'Hızlı cevapla ekstra puan kazan' },
        ].map((f) => (
          <View key={f.label} style={[styles.featureRow, { borderColor: c.border, backgroundColor: c.card }]}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={[styles.featureLabel, { color: c.text }]}>{f.label}</Text>
          </View>
        ))}
      </View>

      {/* Misafir Giriş - Ana buton */}
      <TouchableOpacity
        style={[styles.guestBtn, { opacity: guestLoading ? 0.7 : 1 }]}
        onPress={handleGuest}
        disabled={guestLoading || googleLoading}
        activeOpacity={0.85}
      >
        {guestLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Text style={styles.guestBtnIcon}>👤</Text>
            <Text style={styles.guestBtnText}>Misafir Olarak Giriş Yap</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Google Giriş - İkincil */}
      <TouchableOpacity
        style={[styles.googleBtn, { borderColor: c.border, backgroundColor: c.card }]}
        onPress={handleGoogleSignIn}
        disabled={guestLoading || googleLoading}
        activeOpacity={0.85}
      >
        {googleLoading ? (
          <ActivityIndicator color={Colors.primary} size="small" />
        ) : (
          <>
            <View style={[styles.googleIconBox, { backgroundColor: Colors.primary }]}>
              <Text style={styles.googleIcon}>G</Text>
            </View>
            <Text style={[styles.googleBtnText, { color: c.text }]}>Google ile Giriş Yap</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDemo} activeOpacity={0.6}>
        <Text style={[styles.demoText, { color: c.textSecondary }]}>Demo Modu</Text>
      </TouchableOpacity>

      <Text style={[styles.legal, { color: c.textSecondary }]}>
        Giriş yaparak gizlilik politikamızı kabul etmiş olursunuz.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    gap: 20,
  },
  hero: { alignItems: 'center', gap: 12 },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: { fontSize: 40, fontWeight: '800', color: '#fff' },
  appName: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  tagline: { fontSize: 16, textAlign: 'center', lineHeight: 24 },
  features: { gap: 10 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  featureIcon: { fontSize: 22 },
  featureLabel: { fontSize: 15, fontWeight: '500' },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  guestBtnIcon: { fontSize: 20 },
  guestBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  googleIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: { fontSize: 13, fontWeight: '800', color: '#fff' },
  googleBtnText: { fontSize: 15, fontWeight: '600' },
  demoText: { textAlign: 'center', fontSize: 13, fontWeight: '500' },
  legal: { fontSize: 12, textAlign: 'center' },
});
