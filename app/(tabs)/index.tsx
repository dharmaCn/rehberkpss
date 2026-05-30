import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { getAuthSync } from '../../lib/firebase';
import { hasCompletedTodayQuiz } from '../../lib/firestore';
import { getDailyQuestions, getTodayKey } from '../../lib/quiz';
import { QUESTION_POOL } from '../../constants/questions';
import { Colors } from '../../constants/colors';

// KPSS Genel Kültür sınavında yaklaşık soru dağılımı (toplam ~60 soru)
const CATEGORIES = [
  { key: 'tarih', label: 'Tarih', color: '#EF4444', icon: '📜', exam: 27 },
  { key: 'cografya', label: 'Coğrafya', color: '#10B981', icon: '🌍', exam: 18 },
  { key: 'vatandaslik', label: 'Vatandaşlık', color: Colors.primary, icon: '🏛️', exam: 9 },
  { key: 'guncel', label: 'Güncel', color: '#F59E0B', icon: '📰', exam: 6 },
] as const;

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const user = getAuthSync()?.currentUser ?? null;

  const [completed, setCompleted] = useState<boolean | null>(null);
  const [todayScore, setTodayScore] = useState<number | null>(null);
  const questionCount = getDailyQuestions().length;
  const today = getTodayKey();

  useEffect(() => {
    if (!user) {
      setCompleted(false);
      return;
    }
    hasCompletedTodayQuiz(user.uid).then(setCompleted);
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Günaydın';
    if (h < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  function showCategoryInfo(cat: (typeof CATEGORIES)[number]) {
    const count = QUESTION_POOL.filter((q) => q.category === cat.key).length;
    Alert.alert(
      `${cat.icon}  ${cat.label}`,
      `KPSS Genel Kültür sınavında bu konudan yaklaşık ${cat.exam} soru çıkmaktadır.\n\nUygulamada ${cat.label} kategorisinde toplam ${count} soru bulunuyor.`
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: c.textSecondary }]}>
            {greeting()}, {user?.displayName?.split(' ')[0] ?? 'Kullanıcı'} 👋
          </Text>
          <Text style={[styles.date, { color: c.text }]}>{today}</Text>
        </View>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: Colors.primary }]}>
            <Text style={styles.avatarText}>{user?.displayName?.[0] ?? '?'}</Text>
          </View>
        )}
      </View>

      {/* Quiz kartı */}
      <View style={[styles.card, { backgroundColor: Colors.primary }]}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.cardLabel}>Günlük Quiz</Text>
            <Text style={styles.cardTitle}>Bugünün Soruları</Text>
            <Text style={styles.cardSub}>{questionCount} soru • 4 kategori</Text>
          </View>
          <View style={styles.cardBadge}>
            <Text style={styles.cardBadgeText}>{questionCount}</Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>30sn</Text>
            <Text style={styles.infoLabel}>Soru başı süre</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>150</Text>
            <Text style={styles.infoLabel}>Maks puan</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoValue}>⚡</Text>
            <Text style={styles.infoLabel}>Hız bonusu</Text>
          </View>
        </View>

        {completed === null ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 16 }} />
        ) : completed ? (
          <View style={styles.completedBox}>
            <Text style={styles.completedText}>✅ Bugün tamamlandı!</Text>
            <Text style={styles.completedSub}>Yarın yeni sorular gelecek.</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => router.push('/quiz/session')}
            activeOpacity={0.85}
          >
            <Text style={styles.startBtnText}>Quize Başla →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Konu dağılımı */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Konu Dağılımı</Text>
        <Text style={[styles.sectionHint, { color: c.textSecondary }]}>detay için dokun</Text>
      </View>
      <View style={styles.categories}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.catCard, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => showCategoryInfo(cat)}
            activeOpacity={0.8}
          >
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <Text style={[styles.catLabel, { color: c.text }]}>{cat.label}</Text>
            <View style={[styles.catDot, { backgroundColor: cat.color }]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* İpucu */}
      <View style={[styles.tipCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.tipTitle, { color: c.text }]}>💡 Bugünün İpucu</Text>
        <Text style={[styles.tipText, { color: c.textSecondary }]}>
          Hız bonusu için soruları hızlı yanıtla! İlk 15 saniyede doğru cevaplar daha yüksek puan kazandırır.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 60, gap: 20, paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: 14, fontWeight: '500' },
  date: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  card: {
    borderRadius: 24,
    padding: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 4 },
  cardSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  cardBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBadgeText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  cardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-around' },
  infoItem: { alignItems: 'center', gap: 4 },
  infoValue: { fontSize: 18, fontWeight: '800', color: '#fff' },
  infoLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },

  completedBox: { marginTop: 20, alignItems: 'center', gap: 4 },
  completedText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  completedSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },

  startBtn: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  startBtnText: { color: Colors.primary, fontSize: 16, fontWeight: '800' },

  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionHint: { fontSize: 12, fontWeight: '500' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catCard: {
    flexGrow: 1,
    flexBasis: '44%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  catIcon: { fontSize: 28 },
  catLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  catDot: { width: 8, height: 8, borderRadius: 4 },

  tipCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 8 },
  tipTitle: { fontSize: 14, fontWeight: '700' },
  tipText: { fontSize: 13, lineHeight: 20 },
});
