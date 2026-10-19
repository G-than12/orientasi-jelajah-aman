// components/CircularThemeOverlay.tsx
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { darkTheme, lightTheme } from "../constants/theme";

interface CircularThemeOverlayProps {
  transition: {
    active: boolean;
    x: number;
    y: number;
    nextIsDark: boolean;
  } | null;
  onApplyTheme?: (nextIsDark: boolean) => void;
  onComplete: () => void;
}

export default function CircularThemeOverlay({
  transition,
  onComplete,
}: CircularThemeOverlayProps) {
  const { width, height } = useWindowDimensions();
  const scale = useRef(new Animated.Value(0.001)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!transition || !transition.active) return;

    scale.setValue(0.001);
    opacity.setValue(0.95);

    const isWeb = Platform.OS === "web";
    const useNative = !isWeb;

    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1,
        duration: 420,
        easing: Easing.bezier(0.2, 0.8, 0.2, 1),
        useNativeDriver: useNative,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: useNative,
      }),
    ]).start(() => {
      onComplete();
    });
  }, [transition, onComplete, scale, opacity]);

  if (!transition || !transition.active) {
    return null;
  }

  const originX = transition.x > 0 ? transition.x : width - 50;
  const originY = transition.y > 0 ? transition.y : 100;

  const distTL = Math.hypot(originX, originY);
  const distTR = Math.hypot(width - originX, originY);
  const distBL = Math.hypot(originX, height - originY);
  const distBR = Math.hypot(width - originX, height - originY);
  const maxRadius = Math.ceil(Math.max(distTL, distTR, distBL, distBR)) + 60;

  const targetBg = transition.nextIsDark ? darkTheme.bg : lightTheme.bg;

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.overlayWrapper]}
    >
      <Animated.View
        style={[
          styles.circle,
          {
            left: originX - maxRadius,
            top: originY - maxRadius,
            width: maxRadius * 2,
            height: maxRadius * 2,
            borderRadius: maxRadius,
            backgroundColor: targetBg,
            opacity,
            transform: [{ scale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlayWrapper: {
    zIndex: 99999,
    elevation: 99999,
  },
  circle: {
    position: "absolute",
    overflow: "hidden",
  },
});
