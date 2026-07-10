import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useOnboarding } from '../lib/onboarding';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'flash' as const,
    title: 'Her gün 10 soru, 30 saniye tempo',
    body: 'Kısa ve odaklı pratikle KPSS & AGS\'ye hazırlan, günlük rutin haline getir.',
    colors: ['#4338CA', '#7C3AED'] as const,
  },
  {
    icon: 'book' as const,
    title: 'Konu anlatımı ve arkadaşla düello',
    body: '30 üniteyi hap bilgi kartlarıyla öğren, arkadaşlarını meydan okumaya davet et.',
    colors: ['#0EA5E9', '#4338CA'] as const,
  },
  {
    icon: 'gift' as const,
    title: 'Ücretsiz, reklamsız',
    body: 'Misafir olarak hemen başla ya da hesabını bağlayıp ilerlemeni koru.',
    colors: ['#059669', '#0EA5E9'] as const,
  },
];

export default function OnboardingScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const { markSeen } = useOnboarding();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  function finish() {
    markSeen();
    router.replace('/');
  }

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  }

  function goNext() {
    if (index >= SLIDES.length - 1) {
      finish();
      return;
    }
    scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
  }

  const isLast = index === SLIDES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <TouchableOpacity style={styles.skip} onPress={finish} hitSlop={10}>
        <Text style={[styles.skipText, { color: c.textSecondary }]}>Geç</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={{ flex: 1 }}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <LinearGradient colors={s.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconBadge}>
              <Ionicons name={s.icon} size={44} color="#fff" />
            </LinearGradient>
            <Text style={[styles.title, { color: c.text }]}>{s.title}</Text>
            <Text style={[styles.body, { color: c.textSecondary }]}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i === index ? Colors.primary : c.border },
                i === index && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: Colors.primary }]} onPress={goNext} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>{isLast ? 'Hadi Başlayalım' : 'İleri'}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  skip: { position: 'absolute', top: 60, right: 20, zIndex: 1, padding: 8 },
  skipText: { fontSize: 14, fontWeight: '700' },

  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 20 },
  iconBadge: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '900', textAlign: 'center', lineHeight: 32 },
  body: { fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 },

  footer: { paddingHorizontal: 24, paddingBottom: 40, gap: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 22 },

  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '900' },
});
