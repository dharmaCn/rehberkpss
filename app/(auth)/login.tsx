import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Ionicons } from '@expo/vector-icons';
import { signInGuestAsync, signInWithGoogleAsync, signInWithAppleAsync } from '../../lib/firebase';
import { ensureUserProfile } from '../../lib/firestore';
import { openStoreReview } from '../../lib/review';
import { Colors } from '../../constants/colors';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const [guestLoading, setGuestLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleAvailable, setAppleAvailable] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable).catch(() => {});
    }
  }, []);

  async function handleApple() {
    try {
      const user = await signInWithAppleAsync();
      if (user) {
        await ensureUserProfile({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          isAnonymous: false,
        });
      }
    } catch (e) {
      const code = (e as { code?: string })?.code ?? '';
      if (code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple ile giriş yapılamadı', 'Lütfen tekrar deneyin.');
      }
    }
  }

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
      }
    } catch {
      // kullanıcı iptal ettiyse veya hata varsa sessizce devam et
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Gradient hero */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED', '#6D28D9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.logoGlow}>
          <Image source={require('../../assets/icon.png')} style={styles.logoImg} />
        </View>
        <Text style={styles.appName}>KPSS & AGS Quiz</Text>
        <Text style={styles.tagline}>Soru Bankası 2026</Text>

        {/* İstatistikler */}
        <View style={styles.statsRow}>
          {[
            { value: 'Binlerce', label: 'Soru' },
            { value: 'Onlarca', label: 'Konu' },
            { value: 'Her Gün', label: 'Yeni' },
          ].map((s) => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Alt kısım — butonlar */}
      <View style={styles.bottom}>
        <Text style={[styles.ctaText, { color: c.text }]}>
          Her gün 10 soru çöz,{'\n'}sıralamada yüksel
        </Text>

        {/* Misafir */}
        <TouchableOpacity
          style={[styles.primaryBtn, { opacity: guestLoading ? 0.7 : 1 }]}
          onPress={handleGuest}
          disabled={guestLoading || googleLoading}
          activeOpacity={0.85}
        >
          {guestLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="flash" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Hızlı Başla</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
          <Text style={[styles.dividerText, { color: c.textSecondary }]}>veya hesabınla giriş yap</Text>
          <View style={[styles.dividerLine, { backgroundColor: c.border }]} />
        </View>

        {/* Sosyal butonlar yan yana */}
        <View style={styles.socialRow}>
          {appleAvailable && (
            <TouchableOpacity
              style={[styles.socialBtn, { backgroundColor: scheme === 'dark' ? '#fff' : '#000' }]}
              onPress={handleApple}
              activeOpacity={0.85}
            >
              <Ionicons name="logo-apple" size={20} color={scheme === 'dark' ? '#000' : '#fff'} />
              <Text style={[styles.socialBtnText, { color: scheme === 'dark' ? '#000' : '#fff' }]}>Apple</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.socialBtn, { backgroundColor: c.card, borderColor: c.border, borderWidth: 1.5 }]}
            onPress={handleGoogleSignIn}
            disabled={guestLoading || googleLoading}
            activeOpacity={0.85}
          >
            {googleLoading ? (
              <ActivityIndicator color={Colors.primary} size="small" />
            ) : (
              <>
                <Text style={styles.googleG}>G</Text>
                <Text style={[styles.socialBtnText, { color: c.text }]}>Google</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.legal, { color: c.textSecondary }]}>
          Giriş yaparak gizlilik politikamızı kabul etmiş olursunuz.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  hero: {
    paddingTop: 100,
    paddingBottom: 44,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  logoGlow: {
    width: 88,
    height: 88,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  logoImg: { width: 88, height: 88, borderRadius: 26 },
  appName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.5,
  },

  statsRow: {
    flexDirection: 'row',
    marginTop: 28,
    gap: 2,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 24,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.2)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '600',
    marginTop: 2,
  },

  bottom: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
    gap: 16,
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12, fontWeight: '500' },

  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  socialBtnText: { fontSize: 13, fontWeight: '700' },
  googleG: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4285F4',
  },

  legal: { fontSize: 11, textAlign: 'center', marginTop: 4 },
});
