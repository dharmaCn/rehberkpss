import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAuthSync } from '../../lib/firebase';
import { fetchLeaderboard, LeaderboardEntry } from '../../lib/firestore';
import { TITLES } from '../../lib/titles';
import { Colors } from '../../constants/colors';

type Period = 'daily' | 'weekly' | 'alltime';

const PERIOD_LABELS: Record<Period, string> = {
  daily: 'Bugün',
  weekly: 'Bu Hafta',
  alltime: 'Tüm Zamanlar',
};

export default function LeaderboardScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const user = getAuthSync()?.currentUser ?? null;
  const router = useRouter();

  const [period, setPeriod] = useState<Period>('daily');
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    load();
  }, [period]);

  async function load() {

    setLoading(true);
    try {
      const result = await fetchLeaderboard(period);
      setData(result);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);
  const myRank = data.findIndex((e) => e.uid === user?.uid);

  function openProfile(uid: string) {
    router.push(`/user/${uid}`);
  }

  function getMedalColor(rank: number) {
    if (rank === 1) return '#F59E0B';
    if (rank === 2) return '#94A3B8';
    return '#D97706';
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.headerArea}>
        <Text style={[styles.title, { color: c.text }]}>🏆 Sıralama</Text>

        {/* Period tabs */}
        <View style={[styles.tabs, { backgroundColor: c.card, borderColor: c.border }]}>
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              style={[styles.tab, period === p && { backgroundColor: Colors.primary }]}
              onPress={() => setPeriod(p)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, period === p ? { color: '#fff' } : { color: c.textSecondary }]}>
                {PERIOD_LABELS[p]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {user?.isAnonymous && (
          <View style={[styles.guestNotice, { backgroundColor: Colors.primary + '12', borderColor: Colors.primary + '30' }]}>
            <Text style={[styles.guestNoticeText, { color: Colors.primary }]}>
              Sıralamada kalıcı hale gelmek istiyorsan kendi hesabınla giriş yap
            </Text>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} size="large" />
      ) : data.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={[styles.emptyTitle, { color: c.text }]}>Henüz sonuç yok</Text>
          <Text style={[styles.emptyText, { color: c.textSecondary }]}>
            {period === 'daily'
              ? 'Bugün quiz çözülmedi. İlk sen ol!'
              : 'Bu dönem için sonuç bulunamadı.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary} />}
        >
          {/* Top 3 podium */}
          {top3.length >= 1 && (
            <View style={styles.podium}>
              {/* 2nd place */}
              {top3[1] && (
                <TouchableOpacity style={[styles.podiumItem, { marginTop: 32 }]} onPress={() => openProfile(top3[1].uid)} activeOpacity={0.8}>
                  {top3[1].photoURL ? (
                    <Image source={{ uri: top3[1].photoURL }} style={[styles.podiumAvatar, { borderColor: '#94A3B8' }]} />
                  ) : (
                    <View style={[styles.podiumAvatarPlaceholder, { borderColor: '#94A3B8', backgroundColor: '#94A3B8' }]}>
                      <Text style={styles.podiumAvatarText}>{top3[1].displayName[0]}</Text>
                    </View>
                  )}
                  <Text style={styles.podiumMedal}>🥈</Text>
                  <Text style={[styles.podiumName, { color: c.text }]} numberOfLines={1}>{top3[1].displayName.split(' ')[0]}</Text>
                  <Text style={[styles.podiumScore, { color: c.textSecondary }]}>{top3[1].score} pt</Text>
                </TouchableOpacity>
              )}

              {/* 1st place */}
              <TouchableOpacity style={[styles.podiumItem, styles.podiumFirst]} onPress={() => openProfile(top3[0].uid)} activeOpacity={0.8}>
                {top3[0].photoURL ? (
                  <Image source={{ uri: top3[0].photoURL }} style={[styles.podiumAvatar, styles.podiumAvatarFirst, { borderColor: '#F59E0B' }]} />
                ) : (
                  <View style={[styles.podiumAvatarPlaceholder, styles.podiumAvatarFirst, { borderColor: '#F59E0B', backgroundColor: Colors.primary }]}>
                    <Text style={styles.podiumAvatarText}>{top3[0].displayName[0]}</Text>
                  </View>
                )}
                <Text style={styles.podiumMedal}>🥇</Text>
                <Text style={[styles.podiumName, { color: c.text }]} numberOfLines={1}>{top3[0].displayName.split(' ')[0]}</Text>
                <Text style={[styles.podiumScore, { color: c.textSecondary }]}>{top3[0].score} pt</Text>
              </TouchableOpacity>

              {/* 3rd place */}
              {top3[2] && (
                <TouchableOpacity style={[styles.podiumItem, { marginTop: 48 }]} onPress={() => openProfile(top3[2].uid)} activeOpacity={0.8}>
                  {top3[2].photoURL ? (
                    <Image source={{ uri: top3[2].photoURL }} style={[styles.podiumAvatar, { borderColor: '#D97706' }]} />
                  ) : (
                    <View style={[styles.podiumAvatarPlaceholder, { borderColor: '#D97706', backgroundColor: '#D97706' }]}>
                      <Text style={styles.podiumAvatarText}>{top3[2].displayName[0]}</Text>
                    </View>
                  )}
                  <Text style={styles.podiumMedal}>🥉</Text>
                  <Text style={[styles.podiumName, { color: c.text }]} numberOfLines={1}>{top3[2].displayName.split(' ')[0]}</Text>
                  <Text style={[styles.podiumScore, { color: c.textSecondary }]}>{top3[2].score} pt</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Rest of leaderboard */}
          <View style={[styles.listCard, { backgroundColor: c.card, borderColor: c.border }]}>
            {rest.map((entry, i) => {
              const isMe = entry.uid === user?.uid;
              return (
                <TouchableOpacity
                  key={entry.uid}
                  style={[
                    styles.listRow,
                    i < rest.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border },
                    isMe && { backgroundColor: Colors.primary + '11' },
                  ]}
                  onPress={() => openProfile(entry.uid)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.rank, { color: c.textSecondary }]}>#{entry.rank}</Text>
                  {entry.photoURL ? (
                    <Image source={{ uri: entry.photoURL }} style={styles.listAvatar} />
                  ) : (
                    <View style={[styles.listAvatarPlaceholder, { backgroundColor: Colors.primary }]}>
                      <Text style={styles.listAvatarText}>{entry.displayName[0]}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.listName, { color: isMe ? Colors.primary : c.text }]} numberOfLines={1}>
                      {entry.displayName}{isMe ? ' (Sen)' : ''}
                    </Text>
                    {entry.titleId && TITLES[entry.titleId] && (
                      <View style={styles.listTitleRow}>
                        <Ionicons name={TITLES[entry.titleId].icon as never} size={11} color={TITLES[entry.titleId].color} />
                        <Text style={[styles.listTitleText, { color: TITLES[entry.titleId].color }]} numberOfLines={1}>
                          {TITLES[entry.titleId].name}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.listScore, { color: Colors.primary }]}>{entry.score} pt</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* My rank banner if not visible */}
          {myRank >= 0 && myRank < 3 ? null : myRank >= 3 ? (
            <View style={[styles.myRankBanner, { backgroundColor: Colors.primary }]}>
              <Text style={styles.myRankText}>Senin Sıran: #{myRank + 1}</Text>
              <Text style={styles.myRankScore}>{data[myRank]?.score ?? 0} pt</Text>
            </View>
          ) : (
            <View style={[styles.myRankBanner, { backgroundColor: c.card, borderColor: c.border, borderWidth: 1 }]}>
              <Text style={[styles.myRankText, { color: c.textSecondary }]}>Bugün quiz çözerek sıralamaya gir!</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, gap: 16 },
  title: { fontSize: 28, fontWeight: '800' },

  tabs: { flexDirection: 'row', borderRadius: 14, padding: 4, borderWidth: 1 },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },

  guestNotice: { borderRadius: 12, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12 },
  guestNoticeText: { fontSize: 12, fontWeight: '700', textAlign: 'center', lineHeight: 17 },

  scrollContent: { paddingBottom: 32 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },

  podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', paddingVertical: 24, paddingHorizontal: 20, gap: 16 },
  podiumItem: { alignItems: 'center', gap: 6, flex: 1 },
  podiumFirst: { marginTop: 0 },
  podiumAvatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 3 },
  podiumAvatarFirst: { width: 72, height: 72, borderRadius: 36, borderWidth: 3 },
  podiumAvatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  podiumAvatarText: { color: '#fff', fontWeight: '700', fontSize: 20 },
  podiumMedal: { fontSize: 22 },
  podiumName: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  podiumScore: { fontSize: 12, fontWeight: '600' },

  listCard: { marginHorizontal: 20, borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  listRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rank: { width: 32, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  listAvatar: { width: 40, height: 40, borderRadius: 20 },
  listAvatarPlaceholder: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  listAvatarText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  listName: { fontSize: 14, fontWeight: '600' },
  listTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  listTitleText: { fontSize: 11, fontWeight: '600' },
  listScore: { fontSize: 14, fontWeight: '700' },

  myRankBanner: {
    margin: 20,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  myRankText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  myRankScore: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
