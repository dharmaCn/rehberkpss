import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Animated,
  Alert,
} from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { getAuthSync } from '../../lib/firebase';
import { saveQuizResult, logWrongQuestion, SaveResultOutcome } from '../../lib/firestore';
import { getDailyQuestions, calculateScore, getCategoryLabel, getCategoryColor, getTodayKey } from '../../lib/quiz';
import { recordQuizCompletedAndMaybePrompt } from '../../lib/review';
import { Question } from '../../constants/questions';
import { Colors } from '../../constants/colors';
import { BADGES, BadgeId } from '../../lib/badges';
import { captureAndShare, buildChallengeUrl } from '../../lib/share';
import { markShareMission } from '../../lib/firestore';

const QUESTION_TIME = 30;

export default function QuizSession() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const router = useRouter();

  const questions = useMemo(() => getDailyQuestions(), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [totalScore, setTotalScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]); // her sorunun verilen cevabı (-1 = süre doldu)
  const [openReview, setOpenReview] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<SaveResultOutcome | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const shareCardRef = useRef<View | null>(null);

  const q: Question = questions[index];

  useEffect(() => {
    startTimer();
    animateProgress();
    return () => clearTimer();
  }, [index]);

  function startTimer() {
    setTimeLeft(QUESTION_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearTimer();
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function clearTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function animateProgress() {
    progressAnim.setValue(1);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: QUESTION_TIME * 1000,
      useNativeDriver: false,
    }).start();
  }

  function handleTimeout() {
    if (selected !== null) return;
    setSelected(-1); // hiçbiri seçilmedi
    setAnswers((a) => [...a, -1]);
    setTimeout(() => nextQuestion(0, 0), 1000);
  }

  function handleAnswer(optIndex: number) {
    if (selected !== null) return;
    clearTimer();
    setSelected(optIndex);
    setAnswers((a) => [...a, optIndex]);

    const isCorrect = optIndex === q.correctIndex;
    Haptics.notificationAsync(
      isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});

    if (!isCorrect) {
      const u = getAuthSync()?.currentUser ?? null;
      if (u) logWrongQuestion(u.uid, q.id).catch(() => {});
    }

    const pts = isCorrect ? calculateScore(true, timeLeft, QUESTION_TIME) : 0;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    const newScore = totalScore + pts;

    setCorrectCount(newCorrect);
    setTotalScore(newScore);

    setTimeout(() => nextQuestion(pts, newCorrect), 900);
  }

  async function nextQuestion(lastPts: number, corrects: number) {
    const next = index + 1;
    if (next >= questions.length) {
      setFinished(true);
      await saveResult(totalScore + lastPts, corrects);
    } else {
      setSelected(null);
      setIndex(next);
    }
  }

  async function saveResult(score: number, corrects: number) {
    const user = getAuthSync()?.currentUser ?? null;
    if (!user) return;
    setSaving(true);
    try {
      const res = await saveQuizResult(user, score, corrects, questions.length);
      setOutcome(res);
      if (res.newBadges.length > 0) {
        setTimeout(() => setShowBadgeModal(true), 600);
      }
    } catch {
      // Sonuç kaydedilemese de ekran gösterilir
    } finally {
      setSaving(false);
    }
    setTimeout(() => { recordQuizCompletedAndMaybePrompt(); }, 800);
  }

  async function handleShare() {
    const user = getAuthSync()?.currentUser ?? null;
    if (!user) return;
    const today = getTodayKey();
    const url = buildChallengeUrl(user.uid, totalScore, today);
    const ok = await captureAndShare(shareCardRef, `${totalScore} puan yaptım — beni geçebilir misin? ${url}`);
    if (ok) {
      await markShareMission(user.uid).catch(() => {});
    }
  }

  function getOptionStyle(i: number) {
    if (selected === null) return [styles.option, { backgroundColor: c.card, borderColor: c.border }];
    if (i === q.correctIndex) return [styles.option, styles.optionCorrect];
    if (i === selected && selected !== q.correctIndex) return [styles.option, styles.optionWrong];
    return [styles.option, { backgroundColor: c.card, borderColor: c.border, opacity: 0.5 }];
  }

  function getOptionTextColor(i: number) {
    if (selected === null) return c.text;
    if (i === q.correctIndex) return '#fff';
    if (i === selected && selected !== q.correctIndex) return '#fff';
    return c.textSecondary;
  }

  if (finished) {
    const percentage = Math.round((correctCount / questions.length) * 100);
    const emoji = percentage >= 80 ? '🏆' : percentage >= 60 ? '👍' : percentage >= 40 ? '📚' : '💪';

    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: c.background }}
        contentContainerStyle={styles.resultScrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.homeBtnTop}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.7}
        >
          <Ionicons name="home" size={16} color={Colors.primary} />
          <Text style={styles.homeBtnTopText}>Ana Sayfa</Text>
        </TouchableOpacity>

        <View ref={shareCardRef} collapsable={false} style={[styles.resultCard, { backgroundColor: Colors.primary }]}>
          <Text style={styles.resultEmoji}>{emoji}</Text>
          <Text style={styles.resultTitle}>Quiz Tamamlandı!</Text>
          <Text style={styles.resultScore}>{totalScore}</Text>
          <Text style={styles.resultScoreLabel}>toplam puan</Text>

          <View style={styles.resultStats}>
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>{correctCount}/{questions.length}</Text>
              <Text style={styles.resultStatLabel}>Doğru</Text>
            </View>
            <View style={styles.resultStatDivider} />
            <View style={styles.resultStat}>
              <Text style={styles.resultStatValue}>%{percentage}</Text>
              <Text style={styles.resultStatLabel}>Başarı</Text>
            </View>
          </View>
          <Text style={styles.shareWatermark}>KPSS Quiz · {getTodayKey()}</Text>
        </View>

        {outcome?.percentile !== undefined && outcome.percentile >= 10 && (
          <View style={[styles.percentileChip, { backgroundColor: Colors.success + '22' }]}>
            <Ionicons name="trending-up" size={16} color={Colors.success} />
            <Text style={[styles.percentileText, { color: Colors.success }]}>
              Bugün kullanıcıların %{outcome.percentile}'inden iyisin 🎯
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.shareBtn, { backgroundColor: c.card, borderColor: Colors.primary }]}
          onPress={handleShare}
          activeOpacity={0.85}
        >
          <Ionicons name="share-social" size={18} color={Colors.primary} />
          <Text style={[styles.shareBtnText, { color: Colors.primary }]}>Sonucu Paylaş — Beni Geçebilir Misin?</Text>
        </TouchableOpacity>

        <Text style={[styles.resultMsg, { color: c.textSecondary }]}>
          {percentage >= 80
            ? 'Mükemmel! Bugün çok iyiydin.'
            : percentage >= 60
            ? 'İyi iş! Biraz daha çalışınca zirvedesin.'
            : 'Yarın daha iyisini yapacaksın!'}
        </Text>

        {/* Cevap inceleme */}
        <Text style={[styles.reviewTitle, { color: c.text }]}>Cevaplarını İncele</Text>
        <Text style={[styles.reviewHint, { color: c.textSecondary }]}>
          Bir soruya dokunarak doğru cevabı ve açıklamasını gör.
        </Text>

        <View style={styles.reviewList}>
          {questions.map((rq, i) => {
            const userAns = answers[i] ?? -1;
            const isCorrect = userAns === rq.correctIndex;
            const open = openReview === i;
            return (
              <View key={rq.id} style={[styles.reviewItem, { backgroundColor: c.card, borderColor: c.border }]}>
                <TouchableOpacity
                  style={styles.reviewHeader}
                  onPress={() => setOpenReview(open ? null : i)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.reviewBadge, { backgroundColor: isCorrect ? Colors.success : Colors.error }]}>
                    <Text style={styles.reviewBadgeText}>{isCorrect ? '✓' : '✗'}</Text>
                  </View>
                  <Text style={[styles.reviewQ, { color: c.text }]} numberOfLines={open ? undefined : 1}>
                    {i + 1}. {rq.question}
                  </Text>
                  <Text style={[styles.reviewChevron, { color: c.textSecondary }]}>{open ? '▲' : '▼'}</Text>
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
                            correctOpt && { backgroundColor: Colors.success + '1A', borderColor: Colors.success },
                            wrongPick && { backgroundColor: Colors.error + '1A', borderColor: Colors.error },
                          ]}
                        >
                          <Text style={[styles.reviewOptText, { color: c.text }]}>
                            {String.fromCharCode(65 + j)}) {opt}
                          </Text>
                          {correctOpt && <Text style={[styles.reviewTag, { color: Colors.success }]}>✓ Doğru cevap</Text>}
                          {wrongPick && <Text style={[styles.reviewTag, { color: Colors.error }]}>Senin cevabın</Text>}
                        </View>
                      );
                    })}

                    {userAns === -1 && (
                      <Text style={[styles.reviewTimeout, { color: c.textSecondary }]}>⏱ Süre doldu — bu soruyu cevaplamadın.</Text>
                    )}

                    {rq.aciklama && (
                      <View style={[styles.reviewAciklama, { backgroundColor: Colors.primary + '12', borderColor: Colors.primary + '33' }]}>
                        <Text style={[styles.reviewAciklamaLabel, { color: Colors.primary }]}>💡 Açıklama</Text>
                        <Text style={[styles.reviewAciklamaText, { color: c.text }]}>{rq.aciklama}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.homeBtn, { backgroundColor: Colors.primary }]}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={styles.homeBtnText}>Ana Sayfaya Dön</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.leaderBtn, { borderColor: c.border }]}
          onPress={() => router.replace('/(tabs)/leaderboard')}
          activeOpacity={0.85}
        >
          <Text style={[styles.leaderBtnText, { color: c.text }]}>Sıralamayı Gör 🏆</Text>
        </TouchableOpacity>

        {/* Rozet açma modal'ı */}
        {showBadgeModal && outcome && outcome.newBadges.length > 0 && (
          <View style={styles.badgeOverlay}>
            <View style={[styles.badgeModal, { backgroundColor: c.card }]}>
              <Text style={styles.badgeEmoji}>🎉</Text>
              <Text style={[styles.badgeTitleBig, { color: c.text }]}>
                {outcome.newBadges.length > 1 ? 'Yeni Rozetler!' : 'Yeni Rozet!'}
              </Text>
              <View style={styles.badgeList}>
                {outcome.newBadges.map((id) => {
                  const def = BADGES[id as BadgeId];
                  if (!def) return null;
                  return (
                    <View key={id} style={styles.badgeChip}>
                      <View style={[styles.badgeChipIcon, { backgroundColor: def.color + '22' }]}>
                        <Ionicons name={def.icon as never} size={24} color={def.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.badgeChipTitle, { color: c.text }]}>{def.title}</Text>
                        <Text style={[styles.badgeChipDesc, { color: c.textSecondary }]}>{def.description}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
              <TouchableOpacity
                style={[styles.badgeCloseBtn, { backgroundColor: Colors.primary }]}
                onPress={() => setShowBadgeModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.badgeCloseText}>Devam</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Progress bar */}
      <View style={styles.progressHeader}>
        <TouchableOpacity onPress={() => {
          clearTimer();
          Alert.alert('Quiz\'den Çık', 'İlerlemeniz kaydedilmeyecek. Çıkmak istiyor musunuz?', [
            { text: 'Devam Et', onPress: startTimer },
            { text: 'Çık', style: 'destructive', onPress: () => router.back() },
          ]);
        }}>
          <Text style={[styles.exitBtn, { color: c.textSecondary }]}>✕</Text>
        </TouchableOpacity>

        <View style={[styles.progressTrack, { backgroundColor: c.border }]}>
          <View style={[styles.progressFill, { width: `${((index) / questions.length) * 100}%` }]} />
        </View>

        <Text style={[styles.questionCounter, { color: c.textSecondary }]}>
          {index + 1}/{questions.length}
        </Text>
      </View>

      {/* Timer */}
      <View style={styles.timerRow}>
        <Animated.View
          style={[
            styles.timerBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: timeLeft <= 10 ? Colors.error : Colors.primary,
            },
          ]}
        />
      </View>

      <View style={styles.body}>
        {/* Kategori etiketi */}
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(q.category) + '22' }]}>
          <Text style={[styles.categoryText, { color: getCategoryColor(q.category) }]}>
            {getCategoryLabel(q.category)}
          </Text>
        </View>

        {/* Süre */}
        <Text style={[styles.timer, { color: timeLeft <= 10 ? Colors.error : c.textSecondary }]}>
          ⏱ {timeLeft}s
        </Text>

        {/* Soru */}
        <Text style={[styles.question, { color: c.text }]}>{q.question}</Text>

        {/* Seçenekler */}
        <View style={styles.options}>
          {q.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={getOptionStyle(i)}
              onPress={() => handleAnswer(i)}
              activeOpacity={0.85}
              disabled={selected !== null}
            >
              <View style={[styles.optionLetter, selected !== null && i === q.correctIndex && styles.optionLetterCorrect]}>
                <Text style={[styles.optionLetterText, selected !== null && i === q.correctIndex && { color: Colors.success }]}>
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

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56 },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 8,
  },
  exitBtn: { fontSize: 20, fontWeight: '600', width: 32 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  questionCounter: { fontSize: 13, fontWeight: '600', width: 40, textAlign: 'right' },

  timerRow: { height: 4, backgroundColor: 'transparent', marginHorizontal: 20, borderRadius: 2, overflow: 'hidden' },
  timerBar: { height: 4, borderRadius: 2 },

  body: { flex: 1, paddingHorizontal: 20, paddingTop: 24, gap: 16 },

  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  categoryText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  timer: { fontSize: 15, fontWeight: '600' },

  question: { fontSize: 20, fontWeight: '700', lineHeight: 30 },

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

  // Result screen
  resultCard: {
    margin: 20,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  resultEmoji: { fontSize: 56, marginBottom: 8 },
  resultTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  resultScore: { fontSize: 56, fontWeight: '900', color: '#fff', lineHeight: 64 },
  resultScoreLabel: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  resultStats: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
  },
  resultStat: { alignItems: 'center', gap: 4, flex: 1 },
  resultStatValue: { fontSize: 20, fontWeight: '800', color: '#fff' },
  resultStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  resultStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },

  resultMsg: { textAlign: 'center', fontSize: 15, paddingHorizontal: 32, lineHeight: 22 },

  homeBtn: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  homeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  homeBtnTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  homeBtnTopText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
  leaderBtn: {
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  leaderBtnText: { fontSize: 15, fontWeight: '600' },

  // Sonuç ekranı scroll + cevap inceleme
  resultScrollContent: { paddingTop: 56, paddingBottom: 40 },
  reviewTitle: { fontSize: 18, fontWeight: '800', marginHorizontal: 20, marginTop: 24 },
  reviewHint: { fontSize: 13, marginHorizontal: 20, marginTop: 4, marginBottom: 12 },
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
  reviewTimeout: { fontSize: 13, fontStyle: 'italic', marginTop: 2 },
  reviewAciklama: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 6, marginTop: 4 },
  reviewAciklamaLabel: { fontSize: 13, fontWeight: '800' },
  reviewAciklamaText: { fontSize: 13, lineHeight: 20 },

  shareWatermark: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', marginTop: 16, letterSpacing: 1 },
  percentileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  percentileText: { fontSize: 13, fontWeight: '700' },
  shareBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  shareBtnText: { fontSize: 14, fontWeight: '800' },

  badgeOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  badgeModal: { borderRadius: 22, padding: 24, alignItems: 'center', gap: 12 },
  badgeEmoji: { fontSize: 52 },
  badgeTitleBig: { fontSize: 20, fontWeight: '800' },
  badgeList: { alignSelf: 'stretch', gap: 10 },
  badgeChip: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badgeChipIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  badgeChipTitle: { fontSize: 14, fontWeight: '800' },
  badgeChipDesc: { fontSize: 12, marginTop: 2 },
  badgeCloseBtn: { alignSelf: 'stretch', paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  badgeCloseText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
