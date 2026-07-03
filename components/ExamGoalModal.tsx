import { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, useColorScheme, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { updateProfileMeta } from '../lib/firestore';
import { KPSS_EXAMS, TARGET_SCORES } from '../constants/exams';

interface Props {
  uid: string;
  visible: boolean;
  initialDate?: string;
  initialTarget?: number;
  onClose: () => void;
}

export default function ExamGoalModal({ uid, visible, initialDate, initialTarget, onClose }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const [step, setStep] = useState<0 | 1>(0);
  const [examId, setExamId] = useState<string>(initialExamId(initialDate));
  const [target, setTarget] = useState<number>(initialTarget ?? 80);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const picked = KPSS_EXAMS.find((e) => e.id === examId);
      const dateStr = picked?.date && picked.date.length > 0
        ? picked.date
        : defaultIndefiniteDate();
      await updateProfileMeta(uid, { examDate: dateStr, targetScore: target });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: c.card }]}>
          {step === 0 ? (
            <>
              <Text style={styles.emoji}>📅</Text>
              <Text style={[styles.title, { color: c.text }]}>Hangi KPSS sınavına gireceksin?</Text>
              <Text style={[styles.body, { color: c.textSecondary }]}>
                Sınavına kalan günleri ana ekranda gösterip her gün motive olmana yardımcı olalım.
              </Text>
              <ScrollView style={{ alignSelf: 'stretch', maxHeight: 280 }} contentContainerStyle={{ gap: 8 }}>
                {KPSS_EXAMS.map((e) => {
                  const sel = examId === e.id;
                  return (
                    <TouchableOpacity
                      key={e.id}
                      onPress={() => setExamId(e.id)}
                      style={[
                        styles.examRow,
                        sel
                          ? { backgroundColor: Colors.primary + '14', borderColor: Colors.primary }
                          : { borderColor: c.border, backgroundColor: c.background },
                      ]}
                      activeOpacity={0.85}
                    >
                      <View style={[styles.examDot, { backgroundColor: sel ? Colors.primary : c.border }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.examLabel, { color: c.text }]} numberOfLines={2}>{e.label}</Text>
                        {e.date ? (
                          <Text style={[styles.examDate, { color: c.textSecondary }]}>
                            {formatDate(e.date)}
                          </Text>
                        ) : (
                          <Text style={[styles.examDate, { color: c.textSecondary }]}>Tarih: belirsiz</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View style={styles.btnRow}>
                <TouchableOpacity style={[styles.skipBtn, { borderColor: c.border }]} onPress={onClose} activeOpacity={0.85}>
                  <Text style={[styles.skipText, { color: c.textSecondary }]}>Sonra</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.nextBtn, { backgroundColor: Colors.primary }]}
                  onPress={() => setStep(1)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.nextText}>Devam →</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.emoji}>🎯</Text>
              <Text style={[styles.title, { color: c.text }]}>Hedef puanın?</Text>
              <Text style={[styles.body, { color: c.textSecondary }]}>
                Bu hedefe ne kadar yaklaştığını birlikte göreceğiz.
              </Text>
              <View style={[styles.targetBox, { borderColor: c.border, backgroundColor: c.background }]}>
                <Text style={[styles.targetBig, { color: Colors.primary }]}>{target}</Text>
                <Text style={[styles.targetLbl, { color: c.textSecondary }]}>puan</Text>
              </View>
              <View style={styles.chipRow}>
                {TARGET_SCORES.map((v) => {
                  const sel = target === v;
                  return (
                    <TouchableOpacity
                      key={v}
                      onPress={() => setTarget(v)}
                      style={[styles.chip, sel ? { backgroundColor: Colors.primary } : { borderColor: c.border, borderWidth: 1.5 }]}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.chipText, { color: sel ? '#fff' : c.text }]}>{v}+</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.btnRow}>
                <TouchableOpacity style={[styles.skipBtn, { borderColor: c.border }]} onPress={() => setStep(0)} activeOpacity={0.85}>
                  <Text style={[styles.skipText, { color: c.textSecondary }]}>← Geri</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.nextBtn, { backgroundColor: Colors.primary, opacity: saving ? 0.6 : 1 }]}
                  onPress={save}
                  disabled={saving}
                  activeOpacity={0.85}
                >
                  <Text style={styles.nextText}>{saving ? 'Kaydediliyor…' : 'Bitir ✓'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function initialExamId(date?: string): string {
  if (!date) return KPSS_EXAMS[0].id;
  const match = KPSS_EXAMS.find((e) => e.date === date);
  return match ? match.id : 'belirsiz';
}

function defaultIndefiniteDate(): string {
  // 120 gün sonrası
  const d = new Date();
  d.setDate(d.getDate() + 120);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 20 },
  card: { borderRadius: 24, padding: 22, alignItems: 'center', gap: 12 },
  emoji: { fontSize: 40 },
  title: { fontSize: 19, fontWeight: '800', textAlign: 'center' },
  body: { fontSize: 13, lineHeight: 19, textAlign: 'center' },

  examRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1.5 },
  examDot: { width: 14, height: 14, borderRadius: 7 },
  examLabel: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  examDate: { fontSize: 11, marginTop: 2 },

  targetBox: { alignSelf: 'stretch', alignItems: 'center', paddingVertical: 16, borderRadius: 16, borderWidth: 1.5 },
  targetBig: { fontSize: 44, fontWeight: '900' },
  targetLbl: { fontSize: 12, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 22 },
  chipText: { fontSize: 14, fontWeight: '700' },

  btnRow: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 4 },
  skipBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, borderWidth: 1.5, alignItems: 'center' },
  skipText: { fontSize: 14, fontWeight: '700' },
  nextBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  nextText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
