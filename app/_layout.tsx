// app/_layout.tsx (root layout)
import { Stack } from "expo-router";
import { RiwayatProvider } from "../contexts/RiwayatContext";

export default function RootLayout() {
  return (
    <RiwayatProvider>
      <Stack>
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
    </RiwayatProvider>
  );
}
