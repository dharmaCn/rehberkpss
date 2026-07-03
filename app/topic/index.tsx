import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  TOPICS,
  topicHasContent,
  SUBJECT_LABELS,
  SUBJECT_ICONS,
  SUBJECT_COLORS,
  TopicSubject,
} from '../../constants/topics';
import { Colors } from '../../constants/colors';

const SUBJECTS: TopicSubject[] = ['tarih', 'cografya', 'vatandaslik'];

export default function TopicListScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const params = useLocalSearchParams<{ subject?: string }>();
  const initial = (SUBJECTS.includes(params.subject as TopicSubject)
    ? (params.subject as TopicSubject)
    : 'tarih') as TopicSubject;
  const [subject, setSubject] = useState<TopicSubject>(initial);

  const filtered = useMemo(() => TOPICS.filter((t) => t.subject === subject), [subject]);
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));
  const subjColor = SUBJECT_COLORS[subject];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={goBack} hitSlop={12}>
          <Text style={[styles.exitBtn, { color: c.textSecondary }]}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Subject tabs */}
      <View style={styles.tabs}>
        {SUBJECTS.map((s) => {
          const active = s === subject;
          const col = SUBJECT_COLORS[s];
          return (
            <TouchableOpacity
              key={s}
              onPress={() => setSubject(s)}
              style={[
                styles.tab,
                active ? { backgroundColor: col } : { borderColor: c.border, borderWidth: 1, backgroundColor: c.card },
              ]}
              activeOpacity={0.85}
            >
              <Text style={styles.tabIcon}>{SUBJECT_ICONS[s]}</Text>
              <Text style={[styles.tabText, { color: active ? '#fff' : c.text }]}>{SUBJECT_LABELS[s]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.titleBlock}>
        <Text style={[styles.title, { color: c.text }]}>{SUBJECT_LABELS[subject]} Konuları</Text>
        <Text style={[styles.summary, { color: c.textSecondary }]}>
          Bir konuya dokun, hap bilgi kartlarını gör, sonunda mini quize katıl.
        </Text>
      </View>

      <View style={styles.list}>
        {filtered.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>
              Bu konu için içerik yakında eklenecek.
            </Text>
          </View>
        ) : (
          filtered.map((t, idx) => {
            const soon = !topicHasContent(t);
            return (
              <TouchableOpacity
                key={t.id}
                style={[styles.row, { backgroundColor: c.card, borderColor: c.border }]}
                onPress={() =>
                  soon
                    ? undefined
                    : router.push({ pathname: '/topic/[id]', params: { id: t.id } } as never)
                }
                activeOpacity={soon ? 1 : 0.85}
              >
                <View style={[styles.rowIndex, { backgroundColor: soon ? c.border : subjColor + '1A' }]}>
                  <Text style={[styles.rowIndexText, { color: soon ? c.textSecondary : subjColor }]}>
                    {idx + 1}
                  </Text>
                </View>
                <Text style={styles.rowIcon}>{t.icon}</Text>
                <View style={styles.rowBody}>
                  <Text style={[styles.rowTitle, { color: c.text }]} numberOfLines={2}>
                    {t.title}
                  </Text>
                  {soon ? (
                    <Text style={[styles.rowMeta, { color: c.textSecondary }]}>Yakında</Text>
                  ) : (
                    <Text style={[styles.rowMeta, { color: c.textSecondary }]}>3 seviye • Kolay / Orta / Zor</Text>
                  )}
                </View>
                <Text style={[styles.chevron, { color: soon ? c.border : c.textSecondary }]}>
                  {soon ? '🔒' : '›'}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40, gap: 16 },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exitBtn: { fontSize: 26, fontWeight: '700' },

  tabs: { flexDirection: 'row', gap: 8 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: 'center',
    gap: 2,
  },
  tabIcon: { fontSize: 20 },
  tabText: { fontSize: 12, fontWeight: '800' },

  titleBlock: { gap: 4, marginTop: 4 },
  title: { fontSize: 22, fontWeight: '800' },
  summary: { fontSize: 13, lineHeight: 19 },

  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  rowIndex: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  rowIndexText: { fontSize: 13, fontWeight: '800' },
  rowIcon: { fontSize: 26 },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 14, fontWeight: '700', lineHeight: 19 },
  rowMeta: { fontSize: 12, fontWeight: '500' },
  chevron: { fontSize: 22, fontWeight: '300' },

  empty: { padding: 24, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  emptyText: { fontSize: 13 },
});
