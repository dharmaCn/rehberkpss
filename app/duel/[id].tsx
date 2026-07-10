// Düello detayı — role ve duruma göre:
//   rakip + pending  → kabul ekranı → DuelRunner → sonuç
//   taraf + completed/expired → sonuç karşılaştırması (+ rövanş)
//   meydan okuyan + pending → "rakip bekleniyor" (48 saat geçtiyse hükmen galibiyet)

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db, getAuthSync } from '../../lib/firebase';
import { UserProfile } from '../../lib/firestore';
import {
  Duel,
  DuelSideResult,
  DUEL_CATEGORY_LABELS,
  DUEL_WIN_XP,
  getDuel,
  completeDuel,
  questionsByIds,
  isDuelExpired,
  markDuelExpired,
  markFromSeenResult,
  didIWin,
  applyDuelOutcomeToMyStats,
} from '../../lib/duels';
import { BADGES, BadgeId } from '../../lib/badges';
import { Colors } from '../../constants/colors';
import DuelRunner from '../../components/DuelRunner';

type Phase = 'loading' | 'intro' | 'play' | 'saving' | 'result' | 'waiting' | 'notfound';

export default function DuelScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [phase, setPhase] = useState<Phase>('loading');
  const [duel, setDuel] = useState<Duel | null>(null);
  const [newBadges, setNewBadges] = useState<BadgeId[]>([]);

  const myUid = getAuthSync()?.currentUser?.uid ?? '';

  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    if (!id || !myUid) {
      setPhase('notfound');
      return;
    }
    const d = await getDuel(id).catch(() => null);
    if (!d) {
      setPhase('notfound');
      return;
    }

    // 48 saati geçmiş bekleyen düello: hükmen sonuçlandır
    if (isDuelExpired(d)) {
      await markDuelExpired(d.id).catch(() => {});
      d.status = 'expired';
    }

    setDuel(d);

    if (d.status === 'pending') {
      setPhase(d.to === myUid ? 'intro' : 'waiting');
    } else {
      // Meydan okuyan sonucu ilk kez görüyorsa istatistiğini işle
      if (d.from === myUid && !d.fromSeenResult) {
        await applyMyStats(d);
        markFromSeenResult(d.id).catch(() => {});
      }
      setPhase('result');
    }
  }

  async function applyMyStats(d: Duel) {
    try {
      const snap = await getDoc(doc(db, 'users', myUid));
      const p = (snap.data() ?? {}) as Partial<UserProfile>;
      const res = await applyDuelOutcomeToMyStats(
        myUid,
        didIWin(d, myUid),
        (p.badges ?? []) as BadgeId[],
        p.duelWins ?? 0,
        p.duelStreak ?? 0
      );
      setNewBadges(res.newBadges);
    } catch {
      // İstatistik yazılamazsa sonuç yine gösterilir
    }
  }

  async function handleFinish(result: DuelSideResult) {
    if (!duel) return;
    setPhase('saving');
    try {
      await completeDuel(duel.id, result);
      const updated: Duel = {
        ...duel,
        status: 'completed',
        toScore: result.score,
        toCorrect: result.correct,
        toTimeMs: result.timeMs,
      };
      setDuel(updated);
      await applyMyStats(updated);
      setPhase('result');
    } catch {
      setPhase('result'); // skor kaydedilemese de karşılaştırma yerel sonuçla gösterilir
      setDuel((d) =>
        d ? { ...d, status: 'completed', toScore: result.score, toCorrect: result.correct, toTimeMs: result.timeMs } : d
      );
    }
  }

  if (phase === 'loading' || phase === 'saving') {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (phase === 'notfound' || !duel) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={styles.bigEmoji}>🤷</Text>
        <Text style={[styles.title, { color: c.text }]}>Düello bulunamadı</Text>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: Colors.primary }]} onPress={() => router.back()}>
          <Text style={styles.primaryBtnText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const iAmFrom = duel.from === myUid;
  const opponentName = iAmFrom ? duel.toName : duel.fromName;
  const catLabel = DUEL_CATEGORY_LABELS[duel.category] ?? duel.category;

  if (phase === 'play') {
    return (
      <DuelRunner
        questions={questionsByIds(duel.questionIds)}
        onFinish={handleFinish}
        onExit={() => router.back()}
      />
    );
  }

  if (phase === 'intro') {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={styles.bigEmoji}>⚔️</Text>
        <Text style={[styles.title, { color: c.text }]}>{duel.fromName} sana meydan okudu!</Text>
        <View style={[styles.chip, { backgroundColor: Colors.primary + '18' }]}>
          <Text style={[styles.chipText, { color: Colors.primary }]}>{catLabel} · 5 soru · 30sn/soru</Text>
        </View>
        <Text style={[styles.body, { color: c.textSecondary }]}>
          {duel.fromName} soruları çoktan çözdü ve seni bekliyor. Aynı 5 soruyu sen de çöz — yüksek
          puan kazanır, kazanan +{DUEL_WIN_XP} XP ve rozet ilerlemesi alır!
        </Text>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: Colors.primary }]}
          onPress={() => setPhase('play')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Düelloyu Kabul Et ⚔️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={[styles.secondaryBtnText, { color: c.textSecondary }]}>Şimdi Değil</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'waiting') {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={styles.bigEmoji}>⏳</Text>
        <Text style={[styles.title, { color: c.text }]}>{duel.toName} bekleniyor</Text>
        <View style={[styles.scoreCard, { backgroundColor: Colors.primary }]}>
          <Text style={styles.scoreValue}>{duel.fromScore}</Text>
          <Text style={styles.scoreLabel}>puanın · {duel.fromCorrect}/5 doğru</Text>
        </View>
        <Text style={[styles.body, { color: c.textSecondary }]}>
          {duel.toName} 48 saat içinde cevaplamazsa hükmen sen kazanırsın.
        </Text>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: Colors.primary }]} onPress={() => router.back()}>
          <Text style={styles.primaryBtnText}>Tamam</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Sonuç karşılaştırması ───
  const won = didIWin(duel, myUid);
  const myScore = iAmFrom ? duel.fromScore : duel.toScore ?? 0;
  const myCorrect = iAmFrom ? duel.fromCorrect : duel.toCorrect ?? 0;
  const oppScore = iAmFrom ? duel.toScore ?? 0 : duel.fromScore;
  const oppCorrect = iAmFrom ? duel.toCorrect ?? 0 : duel.fromCorrect;
  const expired = duel.status === 'expired';

  const headline = expired
    ? iAmFrom
      ? 'Hükmen Kazandın! 🏆'
      : 'Süre Doldu 😴'
    : won === true
    ? 'Kazandın! 🏆'
    : won === false
    ? 'Kaybettin 😔'
    : 'Berabere! 🤝';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={styles.resultContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.bigEmoji}>{won === true || (expired && iAmFrom) ? '🎉' : won === false ? '⚔️' : '🤝'}</Text>
      <Text style={[styles.title, { color: c.text }]}>{headline}</Text>
      <View style={[styles.chip, { backgroundColor: Colors.primary + '18' }]}>
        <Text style={[styles.chipText, { color: Colors.primary }]}>{catLabel} Düellosu</Text>
      </View>

      <View style={styles.vsRow}>
        <View style={[styles.vsCard, { backgroundColor: c.card, borderColor: won !== false ? Colors.success : c.border }]}>
          <Text style={[styles.vsName, { color: c.text }]} numberOfLines={1}>Sen</Text>
          <Text style={[styles.vsScore, { color: won !== false ? Colors.success : c.text }]}>{expired && !iAmFrom ? '—' : myScore}</Text>
          <Text style={[styles.vsSub, { color: c.textSecondary }]}>{expired && !iAmFrom ? 'cevaplamadın' : `${myCorrect}/5 doğru`}</Text>
        </View>
        <Text style={[styles.vsLabel, { color: c.textSecondary }]}>VS</Text>
        <View style={[styles.vsCard, { backgroundColor: c.card, borderColor: won === false ? Colors.success : c.border }]}>
          <Text style={[styles.vsName, { color: c.text }]} numberOfLines={1}>{opponentName}</Text>
          <Text style={[styles.vsScore, { color: won === false ? Colors.success : c.text }]}>{expired && iAmFrom ? '—' : oppScore}</Text>
          <Text style={[styles.vsSub, { color: c.textSecondary }]}>{expired && iAmFrom ? 'cevaplamadı' : `${oppCorrect}/5 doğru`}</Text>
        </View>
      </View>

      {won === true && (
        <View style={[styles.xpChip, { backgroundColor: Colors.success + '22' }]}>
          <Ionicons name="trending-up" size={16} color={Colors.success} />
          <Text style={[styles.xpText, { color: Colors.success }]}>+{DUEL_WIN_XP} XP kazandın</Text>
        </View>
      )}

      {newBadges.length > 0 && (
        <View style={[styles.badgeCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.badgeTitle, { color: c.text }]}>🎉 Yeni Rozet!</Text>
          {newBadges.map((id) => {
            const def = BADGES[id];
            if (!def) return null;
            return (
              <View key={id} style={styles.badgeRow}>
                <View style={[styles.badgeIcon, { backgroundColor: def.color + '22' }]}>
                  <Ionicons name={def.icon as never} size={20} color={def.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.badgeName, { color: c.text }]}>{def.title}</Text>
                  <Text style={[styles.badgeDesc, { color: c.textSecondary }]}>{def.description}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: Colors.primary }]}
        onPress={() =>
          router.replace({
            pathname: '/duel/new',
            params: { to: iAmFrom ? duel.to : duel.from, name: opponentName },
          })
        }
        activeOpacity={0.85}
      >
        <Text style={styles.primaryBtnText}>Rövanş İste ⚔️</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <Text style={[styles.secondaryBtnText, { color: c.textSecondary }]}>Kapat</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  resultContent: { paddingTop: 80, paddingBottom: 48, paddingHorizontal: 24, alignItems: 'center', gap: 12 },
  bigEmoji: { fontSize: 56, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  body: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: '700' },
  scoreCard: { borderRadius: 20, paddingVertical: 20, paddingHorizontal: 40, alignItems: 'center', marginVertical: 8 },
  scoreValue: { fontSize: 44, fontWeight: '900', color: '#fff' },
  scoreLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  vsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 12, alignSelf: 'stretch' },
  vsCard: { flex: 1, borderRadius: 18, borderWidth: 2, padding: 16, alignItems: 'center', gap: 4 },
  vsName: { fontSize: 14, fontWeight: '700' },
  vsScore: { fontSize: 34, fontWeight: '900' },
  vsSub: { fontSize: 12, fontWeight: '600' },
  vsLabel: { fontSize: 14, fontWeight: '800' },
  xpChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  xpText: { fontSize: 13, fontWeight: '700' },
  badgeCard: { alignSelf: 'stretch', borderRadius: 16, borderWidth: 1, padding: 16, gap: 12, marginTop: 4 },
  badgeTitle: { fontSize: 15, fontWeight: '800' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badgeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  badgeName: { fontSize: 14, fontWeight: '700' },
  badgeDesc: { fontSize: 12, marginTop: 2 },
  primaryBtn: { alignSelf: 'stretch', paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginTop: 12 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { paddingVertical: 12 },
  secondaryBtnText: { fontSize: 14, fontWeight: '600' },
});
