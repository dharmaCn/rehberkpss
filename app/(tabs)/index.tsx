import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  useColorScheme,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthSync } from '../../lib/firebase';
import { hasCompletedTodayQuiz, hasCompletedTodayCategoryQuiz, fetchUserProfile, hasAnsweredDailyArt, fetchDueWrongCount, UserProfile } from '../../lib/firestore';
import { getDailyQuestions, getDailyCategoryQuestions, getTodayKey } from '../../lib/quiz';
import { getDailyArtQuestion } from '../../constants/artworks';
import { getDailyFact, FACT_CATEGORY_LABELS } from '../../constants/facts';
import { openStoreReview } from '../../lib/review';
import { STORE_URLS } from '../../lib/share';
import { Colors } from '../../constants/colors';
import { daysUntil } from '../../constants/season';
import ExamGoalModal from '../../components/ExamGoalModal';
import DailyCultureModal from '../../components/DailyCultureModal';

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [examModal, setExamModal] = useState(false);
  const [artAnswered, setArtAnswered] = useState(false);
  const [cultureModal, setCultureModal] = useState(false);
  const [dueWrong, setDueWrong] = useState(0);
  const dailyArt = useMemo(() => getDailyArtQuestion(), []);
  const dailyFact = useMemo(() => getDailyFact(), []);
  const questionCount = useMemo(() => getDailyQuestions().length, []);
  const catCounts = useMemo(
    () => Object.fromEntries(CATEGORIES.map((cat) => [cat.key, getDailyCategoryQuestions(cat.key).length])),
    []
  );
  const today = getTodayKey();

  const refreshAll = useCallback((openExamIfNeeded = false) => {
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
    fetchUserProfile(user.uid).then((p) => {
      setProfile(p);
      if (openExamIfNeeded && p && !p.profileMeta?.examDate) {
        setExamModal(true);
      }
    });
    hasAnsweredDailyArt(user.uid, dailyArt.id).then(setArtAnswered);
    fetchDueWrongCount(user.uid).then(setDueWrong).catch(() => {});
  }, [user, dailyArt.id]);

  useEffect(() => {
    refreshAll(true);
  }, [refreshAll]);

  // Günün Genel Kültür Sorusu — girişte günde 1 kez otomatik aç
  useEffect(() => {
    // Sınav hedefi modalı açıkken günün sorusu modalını asla açma (iki Modal aynı anda
    // ekranda dokunmaları görünmez şekilde engelliyordu)
    if (!user || examModal) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    (async () => {
      try {
        const shownKey = `dailyCultureShown:${today}`;
        const shown = await AsyncStorage.getItem(shownKey);
        if (shown) return;
        const answered = await hasAnsweredDailyArt(user.uid, dailyArt.id);
        if (cancelled || answered) return;
        await AsyncStorage.setItem(shownKey, '1');
        // "Hoş geldin" uyarısının kapanması için kısa gecikme
        timer = setTimeout(() => {
          if (!cancelled) setCultureModal(true);
        }, 1200);
      } catch {
        // sessizce geç
      }
    })();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [user, dailyArt.id, today, examModal]);

  useFocusEffect(useCallback(() => {
    refreshAll(false);
  }, [refreshAll]));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Günaydın';
    if (h < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  const streak = profile?.currentStreak ?? 0;
  const examDate = profile?.profileMeta?.examDate;
  const examDaysLeft = examDate ? daysUntil(examDate) : null;
  const missions = profile?.missions;
  const showMissions = missions && !missions.completed;
  const streakBroken = (() => {
    if (!profile?.lastQuizDate || (profile?.currentStreak ?? 0) === 0) return false;
    const last = profile.lastQuizDate;
    const d = new Date(today + 'T12:00:00');
    d.setDate(d.getDate() - 2);
    const twoDaysAgo = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return last < twoDaysAgo;
  })();
  const freezeUsedToday = profile?.streakFreeze?.autoUsedAt === today;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ═══ HEADER — gradient banner ═══ */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerBanner}
      >
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingWhite}>
              {greeting()}, {user?.displayName?.split(' ')[0] ?? 'Kullanıcı'} 👋
            </Text>
            <Text style={styles.dateWhite}>{today}</Text>
          </View>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.avatarText}>{user?.displayName?.[0] ?? '?'}</Text>
            </View>
          )}
        </View>

        {/* Streak + Sınav bilgisi header'da */}
        <View style={styles.headerChips}>
          {streak > 0 && (
            <View style={styles.headerChip}>
              <Ionicons name="flame" size={14} color="#F59E0B" />
              <Text style={styles.headerChipText}>{streak} gün serisi</Text>
            </View>
          )}
          {examDaysLeft !== null && (
            <TouchableOpacity style={styles.headerChip} onPress={() => setExamModal(true)} activeOpacity={0.8}>
              <Ionicons name="calendar" size={14} color="#60A5FA" />
              <Text style={styles.headerChipText}>Sınava {examDaysLeft} gün</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Streak banner — freeze veya kırılma uyarısı */}
      {freezeUsedToday && (
        <View style={[styles.banner, { backgroundColor: '#0EA5E9' + '1A', borderColor: '#0EA5E9' }]}>
          <Text style={styles.bannerEmoji}>❄️</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: c.text }]}>Streak Freeze kullanıldı</Text>
            <Text style={[styles.bannerBody, { color: c.textSecondary }]}>
              Serini koruyabilmek için 1 freeze harcandı. Bugün quiz çöz ki seri devam etsin.
            </Text>
          </View>
        </View>
      )}
      {streakBroken && !freezeUsedToday && (
        <View style={[styles.banner, { backgroundColor: Colors.error + '1A', borderColor: Colors.error }]}>
          <Text style={styles.bannerEmoji}>💔</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: c.text }]}>Serin kırıldı</Text>
            <Text style={[styles.bannerBody, { color: c.textSecondary }]}>
              Yeniden başlayalım, bugünkü quiz'i çözerek seriyi 1'den başlat 💪
            </Text>
          </View>
        </View>
      )}

      {/* ═══ GÜNÜN GENEL KÜLTÜR SORUSU ═══ */}
      <TouchableOpacity
        style={[styles.artCard, { backgroundColor: c.card, borderColor: c.border }]}
        onPress={() => (artAnswered ? router.push('/art?daily=1' as never) : setCultureModal(true))}
        activeOpacity={0.9}
      >
        {dailyArt.image ? (
          <Image source={{ uri: dailyArt.image }} style={styles.artThumb} resizeMode="cover" />
        ) : (
          <View style={[styles.artThumb, styles.artThumbFallback, { backgroundColor: Colors.accent + '22' }]}>
            <Ionicons name="color-palette" size={28} color={Colors.accent} />
          </View>
        )}
        <View style={styles.artBody}>
          <View style={styles.artLabelRow}>
            <Ionicons name="sparkles" size={13} color={Colors.accent} />
            <Text style={[styles.artLabel, { color: Colors.accent }]}>GÜNÜN GENEL KÜLTÜR SORUSU</Text>
          </View>
          <Text style={[styles.artTitle, { color: c.text }]} numberOfLines={2}>
            {artAnswered ? 'Bugünkü soruyu çözdün ✓' : 'Bugünün sorusunu çöz'}
          </Text>
          <Text style={[styles.artSub, { color: c.textSecondary }]}>
            {artAnswered ? 'Sonucu ve oranı gör' : 'Günde 1 soru • çöz, kaç kişi bildi gör'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={c.textSecondary} />
      </TouchableOpacity>

      {/* ═══ GÜNLÜK QUIZ ═══ */}
      <View style={[styles.quizCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.quizCardTop}>
          <View style={[styles.quizIconBox, { backgroundColor: Colors.primary + '15' }]}>
            <Ionicons name="help-circle" size={28} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.quizCardTitle, { color: c.text }]}>Bugünün Soruları</Text>
            <Text style={[styles.quizCardSub, { color: c.textSecondary }]}>
              {questionCount} soru • 4 kategori • 30sn/soru
            </Text>
          </View>
          <View style={[styles.quizBadge, { backgroundColor: Colors.primary + '15' }]}>
            <Text style={[styles.quizBadgeText, { color: Colors.primary }]}>{questionCount}</Text>
          </View>
        </View>

        {completed === null ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />
        ) : completed ? (
          <View style={[styles.completedBox, { backgroundColor: Colors.success + '12' }]}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
            <View>
              <Text style={[styles.completedText, { color: Colors.success }]}>Bugün tamamlandı!</Text>
              <Text style={[styles.completedSub, { color: c.textSecondary }]}>Yarın yeni sorular gelecek.</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.quizStartBtn}
            onPress={() => router.push('/quiz/session')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.quizStartGradient}
            >
              <Text style={styles.quizStartText}>Quize Başla</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* ═══ TEKRAR ZAMANI — aralıklı yanlış tekrarı ═══ */}
      {dueWrong > 0 && (
        <TouchableOpacity
          style={[styles.dueCard, { backgroundColor: '#F59E0B' + '12', borderColor: '#F59E0B' + '40' }]}
          onPress={() => router.push('/wrong' as never)}
          activeOpacity={0.85}
        >
          <View style={[styles.dueIconBox, { backgroundColor: '#F59E0B' + '22' }]}>
            <Ionicons name="refresh-circle" size={26} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.dueTitle, { color: c.text }]}>Tekrar Zamanı 🔁</Text>
            <Text style={[styles.dueSub, { color: c.textSecondary }]}>
              {dueWrong} yanlışın tekrar bekliyor — şimdi çöz, kalıcı öğren
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={c.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Hoşgeldin görevleri */}
      {showMissions && (
        <View style={[styles.missionsCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.missionsHeader}>
            <Ionicons name="sparkles" size={18} color="#8B5CF6" />
            <Text style={[styles.missionsTitle, { color: c.text }]}>İlk Hafta Görevleri</Text>
          </View>
          <Text style={[styles.missionsSub, { color: c.textSecondary }]}>
            Hepsini tamamla, "Hoş Geldin" rozetini kap 🎁
          </Text>
          {[
            { key: 'firstQuiz', label: 'İlk quizini çöz', done: !!missions?.firstQuiz },
            { key: 'profileComplete', label: 'Sınav tarihi & hedef puanı belirle', done: !!missions?.profileComplete },
            { key: 'firstShare', label: 'Bir arkadaşını davet et', done: !!missions?.firstShare },
            { key: 'threeDayStreak', label: '3 gün üst üste gel', done: !!missions?.threeDayStreak },
          ].map((m) => (
            <View key={m.key} style={styles.missionRow}>
              <Ionicons
                name={m.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={m.done ? Colors.success : c.textSecondary}
              />
              <Text style={[styles.missionText, { color: m.done ? c.textSecondary : c.text, textDecorationLine: m.done ? 'line-through' : 'none' }]}>
                {m.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* ═══ DERS QUIZLERİ ═══ */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.sectionDot, { backgroundColor: Colors.primary }]} />
          <Text style={[styles.sectionTitle, { color: c.text }]}>Ders Quizleri</Text>
        </View>
        <Text style={[styles.sectionHint, { color: c.textSecondary }]}>%20 puan • 5 soru</Text>
      </View>
      <View style={styles.lessonGrid}>
        {CATEGORIES.map((cat) => {
          const done = catCompleted[cat.key] ?? false;
          const qCount = catCounts[cat.key];
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
                  <Text style={[styles.lessonDoneText, { color: cat.color }]}>✓ Tamam</Text>
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

      {/* ═══ KONU ANLATIMI ═══ */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.sectionDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.sectionTitle, { color: c.text }]}>Konu Anlatımı</Text>
        </View>
      </View>
      <View style={{ gap: 10 }}>
        {[
          { subject: 'tarih', label: 'Tarih', sub: '13 ünite • Kart + mini quiz', icon: '📜', color: '#EF4444' },
          { subject: 'cografya', label: 'Coğrafya', sub: '2 ünite • Kart + mini quiz (yeni!)', icon: '🌍', color: '#10B981' },
          { subject: 'vatandaslik', label: 'Vatandaşlık', sub: '2 ünite • Kart + mini quiz (yeni!)', icon: '🏛️', color: Colors.primary },
        ].map((item) => (
          <TouchableOpacity
            key={item.subject}
            style={[styles.topicRow, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => router.push({ pathname: '/topic', params: { subject: item.subject } } as never)}
            activeOpacity={0.85}
          >
            <View style={[styles.topicIcon, { backgroundColor: item.color + '15' }]}>
              <Text style={styles.topicEmoji}>{item.icon}</Text>
            </View>
            <View style={styles.topicBody}>
              <Text style={[styles.topicTitle, { color: c.text }]}>{item.label}</Text>
              <Text style={[styles.topicSub, { color: c.textSecondary }]}>{item.sub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* ═══ GENEL KÜLTÜR + YANLIŞLARIM ═══ */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.sectionDot, { backgroundColor: Colors.accent }]} />
          <Text style={[styles.sectionTitle, { color: c.text }]}>Keşfet</Text>
        </View>
      </View>
      <View style={{ gap: 10 }}>
        <TouchableOpacity
          style={[styles.topicRow, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={() => router.push('/art' as never)}
          activeOpacity={0.85}
        >
          <View style={[styles.topicIcon, { backgroundColor: Colors.accent + '15' }]}>
            <Ionicons name="color-palette" size={24} color={Colors.accent} />
          </View>
          <View style={styles.topicBody}>
            <Text style={[styles.topicTitle, { color: c.text }]}>Genel Kültür & Güncel Bilgiler</Text>
            <Text style={[styles.topicSub, { color: c.textSecondary }]}>
              Ünlü eserler, ressamlar, yazarlar • görsel destekli
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.topicRow, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={() => router.push('/wrong' as never)}
          activeOpacity={0.85}
        >
          <View style={[styles.topicIcon, { backgroundColor: Colors.error + '15' }]}>
            <Ionicons name="book" size={24} color={Colors.error} />
          </View>
          <View style={styles.topicBody}>
            <Text style={[styles.topicTitle, { color: c.text }]}>Yanlışlarım Defteri</Text>
            <Text style={[styles.topicSub, { color: c.textSecondary }]}>
              Yanlış cevapladığın soruları tekrar çöz
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Günün Bilgisi */}
      <View style={[styles.tipCard, { backgroundColor: Colors.primary + '08', borderColor: Colors.primary + '20' }]}>
        <View style={styles.tipHeaderRow}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={16} color={Colors.primary} />
            <Text style={[styles.tipTitle, { color: Colors.primary }]}>Günün Bilgisi</Text>
            <View style={[styles.tipCatBadge, { backgroundColor: Colors.primary + '18' }]}>
              <Text style={[styles.tipCatText, { color: Colors.primary }]}>
                {FACT_CATEGORY_LABELS[dailyFact.category]}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              const storeLink = STORE_URLS.ios;
              Share.share({
                message: `💡 Günün Bilgisi\n\n${dailyFact.text}\n\nDaha fazlası KPSS & AGS Quiz'te 👇\n${storeLink}`,
              }).catch(() => {});
            }}
            hitSlop={10}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.tipText, { color: c.textSecondary }]}>{dailyFact.text}</Text>
      </View>

      {/* Bizi Değerlendir */}
      <TouchableOpacity style={styles.rateRow} onPress={openStoreReview} activeOpacity={0.7}>
        <Text style={[styles.rateText, { color: c.textSecondary }]}>
          ⭐ Uygulamayı beğendin mi? Bizi değerlendir →
        </Text>
      </TouchableOpacity>

      {user ? (
        <ExamGoalModal
          uid={user.uid}
          visible={examModal}
          initialDate={profile?.profileMeta?.examDate}
          initialTarget={profile?.profileMeta?.targetScore}
          onClose={() => {
            setExamModal(false);
            fetchUserProfile(user.uid).then(setProfile);
          }}
        />
      ) : null}

      <DailyCultureModal
        visible={cultureModal}
        question={dailyArt}
        uid={user?.uid ?? null}
        onClose={() => {
          setCultureModal(false);
          if (user) hasAnsweredDailyArt(user.uid, dailyArt.id).then(setArtAnswered);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: 32, gap: 16 },

  // ── Header banner ──
  headerBanner: {
    paddingTop: 64,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingWhite: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  dateWhite: { fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  avatarPlaceholder: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  headerChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  headerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerChipText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  // ── Banners ──
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginHorizontal: 20,
  },
  bannerEmoji: { fontSize: 26 },
  bannerTitle: { fontSize: 14, fontWeight: '800' },
  bannerBody: { fontSize: 12, lineHeight: 17, marginTop: 2 },

  // ── Art card ──
  artCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 16, borderWidth: 1, marginHorizontal: 20,
  },
  artThumb: { width: 56, height: 56, borderRadius: 12 },
  artThumbFallback: { alignItems: 'center', justifyContent: 'center' },
  artBody: { flex: 1, gap: 2 },
  artLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  artLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  artTitle: { fontSize: 14, fontWeight: '800' },
  artSub: { fontSize: 11 },

  // ── Tekrar Zamanı card ──
  dueCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 16, borderWidth: 1, marginHorizontal: 20,
  },
  dueIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dueTitle: { fontSize: 14, fontWeight: '800' },
  dueSub: { fontSize: 12, marginTop: 2 },

  // ── Quiz card ──
  quizCard: {
    borderRadius: 20, padding: 20, borderWidth: 1, marginHorizontal: 20,
  },
  quizCardTop: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  quizIconBox: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  quizCardTitle: { fontSize: 18, fontWeight: '800' },
  quizCardSub: { fontSize: 12, marginTop: 2 },
  quizBadge: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  quizBadgeText: { fontSize: 18, fontWeight: '800' },

  completedBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: 16, padding: 14, borderRadius: 12,
  },
  completedText: { fontSize: 14, fontWeight: '700' },
  completedSub: { fontSize: 11, marginTop: 1 },

  quizStartBtn: { marginTop: 16 },
  quizStartGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
  },
  quizStartText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  // ── Missions ──
  missionsCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10, marginHorizontal: 20 },
  missionsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  missionsTitle: { fontSize: 15, fontWeight: '800' },
  missionsSub: { fontSize: 12, marginTop: -4 },
  missionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  missionText: { fontSize: 14, flex: 1 },

  // ── Section headers ──
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginHorizontal: 20, marginTop: 4,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionDot: { width: 4, height: 18, borderRadius: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  sectionHint: { fontSize: 11, fontWeight: '500' },

  // ── Lesson grid ──
  lessonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginHorizontal: 20 },
  lessonCard: {
    flexGrow: 1, flexBasis: '44%', borderRadius: 16, padding: 14,
    alignItems: 'center', gap: 5, borderWidth: 1,
  },
  lessonIcon: { fontSize: 26 },
  lessonLabel: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  lessonCount: { fontSize: 11, fontWeight: '500' },
  lessonDoneBadge: { borderRadius: 16, paddingHorizontal: 10, paddingVertical: 3, marginTop: 2 },
  lessonDoneText: { fontSize: 10, fontWeight: '700' },
  lessonStartBadge: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 5, marginTop: 2 },
  lessonStartText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // ── Topic rows ──
  topicRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14, borderRadius: 14, borderWidth: 1, marginHorizontal: 20,
  },
  topicIcon: {
    width: 46, height: 46, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  topicEmoji: { fontSize: 24 },
  topicBody: { flex: 1, gap: 2 },
  topicTitle: { fontSize: 15, fontWeight: '800' },
  topicSub: { fontSize: 11, fontWeight: '500' },

  // ── Tip / Günün Bilgisi ──
  tipCard: { borderRadius: 14, padding: 14, borderWidth: 1, marginHorizontal: 20, gap: 6 },
  tipHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  tipTitle: { fontSize: 13, fontWeight: '800' },
  tipCatBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  tipCatText: { fontSize: 10, fontWeight: '700' },
  tipText: { fontSize: 12, lineHeight: 18 },

  // ── Rate ──
  rateRow: { alignItems: 'center', paddingVertical: 8 },
  rateText: { fontSize: 12, fontWeight: '600' },
});
