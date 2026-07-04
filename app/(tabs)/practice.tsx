import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuthSync } from '../../lib/firebase';
import { fetchDueWrongCount, hasCompletedTodayCategoryQuiz } from '../../lib/firestore';
import { getDailyCategoryQuestions } from '../../lib/quiz';
import { Colors } from '../../constants/colors';

const CATEGORIES = [
  { key: 'tarih', label: 'Tarih', color: '#EF4444', iconName: 'book', motifs: ['library', 'book', 'time'] },
  { key: 'cografya', label: 'Coğrafya', color: '#10B981', iconName: 'earth', motifs: ['map', 'compass', 'earth'] },
  { key: 'vatandaslik', label: 'Vatandaşlık', color: Colors.primary, iconName: 'business', motifs: ['business', 'document-text', 'shield-checkmark'] },
  { key: 'guncel', label: 'Güncel', color: '#F59E0B', iconName: 'newspaper', motifs: ['newspaper', 'megaphone', 'radio'] },
] as const;

const TOPICS = [
  { subject: 'tarih', label: 'Tarih', sub: '13 ünite • Kart + mini quiz', icon: '📜', color: '#EF4444' },
  { subject: 'cografya', label: 'Coğrafya', sub: '10 ünite • Kart + mini quiz', icon: '🌍', color: '#10B981' },
  { subject: 'vatandaslik', label: 'Vatandaşlık', sub: '7 ünite • Kart + mini quiz', icon: '🏛️', color: Colors.primary },
] as const;

export default function PracticeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const user = getAuthSync()?.currentUser ?? null;

  const [catCompleted, setCatCompleted] = useState<Record<string, boolean>>({});
  const [dueWrong, setDueWrong] = useState(0);
  const catCounts = useMemo(
    () => Object.fromEntries(CATEGORIES.map((cat) => [cat.key, getDailyCategoryQuestions(cat.key).length])),
    []
  );

  const refresh = useCallback(() => {
    if (!user) {
      setCatCompleted({});
      setDueWrong(0);
      return;
    }
    Promise.all(
      CATEGORIES.map((cat) =>
        hasCompletedTodayCategoryQuiz(user.uid, cat.key).then((done) => ({ key: cat.key, done }))
      )
    ).then((results) => {
      const map: Record<string, boolean> = {};
      results.forEach(({ key, done }) => { map[key] = done; });
      setCatCompleted(map);
    });
    fetchDueWrongCount(user.uid).then(setDueWrong).catch(() => {});
  }, [user]);

  useFocusEffect(useCallback(() => {
    refresh();
  }, [refresh]));

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text }]}>Pratik</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Ders quizleri, konu anlatımları ve yanlış tekrarları.
        </Text>
      </View>

      {dueWrong > 0 && (
        <TouchableOpacity
          style={[styles.dueCard, { backgroundColor: Colors.warning + '12', borderColor: Colors.warning + '40' }]}
          onPress={() => router.push('/wrong' as never)}
          activeOpacity={0.86}
        >
          <View style={[styles.dueIconBox, { backgroundColor: Colors.warning + '22' }]}>
            <Ionicons name="refresh-circle" size={26} color={Colors.warning} />
          </View>
          <View style={styles.dueBody}>
            <Text style={[styles.dueTitle, { color: c.text }]}>Tekrar zamanı</Text>
            <Text style={[styles.dueSub, { color: c.textSecondary }]}>
              {dueWrong} yanlışın tekrar bekliyor
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={c.textSecondary} />
        </TouchableOpacity>
      )}

      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={[styles.sectionDot, { backgroundColor: Colors.primary }]} />
          <Text style={[styles.sectionTitle, { color: c.text }]}>Ders Quizleri</Text>
        </View>
        <Text style={[styles.sectionHint, { color: c.textSecondary }]}>Günlük</Text>
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
              activeOpacity={0.82}
            >
              <LinearGradient
                colors={[cat.color + '22', cat.color + '08']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.lessonCardTint}
              />
              <View style={[styles.lessonOrb, { backgroundColor: cat.color + '20' }]} />
              <View pointerEvents="none" style={styles.lessonMotifLayer}>
                {cat.motifs.map((icon, i) => (
                  <Ionicons
                    key={icon}
                    name={icon as any}
                    size={i === 0 ? 70 : 42}
                    color={cat.color}
                    style={[
                      styles.lessonMotif,
                      i === 0 && styles.lessonMotifPrimary,
                      i === 1 && styles.lessonMotifSecondary,
                      i === 2 && styles.lessonMotifTertiary,
                    ]}
                  />
                ))}
              </View>
              <View style={styles.lessonCardTop}>
                <View style={[styles.lessonIconBox, { backgroundColor: cat.color }]}>
                  <Ionicons name={cat.iconName as any} size={23} color="#fff" />
                </View>
                <View style={[styles.lessonStatusBadge, { backgroundColor: done ? cat.color + '22' : '#fff' }]}>
                  <Ionicons
                    name={done ? 'checkmark-circle' : 'play-circle'}
                    size={13}
                    color={done ? cat.color : Colors.primary}
                  />
                  <Text style={[styles.lessonStatusText, { color: done ? cat.color : Colors.primary }]}>
                    {done ? 'Tamam' : 'Başla'}
                  </Text>
                </View>
              </View>
              <View style={styles.lessonBody}>
                <Text style={[styles.lessonLabel, { color: c.text }]} numberOfLines={1}>{cat.label}</Text>
                <Text style={[styles.lessonCount, { color: c.textSecondary }]}>{qCount} soruluk mini quizler</Text>
              </View>
              <View style={styles.lessonMetaRow}>
                <View style={styles.lessonMiniStat}>
                  <Text style={[styles.lessonMiniNumber, { color: cat.color }]}>{qCount}</Text>
                  <Text style={[styles.lessonMiniLabel, { color: c.textSecondary }]}>soru</Text>
                </View>
                <View style={[styles.lessonActionCircle, { backgroundColor: done ? cat.color + '18' : cat.color }]}>
                  <Ionicons name={done ? 'checkmark' : 'arrow-forward'} size={16} color={done ? cat.color : '#fff'} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.subSectionLabel, { color: c.textSecondary }]}>Konu Anlatımı</Text>
      <View style={styles.rowGroup}>
        {TOPICS.map((item) => (
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

      <Text style={[styles.subSectionLabel, { color: c.textSecondary }]}>Tekrar</Text>
      <View style={styles.rowGroup}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 58, paddingBottom: 32, gap: 16 },
  header: { marginHorizontal: 20, gap: 4 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '900' },
  subtitle: { fontSize: 13, lineHeight: 19, fontWeight: '600' },

  dueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 20,
  },
  dueIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dueBody: { flex: 1 },
  dueTitle: { fontSize: 14, fontWeight: '800' },
  dueSub: { fontSize: 12, marginTop: 2 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionDot: { width: 4, height: 18, borderRadius: 2 },
  sectionTitle: { fontSize: 17, fontWeight: '800' },
  sectionHint: { fontSize: 11, fontWeight: '600' },
  subSectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginHorizontal: 20,
    marginTop: 4,
  },

  lessonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginHorizontal: 20 },
  lessonCard: {
    flexGrow: 1,
    flexBasis: '46%',
    minHeight: 164,
    borderRadius: 20,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  lessonCardTint: {
    ...StyleSheet.absoluteFillObject,
  },
  lessonOrb: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 41,
    right: -28,
    top: -24,
  },
  lessonMotifLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  lessonMotif: {
    position: 'absolute',
    opacity: 0.11,
  },
  lessonMotifPrimary: {
    right: 8,
    bottom: 12,
    transform: [{ rotate: '-10deg' }],
  },
  lessonMotifSecondary: {
    right: 58,
    top: 52,
    opacity: 0.08,
    transform: [{ rotate: '12deg' }],
  },
  lessonMotifTertiary: {
    right: 18,
    top: 16,
    opacity: 0.07,
    transform: [{ rotate: '8deg' }],
  },
  lessonCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  lessonIconBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonStatusBadge: {
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  lessonStatusText: { fontSize: 10, fontWeight: '900' },
  lessonBody: {
    gap: 4,
    minHeight: 44,
  },
  lessonLabel: { fontSize: 16, lineHeight: 20, fontWeight: '900' },
  lessonCount: { fontSize: 11, lineHeight: 15, fontWeight: '600' },
  lessonMetaRow: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  lessonMiniStat: {
    gap: 0,
  },
  lessonMiniNumber: { fontSize: 22, lineHeight: 24, fontWeight: '900' },
  lessonMiniLabel: { fontSize: 10, fontWeight: '800' },
  lessonActionCircle: {
    width: 34,
    height: 34,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowGroup: { gap: 10 },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 20,
  },
  topicIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicEmoji: { fontSize: 24 },
  topicBody: { flex: 1, gap: 2 },
  topicTitle: { fontSize: 15, fontWeight: '800' },
  topicSub: { fontSize: 11, fontWeight: '500' },
});
