import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Animated,
} from 'react-native';
import { useRef, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTopic, pickRandomTopicQuestions, TopicQuestion } from '../../constants/topics';
import { Colors } from '../../constants/colors';

type Mode = 'cards' | 'quiz-intro' | 'quiz' | 'result';

const TARIH = '#EF4444';

export default function TopicDetail() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const topic = id ? getTopic(id) : undefined;

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/(tabs)'));

  const [mode, setMode] = useState<Mode>('cards');
  const [cardIndex, setCardIndex] = useState(0);

  // Quiz oturumu için 5 rastgele soru — quiz başlarken seçilir
  const [quizSet, setQuizSet] = useState<TopicQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [openReview, setOpenReview] = useState<number | null>(null);

  // Kart geçiş animasyonu
  const fade = useRef(new Animated.Value(1)).current;

  // Topic yoksa erken çıkış
  if (!topic) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: c.background }]}>
        <Text style={[styles.notFound, { color: c.text }]}>Konu bulunamadı.</Text>
        <TouchableOpacity style={[styles.backChip, { borderColor: c.border }]} onPress={goBack}>
          <Text style={[styles.backChipText, { color: c.text }]}>← Geri</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isEmpty = topic.cards.length === 0;

  // "Yakında" durumu
  if (isEmpty) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: c.background }]}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goBack} hitSlop={12}>
            <Text style={[styles.exitBtn, { color: c.textSecondary }]}>←</Text>
          </TouchableOpacity>
          <View style={[styles.subjectBadge, { backgroundColor: TARIH + '22' }]}>
            <Text style={[styles.subjectText, { color: TARIH }]}>Tarih</Text>
          </View>
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.titleIcon}>{topic.icon}</Text>
          <Text style={[styles.title, { color: c.text }]}>{topic.title}</Text>
        </View>
        <View style={[styles.soonCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={styles.soonEmoji}>🚧</Text>
          <Text style={[styles.soonTitle, { color: c.text }]}>Bu konu yakında eklenecek</Text>
          <Text style={[styles.soonText, { color: c.textSecondary }]}>
            Bu ünitenin hap bilgileri ve mini quizi üzerinde çalışıyoruz.
          </Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: Colors.primary, marginTop: 16 }]}
            onPress={goBack}
          >
            <Text style={styles.primaryBtnText}>← Konulara Dön</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // KART AKIŞI
  function nextCard() {
    if (cardIndex + 1 >= topic!.cards.length) {
      setMode('quiz-intro');
      return;
    }
    Animated.sequence([
      Animated.timing(fade, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    setCardIndex((i) => i + 1);
  }
  function prevCard() {
    if (cardIndex === 0) return;
    Animated.sequence([
      Animated.timing(fade, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    setCardIndex((i) => i - 1);
  }

  // QUIZ
  function startQuiz() {
    const set = pickRandomTopicQuestions(topic!, 5);
    setQuizSet(set);
    setQIndex(0);
    setSelected(null);
    setAnswers([]);
    setCorrectCount(0);
    setOpenReview(null);
    setMode('quiz');
  }

  function handleAnswer(optIndex: number) {
    if (selected !== null) return;
    setSelected(optIndex);
    const q = quizSet[qIndex];
    const isCorrect = optIndex === q.correctIndex;
    setAnswers((a) => [...a, optIndex]);
    if (isCorrect) setCorrectCount((x) => x + 1);
    setTimeout(() => {
      if (qIndex + 1 >= quizSet.length) {
        setMode('result');
      } else {
        setSelected(null);
        setQIndex((x) => x + 1);
      }
    }, 850);
  }

  function getOptionStyle(i: number) {
    const q = quizSet[qIndex];
    if (selected === null) return [styles.option, { backgroundColor: c.card, borderColor: c.border }];
    if (i === q.correctIndex) return [styles.option, styles.optionCorrect];
    if (i === selected) return [styles.option, styles.optionWrong];
    return [styles.option, { backgroundColor: c.card, borderColor: c.border, opacity: 0.5 }];
  }
  function getOptionTextColor(i: number) {
    const q = quizSet[qIndex];
    if (selected === null) return c.text;
    if (i === q.correctIndex) return '#fff';
    if (i === selected) return '#fff';
    return c.textSecondary;
  }

  // ────────────────────── MODE: cards ──────────────────────
  if (mode === 'cards') {
    const progress = ((cardIndex + 1) / topic.cards.length) * 100;
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        {/* Üst bar */}
        <View style={styles.cardsTopBar}>
          <TouchableOpacity onPress={goBack} hitSlop={12}>
            <Text style={[styles.exitBtn, { color: c.textSecondary }]}>✕</Text>
          </TouchableOpacity>
          <View style={[styles.progressTrack, { backgroundColor: c.border }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: TARIH }]} />
          </View>
          <Text style={[styles.cardCounter, { color: c.textSecondary }]}>
            {cardIndex + 1}/{topic.cards.length}
          </Text>
        </View>

        <View style={[styles.subjectBadge, { backgroundColor: TARIH + '22', alignSelf: 'center', marginTop: 8 }]}>
          <Text style={[styles.subjectText, { color: TARIH }]}>{topic.title}</Text>
        </View>

        {/* Kart */}
        <View style={styles.cardArea}>
          <Animated.View
            style={[
              styles.bigCard,
              { backgroundColor: c.card, borderColor: c.border, opacity: fade },
            ]}
          >
            <Text style={styles.cardEmoji}>{topic.icon}</Text>
            <Text style={[styles.cardText, { color: c.text }]}>
              {topic.cards[cardIndex]}
            </Text>
          </Animated.View>
        </View>

        {/* Alt navigasyon */}
        <View style={styles.navBar}>
          <TouchableOpacity
            style={[
              styles.navBtn,
              { backgroundColor: c.card, borderColor: c.border, opacity: cardIndex === 0 ? 0.4 : 1 },
            ]}
            onPress={prevCard}
            disabled={cardIndex === 0}
            activeOpacity={0.85}
          >
            <Text style={[styles.navBtnText, { color: c.text }]}>← Önceki</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtnPrimary, { backgroundColor: TARIH }]}
            onPress={nextCard}
            activeOpacity={0.85}
          >
            <Text style={styles.navBtnPrimaryText}>
              {cardIndex + 1 >= topic.cards.length ? 'Bitir →' : 'Sonraki →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ────────────────────── MODE: quiz-intro ──────────────────────
  if (mode === 'quiz-intro') {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: c.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goBack} hitSlop={12}>
            <Text style={[styles.exitBtn, { color: c.textSecondary }]}>←</Text>
          </TouchableOpacity>
          <View style={[styles.subjectBadge, { backgroundColor: TARIH + '22' }]}>
            <Text style={[styles.subjectText, { color: TARIH }]}>Tarih</Text>
          </View>
        </View>

        <View style={[styles.introCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={styles.introEmoji}>🎯</Text>
          <Text style={[styles.introTitle, { color: c.text }]}>Kartlar Tamamlandı!</Text>
          <Text style={[styles.introText, { color: c.textSecondary }]}>
            "{topic.title}" konusuyla ilgili 5 soruluk mini quize katılmak ister misin? Sorular her seferinde değişir.
          </Text>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: TARIH }]}
            onPress={startQuiz}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Quize Başla →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: c.border }]}
            onPress={() => setCardIndex(0)}
            activeOpacity={0.85}
          >
            <Text style={[styles.secondaryBtnText, { color: c.text }]}>↻ Kartları Tekrar Gör</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={goBack} hitSlop={10}>
            <Text style={[styles.skipText, { color: c.textSecondary }]}>Şimdi Değil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ────────────────────── MODE: quiz ──────────────────────
  if (mode === 'quiz') {
    const q = quizSet[qIndex];
    const progress = ((qIndex + 1) / quizSet.length) * 100;
    return (
      <View style={[styles.container, { backgroundColor: c.background, paddingTop: 56 }]}>
        <View style={styles.quizHeader}>
          <TouchableOpacity onPress={() => setMode('quiz-intro')} hitSlop={12}>
            <Text style={[styles.exitBtn, { color: c.textSecondary }]}>✕</Text>
          </TouchableOpacity>
          <View style={[styles.progressTrack, { backgroundColor: c.border }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: TARIH }]} />
          </View>
          <Text style={[styles.cardCounter, { color: c.textSecondary }]}>
            {qIndex + 1}/{quizSet.length}
          </Text>
        </View>

        <View style={styles.body}>
          <View style={[styles.subjectBadge, { backgroundColor: TARIH + '22', alignSelf: 'flex-start' }]}>
            <Text style={[styles.subjectText, { color: TARIH }]}>{topic.title}</Text>
          </View>
          <Text style={[styles.question, { color: c.text }]}>{q.question}</Text>
          <View style={styles.options}>
            {q.options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={getOptionStyle(i)}
                onPress={() => handleAnswer(i)}
                activeOpacity={0.85}
                disabled={selected !== null}
              >
                <View
                  style={[
                    styles.optionLetter,
                    selected !== null && i === q.correctIndex && styles.optionLetterCorrect,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionLetterText,
                      selected !== null && i === q.correctIndex && { color: Colors.success },
                    ]}
                  >
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: getOptionTextColor(i) }]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  // ────────────────────── MODE: result ──────────────────────
  const percentage = quizSet.length ? Math.round((correctCount / quizSet.length) * 100) : 0;
  const emoji = percentage >= 80 ? '🏆' : percentage >= 60 ? '👍' : percentage >= 40 ? '📚' : '💪';
  const msg =
    percentage >= 80
      ? 'Mükemmel! Bu konuyu çok iyi biliyorsun.'
      : percentage >= 60
      ? 'İyi iş! Biraz daha çalışarak uzmanlaşırsın.'
      : 'Kartları tekrar gözden geçirip yeniden dene!';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: c.background }]}
      contentContainerStyle={{ paddingTop: 56, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.resultCard, { backgroundColor: TARIH }]}>
        <Text style={styles.resultEmoji}>{emoji}</Text>
        <Text style={styles.resultLabel}>{topic.title}</Text>
        <Text style={styles.resultTitle}>Mini Quiz Tamamlandı!</Text>
        <View style={styles.resultStats}>
          <View style={styles.resultStat}>
            <Text style={styles.resultStatValue}>{correctCount}/{quizSet.length}</Text>
            <Text style={styles.resultStatLabel}>Doğru</Text>
          </View>
          <View style={styles.resultStatDivider} />
          <View style={styles.resultStat}>
            <Text style={styles.resultStatValue}>%{percentage}</Text>
            <Text style={styles.resultStatLabel}>Başarı</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.resultMsg, { color: c.textSecondary }]}>{msg}</Text>

      <Text style={[styles.reviewTitle, { color: c.text }]}>Cevaplarını İncele</Text>
      <View style={styles.reviewList}>
        {quizSet.map((rq, i) => {
          const userAns = answers[i] ?? -1;
          const isCorrect = userAns === rq.correctIndex;
          const open = openReview === i;
          return (
            <View
              key={i}
              style={[styles.reviewItem, { backgroundColor: c.card, borderColor: c.border }]}
            >
              <TouchableOpacity
                style={styles.reviewHeader}
                onPress={() => setOpenReview(open ? null : i)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.reviewBadge,
                    { backgroundColor: isCorrect ? Colors.success : Colors.error },
                  ]}
                >
                  <Text style={styles.reviewBadgeText}>{isCorrect ? '✓' : '✗'}</Text>
                </View>
                <Text style={[styles.reviewQ, { color: c.text }]} numberOfLines={open ? undefined : 1}>
                  {i + 1}. {rq.question}
                </Text>
                <Text style={[styles.reviewChevron, { color: c.textSecondary }]}>
                  {open ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
              {open && (
                <View style={styles.reviewBody}>
                  {rq.options.map((opt, j) => {
                    const correctOpt = j === rq.correctIndex;
                    const wrongPick = j === userAns && userAns !== rq.correctIndex;
                    return (
                      <View
                        key={j}
                        style={[
                          styles.reviewOpt,
                          { borderColor: c.border },
                          correctOpt && {
                            backgroundColor: Colors.success + '1A',
                            borderColor: Colors.success,
                          },
                          wrongPick && {
                            backgroundColor: Colors.error + '1A',
                            borderColor: Colors.error,
                          },
                        ]}
                      >
                        <Text style={[styles.reviewOptText, { color: c.text }]}>
                          {String.fromCharCode(65 + j)}) {opt}
                        </Text>
                        {correctOpt && (
                          <Text style={[styles.reviewTag, { color: Colors.success }]}>
                            ✓ Doğru cevap
                          </Text>
                        )}
                        {wrongPick && (
                          <Text style={[styles.reviewTag, { color: Colors.error }]}>
                            Senin cevabın
                          </Text>
                        )}
                      </View>
                    );
                  })}
                  {rq.aciklama && (
                    <View
                      style={[
                        styles.reviewAciklama,
                        { backgroundColor: TARIH + '12', borderColor: TARIH + '33' },
                      ]}
                    >
                      <Text style={[styles.reviewAciklamaLabel, { color: TARIH }]}>💡 Açıklama</Text>
                      <Text style={[styles.reviewAciklamaText, { color: c.text }]}>
                        {rq.aciklama}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.resultActions}>
        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: c.border, flex: 1 }]}
          onPress={startQuiz}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryBtnText, { color: c.text }]}>↻ Yeni 5 Soru</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: TARIH, flex: 1 }]}
          onPress={goBack}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Konulara Dön</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40, gap: 20 },

  notFound: { fontSize: 16, fontWeight: '600' },
  backChip: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 10 },
  backChipText: { fontSize: 15, fontWeight: '600' },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exitBtn: { fontSize: 24, fontWeight: '700', width: 28 },
  subjectBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  subjectText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },

  titleBlock: { gap: 6 },
  titleIcon: { fontSize: 44 },
  title: { fontSize: 24, fontWeight: '800', lineHeight: 30 },

  soonCard: { borderRadius: 20, borderWidth: 1, padding: 28, alignItems: 'center', gap: 8 },
  soonEmoji: { fontSize: 44 },
  soonTitle: { fontSize: 17, fontWeight: '800' },
  soonText: { fontSize: 14, lineHeight: 21, textAlign: 'center' },

  // Kart akışı
  cardsTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 20,
    gap: 12,
  },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  cardCounter: { fontSize: 13, fontWeight: '700', width: 56, textAlign: 'right' },

  cardArea: { flex: 1, paddingHorizontal: 20, paddingTop: 24, justifyContent: 'center' },
  bigCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    gap: 18,
    minHeight: 280,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardEmoji: { fontSize: 36 },
  cardText: { fontSize: 19, lineHeight: 28, fontWeight: '500' },

  navBar: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 32,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  navBtnText: { fontSize: 15, fontWeight: '700' },
  navBtnPrimary: {
    flex: 1.4,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  navBtnPrimaryText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  // Quiz intro
  introCard: { borderRadius: 24, borderWidth: 1, padding: 28, alignItems: 'center', gap: 14 },
  introEmoji: { fontSize: 56 },
  introTitle: { fontSize: 22, fontWeight: '800' },
  introText: { fontSize: 14, lineHeight: 21, textAlign: 'center', paddingHorizontal: 8 },

  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: 8,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  secondaryBtn: {
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 24,
    alignItems: 'center',
    alignSelf: 'stretch',
    borderWidth: 1.5,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '700' },
  skipText: { fontSize: 13, fontWeight: '600', marginTop: 4, padding: 6 },

  // Quiz
  quizHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12 },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 24, gap: 16 },
  question: { fontSize: 19, fontWeight: '700', lineHeight: 28 },
  options: { gap: 12 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  optionCorrect: { backgroundColor: Colors.success, borderColor: Colors.success },
  optionWrong: { backgroundColor: Colors.error, borderColor: Colors.error },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterCorrect: { backgroundColor: 'rgba(255,255,255,0.3)' },
  optionLetterText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  optionText: { flex: 1, fontSize: 15, fontWeight: '500' },

  // Result
  resultCard: {
    margin: 20,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    gap: 6,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  resultEmoji: { fontSize: 52, marginBottom: 4 },
  resultLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  resultTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  resultStats: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 14,
    alignSelf: 'stretch',
  },
  resultStat: { alignItems: 'center', gap: 4, flex: 1 },
  resultStatValue: { fontSize: 22, fontWeight: '800', color: '#fff' },
  resultStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  resultStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  resultMsg: { textAlign: 'center', fontSize: 14, paddingHorizontal: 32, lineHeight: 21 },

  reviewTitle: { fontSize: 17, fontWeight: '800', marginHorizontal: 20, marginTop: 20, marginBottom: 10 },
  reviewList: { marginHorizontal: 20, gap: 10 },
  reviewItem: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  reviewBadge: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  reviewBadgeText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  reviewQ: { flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 20 },
  reviewChevron: { fontSize: 12, marginLeft: 4 },
  reviewBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 8 },
  reviewOpt: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, gap: 4 },
  reviewOptText: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  reviewTag: { fontSize: 12, fontWeight: '700' },
  reviewAciklama: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 6, marginTop: 4 },
  reviewAciklamaLabel: { fontSize: 13, fontWeight: '800' },
  reviewAciklamaText: { fontSize: 13, lineHeight: 20 },

  resultActions: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginTop: 20 },
});
