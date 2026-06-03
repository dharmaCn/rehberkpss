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
import { useCallback, useEffect, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { getAuthSync } from '../../lib/firebase';
import { hasCompletedTodayQuiz, hasCompletedTodayCategoryQuiz, fetchUserProfile } from '../../lib/firestore';
import { getDailyQuestions, getDailyCategoryQuestions, getTodayKey } from '../../lib/quiz';
import { QUESTION_POOL } from '../../constants/questions';
import { daysUntilExam, KPSS_EXAM_LABEL } from '../../constants/exam';
import { Colors } from '../../constants/colors';

const DAILY_GOAL = 3;

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
  const [streak, setStreak] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
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

  // Streak + yanlış soru sayısı her odaklanmada tazelenir (quiz sonrası güncel kalsın)
  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      fetchUserProfile(user.uid).then((p) => {
        setStreak(p?.currentStreak ?? 0);
        setWrongCount(Object.keys(p?.wrongQuestions ?? {}).length);
      });
    }, [user])
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Günaydın';
    if (h < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  const daysLeft = daysUntilExam();
  const doneToday = (completed === true ? 1 : 0) + Object.values(catCompleted).filter(Boolean).length;

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
          {streak > 0 && (
            <View style={styles.streakChip}>
              <Text style={styles.streakChipText}>🔥 {streak} günlük seri</Text>
            </View>
          )}
        </View>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: Colors.primary }]}>
            <Text style={styles.avatarText}>{user?.displayName?.[0] ?? '?'}</Text>
          </View>
        )}
      </View>

      {/* KPSS geri sayım + günlük hedef */}
      <View style={[styles.examCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.examRow}>
          <View>
            <Text style={[styles.examLabel, { color: c.textSecondary }]}>{KPSS_EXAM_LABEL}</Text>
            <Text style={[styles.examDays, { color: c.text }]}>
              {daysLeft > 0 ? `${daysLeft} gün kaldı` : daysLeft === 0 ? 'Sınav bugün! 🍀' : 'Sınav tarihi geçti'}
            </Text>
          </View>
          <Text style={styles.examEmoji}>⏳</Text>
        </View>

        <View style={styles.goalHead}>
          <Text style={[styles.goalLabel, { color: c.textSecondary }]}>Bugünkü hedef</Text>
          <Text style={[styles.goalCount, { color: doneToday >= DAILY_GOAL ? Colors.success : Colors.primary }]}>
            {Math.min(doneToday, DAILY_GOAL)}/{DAILY_GOAL} quiz
          </Text>
        </View>
        <View style={[styles.goalTrack, { backgroundColor: c.border }]}>
          <View
            style={[
              styles.goalFill,
              {
                width: `${Math.min(100, (doneToday / DAILY_GOAL) * 100)}%`,
                backgroundColor: doneToday >= DAILY_GOAL ? Colors.success : Colors.primary,
              },
            ]}
          />
        </View>
        {doneToday >= DAILY_GOAL && (
          <Text style={[styles.goalDone, { color: Colors.success }]}>🎯 Günlük hedefini tamamladın!</Text>
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

      {/* Yanlışlarım */}
      <TouchableOpacity
        style={[styles.wrongCard, { backgroundColor: c.card, borderColor: c.border }]}
        onPress={() => router.push('/quiz/wrong' as never)}
        activeOpacity={0.85}
      >
        <View style={[styles.wrongIconBox, { backgroundColor: Colors.error + '18' }]}>
          <Text style={styles.wrongIcon}>📑</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.wrongTitle, { color: c.text }]}>Yanlışlarım</Text>
          <Text style={[styles.wrongSub, { color: c.textSecondary }]}>
            {wrongCount > 0 ? `${wrongCount} soru tekrar bekliyor` : 'Tekrar edilecek soru yok 🎉'}
          </Text>
        </View>
        {wrongCount > 0 && (
          <View style={[styles.wrongBadge, { backgroundColor: Colors.error }]}>
            <Text style={styles.wrongBadgeText}>{wrongCount}</Text>
          </View>
        )}
        <Text style={[styles.wrongChevron, { color: c.textSecondary }]}>›</Text>
      </TouchableOpacity>

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
  streakChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#F59E0B22',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  streakChipText: { fontSize: 13, fontWeight: '800', color: '#D97706' },

  examCard: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 10 },
  examRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  examLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  examDays: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  examEmoji: { fontSize: 30 },
  goalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  goalLabel: { fontSize: 13, fontWeight: '600' },
  goalCount: { fontSize: 13, fontWeight: '800' },
  goalTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  goalFill: { height: '100%', borderRadius: 4 },
  goalDone: { fontSize: 12, fontWeight: '700', marginTop: 2 },
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

  wrongCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  wrongIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  wrongIcon: { fontSize: 22 },
  wrongTitle: { fontSize: 15, fontWeight: '700' },
  wrongSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  wrongBadge: { minWidth: 26, height: 26, borderRadius: 13, paddingHorizontal: 7, alignItems: 'center', justifyContent: 'center' },
  wrongBadgeText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  wrongChevron: { fontSize: 24, fontWeight: '300', marginLeft: 2 },

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
});
