// Yeni düello başlat — ders seç, 5 soruyu çöz, meydan okumayı gönder.
// Parametreler: to (rakip uid), name (rakip görünen adı)

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAuthSync } from '../../lib/firebase';
import { publicDisplayName } from '../../lib/friends';
import {
  DuelCategory,
  DUEL_CATEGORY_LABELS,
  DuelSideResult,
  pickDuelQuestions,
  createDuel,
} from '../../lib/duels';
import { Question } from '../../constants/questions';
import { Colors } from '../../constants/colors';
import DuelRunner from '../../components/DuelRunner';

const CATEGORIES: { id: DuelCategory; icon: string; color: string }[] = [
  { id: 'tarih', icon: 'book', color: '#EF4444' },
  { id: 'cografya', icon: 'earth', color: '#10B981' },
  { id: 'vatandaslik', icon: 'people', color: '#4F46E5' },
  { id: 'guncel', icon: 'newspaper', color: '#F59E0B' },
  { id: 'karisik', icon: 'shuffle', color: '#8B5CF6' },
];

type Phase = 'category' | 'play' | 'sending' | 'sent' | 'error';

export default function NewDuel() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const { to, name } = useLocalSearchParams<{ to: string; name: string }>();

  const [phase, setPhase] = useState<Phase>('category');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [myResult, setMyResult] = useState<DuelSideResult | null>(null);

  const opponentName = name ?? 'Rakip';

  function startWithCategory(cat: DuelCategory) {
    setQuestions(pickDuelQuestions(cat));
    setPhase('play');
    setPickedCategory(cat);
  }
  const [pickedCategory, setPickedCategory] = useState<DuelCategory>('karisik');

  async function handleFinish(result: DuelSideResult) {
    setMyResult(result);
    setPhase('sending');
    const user = getAuthSync()?.currentUser ?? null;
    if (!user || !to) {
      setPhase('error');
      return;
    }
    try {
      await createDuel(
        { uid: user.uid, name: publicDisplayName(user.uid, user.displayName) },
        { uid: to, name: opponentName },
        pickedCategory,
        questions.map((q) => q.id),
        result
      );
      setPhase('sent');
    } catch {
      setPhase('error');
    }
  }

  if (phase === 'play') {
    return <DuelRunner questions={questions} onFinish={handleFinish} onExit={() => router.back()} />;
  }

  if (phase === 'sending') {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={[styles.sendingText, { color: c.textSecondary }]}>Meydan okuma gönderiliyor…</Text>
      </View>
    );
  }

  if (phase === 'sent' && myResult) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={styles.bigEmoji}>⚔️</Text>
        <Text style={[styles.sentTitle, { color: c.text }]}>Meydan Okuma Gönderildi!</Text>
        <View style={[styles.scoreCard, { backgroundColor: Colors.primary }]}>
          <Text style={styles.scoreValue}>{myResult.score}</Text>
          <Text style={styles.scoreLabel}>puanın · {myResult.correct}/5 doğru</Text>
        </View>
        <Text style={[styles.sentBody, { color: c.textSecondary }]}>
          {opponentName} uygulamayı açınca düellonu görecek. Aynı 5 soruyu çözecek — 48 saat içinde
          cevaplamazsa hükmen sen kazanırsın! 🏆
        </Text>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: Colors.primary }]}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Tamam</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'error') {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <Text style={styles.bigEmoji}>😕</Text>
        <Text style={[styles.sentTitle, { color: c.text }]}>Bir şeyler ters gitti</Text>
        <Text style={[styles.sentBody, { color: c.textSecondary }]}>
          Meydan okuma gönderilemedi. İnternet bağlantını kontrol edip tekrar dene.
        </Text>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: Colors.primary }]}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Kategori seçimi
  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={24} color={c.textSecondary} />
      </TouchableOpacity>

      <Text style={styles.bigEmoji}>⚔️</Text>
      <Text style={[styles.title, { color: c.text }]}>Düello: {opponentName}</Text>
      <Text style={[styles.subtitle, { color: c.textSecondary }]}>
        Dersi sen seç, 5 soruyu çöz. Sonra sıra {opponentName} adlı arkadaşında — aynı soruları o da
        çözecek, yüksek puan kazanır!
      </Text>

      <View style={styles.catList}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catBtn, { backgroundColor: c.card, borderColor: cat.color }]}
            onPress={() => startWithCategory(cat.id)}
            activeOpacity={0.85}
          >
            <View style={[styles.catIcon, { backgroundColor: cat.color + '22' }]}>
              <Ionicons name={cat.icon as never} size={22} color={cat.color} />
            </View>
            <Text style={[styles.catLabel, { color: c.text }]}>{DUEL_CATEGORY_LABELS[cat.id]}</Text>
            <Ionicons name="chevron-forward" size={18} color={c.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 64, paddingHorizontal: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  backBtn: { position: 'absolute', top: 60, right: 20, zIndex: 1, padding: 8 },
  bigEmoji: { fontSize: 56, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21, marginTop: 8, marginBottom: 24 },
  catList: { gap: 12 },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  catIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  catLabel: { flex: 1, fontSize: 16, fontWeight: '700' },
  sendingText: { fontSize: 15, fontWeight: '600' },
  sentTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  sentBody: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  scoreCard: { borderRadius: 20, paddingVertical: 20, paddingHorizontal: 40, alignItems: 'center', marginVertical: 8 },
  scoreValue: { fontSize: 44, fontWeight: '900', color: '#fff' },
  scoreLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  primaryBtn: { alignSelf: 'stretch', paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginTop: 12 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
