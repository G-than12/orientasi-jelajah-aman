import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts, typeScale, spacing } from "../../constants/styles";
import { usePengaturan } from "../../contexts/PengaturanContext";

export default function TabTentang() {
  const { theme } = usePengaturan();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Header Aplikasi */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconPlaceholder,
            {
              backgroundColor: theme.primaryBg,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <Ionicons name="partly-sunny" size={38} color="#2563eb" />
        </View>
        <Text
          accessible
          accessibilityLabel="Judul halaman: Tentang Jelajah Aman"
          style={[styles.judul, { color: theme.text }]}
        >
          Jelajah Aman
        </Text>
        <View
          style={[
            styles.versiBadge,
            { backgroundColor: theme.cardSecondary },
          ]}
        >
          <Text style={[styles.versiText, { color: theme.textSecondary }]}>
            Versi 1.0.0
          </Text>
        </View>
      </View>

      {/* Card Info Pengembang */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
          },
        ]}
      >
        <Text style={[styles.labelSection, { color: theme.textMuted }]}>
          Pengembang
        </Text>
        <Text style={[styles.nama, { color: theme.text }]}>Gathan</Text>
        <Text style={[styles.subtext, { color: theme.textSecondary }]}>
          Informatika â€” UIN Gus Dur Pekalongan
        </Text>
      </View>

      {/* Card Deskripsi */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
          },
        ]}
      >
        <Text style={[styles.labelSection, { color: theme.textMuted }]}>
          Tentang Aplikasi
        </Text>
        <Text style={[styles.deskripsi, { color: theme.textSecondary }]}>
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
    gap: spacing.sedang,
  },
  cardHeader: {
    alignItems: "center",
    paddingVertical: spacing.sedang,
  },
  iconPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  judul: {
    fontFamily: fonts.extraBold,
    fontSize: typeScale.judul,
    fontWeight: "800",
  },
  versiBadge: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  versiText: {
    fontFamily: fonts.semiBold,
    fontSize: typeScale.keterangan,
    fontWeight: "600",
  },
  card: {
    padding: spacing.sedang,
    borderRadius: 14,
    borderWidth: 1,
  },
  labelSection: {
    fontSize: typeScale.keterangan,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  nama: {
    fontSize: typeScale.subjudul,
    fontWeight: "700",
  },
  subtext: {
    fontSize: typeScale.isi,
    marginTop: 2,
  },
  deskripsi: {
    fontSize: typeScale.isi,
    lineHeight: 20,
  },
});
