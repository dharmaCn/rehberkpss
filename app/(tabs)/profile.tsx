import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { getAuthSync } from '../../lib/firebase';
import { fetchUserProfile, fetchUserRank, UserProfile } from '../../lib/firestore';
import { Colors } from '../../constants/colors';

export default function ProfileScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const user = getAuthSync()?.currentUser ?? null;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ranks, setRanks] = useState({ daily: 0, weekly: 0, alltime: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchUserProfile(user.uid),
      fetchUserRank(user.uid, 'daily'),
      fetchUserRank(user.uid, 'weekly'),
      fetchUserRank(user.uid, 'alltime'),
    ]).then(([prof, daily, weekly, alltime]) => {
      setProfile(prof);
      setRanks({ daily, weekly, alltime });
    }).finally(() => setLoading(false));
  }, [user]);

  async function handleSignOut() {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkmak istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          const a = getAuthSync();
          if (a) await signOut(a);
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={[styles.scroll, { backgroundColor: c.background, justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const totalScore = profile?.totalScore ?? 0;
  const quizCount = profile?.quizCount ?? 0;
  const bestScore = profile?.bestDayScore ?? 0;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Avatar & name */}
      <View style={styles.hero}>
        <View style={[styles.avatarRing, { borderColor: Colors.primary }]}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: Colors.primary }]}>
              <Text style={styles.avatarText}>{(profile?.displayName ?? user?.displayName ?? '?')?.[0]}</Text>
            </View>
          )}
        </View>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: c.text }]}>{profile?.displayName ?? user?.displayName ?? 'Kullanıcı'}</Text>
          {user?.isAnonymous && (
            <View style={[styles.guestBadge, { backgroundColor: Colors.primary + '22' }]}>
              <Text style={[styles.guestBadgeText, { color: Colors.primary }]}>Misafir</Text>
            </View>
          )}
        </View>
        <Text style={[styles.email, { color: c.textSecondary }]}>{user?.email ?? ''}</Text>
      </View>

      {/* Rank kartları */}
      <View style={styles.rankRow}>
        {[
          { label: 'Bugün', rank: ranks.daily, icon: '☀️' },
          { label: 'Bu Hafta', rank: ranks.weekly, icon: '📅' },
          { label: 'Tüm Zamanlar', rank: ranks.alltime, icon: '🌍' },
        ].map((r) => (
          <View key={r.label} style={[styles.rankCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={styles.rankIcon}>{r.icon}</Text>
            <Text style={[styles.rankNum, { color: Colors.primary }]}>
              {r.rank >= 999 ? '—' : `#${r.rank}`}
            </Text>
            <Text style={[styles.rankLabel, { color: c.textSecondary }]}>{r.label}</Text>
          </View>
        ))}
      </View>

      {/* İstatistikler */}
      <Text style={[styles.sectionTitle, { color: c.text }]}>İstatistikler</Text>
      <View style={[styles.statsCard, { backgroundColor: c.card, borderColor: c.border }]}>
        {[
          { label: 'Toplam Puan', value: totalScore.toLocaleString('tr-TR'), icon: '⭐' },
          { label: 'Çözülen Quiz', value: quizCount, icon: '📝' },
          { label: 'En Yüksek Günlük Puan', value: bestScore, icon: '🏆' },
        ].map((s, i, arr) => (
          <View
            key={s.label}
            style={[styles.statRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}
          >
            <View style={styles.statLeft}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statLabel, { color: c.textSecondary }]}>{s.label}</Text>
            </View>
            <Text style={[styles.statValue, { color: c.text }]}>{s.value}</Text>
          </View>
        ))}
      </View>

      {/* Seviye */}
      <View style={[styles.levelCard, { backgroundColor: Colors.primary }]}>
        <View style={styles.levelLeft}>
          <Text style={styles.levelBadge}>
            {totalScore >= 5000 ? '🌟 Uzman' : totalScore >= 2000 ? '🎓 İleri Seviye' : totalScore >= 500 ? '📚 Orta Seviye' : '🌱 Başlangıç'}
          </Text>
          <Text style={styles.levelSub}>
            {totalScore >= 5000
              ? 'KPSS konularına hâkimsin!'
              : `Bir üst seviye için ${totalScore >= 2000 ? 5000 - totalScore : totalScore >= 500 ? 2000 - totalScore : 500 - totalScore} puan daha`}
          </Text>
        </View>
        <Text style={styles.levelScore}>{totalScore}</Text>
      </View>

      {/* Çıkış */}
      <TouchableOpacity
        style={[styles.signOutBtn, { borderColor: Colors.error }]}
        onPress={handleSignOut}
        activeOpacity={0.85}
      >
        <Text style={[styles.signOutText, { color: Colors.error }]}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 60, gap: 20, paddingBottom: 40 },

  hero: { alignItems: 'center', gap: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  guestBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  guestBadgeText: { fontSize: 12, fontWeight: '700' },
  avatarRing: { borderWidth: 3, borderRadius: 52, padding: 3 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  email: { fontSize: 14 },

  rankRow: { flexDirection: 'row', gap: 12 },
  rankCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
  },
  rankIcon: { fontSize: 22 },
  rankNum: { fontSize: 20, fontWeight: '800' },
  rankLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  sectionTitle: { fontSize: 18, fontWeight: '700' },

  statsCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  statLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIcon: { fontSize: 20 },
  statLabel: { fontSize: 14 },
  statValue: { fontSize: 16, fontWeight: '700' },

  levelCard: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelLeft: { gap: 6, flex: 1 },
  levelBadge: { fontSize: 16, fontWeight: '800', color: '#fff' },
  levelSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 18 },
  levelScore: { fontSize: 32, fontWeight: '900', color: '#fff' },

  signOutBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5 },
  signOutText: { fontSize: 15, fontWeight: '700' },
});
