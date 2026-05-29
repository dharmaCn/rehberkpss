import { useColorScheme as useRNColorScheme } from 'react-native';
import { Colors } from '../constants/colors';

export function useTheme() {
  const scheme = useRNColorScheme() ?? 'light';
  const isDark = scheme === 'dark';
  return {
    isDark,
    colors: isDark ? Colors.dark : Colors.light,
    primary: Colors.primary,
    accent: Colors.accent,
    success: Colors.success,
    error: Colors.error,
  };
}
