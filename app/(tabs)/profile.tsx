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
  Modal,
  TextInput,
} from 'react-native';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { getAuthSync, deleteAccountAsync } from '../../lib/firebase';
import { fetchUserProfile, fetchUserRank, UserProfile, CategoryKey } from '../../lib/firestore';
import { getCategoryLabel, getCategoryColor } from '../../lib/quiz';
import { ACHIEVEMENTS, buildAchievementCtx } from '../../lib/achievements';
import { getLeague } from '../../lib/league';
import { Colors } from '../../constants/colors';

const CATS: CategoryKey[] = ['tarih', 'cografya', 'vatandaslik', 'guncel'];

export default function ProfileScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const user = getAuthSync()?.currentUser ?? null;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ranks, setRanks] = useState({ daily: 0, weekly: 0, alltime: 0 });
  const [loading, setLoading] = useState(true);
  const [delVisible, setDelVisible] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const canDelete = confirmText.trim().toLowerCase() === 'hesapsil';

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

  async function handleDeleteAccount() {
    if (!canDelete || deleting) return;
    setDeleting(true);
    try {
      await deleteAccountAsync();
      // Hesap silinince onAuthStateChanged tetiklenir, _layout giriş ekranına yönlendirir
      setDelVisible(false);
      setConfirmText('');
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? '';
      const msg = e instanceof Error ? e.message : String(e);
      if (code === 'auth/requires-recent-login') {
        Alert.alert(
          'Yeniden Giriş Gerekli',
          'Güvenlik nedeniyle hesabı silmeden önce çıkış yapıp tekrar giriş yapmanız gerekiyor. Lütfen çıkış yapıp tekrar giriş yapın, ardından yeniden deneyin.'
        );
      } else {
        Alert.alert('Hata', 'Hesap silinemedi: ' + msg);
      }
    } finally {
      setDeleting(false);
    }
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

  // Konu performansı — en zayıf ders en üstte, verisi olmayanlar en altta
  const catStats = profile?.categoryStats ?? {};
  const catPerf = CATS.map((key) => {
    const s = catStats[key];
    const total = s?.total ?? 0;
    const correct = s?.correct ?? 0;
    return { key, total, correct, acc: total > 0 ? Math.round((correct / total) * 100) : null };
  }).sort((a, b) => (a.acc ?? 101) - (b.acc ?? 101));

  // Rozetler
  const achCtx = buildAchievementCtx(profile);
  const earnedCount = ACHIEVEMENTS.filter((a) => a.earned(achCtx)).length;

  // Lig
  const lg = getLeague(totalScore);

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

      {/* Konu Performansı */}
      <Text style={[styles.sectionTitle, { color: c.text }]}>Konu Performansın</Text>
      <View style={[styles.perfCard, { backgroundColor: c.card, borderColor: c.border }]}>
        {catPerf.map((p, i) => (
          <View
            key={p.key}
            style={[styles.perfRow, i < catPerf.length - 1 && { borderBottomWidth: 1, borderBottomColor: c.border }]}
          >
            <View style={styles.perfHead}>
              <Text style={[styles.perfLabel, { color: c.text }]}>{getCategoryLabel(p.key)}</Text>
              <Text style={[styles.perfPct, { color: p.acc == null ? c.textSecondary : getCategoryColor(p.key) }]}>
                {p.acc == null ? 'Veri yok' : `%${p.acc}`}
              </Text>
            </View>
            <View style={[styles.perfTrack, { backgroundColor: c.border }]}>
              <View style={[styles.perfFill, { width: `${p.acc ?? 0}%`, backgroundColor: getCategoryColor(p.key) }]} />
            </View>
            {p.total > 0 && (
              <Text style={[styles.perfSub, { color: c.textSecondary }]}>{p.correct}/{p.total} doğru</Text>
            )}
          </View>
        ))}
      </View>

      {/* Lig */}
      <View style={[styles.leagueCard, { backgroundColor: lg.league.color }]}>
        <View style={styles.leagueTop}>
          <View style={styles.leagueLeft}>
            <Text style={styles.leagueIcon}>{lg.league.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.leagueName}>{lg.league.name} Ligi</Text>
              <Text style={styles.leagueSub}>
                {lg.next ? `${lg.next.name} ligine ${lg.toNext.toLocaleString('tr-TR')} puan` : 'En üst lig — efsanesin! 👑'}
              </Text>
            </View>
          </View>
          <Text style={styles.leagueScore}>{totalScore.toLocaleString('tr-TR')}</Text>
        </View>
        <View style={styles.leagueTrack}>
          <View style={[styles.leagueFill, { width: `${lg.progressPct}%` }]} />
        </View>
      </View>

      {/* Rozetler */}
      <View style={styles.achHeader}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>Rozetler</Text>
        <Text style={[styles.achCount, { color: c.textSecondary }]}>{earnedCount}/{ACHIEVEMENTS.length}</Text>
      </View>
      <View style={styles.achGrid}>
        {ACHIEVEMENTS.map((a) => {
          const earned = a.earned(achCtx);
          const prog = !earned && a.progress ? a.progress(achCtx) : null;
          return (
            <View
              key={a.id}
              style={[
                styles.achTile,
                { backgroundColor: c.card, borderColor: earned ? Colors.primary : c.border },
                !earned && { opacity: 0.55 },
              ]}
            >
              <Text style={styles.achIcon}>{a.icon}</Text>
              <Text style={[styles.achTitle, { color: c.text }]} numberOfLines={1}>{a.title}</Text>
              {earned ? (
                <Text style={[styles.achState, { color: Colors.success }]}>✓ Kazanıldı</Text>
              ) : prog ? (
                <Text style={[styles.achState, { color: c.textSecondary }]}>{prog.current}/{prog.target}</Text>
              ) : (
                <Text style={[styles.achState, { color: c.textSecondary }]}>Kilitli</Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Çıkış */}
      <TouchableOpacity
        style={[styles.signOutBtn, { borderColor: Colors.error }]}
        onPress={handleSignOut}
        activeOpacity={0.85}
      >
        <Text style={[styles.signOutText, { color: Colors.error }]}>Çıkış Yap</Text>
      </TouchableOpacity>

      {/* Hesabımı Sil — yalnızca gerçek (Google) hesaplarda; misafirde gösterilmez */}
      {!user?.isAnonymous && (
      <>
      <TouchableOpacity
        style={styles.deleteLink}
        onPress={() => { setConfirmText(''); setDelVisible(true); }}
        activeOpacity={0.7}
      >
        <Text style={[styles.deleteLinkText, { color: Colors.error }]}>Hesabımı Sil</Text>
      </TouchableOpacity>

      {/* Hesap silme onay modalı */}
      <Modal
        visible={delVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !deleting && setDelVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: c.card }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>Hesabını Sil</Text>
            <Text style={[styles.modalDesc, { color: c.textSecondary }]}>
              Bu işlem geri alınamaz. Tüm verilerin (puanların, sıralaman ve quiz geçmişin) kalıcı olarak silinir.
              {'\n\n'}Onaylamak için aşağıya{' '}
              <Text style={{ fontWeight: '800', color: c.text }}>hesapsil</Text> yaz.
            </Text>
            <TextInput
              value={confirmText}
              onChangeText={setConfirmText}
              placeholder="hesapsil"
              placeholderTextColor={c.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!deleting}
              style={[styles.modalInput, { borderColor: c.border, color: c.text, backgroundColor: c.background }]}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: c.border, borderWidth: 1.5 }]}
                onPress={() => { setDelVisible(false); setConfirmText(''); }}
                disabled={deleting}
                activeOpacity={0.85}
              >
                <Text style={[styles.modalBtnText, { color: c.text }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.error, opacity: canDelete && !deleting ? 1 : 0.5 }]}
                onPress={handleDeleteAccount}
                disabled={!canDelete || deleting}
                activeOpacity={0.85}
              >
                {deleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>Hesabı Sil</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </>
      )}
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

  perfCard: { borderRadius: 20, borderWidth: 1, padding: 4 },
  perfRow: { paddingHorizontal: 14, paddingVertical: 14, gap: 8 },
  perfHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  perfLabel: { fontSize: 15, fontWeight: '700' },
  perfPct: { fontSize: 15, fontWeight: '800' },
  perfTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  perfFill: { height: '100%', borderRadius: 4 },
  perfSub: { fontSize: 12, fontWeight: '500' },

  achHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  achCount: { fontSize: 14, fontWeight: '700' },
  achGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achTile: {
    flexGrow: 1,
    flexBasis: '29%',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 5,
  },
  achIcon: { fontSize: 28 },
  achTitle: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  achState: { fontSize: 10, fontWeight: '700', textAlign: 'center' },

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

  leagueCard: { borderRadius: 20, padding: 20, gap: 14 },
  leagueTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  leagueLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  leagueIcon: { fontSize: 36 },
  leagueName: { fontSize: 18, fontWeight: '800', color: '#fff' },
  leagueSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  leagueScore: { fontSize: 28, fontWeight: '900', color: '#fff', marginLeft: 8 },
  leagueTrack: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' },
  leagueFill: { height: '100%', borderRadius: 4, backgroundColor: '#fff' },

  signOutBtn: { borderRadius: 16, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5 },
  signOutText: { fontSize: 15, fontWeight: '700' },

  deleteLink: { alignItems: 'center', paddingVertical: 4 },
  deleteLinkText: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', paddingHorizontal: 28 },
  modalCard: { borderRadius: 20, padding: 22, gap: 14 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalDesc: { fontSize: 14, lineHeight: 21 },
  modalInput: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 4 },
  modalBtn: { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  modalBtnText: { fontSize: 15, fontWeight: '700' },
});
