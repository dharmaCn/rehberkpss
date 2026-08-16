import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { forwardRef } from 'react';
import { MonthlyRecap, monthLabel } from '../lib/monthlyRecap';

interface Props {
  recap: MonthlyRecap;
  displayName: string;
}

// Paylaşılabilir aylık özet kartı — sıralama/yüzdelik yok, sadece emek (soru sayısı,
// aktif gün) gösterir. captureAndShare ile View ref'i üzerinden PNG'ye çevrilir.
const MonthlyRecapCard = forwardRef<View, Props>(function MonthlyRecapCard({ recap, displayName }, ref) {
  return (
    <View ref={ref} collapsable={false}>
      <LinearGradient
        colors={['#4338CA', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <Text style={styles.kicker}>ATANMA GÜNLÜĞÜ</Text>
        <Text style={styles.month}>{monthLabel(recap.monthKey)}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{recap.totalQuestions}</Text>
            <Text style={styles.statLabel}>Soru Çözüldü</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{recap.daysActive}</Text>
            <Text style={styles.statLabel}>Aktif Gün</Text>
          </View>
        </View>

        <Text style={styles.footer}>{displayName} · KPSS AGS Quiz</Text>
      </LinearGradient>
    </View>
  );
});

export default MonthlyRecapCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#4338CA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  kicker: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  month: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    justifyContent: 'center',
  },
  stat: { alignItems: 'center', gap: 4, flex: 1 },
  statValue: { fontSize: 36, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  footer: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', marginTop: 16, letterSpacing: 1 },
});
