// Düello soru koşucusu — 5 soru, 30sn/soru, hız bonusu.
// Hem meydan okuyan (yeni düello) hem rakip (kabul) aynı bileşeni kullanır.

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Animated,
  Alert,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Question } from '../constants/questions';
import { Colors } from '../constants/colors';
import { calculateScore, getCategoryLabel, getCategoryColor } from '../lib/quiz';
import { DuelSideResult } from '../lib/duels';

const QUESTION_TIME = 30;

interface Props {
  questions: Question[];
  onFinish: (result: DuelSideResult) => void;
  onExit: () => void;
}

export default function DuelRunner({ questions, onFinish, onExit }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);

  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const timeMsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;

  const q = questions[index];

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
    setSelected((cur) => {
      if (cur !== null) return cur;
      timeMsRef.current += QUESTION_TIME * 1000;
      setTimeout(() => nextQuestion(), 1000);
      return -1;
    });
  }

  function handleAnswer(optIndex: number) {
    if (selected !== null) return;
    clearTimer();
    setSelected(optIndex);

    const isCorrect = optIndex === q.correctIndex;
    Haptics.notificationAsync(
      isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});

    timeMsRef.current += (QUESTION_TIME - timeLeft) * 1000;
    if (isCorrect) {
      correctRef.current += 1;
      scoreRef.current += calculateScore(true, timeLeft, QUESTION_TIME);
    }

    setTimeout(() => nextQuestion(), 900);
  }

  function nextQuestion() {
    const next = index + 1;
    if (next >= questions.length) {
      onFinish({
        score: scoreRef.current,
        correct: correctRef.current,
        timeMs: timeMsRef.current,
      });
    } else {
      setSelected(null);
      setIndex(next);
    }
  }

  function confirmExit() {
    clearTimer();
    Alert.alert('Düellodan Çık', 'İlerlemen kaydedilmeyecek. Çıkmak istiyor musun?', [
      { text: 'Devam Et', onPress: startTimer },
      { text: 'Çık', style: 'destructive', onPress: onExit },
    ]);
  }

  function getOptionStyle(i: number) {
    if (selected === null) return [styles.option, { backgroundColor: c.card, borderColor: c.border }];
    if (i === q.correctIndex) return [styles.option, styles.optionCorrect];
    if (i === selected && selected !== q.correctIndex) return [styles.option, styles.optionWrong];
    return [styles.option, { backgroundColor: c.card, borderColor: c.border, opacity: 0.5 }];
  }

  function getOptionTextColor(i: number) {
    if (selected === null) return c.text;
    if (i === q.correctIndex || (i === selected && selected !== q.correctIndex)) return '#fff';
    return c.textSecondary;
  }

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.progressHeader}>
        <TouchableOpacity onPress={confirmExit}>
          <Text style={[styles.exitBtn, { color: c.textSecondary }]}>✕</Text>
        </TouchableOpacity>
        <View style={[styles.progressTrack, { backgroundColor: c.border }]}>
          <View style={[styles.progressFill, { width: `${(index / questions.length) * 100}%` }]} />
        </View>
        <Text style={[styles.questionCounter, { color: c.textSecondary }]}>
          {index + 1}/{questions.length}
        </Text>
      </View>

      <View style={styles.timerRow}>
        <Animated.View
          style={[
            styles.timerBar,
            {
              width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              backgroundColor: timeLeft <= 10 ? Colors.error : Colors.primary,
            },
          ]}
        />
      </View>

      <View style={styles.body}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(q.category) + '22' }]}>
          <Text style={[styles.categoryText, { color: getCategoryColor(q.category) }]}>
            ⚔️ {getCategoryLabel(q.category)}
          </Text>
        </View>

        <Text style={[styles.timer, { color: timeLeft <= 10 ? Colors.error : c.textSecondary }]}>
          ⏱ {timeLeft}s
        </Text>

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
  timerRow: { height: 4, marginHorizontal: 20, borderRadius: 2, overflow: 'hidden' },
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
});
