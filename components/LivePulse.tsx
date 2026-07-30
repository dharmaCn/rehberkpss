import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { fetchTodayPulse } from '../lib/firestore';

export default function LivePulse() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const [pulse, setPulse] = useState<{ candidateCount: number; questionCount: number } | null>(null);

  useEffect(() => {
    let alive = true;
    fetchTodayPulse()
      .then((p) => {
        if (alive) setPulse(p);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!pulse || pulse.candidateCount < 3) return null;

  return (
    <View style={[styles.wrap, { backgroundColor: c.card, borderColor: c.border }]}>
      <Ionicons name="pulse" size={16} color={Colors.primary} />
      <Text style={[styles.text, { color: c.textSecondary }]}>
        Bugün <Text style={[styles.bold, { color: c.text }]}>{pulse.candidateCount} aday</Text> ·{' '}
        <Text style={[styles.bold, { color: c.text }]}>{pulse.questionCount} soru</Text> çözdü
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  text: { fontSize: 12.5, flexShrink: 1 },
  bold: { fontWeight: '700' },
});
