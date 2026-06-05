import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { TOPICS } from '../../constants/topics';
import { Colors } from '../../constants/colors';

export default function TopicListScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={goBack} hitSlop={12}>
          <Text style={[styles.exitBtn, { color: c.textSecondary }]}>←</Text>
        </TouchableOpacity>
        <View style={[styles.subjectBadge, { backgroundColor: '#EF4444' + '22' }]}>
          <Text style={[styles.subjectText, { color: '#EF4444' }]}>Tarih</Text>
        </View>
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.titleIcon}>📜</Text>
        <Text style={[styles.title, { color: c.text }]}>Tarih Konuları</Text>
        <Text style={[styles.summary, { color: c.textSecondary }]}>
          Bir konuya dokun, hap bilgi kartlarını gör, sonunda mini quize katıl.
        </Text>
      </View>

      <View style={styles.list}>
        {TOPICS.map((t, idx) => {
          const soon = t.cards.length === 0;
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
              <View style={[styles.rowIndex, { backgroundColor: soon ? c.border : Colors.primary + '1A' }]}>
                <Text
                  style={[
                    styles.rowIndexText,
                    { color: soon ? c.textSecondary : Colors.primary },
                  ]}
                >
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
                  <Text style={[styles.rowMeta, { color: c.textSecondary }]}>
                    {t.cards.length} kart • {t.questions.length} soru havuzu
                  </Text>
                )}
              </View>
              <Text style={[styles.chevron, { color: soon ? c.border : c.textSecondary }]}>
                {soon ? '🔒' : '›'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40, gap: 20 },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exitBtn: { fontSize: 26, fontWeight: '700' },
  subjectBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  subjectText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  titleBlock: { gap: 6 },
  titleIcon: { fontSize: 40 },
  title: { fontSize: 24, fontWeight: '800' },
  summary: { fontSize: 14, lineHeight: 20 },

  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  rowIndex: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIndexText: { fontSize: 13, fontWeight: '800' },
  rowIcon: { fontSize: 26 },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { fontSize: 14, fontWeight: '700', lineHeight: 19 },
  rowMeta: { fontSize: 12, fontWeight: '500' },
  chevron: { fontSize: 22, fontWeight: '300' },
});
