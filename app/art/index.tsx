import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { getAuthSync } from '../../lib/firebase';
import { recordArtAnswer, hasAnsweredDailyArt, ArtStat } from '../../lib/firestore';
import {
  ART_QUESTIONS,
  ArtQuestion,
  ArtDifficulty,
  getDailyArtQuestion,
  getArtByDifficulty,
  pickArtTest,
  ART_DIFFICULTY_LABELS,
} from '../../constants/artworks';
import { Colors } from '../../constants/colors';

type Mode = 'home' | 'quiz' | 'result';

const DIFF_COLORS: Record<ArtDifficulty, string> = {
  kolay: '#10B981',
  orta: '#F59E0B',
  zor: '#EF4444',
};

export default function ArtScreen() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const params = useLocalSearchParams<{ daily?: string }>();
  const isDaily = params.daily === '1';
  const user = getAuthSync()?.currentUser ?? null;

  const dailyQ = useMemo(() => getDailyArtQuestion(), []);

  const [mode, setMode] = useState<Mode>(isDaily ? 'quiz' : 'home');
  const [quizSet, setQuizSet] = useState<ArtQuestion[]>(isDaily ? [dailyQ] : []);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [stat, setStat] = useState<ArtStat | null>(null);
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  // Günün sorusu daha önce cevaplanmışsa "Sonucu Gör" ekranını salt-okunur aç —
  // yoksa selected null başladığı için soru tekrar işaretlenebilir hale geliyordu.
  useEffect(() => {
    if (!isDaily || !user) return;
    let cancelled = false;
    hasAnsweredDailyArt(user.uid, dailyQ.id).then((answered) => {
      if (!cancelled && answered) {
        setSelected(dailyQ.correctIndex);
        setImgLoading(true);
      }
    });
    return () => { cancelled = true; };
  }, [isDaily, user, dailyQ]);

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  function startTest(difficulty: ArtDifficulty) {
    const set = pickArtTest(difficulty, 5);
    if (set.length === 0) return;
    setQuizSet(set);
    setQIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setAnswers([]);
    setStat(null);
    setImgError(false);
    setImgLoading(true);
    setMode('quiz');
  }

  async function handleAnswer(optIndex: number) {
    if (selected !== null) return;
    const q = quizSet[qIndex];
    const isCorrect = optIndex === q.correctIndex;
    setSelected(optIndex);
    setAnswers((a) => [...a, optIndex]);
    if (isCorrect) setCorrectCount((n) => n + 1);
    Haptics.notificationAsync(
      isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});

    // Sosyal kanıt: sayaç güncelle + oranı çek
    if (user) {
      const s = await recordArtAnswer(user.uid, q.id, isCorrect);
      setStat(s);
    }
  }

  function next() {
    const n = qIndex + 1;
    if (n >= quizSet.length) {
      setMode('result');
    } else {
      setQIndex(n);
      setSelected(null);
      setStat(null);
      setImgError(false);
      setImgLoading(true);
    }
  }

  // ───────── QUIZ ─────────
  if (mode === 'quiz') {
    const q = quizSet[qIndex];
    const answered = selected !== null;
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: c.background }}
        contentContainerStyle={styles.quizContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.quizHeader}>
          <TouchableOpacity onPress={goBack} hitSlop={12}>
            <Ionicons name="close" size={26} color={c.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.counter, { color: c.textSecondary }]}>
            {isDaily ? 'Günün Eseri' : `${qIndex + 1}/${quizSet.length}`}
          </Text>
          <View style={{ width: 26 }} />
        </View>

        {/* Görsel (resim sorularında) */}
        {q.image && !imgError && (
          <View style={[styles.imageWrap, { backgroundColor: c.card, borderColor: c.border }]}>
            {imgLoading && (
              <View style={styles.imageLoading}>
                <ActivityIndicator color={Colors.primary} />
              </View>
            )}
            <Image
              source={{ uri: q.image }}
              style={styles.image}
              resizeMode="contain"
              onLoadEnd={() => setImgLoading(false)}
              onError={() => { setImgError(true); setImgLoading(false); }}
            />
          </View>
        )}
        {q.image && imgError && (
          <View style={[styles.imageWrap, styles.imageFallback, { backgroundColor: c.card, borderColor: c.border }]}>
            <Ionicons name="image-outline" size={40} color={c.textSecondary} />
            <Text style={[styles.imageFallbackText, { color: c.textSecondary }]}>Görsel yüklenemedi</Text>
          </View>
        )}

        <Text style={[styles.prompt, { color: c.text }]}>{q.prompt}</Text>

        <View style={styles.options}>
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correctIndex;
            const isPicked = i === selected;
            const bg = answered && isCorrect ? Colors.success
              : answered && isPicked && !isCorrect ? Colors.error
              : c.card;
            const bord = answered && isCorrect ? Colors.success
              : answered && isPicked && !isCorrect ? Colors.error
              : c.border;
            const txt = answered && (isCorrect || isPicked) ? '#fff' : c.text;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => handleAnswer(i)}
                disabled={answered}
                activeOpacity={0.85}
                style={[styles.option, { backgroundColor: bg, borderColor: bord }]}
              >
                <Text style={[styles.optionLetter, { color: txt }]}>{String.fromCharCode(65 + i)}</Text>
                <Text style={[styles.optionText, { color: txt }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {answered && (
          <>
            {/* Sosyal kanıt */}
            {stat && stat.total > 0 && (
              <View style={[styles.statChip, { backgroundColor: Colors.primary + '14' }]}>
                <Ionicons name="people" size={16} color={Colors.primary} />
                <Text style={[styles.statText, { color: Colors.primary }]}>
                  Katılanların %{stat.percentCorrect}'i doğru bildi
                  {stat.total >= 1 ? ` (${stat.total} kişi çözdü)` : ''}
                </Text>
              </View>
            )}

            {/* Bilgi kartı */}
            <View style={[styles.infoCard, { backgroundColor: Colors.primary + '12', borderColor: Colors.primary + '33' }]}>
              <View style={styles.infoHead}>
                <Ionicons name="bulb" size={18} color={Colors.primary} />
                <Text style={[styles.infoLabel, { color: Colors.primary }]}>Bunu Unutma</Text>
              </View>
              <Text style={[styles.infoText, { color: c.text }]}>{q.info}</Text>
            </View>

            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: Colors.primary }]}
              onPress={isDaily ? goBack : next}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>
                {isDaily ? 'Tamam' : qIndex + 1 >= quizSet.length ? 'Sonucu Gör' : 'Sıradaki Soru →'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    );
  }

  // ───────── RESULT ─────────
  if (mode === 'result') {
    const pct = Math.round((correctCount / quizSet.length) * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : pct >= 40 ? '📚' : '💪';
    return (
      <View style={[styles.center, { backgroundColor: c.background, paddingHorizontal: 24 }]}>
        <Text style={{ fontSize: 64 }}>{emoji}</Text>
        <Text style={[styles.resultTitle, { color: c.text }]}>{correctCount}/{quizSet.length} doğru</Text>
        <Text style={[styles.resultSub, { color: c.textSecondary }]}>%{pct} başarı</Text>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: Colors.primary, alignSelf: 'stretch', marginTop: 24 }]}
          onPress={() => setMode('home')}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>Yeni Test</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.homeBtn, { borderColor: c.border }]}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={[styles.homeBtnText, { color: c.text }]}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ───────── HOME (bank) ─────────
  const counts: Record<ArtDifficulty, number> = {
    kolay: getArtByDifficulty('kolay').length,
    orta: getArtByDifficulty('orta').length,
    zor: getArtByDifficulty('zor').length,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={styles.homeContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.homeHeader}>
        <TouchableOpacity onPress={goBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={c.text} />
        </TouchableOpacity>
        <Text style={[styles.homeTitle, { color: c.text }]}>Genel Kültür & Güncel Bilgiler</Text>
        <View style={{ width: 26 }} />
      </View>

      <Text style={[styles.homeSub, { color: c.textSecondary }]}>
        Ünlü eserler, ressamlar, yazarlar ve sanatçılar. Her test 5 soru, farklı zorlukta.
      </Text>

      <View style={{ gap: 12 }}>
        {(['kolay', 'orta', 'zor'] as ArtDifficulty[]).map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.testCard, { backgroundColor: c.card, borderColor: c.border }]}
            onPress={() => startTest(d)}
            activeOpacity={0.85}
          >
            <View style={[styles.testDot, { backgroundColor: DIFF_COLORS[d] }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.testTitle, { color: c.text }]}>{ART_DIFFICULTY_LABELS[d]}</Text>
              <Text style={[styles.testMeta, { color: c.textSecondary }]}>{counts[d]} soru havuzu • 5 soruluk test</Text>
            </View>
            <View style={[styles.testStart, { backgroundColor: DIFF_COLORS[d] }]}>
              <Text style={styles.testStartText}>Başla</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.poolInfo, { color: c.textSecondary }]}>
        Toplam {ART_QUESTIONS.length} soru • görsel destekli
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  quizContent: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  quizHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  counter: { fontSize: 14, fontWeight: '700' },

  imageWrap: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', height: 280, justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  imageLoading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  imageFallback: { alignItems: 'center', justifyContent: 'center', gap: 8 },
  imageFallbackText: { fontSize: 13 },

  prompt: { fontSize: 19, fontWeight: '700', lineHeight: 27 },

  options: { gap: 12 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 14, borderWidth: 1.5 },
  optionLetter: { fontSize: 15, fontWeight: '800', width: 22 },
  optionText: { flex: 1, fontSize: 15, fontWeight: '500' },

  statChip: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12, borderRadius: 12 },
  statText: { fontSize: 13, fontWeight: '700', flex: 1 },

  infoCard: { borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 6 },
  infoHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoLabel: { fontSize: 13, fontWeight: '800' },
  infoText: { fontSize: 14, lineHeight: 21 },

  nextBtn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  resultTitle: { fontSize: 24, fontWeight: '800', marginTop: 12 },
  resultSub: { fontSize: 15, marginTop: 4 },
  homeBtn: { alignSelf: 'stretch', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, marginTop: 10 },
  homeBtnText: { fontSize: 15, fontWeight: '700' },

  homeContent: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  homeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  homeTitle: { fontSize: 17, fontWeight: '800', flex: 1, textAlign: 'center' },
  homeSub: { fontSize: 13, lineHeight: 19 },
  testCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 1 },
  testDot: { width: 10, height: 40, borderRadius: 5 },
  testTitle: { fontSize: 16, fontWeight: '800' },
  testMeta: { fontSize: 12, marginTop: 2 },
  testStart: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7 },
  testStartText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  poolInfo: { fontSize: 12, textAlign: 'center', marginTop: 4 },
});
