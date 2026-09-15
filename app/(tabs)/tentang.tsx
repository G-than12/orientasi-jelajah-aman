// app/(tabs)/tentang.tsx
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typeScale, spacing } from "../../constants/styles";

export default function TabTentang() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header Aplikasi */}
      <View style={styles.cardHeader}>
        <View style={styles.iconPlaceholder}>
          <Text style={{ fontSize: 32 }}>🌤️</Text>
        </View>
        <Text
          accessible
          accessibilityLabel="Judul halaman: Tentang Jelajah Aman"
          style={styles.judul}
        >
          Jelajah Aman
        </Text>
        <View style={styles.versiBadge}>
          <Text style={styles.versiText}>Versi 1.0.0</Text>
        </View>
      </View>

      {/* Card Info Pengembang */}
      <View style={styles.card}>
        <Text style={styles.labelSection}>Pengembang</Text>
        <Text style={styles.nama}>Gathan</Text>
        <Text style={styles.subtext}>Informatika — UIN Gus Dur Pekalongan</Text>
      </View>

      {/* Card Deskripsi */}
      <View style={styles.card}>
        <Text style={styles.labelSection}>Tentang Aplikasi</Text>
        <Text style={styles.deskripsi}>
          Aplikasi informasi cuaca dan kualitas udara untuk membantu mobilitas
          pengguna secara aman dan nyaman.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.sedang,
    backgroundColor: "#f8fafc",
    gap: spacing.sedang,
  },
  cardHeader: {
    alignItems: "center",
    paddingVertical: spacing.sedang,
  },
  iconPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  judul: {
    fontSize: typeScale.judul,
    fontWeight: "800",
    color: "#0f172a",
  },
  versiBadge: {
    marginTop: 6,
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  versiText: {
    fontSize: typeScale.keterangan,
    color: "#475569",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: spacing.sedang,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  labelSection: {
    fontSize: typeScale.keterangan,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  nama: {
    fontSize: typeScale.subjudul,
    fontWeight: "700",
    color: "#1e293b",
  },
  subtext: {
    fontSize: typeScale.isi,
    color: "#64748b",
    marginTop: 2,
  },
  deskripsi: {
    fontSize: typeScale.isi,
    color: "#334155",
    lineHeight: 20,
  },
});
