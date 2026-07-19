import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { STORE_URLS } from '../lib/share';
import {
  fetchAppVersionInfo,
  getCurrentVersion,
  isNewer,
  isDismissed,
  dismissVersion,
} from '../lib/appVersion';

export default function UpdateBanner() {
  const scheme = useColorScheme() ?? 'light';
  const c = scheme === 'dark' ? Colors.dark : Colors.light;
  const [latest, setLatest] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const info = await fetchAppVersionInfo();
      if (!info || !alive) return;
      if (!isNewer(info.latestVersion, getCurrentVersion())) return;
      if (await isDismissed(info.latestVersion)) return;
      if (alive) setLatest(info.latestVersion);
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (!latest) return null;

  const open = () => {
    const url = Platform.OS === 'ios' ? STORE_URLS.ios : STORE_URLS.android;
    Linking.openURL(url).catch(() => {});
  };

  const close = () => {
    dismissVersion(latest).catch(() => {});
    setLatest(null);
  };

  return (
    <View style={[styles.wrap, { backgroundColor: c.card, borderColor: Colors.primary }]}>
      <View style={styles.icon}>
        <Ionicons name="arrow-up-circle" size={22} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: c.text }]}>Yeni sürüm mevcut</Text>
        <Text style={[styles.sub, { color: c.textSecondary }]}>
          Güncelle, son iyileştirmeleri al
        </Text>
      </View>
      <TouchableOpacity style={styles.cta} onPress={open} activeOpacity={0.8}>
        <Text style={styles.ctaText}>Güncelle</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.close} onPress={close} hitSlop={8}>
        <Ionicons name="close" size={18} color={c.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  icon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '700', fontSize: 14 },
  sub: { fontSize: 12, marginTop: 2 },
  cta: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  close: { padding: 4 },
});
