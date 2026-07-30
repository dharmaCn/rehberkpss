import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { AGS_TOPIC_ORDER, getAgsTopicLabel, getAgsTopicColor } from '../../lib/agsQuiz';

export default function AgsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const topics = useMemo(() => AGS_TOPIC_ORDER, []);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text }]}>AGS</Text>
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          Eğitim Bilimleri konuları — 9 alt dal, yüzlerce soru
        </Text>
      </View>

      <View style={styles.grid}>
        {topics.map((key) => {
          const color = getAgsTopicColor(key);
          return (
            <TouchableOpacity
              key={key}
              style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/ags/quiz', params: { cat: key } })}
            >
              <View style={[styles.iconWrap, { backgroundColor: color + '22' }]}>
                <Ionicons name="school" size={22} color={color} />
              </View>
              <Text style={[styles.cardLabel, { color: c.text }]}>{getAgsTopicLabel(key)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 56, paddingBottom: 40, paddingHorizontal: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800' },
  subtitle: { fontSize: 14, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardLabel: { fontSize: 14, fontWeight: '700', lineHeight: 19 },
});
