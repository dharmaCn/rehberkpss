import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { getAuthSync } from '../../lib/firebase';
import { hasCompletedTodayQuiz, hasCompletedTodayCategoryQuiz } from '../../lib/firestore';
import { getDailyQuestions, getDailyCategoryQuestions, getTodayKey } from '../../lib/quiz';
import { QUESTION_POOL } from '../../constants/questions';
import { TOPICS } from '../../constants/topics';
import { openStoreReview } from '../../lib/review';
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
  const [catCompleted, setCatCompleted] = useState<Record<string, boolean>>({});
  const questionCount = getDailyQuestions().length;
  const today = getTodayKey();

  useEffect(() => {
    if (!user) {
      setCompleted(false);
      setCatCompleted({});
      return;
    }
    hasCompletedTodayQuiz(user.uid).then(setCompleted);
    Promise.all(
      CATEGORIES.map((cat) =>
        hasCompletedTodayCategoryQuiz(user.uid, cat.key).then((done) => ({ key: cat.key, done }))
      )
    ).then((results) => {
      const map: Record<string, boolean> = {};
      results.forEach(({ key, done }) => { map[key] = done; });
      setCatCompleted(map);
    });
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Günaydın';
    if (h < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

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

      {/* Ders Quizleri */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Ders Quizleri</Text>
        <Text style={[styles.sectionHint, { color: c.textSecondary }]}>%20 puan • 5 soru</Text>
      </View>
      <View style={styles.lessonGrid}>
        {CATEGORIES.map((cat) => {
          const done = catCompleted[cat.key] ?? false;
          const qCount = getDailyCategoryQuestions(cat.key).length;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.lessonCard, { backgroundColor: c.card, borderColor: done ? cat.color : c.border }]}
              onPress={() =>
                done
                  ? undefined
                  : router.push({ pathname: '/quiz/category' as never, params: { cat: cat.key } })
              }
              activeOpacity={0.8}
            >
              <Text style={styles.lessonIcon}>{cat.icon}</Text>
              <Text style={[styles.lessonLabel, { color: c.text }]}>{cat.label}</Text>
              <Text style={[styles.lessonCount, { color: c.textSecondary }]}>{qCount} soru</Text>
              {done ? (
                <View style={[styles.lessonDoneBadge, { backgroundColor: cat.color + '22' }]}>
                  <Text style={[styles.lessonDoneText, { color: cat.color }]}>✓ Tamamlandı</Text>
                </View>
              ) : (
                <View style={[styles.lessonStartBadge, { backgroundColor: cat.color }]}>
                  <Text style={styles.lessonStartText}>Başla</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Konu Anlatımı */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Konu Anlatımı</Text>
        <Text style={[styles.sectionHint, { color: c.textSecondary }]}>KPSS Tarih</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.topicRow}
      >
        {TOPICS.map((t) => {
          const soon = t.sections.length === 0;
          return (
            <TouchableOpacity
              key={t.id}
              style={[styles.topicCard, { backgroundColor: c.card, borderColor: c.border }]}
              onPress={() => router.push({ pathname: '/topic/[id]' as never, params: { id: t.id } })}
              activeOpacity={0.85}
            >
              <Text style={styles.topicIcon}>{t.icon}</Text>
              <Text style={[styles.topicTitle, { color: c.text }]} numberOfLines={2}>{t.title}</Text>
              <Text style={[styles.topicSummary, { color: c.textSecondary }]} numberOfLines={2}>
                {t.summary}
              </Text>
              {soon ? (
                <View style={[styles.topicBadge, { backgroundColor: c.border }]}>
                  <Text style={[styles.topicBadgeText, { color: c.textSecondary }]}>Yakında</Text>
                </View>
              ) : (
                <View style={[styles.topicBadge, { backgroundColor: Colors.primary + '1A' }]}>
                  <Text style={[styles.topicBadgeText, { color: Colors.primary }]}>⏱ {t.readMinutes} dk</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* İpucu */}
      <View style={[styles.tipCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.tipTitle, { color: c.text }]}>💡 Bugünün İpucu</Text>
        <Text style={[styles.tipText, { color: c.textSecondary }]}>
          Hız bonusu için soruları hızlı yanıtla! İlk 15 saniyede doğru cevaplar daha yüksek puan kazandırır.
        </Text>
      </View>

      {/* Bizi Değerlendir */}
      <TouchableOpacity
        style={styles.rateRow}
        onPress={openStoreReview}
        activeOpacity={0.7}
      >
        <Text style={[styles.rateText, { color: c.textSecondary }]}>
          ⭐ Uygulamayı beğendin mi? Bizi değerlendir →
        </Text>
      </TouchableOpacity>
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

  tipCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 8 },
  tipTitle: { fontSize: 14, fontWeight: '700' },
  tipText: { fontSize: 13, lineHeight: 20 },

  lessonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  lessonCard: {
    flexGrow: 1,
    flexBasis: '44%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
  },
  lessonIcon: { fontSize: 28 },
  lessonLabel: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  lessonCount: { fontSize: 11, fontWeight: '500' },
  lessonDoneBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 2 },
  lessonDoneText: { fontSize: 11, fontWeight: '700' },
  lessonStartBadge: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginTop: 2 },
  lessonStartText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  topicRow: { gap: 12, paddingRight: 4 },
  topicCard: {
    width: 160,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 6,
  },
  topicIcon: { fontSize: 28 },
  topicTitle: { fontSize: 14, fontWeight: '700', lineHeight: 19 },
  topicSummary: { fontSize: 12, lineHeight: 17 },
  topicBadge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4 },
  topicBadgeText: { fontSize: 11, fontWeight: '700' },

  rateRow: { alignItems: 'center', paddingVertical: 8 },
  rateText: { fontSize: 13, fontWeight: '600' },
});
