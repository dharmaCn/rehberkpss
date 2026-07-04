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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAuthSync } from '../../lib/firebase';
import { fetchUserProfile, UserProfile } from '../../lib/firestore';
import {
  FriendStatus,
  getFriendStatus,
  sendFriendRequest,
  cancelFriendRequest,
  acceptFriendRequest,
  removeFriend,
  publicDisplayName,
} from '../../lib/friends';
import { Colors } from '../../constants/colors';
import { BADGES, BadgeId } from '../../lib/badges';
import { getLevelInfo } from '../../lib/levels';

export default function PublicProfileScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const me = getAuthSync()?.currentUser ?? null;
  const isSelf = me?.uid === uid;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<FriendStatus>('none');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const [prof, st] = await Promise.all([
          fetchUserProfile(uid),
          me && !isSelf ? getFriendStatus(me.uid, uid) : Promise.resolve<FriendStatus>('none'),
        ]);
        setProfile(prof);
        setStatus(st);
      } finally {
        setLoading(false);
      }
    })();
  }, [uid]);

  async function handleFriendAction() {
    if (!me || !uid || busy) return;
    setBusy(true);
    try {
      if (status === 'none') {
        await sendFriendRequest(me, uid);
        setStatus('outgoing');
      } else if (status === 'outgoing') {
        await cancelFriendRequest(me.uid, uid);
        setStatus('none');
      } else if (status === 'incoming') {
        await acceptFriendRequest(me.uid, uid);
        setStatus('friends');
      } else {
        Alert.alert('Arkadaşlıktan Çıkar', 'Bu kişiyi arkadaş listenden çıkarmak istiyor musun?', [
          { text: 'İptal', style: 'cancel' },
          {
            text: 'Çıkar',
            style: 'destructive',
            onPress: async () => {
              try {
                await removeFriend(me.uid, uid);
                setStatus('none');
              } catch {
                Alert.alert('Hata', 'İşlem tamamlanamadı, tekrar dener misin?');
              }
            },
          },
        ]);
      }
    } catch {
      Alert.alert('Hata', 'İşlem tamamlanamadı, tekrar dener misin?');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.center, { backgroundColor: c.background, gap: 12 }]}>
        <Text style={{ fontSize: 40 }}>🤔</Text>
        <Text style={[styles.emptyTitle, { color: c.text }]}>Kullanıcı bulunamadı</Text>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={{ color: Colors.primary, fontWeight: '700' }}>Geri dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const name = publicDisplayName(profile.uid, profile.displayName);
  const lvl = getLevelInfo(profile.totalScore ?? 0);
  const earnedBadges = (profile.badges ?? []) as BadgeId[];

  const FRIEND_BTN: Record<FriendStatus, { label: string; icon: string; solid: boolean }> = {
    none: { label: 'Arkadaş Ol', icon: 'person-add', solid: true },
    outgoing: { label: 'İstek Gönderildi — İptal Et', icon: 'time', solid: false },
    incoming: { label: 'İsteği Kabul Et', icon: 'checkmark-circle', solid: true },
    friends: { label: 'Arkadaşsınız', icon: 'people', solid: false },
  };
  const btn = FRIEND_BTN[status];

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: c.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Geri */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10} activeOpacity={0.7}>
        <Ionicons name="chevron-back" size={24} color={c.text} />
        <Text style={[styles.backText, { color: c.text }]}>Geri</Text>
      </TouchableOpacity>

      {/* Avatar & isim */}
      <View style={styles.hero}>
        <View style={[styles.avatarRing, { borderColor: Colors.primary }]}>
          {profile.photoURL ? (
            <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: Colors.primary }]}>
              <Text style={styles.avatarText}>{name[0]}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.name, { color: c.text }]}>{name}</Text>
        <Text style={[styles.levelLine, { color: c.textSecondary }]}>
          {lvl.emoji} Seviye {lvl.level} — {lvl.title}
        </Text>
      </View>

      {/* Arkadaşlık butonu */}
      {!isSelf && me && (
        <TouchableOpacity
          style={[
            styles.friendBtn,
            btn.solid
              ? { backgroundColor: Colors.primary }
              : { backgroundColor: c.card, borderColor: c.border, borderWidth: 1.5 },
          ]}
          onPress={handleFriendAction}
          disabled={busy}
          activeOpacity={0.85}
        >
          {busy ? (
            <ActivityIndicator color={btn.solid ? '#fff' : Colors.primary} size="small" />
          ) : (
            <>
              <Ionicons name={btn.icon as never} size={18} color={btn.solid ? '#fff' : Colors.primary} />
              <Text style={[styles.friendBtnText, { color: btn.solid ? '#fff' : c.text }]}>{btn.label}</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* İstatistikler */}
      <View style={styles.statRow}>
        {[
          { label: 'Sezon Puanı', value: (profile.seasonScore ?? 0).toLocaleString('tr-TR'), icon: '🏆' },
          { label: 'Güncel Seri', value: `${profile.currentStreak ?? 0} gün`, icon: '🔥' },
          { label: 'Quiz', value: profile.quizCount ?? 0, icon: '📝' },
        ].map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={[styles.statValue, { color: Colors.primary }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: c.textSecondary }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.statsCard, { backgroundColor: c.card, borderColor: c.border }]}>
        {[
          { label: 'Tüm Zamanlar Puanı', value: (profile.totalScore ?? 0).toLocaleString('tr-TR'), icon: '⭐' },
          { label: 'En Yüksek Günlük Puan', value: profile.bestDayScore ?? 0, icon: '🚀' },
          { label: 'En Uzun Seri', value: `${profile.longestStreak ?? 0} gün`, icon: '📈' },
        ].map((s, i, arr) => (
          <View
            key={s.label}
            style={[styles.listRow, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}
          >
            <View style={styles.listLeft}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.listLabel, { color: c.textSecondary }]}>{s.label}</Text>
            </View>
            <Text style={[styles.listValue, { color: c.text }]}>{s.value}</Text>
          </View>
        ))}
      </View>

      {/* Rozetler */}
      {earnedBadges.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Rozetleri</Text>
          <View style={styles.badgeGrid}>
            {earnedBadges.map((id) => {
              const b = BADGES[id];
              if (!b) return null;
              return (
                <View key={id} style={[styles.badge, { backgroundColor: c.card, borderColor: b.color }]}>
                  <View style={[styles.badgeIcon, { backgroundColor: b.color + '22' }]}>
                    <Ionicons name={b.icon as never} size={22} color={b.color} />
                  </View>
                  <Text style={[styles.badgeTitle, { color: c.text }]} numberOfLines={1}>{b.title}</Text>
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 56, gap: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700' },

  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start' },
  backText: { fontSize: 16, fontWeight: '600' },

  hero: { alignItems: 'center', gap: 6 },
  avatarRing: { borderWidth: 3, borderRadius: 52, padding: 3 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  levelLine: { fontSize: 14, fontWeight: '600' },

  friendBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  friendBtnText: { fontSize: 15, fontWeight: '800' },

  statRow: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1 },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 17, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  statsCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  listLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  listLabel: { fontSize: 14 },
  listValue: { fontSize: 16, fontWeight: '700' },

  sectionTitle: { fontSize: 18, fontWeight: '700' },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  badge: {
    flexBasis: '30%',
    flexGrow: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  badgeIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  badgeTitle: { fontSize: 12, fontWeight: '800', textAlign: 'center' },
});
