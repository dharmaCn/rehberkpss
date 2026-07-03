import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getAuthSync } from '../../lib/firebase';
import { fetchWrongQuestionIds, markQuestionMastered, clearMasteredQuestion } from '../../lib/firestore';
import { QUESTION_POOL, Question } from '../../constants/questions';
import { getCategoryLabel, getCategoryColor } from '../../lib/quiz';
import { Colors } from '../../constants/colors';

export default function WrongScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const user = getAuthSync()?.currentUser ?? null;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [mode, setMode] = useState<'list' | 'quiz' | 'done'>('list');
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [mastered, setMastered] = useState<string[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const ids = await fetchWrongQuestionIds(user.uid, 100);
      const map = new Map(QUESTION_POOL.map((q) => [q.id, q]));
      const found = ids.map((id) => map.get(id)).filter((x): x is Question => !!x);
      setQuestions(found);
    } catch {
      // Hata olursa boş defter göster (sonsuz spinner yerine)
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  function startQuiz() {
    if (questions.length === 0) return;
    const shuffled = [...questions].sort(() => Math.random() - 0.5).slice(0, Math.min(10, questions.length));
    setQuestions(shuffled);
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setMastered([]);
    setMode('quiz');
  }

  function handleAnswer(optIndex: number) {
    if (selected !== null || !user) return;
    const q = questions[index];
    const isCorrect = optIndex === q.correctIndex;
    setSelected(optIndex);
    Haptics.notificationAsync(
      isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});
    if (isCorrect) {
      setCorrectCount((n) => n + 1);
      setMastered((m) => [...m, q.id]);
      markQuestionMastered(user.uid, q.id).catch(() => {});
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
    setTimeout(() => {
      const next = index + 1;
      if (next >= questions.length) {
        setMode('done');
      } else {
        setIndex(next);
        setSelected(null);
      }
    }, 1300);
  }

  async function removeFromList(id: string) {
    if (!user) return;
    await clearMasteredQuestion(user.uid, id);
    setQuestions((qs) => qs.filter((q) => q.id !== id));
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  if (mode === 'done') {
    return (
      <View style={[styles.center, { backgroundColor: c.background, paddingHorizontal: 24 }]}>
        <Text style={styles.bigEmoji}>🎯</Text>
        <Text style={[styles.doneTitle, { color: c.text }]}>Bitti!</Text>
        <Text style={[styles.doneSub, { color: c.textSecondary }]}>
          {correctCount}/{questions.length} doğru — {mastered.length} soru defterinden silindi.
        </Text>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: Colors.primary, marginTop: 24 }]}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (mode === 'quiz') {
    const q = questions[index];
    return (
      <View style={[styles.quizContainer, { backgroundColor: c.background }]}>
        <View style={styles.quizHeader}>
          <TouchableOpacity onPress={() => Alert.alert('Çıkmak istiyor musun?', 'İlerlemen kaydedilmedi.', [
            { text: 'Devam Et', style: 'cancel' },
            { text: 'Çık', style: 'destructive', onPress: () => setMode('list') },
          ])}>
            <Text style={[styles.exit, { color: c.textSecondary }]}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.counter, { color: c.textSecondary }]}>{index + 1}/{questions.length}</Text>
        </View>

        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(q.category) + '22' }]}>
          <Text style={[styles.categoryText, { color: getCategoryColor(q.category) }]}>
            {getCategoryLabel(q.category)}
          </Text>
        </View>

        <Text style={[styles.question, { color: c.text }]}>{q.question}</Text>

        <View style={{ gap: 12, marginTop: 16 }}>
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correctIndex;
            const isPicked = i === selected;
            const showResult = selected !== null;
            const bg =
              showResult && isCorrect
                ? Colors.success
                : showResult && isPicked && !isCorrect
                ? Colors.error
                : c.card;
            const bord =
              showResult && isCorrect
                ? Colors.success
                : showResult && isPicked && !isCorrect
                ? Colors.error
                : c.border;
            const txt = showResult && (isCorrect || isPicked) ? '#fff' : c.text;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => handleAnswer(i)}
                disabled={selected !== null}
                activeOpacity={0.85}
                style={[styles.option, { backgroundColor: bg, borderColor: bord }]}
              >
                <Text style={[styles.optionLetter, { color: txt }]}>{String.fromCharCode(65 + i)}</Text>
                <Text style={[styles.optionText, { color: txt }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selected !== null && q.aciklama && (
          <View style={[styles.tipCard, { backgroundColor: Colors.primary + '14', borderColor: Colors.primary + '40' }]}>
            <View style={styles.tipHead}>
              <Ionicons name="bulb" size={18} color={Colors.primary} />
              <Text style={[styles.tipLabel, { color: Colors.primary }]}>Bunu Unutma 💡</Text>
            </View>
            <Text style={[styles.tipText, { color: c.text }]}>{q.aciklama}</Text>
          </View>
        )}
      </View>
    );
  }

  // LIST mode
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.text }]}>Yanlışlarım Defteri</Text>
        <View style={{ width: 26 }} />
      </View>

      <Text style={[styles.sub, { color: c.textSecondary }]}>
        Yanlış cevapladığın sorular burada birikir. Tekrar çözüp doğrularsan listeden düşer.
      </Text>

      <View style={[styles.summaryCard, { backgroundColor: c.card, borderColor: c.border }]}>
        <Text style={[styles.summaryNum, { color: Colors.primary }]}>{questions.length}</Text>
        <Text style={[styles.summaryLbl, { color: c.textSecondary }]}>soru bekliyor</Text>
      </View>

      {questions.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={[styles.emptyTitle, { color: c.text }]}>Defterin tertemiz!</Text>
          <Text style={[styles.emptySub, { color: c.textSecondary }]}>
            Quiz çözmeye devam et, yanlışların buraya gelecek.
          </Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: Colors.primary }]}
            onPress={startQuiz}
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Tekrar Çöz ({Math.min(10, questions.length)} soru)</Text>
          </TouchableOpacity>

          <View style={{ gap: 10, marginTop: 8 }}>
            {questions.map((q) => (
              <View key={q.id} style={[styles.itemCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={[styles.itemDot, { backgroundColor: getCategoryColor(q.category) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemCat, { color: getCategoryColor(q.category) }]}>{getCategoryLabel(q.category)}</Text>
                  <Text style={[styles.itemQ, { color: c.text }]} numberOfLines={2}>{q.question}</Text>
                </View>
                <TouchableOpacity onPress={() => removeFromList(q.id)} hitSlop={10}>
                  <Ionicons name="close-circle" size={22} color={c.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bigEmoji: { fontSize: 64 },
  doneTitle: { fontSize: 24, fontWeight: '800', marginTop: 12 },
  doneSub: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 22 },

  listContent: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  sub: { fontSize: 13, lineHeight: 19 },

  summaryCard: { borderRadius: 16, borderWidth: 1, padding: 18, alignItems: 'center', gap: 4 },
  summaryNum: { fontSize: 40, fontWeight: '900' },
  summaryLbl: { fontSize: 12, fontWeight: '600' },

  empty: { borderRadius: 18, borderWidth: 1, padding: 24, alignItems: 'center', gap: 6 },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: { fontSize: 17, fontWeight: '800' },
  emptySub: { fontSize: 13, textAlign: 'center', lineHeight: 19 },

  primaryBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  itemCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  itemDot: { width: 8, height: 38, borderRadius: 4 },
  itemCat: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  itemQ: { fontSize: 13, fontWeight: '500', lineHeight: 18, marginTop: 2 },

  quizContainer: { flex: 1, paddingTop: 56, paddingHorizontal: 20 },
  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  exit: { fontSize: 22, fontWeight: '600' },
  counter: { fontSize: 13, fontWeight: '700' },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  categoryText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  question: { fontSize: 19, fontWeight: '700', lineHeight: 28 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 14, borderWidth: 1.5 },
  optionLetter: { fontSize: 15, fontWeight: '800', width: 22 },
  optionText: { flex: 1, fontSize: 15, fontWeight: '500' },
  tipCard: { borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 6, marginTop: 16 },
  tipHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tipLabel: { fontSize: 13, fontWeight: '800' },
  tipText: { fontSize: 14, lineHeight: 21 },
});
