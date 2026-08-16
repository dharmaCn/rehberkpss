import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAuthSync } from '../../lib/firebase';
import { fetchMonthlyRecap, MonthlyRecap, monthLabel } from '../../lib/monthlyRecap';
import { captureAndShare } from '../../lib/share';
import { Colors } from '../../constants/colors';
import MonthlyRecapCard from '../../components/MonthlyRecapCard';

export default function MonthlyRecapScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const { month } = useLocalSearchParams<{ month: string }>();
  const user = getAuthSync()?.currentUser ?? null;

  const [recap, setRecap] = useState<MonthlyRecap | null>(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef<View>(null);

  useEffect(() => {
    if (!user || !month) {
      setLoading(false);
      return;
    }
    fetchMonthlyRecap(user.uid, month)
      .then(setRecap)
      .catch(() => setRecap(null))
      .finally(() => setLoading(false));
  }, [user, month]);

  async function handleShare() {
    if (!recap) return;
    await captureAndShare(cardRef, `${monthLabel(recap.monthKey)} özetim: ${recap.totalQuestions} soru, ${recap.daysActive} aktif gün 📖`);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.homeBtnTop} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={18} color={Colors.primary} />
        <Text style={styles.homeBtnTopText}>Geri</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: c.text }]}>Atanma Günlüğü</Text>
      <Text style={[styles.subtitle, { color: c.textSecondary }]}>
        Sonucu değil, emeğini paylaş.
      </Text>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} size="large" />
      ) : !recap || recap.daysActive === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={[styles.emptyTitle, { color: c.text }]}>Bu ay için henüz aktivite yok</Text>
        </View>
      ) : (
        <>
          <View style={styles.cardWrap}>
            <MonthlyRecapCard ref={cardRef} recap={recap} displayName={user?.displayName ?? 'Aday'} />
          </View>

          <TouchableOpacity
            style={[styles.shareBtn, { backgroundColor: c.card, borderColor: Colors.primary }]}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Ionicons name="share-social" size={18} color={Colors.primary} />
            <Text style={[styles.shareBtnText, { color: Colors.primary }]}>Paylaş</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 56, paddingBottom: 40, paddingHorizontal: 20 },
  homeBtnTop: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginBottom: 12 },
  homeBtnTopText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '900' },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 24 },
  cardWrap: { alignItems: 'center' },
  shareBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  shareBtnText: { fontSize: 14, fontWeight: '800' },
  emptyState: { alignItems: 'center', gap: 12, marginTop: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
});
