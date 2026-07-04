import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { recordArtAnswer, ArtStat } from '../lib/firestore';
import { ArtQuestion } from '../constants/artworks';
import { Colors } from '../constants/colors';

interface Props {
  visible: boolean;
  question: ArtQuestion;
  uid: string | null;
  onClose: () => void;
  onAnswered?: () => void;
}

/**
 * Girişte günde bir kez açılan "Günün Genel Kültür Sorusu" modalı.
 * Kullanıcı görseli görür, şıkkı seçer; cevap sonrası sosyal kanıt (%) ve
 * "Bunu Unutma" bilgi kartı gösterilir.
 */
export default function DailyCultureModal({ visible, question, uid, onClose, onAnswered }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;

  const [selected, setSelected] = useState<number | null>(null);
  const [stat, setStat] = useState<ArtStat | null>(null);
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);

  const answered = selected !== null;

  async function handleAnswer(optIndex: number) {
    if (selected !== null) return;
    const isCorrect = optIndex === question.correctIndex;
    setSelected(optIndex);
    Haptics.notificationAsync(
      isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    ).catch(() => {});
    if (uid) {
      const s = await recordArtAnswer(uid, question.id, isCorrect);
      setStat(s);
      onAnswered?.();
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: c.background }]}>
          {/* Başlık şeridi */}
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <View style={styles.headerLabelRow}>
              <Ionicons name="sparkles" size={14} color="#fff" />
              <Text style={styles.headerLabel}>GÜNÜN GENEL KÜLTÜR SORUSU</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {/* Görsel */}
            {question.image && !imgError && (
              <View style={[styles.imageWrap, { backgroundColor: c.card, borderColor: c.border }]}>
                {imgLoading && (
                  <View style={styles.imageLoading}>
                    <ActivityIndicator color={Colors.primary} />
                  </View>
                )}
                <Image
                  source={{ uri: question.image }}
                  style={styles.image}
                  resizeMode="contain"
                  onLoadEnd={() => setImgLoading(false)}
                  onError={() => { setImgError(true); setImgLoading(false); }}
                />
              </View>
            )}
            {question.image && imgError && (
              <View style={[styles.imageWrap, styles.imageFallback, { backgroundColor: c.card, borderColor: c.border }]}>
                <Ionicons name="image-outline" size={38} color={c.textSecondary} />
                <Text style={{ color: c.textSecondary, fontSize: 13 }}>Görsel yüklenemedi</Text>
              </View>
            )}

            <Text style={[styles.prompt, { color: c.text }]}>{question.prompt}</Text>

            <View style={styles.options}>
              {question.options.map((opt, i) => {
                const isCorrect = i === question.correctIndex;
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
                {stat && stat.total > 0 && (
                  <View style={[styles.statChip, { backgroundColor: Colors.primary + '14' }]}>
                    <Ionicons name="people" size={16} color={Colors.primary} />
                    <Text style={[styles.statText, { color: Colors.primary }]}>
                      Çözenlerin %{stat.percentCorrect}’i doğru bildi
                    </Text>
                  </View>
                )}

                <View style={[styles.infoCard, { backgroundColor: Colors.primary + '12', borderColor: Colors.primary + '33' }]}>
                  <View style={styles.infoHead}>
                    <Ionicons name="bulb" size={18} color={Colors.primary} />
                    <Text style={[styles.infoLabel, { color: Colors.primary }]}>Bunu Unutma</Text>
                  </View>
                  <Text style={[styles.infoText, { color: c.text }]}>{question.info}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.doneBtn, { backgroundColor: Colors.primary }]}
                  onPress={onClose}
                  activeOpacity={0.85}
                >
                  <Text style={styles.doneBtnText}>Tamam</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    maxHeight: '88%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  headerLabel: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },

  body: { padding: 18, gap: 14 },

  imageWrap: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', height: 220, justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  imageLoading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  imageFallback: { alignItems: 'center', justifyContent: 'center', gap: 8 },

  prompt: { fontSize: 18, fontWeight: '700', lineHeight: 25 },

  options: { gap: 10 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1.5 },
  optionLetter: { fontSize: 15, fontWeight: '800', width: 20 },
  optionText: { flex: 1, fontSize: 15, fontWeight: '500' },

  statChip: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12, borderRadius: 12 },
  statText: { fontSize: 13, fontWeight: '700', flex: 1 },

  infoCard: { borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 6 },
  infoHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoLabel: { fontSize: 13, fontWeight: '800' },
  infoText: { fontSize: 14, lineHeight: 21 },

  doneBtn: { borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  doneBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
