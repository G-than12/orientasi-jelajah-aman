// components/WeatherCard.tsx
import { View, Text, StyleSheet } from "react-native";
import { WeatherCardProps } from "../types/cuaca";
import { typeScale, spacing } from "../constants/styles";

const getTemaAQI = (tingkat: string) => {
  switch (tingkat) {
    case "BAIK":
      return { teks: "#15803d", bg: "#dcfce7", label: "Baik" };
    case "SEDANG":
      return { teks: "#b45309", bg: "#fef3c7", label: "Sedang" };
    case "TIDAK_SEHAT":
      return { teks: "#c2410c", bg: "#ffedd5", label: "Tidak Sehat" };
    default:
      return { teks: "#b91c1c", bg: "#fee2e2", label: "Berbahaya" };
  }
};

export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
}: WeatherCardProps) {
  const tema = getTemaAQI(tingkatAQI);

  return (
    <View
      accessible
      accessibilityLabel={`Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${tingkatAQI}`}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.kota}>{kota}</Text>
        <View style={[styles.badge, { backgroundColor: tema.bg }]}>
          <Text style={[styles.badgeText, { color: tema.teks }]}>
            AQI: {tema.label}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.suhu}>{suhu}°</Text>
        <Text style={styles.satuan}>Celsius</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: spacing.sedang,
    borderRadius: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sedang,
  },
  kota: {
    fontSize: typeScale.judul,
    fontWeight: "700",
    color: "#0f172a",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: typeScale.keterangan,
    fontWeight: "700",
  },
  content: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  suhu: {
    fontSize: 48,
    fontWeight: "800",
    color: "#1e293b",
  },
  satuan: {
    fontSize: typeScale.subjudul,
    color: "#64748b",
    fontWeight: "500",
  },
});
