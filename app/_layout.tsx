// app/_layout.tsx (root layout)
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { RiwayatProvider } from "../contexts/RiwayatContext";
import {
  PengaturanProvider,
  usePengaturan,
} from "../contexts/PengaturanContext";
import CircularThemeOverlay from "../components/CircularThemeOverlay";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootContent() {
  const { theme, transition, applyThemeChange, completeTransition } =
    usePengaturan();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar style={theme.statusBarStyle} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.card,
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontFamily: "PlusJakartaSans-Bold",
            fontWeight: "700",
            color: theme.text,
          },
          headerTintColor: theme.text,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        {/* 1. Navigasi Tab Utama (header disembunyikan karena tab punya header sendiri) */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* 2. Halaman Detail Cuaca */}
        <Stack.Screen name="detail/[kota]" options={{ title: "Detail Cuaca" }} />

        {/* 3. Modal Tambah Favorit */}
        <Stack.Screen
          name="tambah-favorit"
          options={{ presentation: "modal", title: "Tambah Favorit" }}
        />
      </Stack>

      {/* Efek Animasi Melingkar (Circular Reveal Transition) */}
      <CircularThemeOverlay
        transition={transition}
        onApplyTheme={applyThemeChange}
        onComplete={completeTransition}
      />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    "PlusJakartaSans-Regular": PlusJakartaSans_400Regular,
    "PlusJakartaSans-Medium": PlusJakartaSans_500Medium,
    "PlusJakartaSans-SemiBold": PlusJakartaSans_600SemiBold,
    "PlusJakartaSans-Bold": PlusJakartaSans_700Bold,
    "PlusJakartaSans-ExtraBold": PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <PengaturanProvider>
      <RiwayatProvider>
        <RootContent />
      </RiwayatProvider>
    </PengaturanProvider>
  );
}

