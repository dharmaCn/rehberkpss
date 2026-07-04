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
import { hasCompletedTodayQuiz, fetchUserProfile, hasAnsweredDailyArt, fetchDueWrongCount, UserProfile } from '../../lib/firestore';
import { getDailyQuestions, getTodayKey } from '../../lib/quiz';
import { getDailyArtQuestion } from '../../constants/artworks';
import { getDailyFact, FACT_CATEGORY_LABELS } from '../../constants/facts';
import { openStoreReview } from '../../lib/review';
import { STORE_URLS } from '../../lib/share';
import { Colors } from '../../constants/colors';
import { daysUntil } from '../../constants/season';
import ExamGoalModal from '../../components/ExamGoalModal';
import DailyCultureModal from '../../components/DailyCultureModal';

const CULTURE_CARD_IMAGE = require('../../assets/culture-card-bg.png');

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const user = getAuthSync()?.currentUser ?? null;

  const [completed, setCompleted] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [examModal, setExamModal] = useState(false);
  const [artAnswered, setArtAnswered] = useState(false);
  const [cultureModal, setCultureModal] = useState(false);
  const [dueWrong, setDueWrong] = useState(0);
  const dailyArt = useMemo(() => getDailyArtQuestion(), []);
  const dailyFact = useMemo(() => getDailyFact(), []);
  const questionCount = useMemo(() => getDailyQuestions().length, []);
  const today = getTodayKey();

  const refreshAll = useCallback((openExamIfNeeded = false) => {
    if (!user) {
      setCompleted(false);
      return;
    }
    hasCompletedTodayQuiz(user.uid).then(setCompleted);
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
        <View style={styles.headerGlowLarge} />
        <View style={styles.headerGlowSmall} />
        <View style={styles.headerTop}>
          <View style={styles.headerCopy}>
            <Text style={styles.greetingWhite}>{greeting()}, {user?.displayName?.split(' ')[0] ?? 'Kullanıcı'}</Text>
            {examDaysLeft !== null ? (
              <TouchableOpacity
                style={styles.examCountdown}
                onPress={() => setExamModal(true)}
                activeOpacity={0.84}
              >
                <Ionicons name="calendar" size={14} color="rgba(255,255,255,0.9)" />
                <Text style={styles.examCountdownText}>Sınava {examDaysLeft} gün</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.examSetButton}
                onPress={() => setExamModal(true)}
                activeOpacity={0.84}
              >
                <Ionicons name="calendar-outline" size={15} color="#fff" />
                <Text style={styles.examSetButtonText}>Sınav hedefi belirle</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() => router.push('/profile' as never)}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Profile git"
          >
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{user?.displayName?.[0] ?? 'M'}</Text>
              </View>
            )}
            <View style={styles.avatarCue}>
              <Ionicons name="chevron-forward" size={10} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {streak > 0 && (
          <View style={styles.headerChips}>
            <View style={styles.headerChip}>
              <Ionicons name="flame" size={14} color="#F59E0B" />
              <Text style={styles.headerChipText}>{streak} gün serisi</Text>
            </View>
          </View>
        )}
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

      <View style={styles.featureDeck}>
        <TouchableOpacity
          style={[styles.featureCard, styles.quizFeatureCard, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={() => (completed ? undefined : router.push('/quiz/session'))}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#4338CA', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.quizHeroBand}
          >
            <View style={styles.quizHeroGlowOne} />
            <View style={styles.quizHeroGlowTwo} />
            <View style={styles.quizHeroLeft}>
              <View style={styles.quizHeroIcon}>
                <Ionicons name="timer" size={22} color="#fff" />
              </View>
              <View style={styles.quizHeroTextCol}>
                <Text style={styles.quizHeroKicker}>30 sn tempo</Text>
                <Text style={styles.quizHeroTitle}>Hızlı günlük pratik</Text>
              </View>
            </View>
            <View style={styles.quizHeroBadge}>
              <Text style={styles.quizHeroBadgeNumber}>{questionCount}</Text>
              <Text style={styles.quizHeroBadgeLabel}>soru</Text>
            </View>
          </LinearGradient>

          <View style={styles.featureBody}>
            <Text style={[styles.featureTitle, { color: c.text }]}>Günlük 10 Soru</Text>
            <Text style={[styles.featureSub, { color: c.textSecondary }]}>
              Ana pratik, 30 saniyelik hızlı tempo ve günlük puan.
            </Text>
          </View>

          <View style={styles.featurePills}>
            <View style={[styles.featurePill, { backgroundColor: Colors.primary + '12' }]}>
              <Text style={[styles.featurePillText, { color: Colors.primary }]}>Ana görev</Text>
            </View>
            <View style={[styles.featurePill, { backgroundColor: Colors.success + '12' }]}>
              <Text style={[styles.featurePillText, { color: Colors.success }]}>Her gün yenilenir</Text>
            </View>
          </View>

          <View style={styles.featureActionWrap}>
            {completed === null ? (
              <ActivityIndicator color={Colors.primary} />
            ) : completed ? (
              <View style={[styles.featureStateRow, { backgroundColor: Colors.success + '12' }]}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={[styles.featureStateText, { color: Colors.success }]}>Bugün tamamlandı</Text>
              </View>
            ) : (
              <LinearGradient
                colors={['#4F46E5', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.featurePrimaryButton}
              >
                <Text style={styles.featurePrimaryButtonText}>Günlük Quize Başla</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            )}
          </View>
        </TouchableOpacity>

        <View
          style={[styles.featureCard, styles.cultureFeatureCard, { backgroundColor: c.card, borderColor: c.border }]}
        >
          <View style={styles.cultureImageFrame}>
            <Image source={CULTURE_CARD_IMAGE} style={styles.cultureImage} resizeMode="cover" />
            <View style={styles.cultureImageOverlay} />
            <View style={styles.cultureChip}>
              <Ionicons name={artAnswered ? 'checkmark-circle' : 'sparkles'} size={13} color="#fff" />
              <Text style={styles.cultureChipText}>{artAnswered ? 'Çözüldü' : 'Günün sorusu'}</Text>
            </View>
          </View>

          <View style={styles.featureBody}>
            <Text style={[styles.featureTitle, { color: c.text }]}>Genel Kültür Soruları</Text>
            <Text style={[styles.featureSub, { color: c.textSecondary }]}>
              Ressam, eser, yazar ve diğer kültür alıştırmaları.
            </Text>
          </View>

          <View style={styles.featurePills}>
            <View style={[styles.featurePill, { backgroundColor: Colors.accent + '12' }]}>
              <Text style={[styles.featurePillText, { color: Colors.accent }]}>Görsel destekli</Text>
            </View>
            <View style={[styles.featurePill, { backgroundColor: Colors.primary + '12' }]}>
              <Text style={[styles.featurePillText, { color: Colors.primary }]}>1 dakikalık alıştırma</Text>
            </View>
          </View>

          <View style={styles.cultureActions}>
            <TouchableOpacity
              style={styles.cultureDailyButton}
              onPress={() => (artAnswered ? router.push('/art?daily=1' as never) : setCultureModal(true))}
              activeOpacity={0.85}
            >
              <Text style={styles.cultureDailyButtonText}>{artAnswered ? 'Sonucu Gör' : 'Günün Sorusu'}</Text>
              <Ionicons name="sparkles" size={16} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cultureAllButton}
              onPress={() => router.push('/art' as never)}
              activeOpacity={0.85}
            >
              <Text style={styles.cultureAllButtonText}>Testler</Text>
              <Ionicons name="albums" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
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
        onAnswered={() => setArtAnswered(true)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: 32, gap: 16 },

  // ── Header banner ──
  headerBanner: {
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 0,
    overflow: 'hidden',
  },
  headerGlowLarge: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: -82,
    right: -46,
  },
  headerGlowSmall: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(245,158,11,0.20)',
    bottom: -52,
    left: 18,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
  },
  headerCopy: {
    flex: 1,
    gap: 8,
  },
  greetingWhite: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.78)' },
  examCountdown: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  examCountdownText: {
    color: '#fff',
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '800',
  },
  examSetButton: {
    alignSelf: 'flex-start',
    minHeight: 38,
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  examSetButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  avatarButton: {
    width: 46,
    height: 46,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  avatar: { width: 38, height: 38, borderRadius: 14 },
  avatarPlaceholder: {
    width: 38, height: 38, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  avatarCue: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  headerChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  headerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  headerChipText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  // ── Banners ──
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1, marginHorizontal: 20,
  },
  bannerEmoji: { fontSize: 26 },
  bannerTitle: { fontSize: 14, fontWeight: '800' },
  bannerBody: { fontSize: 12, lineHeight: 17, marginTop: 2 },

  // ── Main features ──
  featureDeck: {
    marginHorizontal: 20,
    gap: 12,
  },
  featureCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  quizFeatureCard: {
    minHeight: 242,
  },
  cultureFeatureCard: {
    minHeight: 230,
  },
  quizHeroBand: {
    minHeight: 136,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quizHeroGlowOne: {
    position: 'absolute',
    width: 156,
    height: 156,
    borderRadius: 78,
    backgroundColor: 'rgba(255,255,255,0.16)',
    top: -64,
    right: 18,
  },
  quizHeroGlowTwo: {
    position: 'absolute',
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: 'rgba(245,158,11,0.30)',
    bottom: -46,
    left: -28,
  },
  quizHeroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  quizHeroTextCol: {
    flex: 1,
  },
  quizHeroIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  quizHeroKicker: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 12,
    fontWeight: '800',
  },
  quizHeroTitle: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900',
  },
  quizHeroBadge: {
    width: 74,
    height: 74,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  quizHeroBadgeNumber: {
    color: Colors.primary,
    fontSize: 26,
    lineHeight: 28,
    fontWeight: '900',
  },
  quizHeroBadgeLabel: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  featureCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  featureIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBadge: {
    minWidth: 62,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBadgeNumber: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  featureBadgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: -1,
  },
  featureBody: {
    gap: 4,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  featureSub: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  featurePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featurePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  featurePillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  featureActionWrap: {
    marginTop: 'auto',
  },
  featureStateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  featureStateText: {
    fontSize: 14,
    fontWeight: '800',
  },
  featurePrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  featurePrimaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  featureSecondaryButton: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  featureSecondaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  cultureImageFrame: {
    height: 136,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#111827',
  },
  cultureImage: {
    width: '100%',
    height: '100%',
  },
  cultureImageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cultureImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.16)',
  },
  cultureChip: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15,23,42,0.72)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  cultureChipText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  cultureActions: {
    marginTop: 'auto',
    flexDirection: 'row',
    gap: 10,
  },
  cultureDailyButton: {
    minHeight: 48,
    flex: 1.15,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: Colors.accent,
  },
  cultureDailyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },
  cultureAllButton: {
    minHeight: 48,
    flex: 0.9,
    borderRadius: 16,
    borderWidth: 0,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 3,
  },
  cultureAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
  },

  // ── Tekrar Zamanı card ──
  dueCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 16, borderWidth: 1, marginHorizontal: 20,
  },
  dueIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dueTitle: { fontSize: 14, fontWeight: '800' },
  dueSub: { fontSize: 12, marginTop: 2 },

  // ── Missions ──
  missionsCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10, marginHorizontal: 20 },
  missionsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  missionsTitle: { fontSize: 15, fontWeight: '800' },
  missionsSub: { fontSize: 12, marginTop: -4 },
  missionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  missionText: { fontSize: 14, flex: 1 },

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
