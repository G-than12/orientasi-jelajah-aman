// app/_layout.tsx (root layout)
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { RiwayatProvider } from "../contexts/RiwayatContext";
import {
  PengaturanProvider,
  usePengaturan,
} from "../contexts/PengaturanContext";
import CircularThemeOverlay from "../components/CircularThemeOverlay";

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
  return (
    <PengaturanProvider>
      <RiwayatProvider>
        <RootContent />
      </RiwayatProvider>
    </PengaturanProvider>
  );
}
