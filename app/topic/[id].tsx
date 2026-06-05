import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTopic } from '../../constants/topics';
import { Colors } from '../../constants/colors';

export default function TopicDetail() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const topic = id ? getTopic(id) : undefined;

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  if (!topic) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: c.background }]}>
        <Text style={[styles.notFound, { color: c.text }]}>Konu bulunamadı.</Text>
        <TouchableOpacity style={[styles.backChip, { borderColor: c.border }]} onPress={goBack}>
          <Text style={[styles.backChipText, { color: c.text }]}>← Geri</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isEmpty = topic.sections.length === 0;

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

      {/* Başlık */}
      <View style={styles.titleBlock}>
        <Text style={styles.titleIcon}>{topic.icon}</Text>
        <Text style={[styles.title, { color: c.text }]}>{topic.title}</Text>
        <Text style={[styles.summary, { color: c.textSecondary }]}>{topic.summary}</Text>
        {!isEmpty && (
          <Text style={[styles.readTime, { color: c.textSecondary }]}>
            ⏱ ~{topic.readMinutes} dk okuma
          </Text>
        )}
      </View>

      {isEmpty ? (
        <View style={[styles.soonCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={styles.soonEmoji}>🚧</Text>
          <Text style={[styles.soonTitle, { color: c.text }]}>Bu konu yakında eklenecek</Text>
          <Text style={[styles.soonText, { color: c.textSecondary }]}>
            Bu ünitenin konu anlatımı üzerinde çalışıyoruz. Çok yakında burada olacak!
          </Text>
        </View>
      ) : (
        <View style={styles.sections}>
          {topic.sections.map((s, i) => (
            <View key={i} style={[styles.sectionCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={[styles.sectionHeading, { color: Colors.primary }]}>{s.heading}</Text>
              <Text style={[styles.sectionBody, { color: c.text }]}>{s.body}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.homeBtn, { backgroundColor: Colors.primary }]}
        onPress={goBack}
        activeOpacity={0.85}
      >
        <Text style={styles.homeBtnText}>← Konulara Dön</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40, gap: 20 },

  notFound: { fontSize: 16, fontWeight: '600' },
  backChip: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 10 },
  backChipText: { fontSize: 15, fontWeight: '600' },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exitBtn: { fontSize: 26, fontWeight: '700' },
  subjectBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  subjectText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  titleBlock: { gap: 8 },
  titleIcon: { fontSize: 44 },
  title: { fontSize: 26, fontWeight: '800', lineHeight: 32 },
  summary: { fontSize: 15, lineHeight: 22 },
  readTime: { fontSize: 13, fontWeight: '500', marginTop: 2 },

  sections: { gap: 14 },
  sectionCard: { borderRadius: 16, borderWidth: 1, padding: 18, gap: 8 },
  sectionHeading: { fontSize: 16, fontWeight: '800' },
  sectionBody: { fontSize: 15, lineHeight: 24 },

  soonCard: { borderRadius: 20, borderWidth: 1, padding: 28, alignItems: 'center', gap: 10 },
  soonEmoji: { fontSize: 44 },
  soonTitle: { fontSize: 17, fontWeight: '800' },
  soonText: { fontSize: 14, lineHeight: 21, textAlign: 'center' },

  homeBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  homeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
