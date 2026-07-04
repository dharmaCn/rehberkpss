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
  Switch,
} from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { getAuthSync, deleteAccountAsync, updateDisplayNameAsync } from '../../lib/firebase';
import {
  fetchUserProfile,
  fetchUserRank,
  fetchWeeklyResults,
  markShareMission,
  updateUserDisplayName,
  UserProfile,
} from '../../lib/firestore';
import { Colors } from '../../constants/colors';
import { BADGES, BadgeId } from '../../lib/badges';
import { getLevelInfo } from '../../lib/levels';
import { SEASON_LABEL, SEASON_END_AT, daysUntil } from '../../constants/season';
import { enableAll, disableAll, isEnabled } from '../../lib/notifications';
import { shareInvite } from '../../lib/share';
import ExamGoalModal from '../../components/ExamGoalModal';

export default function ProfileScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const user = getAuthSync()?.currentUser ?? null;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ranks, setRanks] = useState({ daily: 0, weekly: 0, alltime: 0 });
  const [loading, setLoading] = useState(true);
  const [weekly, setWeekly] = useState<{ date: string; score: number }[]>([]);
  const [notif, setNotif] = useState(false);
  const [examModal, setExamModal] = useState(false);
  const [delVisible, setDelVisible] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [nickModal, setNickModal] = useState(false);
  const [nickText, setNickText] = useState('');
  const [savingNick, setSavingNick] = useState(false);

  const canDelete = confirmText.trim().toLowerCase() === 'hesapsil';

  async function handleSaveNickname() {
    const trimmed = nickText.trim();
    if (!user || trimmed.length < 2 || trimmed.length > 24 || savingNick) return;
    setSavingNick(true);
    try {
      await updateDisplayNameAsync(trimmed);
      await updateUserDisplayName(user.uid, trimmed);
      setNickModal(false);
      refresh();
    } catch {
      Alert.alert('Hata', 'İsim güncellenemedi, tekrar dener misin?');
    } finally {
      setSavingNick(false);
    }
  }

  const refresh = useCallback(() => {
    if (!user) return;
    Promise.all([
      fetchUserProfile(user.uid),
      fetchUserRank(user.uid, 'daily'),
      fetchUserRank(user.uid, 'weekly'),
      fetchUserRank(user.uid, 'alltime'),
      fetchWeeklyResults(user.uid),
      isEnabled(),
    ])
      .then(([prof, daily, weekly, alltime, week, en]) => {
        setProfile(prof);
        setRanks({ daily, weekly, alltime });
        setWeekly(week.map((w) => ({ date: w.date, score: w.score })));
        setNotif(en);
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  // Sekme her odaklandığında yeniden veri çek (quiz/davet sonrası rozetler, streak, görevler güncellensin)
  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

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

  async function handleNotifToggle(v: boolean) {
    if (v) {
      const ok = await enableAll();
      if (!ok) {
        Alert.alert('İzin Gerekli', 'Bildirimleri açabilmek için sistem ayarlarından izin vermelisin.');
        setNotif(false);
        return;
      }
    } else {
      await disableAll();
    }
    setNotif(v);
  }

  async function handleInvite() {
    if (!user) return;
    const ok = await shareInvite(user.displayName ?? '');
    if (ok) {
      await markShareMission(user.uid);
      refresh();
    }
  }

  async function handleDeleteAccount() {
    if (!canDelete || deleting) return;
    setDeleting(true);
    try {
      await deleteAccountAsync();
      setDelVisible(false);
      setConfirmText('');
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? '';
      const msg = e instanceof Error ? e.message : String(e);
      if (code === 'auth/requires-recent-login') {
        Alert.alert('Yeniden Giriş Gerekli', 'Güvenlik nedeniyle hesabı silmeden önce çıkış yapıp tekrar giriş yapmanız gerekiyor.');
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

  const seasonScore = profile?.seasonScore ?? 0;
  const totalScore = profile?.totalScore ?? 0;
  const quizCount = profile?.quizCount ?? 0;
  const bestScore = profile?.bestDayScore ?? 0;
  const currentStreak = profile?.currentStreak ?? 0;
  const longestStreak = profile?.longestStreak ?? 0;
  const earnedBadges = (profile?.badges ?? []) as BadgeId[];
  const seasonLeft = daysUntil(SEASON_END_AT);
  const maxWeekly = Math.max(1, ...weekly.map((w) => w.score));

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
          <TouchableOpacity
            onPress={() => {
              setNickText(profile?.displayName ?? user?.displayName ?? '');
              setNickModal(true);
            }}
            hitSlop={10}
            style={styles.editNameBtn}
          >
            <Ionicons name="pencil" size={15} color={c.textSecondary} />
          </TouchableOpacity>
          {user?.isAnonymous && (
            <View style={[styles.guestBadge, { backgroundColor: Colors.primary + '22' }]}>
              <Text style={[styles.guestBadgeText, { color: Colors.primary }]}>Misafir</Text>
            </View>
          )}
        </View>
        <Text style={[styles.email, { color: c.textSecondary }]}>{user?.email ?? ''}</Text>
      </View>

      {/* Sezon kartı */}
      <View style={[styles.seasonCard, { backgroundColor: Colors.primary }]}>
        <View style={styles.seasonHead}>
          <View style={styles.seasonChip}>
            <Ionicons name="trophy" size={14} color="#fff" />
            <Text style={styles.seasonChipText}>{SEASON_LABEL}</Text>
          </View>
          <Text style={styles.seasonCountdown}>{seasonLeft}g kaldı</Text>
        </View>
        <Text style={styles.seasonScore}>{seasonScore.toLocaleString('tr-TR')}</Text>
        <Text style={styles.seasonLabel}>sezon puanı</Text>
        <Text style={styles.seasonHint}>İlk 100 sezon sonunda Şampiyon rozeti kazanır 👑</Text>
      </View>

      {/* Rank kartları */}
      <View style={styles.rankRow}>
        {[
          { label: 'Bugün', rank: ranks.daily, icon: '☀️' },
          { label: 'Bu Hafta', rank: ranks.weekly, icon: '📅' },
          { label: 'Sezon', rank: ranks.alltime, icon: '🏆' },
        ].map((r) => (
          <View key={r.label} style={[styles.rankCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={styles.rankIcon}>{r.icon}</Text>
            <Text style={[styles.rankNum, { color: Colors.primary }]}>{r.rank >= 999 ? '—' : `#${r.rank}`}</Text>
            <Text style={[styles.rankLabel, { color: c.textSecondary }]}>{r.label}</Text>
          </View>
        ))}
      </View>

      {/* Seviye / XP */}
      {(() => {
        const lvl = getLevelInfo(totalScore);
        return (
          <View style={[styles.levelCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.levelTop}>
              <Text style={styles.levelEmoji}>{lvl.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.levelTitle, { color: c.text }]}>Seviye {lvl.level} — {lvl.title}</Text>
                <Text style={[styles.levelSub, { color: c.textSecondary }]}>
                  {lvl.nextThreshold !== null
                    ? `${(lvl.nextThreshold - lvl.xp).toLocaleString('tr-TR')} puan sonra bir üst seviye`
                    : 'En yüksek seviyedesin! 👑'}
                </Text>
              </View>
              <Text style={[styles.levelXp, { color: Colors.primary }]}>{lvl.xp.toLocaleString('tr-TR')} XP</Text>
            </View>
            <View style={[styles.levelBarTrack, { backgroundColor: c.border }]}>
              <View style={[styles.levelBarFill, { width: `${Math.round(lvl.progress * 100)}%`, backgroundColor: Colors.primary }]} />
            </View>
          </View>
        );
      })()}

      {/* Streak */}
      <View style={[styles.streakCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={styles.streakItem}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={[styles.streakBig, { color: Colors.warning }]}>{currentStreak}</Text>
          <Text style={[styles.streakLbl, { color: c.textSecondary }]}>Güncel Seri</Text>
        </View>
        <View style={[styles.streakDivider, { backgroundColor: c.border }]} />
        <View style={styles.streakItem}>
          <Text style={styles.streakEmoji}>🏆</Text>
          <Text style={[styles.streakBig, { color: c.text }]}>{longestStreak}</Text>
          <Text style={[styles.streakLbl, { color: c.textSecondary }]}>En Uzun</Text>
        </View>
        <View style={[styles.streakDivider, { backgroundColor: c.border }]} />
        <View style={styles.streakItem}>
          <Text style={styles.streakEmoji}>❄️</Text>
          <Text style={[styles.streakBig, { color: '#0EA5E9' }]}>{profile?.streakFreeze?.available ?? 0}</Text>
          <Text style={[styles.streakLbl, { color: c.textSecondary }]}>Freeze</Text>
        </View>
      </View>

      {/* Haftalık özet */}
      {weekly.length > 0 && (
        <View style={[styles.weeklyCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.sectionTitle, { color: c.text, marginBottom: 12 }]}>Bu Hafta</Text>
          <View style={styles.weeklyBars}>
            {weekly.map((w) => {
              const h = w.score === 0 ? 4 : Math.max(8, (w.score / maxWeekly) * 80);
              const day = new Date(w.date + 'T12:00:00').toLocaleDateString('tr-TR', { weekday: 'short' });
              return (
                <View key={w.date} style={styles.weeklyCol}>
                  <Text style={[styles.weeklyScore, { color: c.textSecondary }]}>{w.score || ''}</Text>
                  <View style={[styles.weeklyBar, { height: h, backgroundColor: w.score > 0 ? Colors.primary : c.border }]} />
                  <Text style={[styles.weeklyDay, { color: c.textSecondary }]}>{day}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Rozetler */}
      <Text style={[styles.sectionTitle, { color: c.text }]}>Rozetlerim</Text>
      <View style={styles.badgeGrid}>
        {(Object.values(BADGES) as typeof BADGES[BadgeId][]).map((b) => {
          const earned = earnedBadges.includes(b.id);
          return (
            <View
              key={b.id}
              style={[
                styles.badge,
                { backgroundColor: c.card, borderColor: earned ? b.color : c.border, opacity: earned ? 1 : 0.5 },
              ]}
            >
              <View style={[styles.badgeIcon, { backgroundColor: earned ? b.color + '22' : c.border + '40' }]}>
                <Ionicons name={b.icon as never} size={22} color={earned ? b.color : c.textSecondary} />
              </View>
              <Text style={[styles.badgeTitle, { color: c.text }]} numberOfLines={1}>{b.title}</Text>
              <Text style={[styles.badgeDesc, { color: c.textSecondary }]} numberOfLines={2}>
                {earned ? b.description : 'Henüz kazanılmadı'}
              </Text>
            </View>
          );
        })}
      </View>

      {/* İstatistikler */}
      <Text style={[styles.sectionTitle, { color: c.text }]}>Tüm Zamanlar</Text>
      <View style={[styles.statsCard, { backgroundColor: c.card, borderColor: c.border }]}>
        {[
          { label: 'Tüm Zamanlar Puanı', value: totalScore.toLocaleString('tr-TR'), icon: '⭐' },
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

      {/* Hedef */}
      <TouchableOpacity
        style={[styles.examEdit, { backgroundColor: c.card, borderColor: c.border }]}
        onPress={() => setExamModal(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="calendar" size={20} color={Colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.examEditTitle, { color: c.text }]}>
            {profile?.profileMeta?.examDate
              ? `Sınav: ${new Date(profile.profileMeta.examDate + 'T12:00:00').toLocaleDateString('tr-TR')}`
              : 'Sınav tarihi belirle'}
          </Text>
          <Text style={[styles.examEditSub, { color: c.textSecondary }]}>
            {profile?.profileMeta?.targetScore ? `Hedef: ${profile.profileMeta.targetScore} puan — düzenle` : 'Hedef puanını seç'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={c.textSecondary} />
      </TouchableOpacity>

      {/* Bildirim toggle */}
      <View style={[styles.notifRow, { backgroundColor: c.card, borderColor: c.border }]}>
        <Ionicons name="notifications" size={20} color={Colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.notifTitle, { color: c.text }]}>Günlük Hatırlatma</Text>
          <Text style={[styles.notifSub, { color: c.textSecondary }]}>Her gün 20:00'de bildirim al</Text>
        </View>
        <Switch value={notif} onValueChange={handleNotifToggle} trackColor={{ true: Colors.primary }} />
      </View>

      {/* Arkadaşını davet */}
      <TouchableOpacity
        style={[styles.inviteBtn, { backgroundColor: Colors.primary }]}
        onPress={handleInvite}
        activeOpacity={0.85}
      >
        <Ionicons name="share-social" size={18} color="#fff" />
        <Text style={styles.inviteText}>Arkadaşını Davet Et</Text>
      </TouchableOpacity>

      {/* Çıkış */}
      <TouchableOpacity style={[styles.signOutBtn, { borderColor: Colors.error }]} onPress={handleSignOut} activeOpacity={0.85}>
        <Text style={[styles.signOutText, { color: Colors.error }]}>Çıkış Yap</Text>
      </TouchableOpacity>

      <Modal visible={nickModal} transparent animationType="fade" onRequestClose={() => !savingNick && setNickModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: c.card }]}>
            <Text style={[styles.modalTitle, { color: c.text }]}>İsmini Değiştir</Text>
            <Text style={[styles.modalDesc, { color: c.textSecondary }]}>
              Sıralamada ve profilinde görünecek isim (2-24 karakter).
            </Text>
            <TextInput
              value={nickText}
              onChangeText={setNickText}
              placeholder="Örn. Ahmet K."
              placeholderTextColor={c.textSecondary}
              maxLength={24}
              editable={!savingNick}
              style={[styles.modalInput, { borderColor: c.border, color: c.text, backgroundColor: c.background }]}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.modalBtn, { borderColor: c.border, borderWidth: 1.5 }]}
                onPress={() => setNickModal(false)}
                disabled={savingNick}
                activeOpacity={0.85}
              >
                <Text style={[styles.modalBtnText, { color: c.text }]}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: Colors.primary, opacity: nickText.trim().length >= 2 && !savingNick ? 1 : 0.5 }]}
                onPress={handleSaveNickname}
                disabled={nickText.trim().length < 2 || savingNick}
                activeOpacity={0.85}
              >
                {savingNick ? <ActivityIndicator color="#fff" size="small" /> : <Text style={[styles.modalBtnText, { color: '#fff' }]}>Kaydet</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {!user?.isAnonymous && (
        <>
          <TouchableOpacity
            style={styles.deleteLink}
            onPress={() => { setConfirmText(''); setDelVisible(true); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.deleteLinkText, { color: Colors.error }]}>Hesabımı Sil</Text>
          </TouchableOpacity>

          <Modal visible={delVisible} transparent animationType="fade" onRequestClose={() => !deleting && setDelVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalCard, { backgroundColor: c.card }]}>
                <Text style={[styles.modalTitle, { color: c.text }]}>Hesabını Sil</Text>
                <Text style={[styles.modalDesc, { color: c.textSecondary }]}>
                  Bu işlem geri alınamaz. Onaylamak için aşağıya{' '}
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
                    {deleting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={[styles.modalBtnText, { color: '#fff' }]}>Hesabı Sil</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}

      {user ? (
        <ExamGoalModal
          uid={user.uid}
          visible={examModal}
          initialDate={profile?.profileMeta?.examDate}
          initialTarget={profile?.profileMeta?.targetScore}
          onClose={() => { setExamModal(false); refresh(); }}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 20, paddingTop: 60, gap: 16, paddingBottom: 40 },

  hero: { alignItems: 'center', gap: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editNameBtn: { padding: 4 },
  guestBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  guestBadgeText: { fontSize: 12, fontWeight: '700' },
  avatarRing: { borderWidth: 3, borderRadius: 52, padding: 3 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 36, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  email: { fontSize: 14 },

  seasonCard: { borderRadius: 20, padding: 20, alignItems: 'center', gap: 4 },
  seasonHead: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch', alignItems: 'center' },
  seasonChip: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 },
  seasonChipText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  seasonCountdown: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700' },
  seasonScore: { color: '#fff', fontSize: 44, fontWeight: '900', marginTop: 4 },
  seasonLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  seasonHint: { color: 'rgba(255,255,255,0.8)', fontSize: 11, textAlign: 'center', marginTop: 6 },

  rankRow: { flexDirection: 'row', gap: 12 },
  rankCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1 },
  rankIcon: { fontSize: 22 },
  rankNum: { fontSize: 20, fontWeight: '800' },
  rankLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  levelCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  levelTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelEmoji: { fontSize: 30 },
  levelTitle: { fontSize: 15, fontWeight: '800' },
  levelSub: { fontSize: 12, marginTop: 2 },
  levelXp: { fontSize: 13, fontWeight: '800' },
  levelBarTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  levelBarFill: { height: 8, borderRadius: 4 },

  streakCard: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, padding: 14, alignItems: 'center', justifyContent: 'space-around' },
  streakItem: { flex: 1, alignItems: 'center', gap: 2 },
  streakDivider: { width: 1, alignSelf: 'stretch', marginVertical: 4 },
  streakEmoji: { fontSize: 20 },
  streakBig: { fontSize: 22, fontWeight: '900' },
  streakLbl: { fontSize: 11, fontWeight: '600' },

  weeklyCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  weeklyBars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 110 },
  weeklyCol: { flex: 1, alignItems: 'center', gap: 4 },
  weeklyScore: { fontSize: 10, fontWeight: '700', minHeight: 12 },
  weeklyBar: { width: 18, borderRadius: 6 },
  weeklyDay: { fontSize: 10, fontWeight: '600' },

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
  badgeDesc: { fontSize: 10, textAlign: 'center', lineHeight: 13 },

  statsCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  statLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIcon: { fontSize: 20 },
  statLabel: { fontSize: 14 },
  statValue: { fontSize: 16, fontWeight: '700' },

  examEdit: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  examEditTitle: { fontSize: 14, fontWeight: '800' },
  examEditSub: { fontSize: 12, marginTop: 2 },

  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  notifTitle: { fontSize: 14, fontWeight: '800' },
  notifSub: { fontSize: 12, marginTop: 2 },

  inviteBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  inviteText: { color: '#fff', fontSize: 15, fontWeight: '800' },

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
