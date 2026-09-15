// app/(tabs)/tentang.tsx
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typeScale, spacing } from "../../constants/styles";

export default function TabTentang() {
  return (
    <SafeAreaView
      style={{ flex: 1, padding: spacing.sedang, gap: spacing.kecil }}
    >
      {/* Judul Halaman dengan Aksesibilitas & Hierarki Visual */}
      <Text
        accessible
        accessibilityLabel="Judul halaman: Tentang Jelajah Aman"
        style={{ fontSize: typeScale.judul, fontWeight: "bold" }}
      >
        Tentang Jelajah Aman
      </Text>

      {/* Versi Aplikasi */}
      <Text style={{ fontSize: typeScale.subjudul, color: "#475569" }}>
        Versi 1.0.0
      </Text>

      {/* Identitas Pembuat */}
      <Text
        style={{
          fontSize: typeScale.isi,
          color: "#1e293b",
          marginTop: spacing.kecil,
        }}
      >
        Dibuat oleh: Gathan
      </Text>

      {/* Keterangan */}
      <Text style={{ fontSize: typeScale.keterangan, color: "#94a3b8" }}>
        Aplikasi pemantau cuaca dan navigasi perjalanan yang aman.
      </Text>
    </SafeAreaView>
  );
}
