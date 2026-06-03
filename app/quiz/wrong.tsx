import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { getAuthSync } from '../../lib/firebase';
import { fetchUserProfile, removeWrongQuestion } from '../../lib/firestore';
import { getCategoryColor, getCategoryLabel } from '../../lib/quiz';
import { QUESTION_POOL, Question } from '../../constants/questions';
import { Colors } from '../../constants/colors';

const SESSION_LIMIT = 20;

export default function WrongPractice() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const user = getAuthSync()?.currentUser ?? null;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [cleared, setCleared] = useState(0);
  const [stillWrong, setStillWrong] = useState(0);
  const [finished, setFinished] = useState(false);

  const byId = useMemo(() => {
    const m = new Map<string, Question>();
    for (const q of QUESTION_POOL) m.set(q.id, q);
    return m;
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchUserProfile(user.uid)
      .then((p) => {
        const ids = Object.keys(p?.wrongQuestions ?? {});
        const resolved = ids.map((id) => byId.get(id)).filter((q): q is Question => !!q);
        // karıştır + oturum başına sınırla
        for (let i = resolved.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [resolved[i], resolved[j]] = [resolved[j], resolved[i]];
        }
        setQuestions(resolved.slice(0, SESSION_LIMIT));
      })
      .finally(() => setLoading(false));
  }, [user]);

  const q = questions[index];

  function handleAnswer(optIndex: number) {
    if (selected !== null || !q || !user) return;
    setSelected(optIndex);
    const isCorrect = optIndex === q.correctIndex;
    if (isCorrect) {
      setCleared((n) => n + 1);
      removeWrongQuestion(user.uid, q.id); // havuzdan çıkar
    } else {
      setStillWrong((n) => n + 1);
    }
  }

  function next() {
    if (index + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  }

  function optionStyle(i: number) {
    if (selected === null) return [styles.option, { backgroundColor: c.card, borderColor: c.border }];
    if (i === q.correctIndex) return [styles.option, { backgroundColor: Colors.success, borderColor: Colors.success }];
    if (i === selected) return [styles.option, { backgroundColor: Colors.error, borderColor: Colors.error }];
    return [styles.option, { backgroundColor: c.card, borderColor: c.border, opacity: 0.5 }];
  }
  function optionTextColor(i: number) {
    if (selected === null) return c.text;
    if (i === q.correctIndex || i === selected) return '#fff';
    return c.textSecondary;
  }

  // --- Yükleniyor ---
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.background }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  // --- Boş havuz ---
  if (questions.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: c.background, padding: 32, gap: 12 }]}>
        <Text style={{ fontSize: 56 }}>🎉</Text>
        <Text style={[styles.emptyTitle, { color: c.text }]}>Hiç yanlışın yok!</Text>
        <Text style={[styles.emptyText, { color: c.textSecondary }]}>
          Yanlış yaptığın sorular burada birikir ve onları tekrar çözerek pekiştirirsin. Şu an havuzun tertemiz.
        </Text>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: Colors.primary }]} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.primaryBtnText}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Bitiş özeti ---
  if (finished) {
    return (
      <View style={[styles.center, { backgroundColor: c.background, padding: 32, gap: 10 }]}>
        <Text style={{ fontSize: 56 }}>{cleared > 0 ? '🧠' : '💪'}</Text>
        <Text style={[styles.emptyTitle, { color: c.text }]}>Tekrar tamamlandı!</Text>
        <View style={[styles.summaryCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryVal, { color: Colors.success }]}>{cleared}</Text>
            <Text style={[styles.summaryLabel, { color: c.textSecondary }]}>Havuzdan çıktı</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: c.border }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryVal, { color: Colors.error }]}>{stillWrong}</Text>
            <Text style={[styles.summaryLabel, { color: c.textSecondary }]}>Hâlâ tekrar gerek</Text>
          </View>
        </View>
        <Text style={[styles.emptyText, { color: c.textSecondary }]}>
          Doğru cevapladığın sorular havuzdan çıkar. Yanlış kalanlar bir sonraki tekrarda yine karşına gelir.
        </Text>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: Colors.primary }]} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.primaryBtnText}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Soru ---
  const catColor = getCategoryColor(q.category);
  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.exitBtn, { color: c.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <View style={[styles.progressTrack, { backgroundColor: c.border }]}>
          <View style={[styles.progressFill, { width: `${(index / questions.length) * 100}%` }]} />
        </View>
        <Text style={[styles.counter, { color: c.textSecondary }]}>{index + 1}/{questions.length}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: catColor + '22' }]}>
            <Text style={[styles.badgeText, { color: catColor }]}>{getCategoryLabel(q.category)}</Text>
          </View>
          <Text style={[styles.reviewMode, { color: c.textSecondary }]}>📑 Tekrar modu</Text>
        </View>

        <Text style={[styles.question, { color: c.text }]}>{q.question}</Text>

        <View style={styles.options}>
          {q.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={optionStyle(i)}
              onPress={() => handleAnswer(i)}
              activeOpacity={0.85}
              disabled={selected !== null}
            >
              <View style={styles.optionLetter}>
                <Text style={styles.optionLetterText}>{String.fromCharCode(65 + i)}</Text>
              </View>
              <Text style={[styles.optionText, { color: optionTextColor(i) }]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selected !== null && (
          <>
            <View
              style={[
                styles.feedback,
                selected === q.correctIndex
                  ? { backgroundColor: Colors.success + '1A', borderColor: Colors.success }
                  : { backgroundColor: Colors.error + '1A', borderColor: Colors.error },
              ]}
            >
              <Text style={[styles.feedbackText, { color: selected === q.correctIndex ? Colors.success : Colors.error }]}>
                {selected === q.correctIndex ? '✓ Doğru! Bu soru havuzundan çıkarıldı.' : '✗ Yanlış — bir sonraki tekrarda yine gelecek.'}
              </Text>
            </View>

            {q.aciklama && (
              <View style={[styles.aciklama, { backgroundColor: Colors.primary + '12', borderColor: Colors.primary + '33' }]}>
                <Text style={[styles.aciklamaLabel, { color: Colors.primary }]}>💡 Açıklama</Text>
                <Text style={[styles.aciklamaText, { color: c.text }]}>{q.aciklama}</Text>
              </View>
            )}

            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: Colors.primary }]} onPress={next}>
              <Text style={styles.primaryBtnText}>{index + 1 >= questions.length ? 'Bitir' : 'Sonraki Soru →'}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12, marginBottom: 8 },
  exitBtn: { fontSize: 20, fontWeight: '600', width: 28 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  counter: { fontSize: 13, fontWeight: '600', width: 44, textAlign: 'right' },

  body: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40, gap: 16 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  reviewMode: { fontSize: 12, fontWeight: '600' },

  question: { fontSize: 20, fontWeight: '700', lineHeight: 30 },

  options: { gap: 12 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 1.5 },
  optionLetter: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  optionLetterText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  optionText: { flex: 1, fontSize: 15, fontWeight: '500' },

  feedback: { borderRadius: 14, borderWidth: 1, padding: 14 },
  feedbackText: { fontSize: 14, fontWeight: '700' },

  aciklama: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 6 },
  aciklamaLabel: { fontSize: 13, fontWeight: '800' },
  aciklamaText: { fontSize: 13, lineHeight: 20 },

  primaryBtn: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  emptyTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },

  summaryCard: { flexDirection: 'row', borderRadius: 20, borderWidth: 1, padding: 20, marginVertical: 4 },
  summaryRow: { flex: 1, alignItems: 'center', gap: 4 },
  summaryVal: { fontSize: 32, fontWeight: '900' },
  summaryLabel: { fontSize: 12, fontWeight: '600' },
  summaryDivider: { width: 1, marginHorizontal: 8 },
});
