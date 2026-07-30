import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useColorScheme } from 'react-native';
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { AGS_TOPIC_ORDER, getAgsTopicLabel, getAgsTopicColor } from '../../lib/agsQuiz';
import { getAgsCategoryBreakdown } from '../../lib/agsCategoryAnalysis';
import { AGS_TITLES } from '../../lib/agsTitles';
import { getAuthSync } from '../../lib/firebase';
import { fetchUserProfile, UserProfile } from '../../lib/firestore';

export default function AgsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const topics = useMemo(() => AGS_TOPIC_ORDER, []);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useFocusEffect(
    useCallback(() => {
      const user = getAuthSync()?.currentUser ?? null;
      if (!user) {
        setProfile(null);
        return;
      }
      fetchUserProfile(user.uid).then(setProfile).catch(() => {});
    }, [])
  );

  const weakest = getAgsCategoryBreakdown(profile?.agsCategoryStats)[0];
  const title = profile?.agsTitleId ? AGS_TITLES[profile.agsTitleId] : null;

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

      {title && (
        <View style={[styles.titleBadge, { backgroundColor: title.color + '1A', borderColor: title.color + '55' }]}>
          <Ionicons name={title.icon as never} size={18} color={title.color} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.titleBadgeName, { color: title.color }]}>{title.name}</Text>
            <Text style={[styles.titleBadgeDesc, { color: c.textSecondary }]}>{title.description}</Text>
          </View>
        </View>
      )}

      {weakest && (
        <TouchableOpacity
          style={[styles.weakCard, { backgroundColor: c.card, borderColor: c.border }]}
          onPress={() => router.push({ pathname: '/ags/quiz', params: { cat: weakest.key } })}
          activeOpacity={0.85}
        >
          <Ionicons name="analytics" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.weakCardTitle, { color: c.text }]}>En zayıf konun: {weakest.label}</Text>
            <Text style={[styles.weakCardSub, { color: c.textSecondary }]}>
              %{Math.round(weakest.accuracy)} doğruluk — tekrar et
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.textSecondary} />
        </TouchableOpacity>
      )}

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
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  titleBadgeName: { fontSize: 14, fontWeight: '800' },
  titleBadgeDesc: { fontSize: 12, marginTop: 2 },
  weakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  weakCardTitle: { fontSize: 14, fontWeight: '700' },
  weakCardSub: { fontSize: 12, marginTop: 2 },
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
