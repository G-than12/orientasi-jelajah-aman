// components/AnimatedThemeToggle.tsx
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePengaturan } from "../contexts/PengaturanContext";

interface AnimatedThemeToggleProps {
  size?: "normal" | "compact";
  style?: any;
}

export default function AnimatedThemeToggle({
  size = "normal",
  style,
}: AnimatedThemeToggleProps) {
  const { darkMode, toggleDarkMode } = usePengaturan();

  const animProgress = useRef(new Animated.Value(darkMode ? 1 : 0)).current;
  const isWeb = Platform.OS === "web";
  const useNative = !isWeb;

  useEffect(() => {
    Animated.timing(animProgress, {
      toValue: darkMode ? 1 : 0,
      duration: 320,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: useNative,
    }).start();
  }, [darkMode, animProgress, useNative]);

  const isCompact = size === "compact";
  const trackWidth = isCompact ? 54 : 68;
  const trackHeight = isCompact ? 30 : 36;
  const thumbSize = isCompact ? 22 : 28;
  const travelDistance = isCompact ? 24 : 32;

  const thumbTranslateX = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, travelDistance],
  });

  const rotateDeg = animProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const sunOpacity = animProgress.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [1, 0, 0],
  });

  const moonOpacity = animProgress.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 0, 1],
  });

  function handlePress(e: any) {
    const pageX = e?.nativeEvent?.pageX;
    const pageY = e?.nativeEvent?.pageY;
    toggleDarkMode(
      pageX !== undefined && pageY !== undefined
        ? { x: pageX, y: pageY }
        : undefined
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityLabel={`Ganti Mode Gelap, saat ini ${
        darkMode ? "Aktif" : "Nonaktif"
      }`}
      accessibilityState={{ checked: darkMode }}
      style={[
        styles.track,
        {
          width: trackWidth,
          height: trackHeight,
          borderRadius: trackHeight / 2,
          backgroundColor: darkMode ? "#0f172a" : "#38bdf8",
          borderColor: darkMode ? "#334155" : "#bae6fd",
        },
        style,
      ]}
    >
      {/* Detail Latar: Bintang malam / Awan mini */}
      <View pointerEvents="none" style={styles.backgroundDetails}>
        <View
          style={[
            styles.starDot,
            { opacity: darkMode ? 1 : 0, top: 6, left: 8 },
          ]}
        />
        <View
          style={[
            styles.starDot,
            { opacity: darkMode ? 0.7 : 0, bottom: 6, left: 14 },
          ]}
        />
        <View
          style={[
            styles.cloudDot,
            {
              opacity: darkMode ? 0 : 0.85,
              top: isCompact ? 14 : 18,
              right: 8,
            },
          ]}
        />
        <View
          style={[
            styles.cloudDot,
            { opacity: darkMode ? 0 : 0.7, top: 8, right: 14 },
          ]}
        />
      </View>

      {/* Thumb Berputar & Bergeser */}
      <Animated.View
        style={[
          styles.thumb,
          {
            width: thumbSize,
            height: thumbSize,
            borderRadius: thumbSize / 2,
            backgroundColor: darkMode ? "#1e293b" : "#ffffff",
            transform: [
              { translateX: thumbTranslateX },
              { rotate: rotateDeg },
            ],
            shadowColor: darkMode ? "#000000" : "#0284c7",
          },
        ]}
      >
        <Animated.View
          style={[
            styles.iconWrapper,
            {
              opacity: sunOpacity,
              transform: [{ scale: sunOpacity }],
            },
          ]}
        >
          <Ionicons name="sunny" size={isCompact ? 13 : 16} color="#f59e0b" />
        </Animated.View>

        <Animated.View
          style={[
            styles.iconWrapper,
            {
              opacity: moonOpacity,
              transform: [{ scale: moonOpacity }],
            },
          ]}
        >
          <Ionicons name="moon" size={isCompact ? 12 : 15} color="#e2e8f0" />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    borderWidth: 1.5,
    padding: 2,
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    flexShrink: 0,
  },
  backgroundDetails: {
    ...StyleSheet.absoluteFill,
  },
  starDot: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#ffffff",
  },
  cloudDot: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#ffffff",
  },
  thumb: {
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  iconWrapper: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
});
