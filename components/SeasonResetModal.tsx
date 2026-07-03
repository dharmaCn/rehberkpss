import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { SEASON_LABEL, SEASON_MODAL_STORAGE_KEY, SEASON_END_AT, daysUntil } from '../constants/season';

export default function SeasonResetModal() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SEASON_MODAL_STORAGE_KEY).then((v) => {
      if (v !== '1') setVisible(true);
    });
  }, []);

  async function close() {
    await AsyncStorage.setItem(SEASON_MODAL_STORAGE_KEY, '1');
    setVisible(false);
  }

  if (!visible) return null;

  const left = daysUntil(SEASON_END_AT);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: c.card }]}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={[styles.title, { color: c.text }]}>{SEASON_LABEL} Başladı!</Text>
          <Text style={[styles.body, { color: c.textSecondary }]}>
            Yeni sürümle birlikte sıralamalar sıfırlandı. Herkes eşit başlıyor — bugünden itibaren puan toplayarak zirveye çıkabilirsin.
            {'\n\n'}Sezon sonunda <Text style={{ fontWeight: '800', color: c.text }}>ilk 100 isim 👑 Şampiyon {SEASON_LABEL} rozetini</Text> kazanır.
            {'\n\n'}<Text style={{ color: Colors.primary, fontWeight: '700' }}>Sezon bitimine {left} gün.</Text>
            {'\n\n'}Geçmiş puanların profilinde "Tüm zamanlar" altında durmaya devam ediyor.
          </Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: Colors.primary }]} onPress={close} activeOpacity={0.85}>
            <Text style={styles.btnText}>Hadi başlayalım →</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 28 },
  card: { borderRadius: 24, padding: 28, alignItems: 'center', gap: 14 },
  emoji: { fontSize: 56 },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  body: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
  btn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, alignSelf: 'stretch', alignItems: 'center', marginTop: 4 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
