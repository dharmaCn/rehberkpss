import { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuthSync } from '../lib/firebase';
import { reportQuestion, QuestionReportReason } from '../lib/firestore';
import { Colors } from '../constants/colors';

interface ReportQuestionButtonProps {
  questionId: string;
  category: string;
  question: string;
  userAnswerIndex: number;
  correctIndex: number;
}

export default function ReportQuestionButton({
  questionId,
  category,
  question,
  userAnswerIndex,
  correctIndex,
}: ReportQuestionButtonProps) {
  const [reported, setReported] = useState(false);
  const [sending, setSending] = useState(false);

  async function submit(reason: QuestionReportReason) {
    const uid = getAuthSync()?.currentUser?.uid;
    if (!uid || sending) return;
    setSending(true);
    try {
      await reportQuestion({ uid, questionId, category, question, userAnswerIndex, correctIndex, reason });
      setReported(true);
      Alert.alert('Teşekkürler', 'Bildirimin alındı, kontrol edilecek.');
    } catch {
      Alert.alert('Hata', 'Bildirim gönderilemedi, tekrar dener misin?');
    } finally {
      setSending(false);
    }
  }

  function handlePress() {
    Alert.alert('Bu soruyu bildir', 'Sorunu en iyi tanımlayan seçeneği seç.', [
      { text: 'Cevap yanlış görünüyor', onPress: () => submit('wrong_answer') },
      { text: 'Soru/açıklama hatalı', onPress: () => submit('other') },
      { text: 'Vazgeç', style: 'cancel' },
    ]);
  }

  if (reported) {
    return (
      <TouchableOpacity disabled style={[styles.chip, styles.chipDone]}>
        <Ionicons name="checkmark-circle" size={15} color={Colors.success} />
        <Text style={[styles.chipText, { color: Colors.success }]}>Bildirildi, teşekkürler</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} disabled={sending} hitSlop={8} style={[styles.chip, styles.chipDefault]} activeOpacity={0.75}>
      <Ionicons name="bulb-outline" size={15} color="#B45309" />
      <Text style={[styles.chipText, { color: '#B45309' }]}>Bu soruyu bildir</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipDefault: {
    backgroundColor: '#FDF1DE',
    borderColor: '#F59E0B55',
  },
  chipDone: {
    backgroundColor: Colors.success + '15',
    borderColor: Colors.success + '40',
  },
  chipText: { fontSize: 12.5, fontWeight: '700' },
});
