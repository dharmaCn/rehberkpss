import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';

const COLORS = ['#4F46E5', '#F59E0B', '#10B981', '#EF4444', '#818CF8', '#22D3EE'];

interface Props {
  count?: number;
  duration?: number;
}

/**
 * Saf React Native Animated ile hafif konfeti patlaması (native modül gerektirmez).
 * Mount olunca bir kez oynar, dokunmaları engellemez.
 */
export default function Confetti({ count = 26, duration = 2600 }: Props) {
  const { width, height } = useWindowDimensions();

  const pieces = useRef(
    Array.from({ length: count }).map((_, i) => ({
      anim: new Animated.Value(0),
      startX: Math.random() * width,
      drift: (Math.random() - 0.5) * 120,
      delay: Math.random() * 600,
      size: 6 + Math.random() * 8,
      color: COLORS[i % COLORS.length],
      rotateTo: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360),
      spin: Math.random() > 0.5,
    }))
  ).current;

  useEffect(() => {
    const animations = pieces.map((p) =>
      Animated.timing(p.anim, {
        toValue: 1,
        duration,
        delay: p.delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );
    Animated.stagger(20, animations).start();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p, i) => {
        const translateY = p.anim.interpolate({ inputRange: [0, 1], outputRange: [-40, height + 40] });
        const translateX = p.anim.interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] });
        const rotate = p.anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.rotateTo}deg`] });
        const opacity = p.anim.interpolate({ inputRange: [0, 0.85, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left: p.startX,
              width: p.size,
              height: p.size * (p.spin ? 1 : 1.6),
              borderRadius: p.spin ? p.size / 2 : 2,
              backgroundColor: p.color,
              opacity,
              transform: [{ translateY }, { translateX }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
}
