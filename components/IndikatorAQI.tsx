// components/IndikatorAQI.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
// Import dari ../types/udara
import { LaporanUdara } from "../types/udara";

interface IndikatorAQIProps {
  data: LaporanUdara;
}

// Fungsi helper penentu warna berdasarkan status kualitas udara
const getWarnaTingkat = (
  tingkat: LaporanUdara["tingkat"],
): { teks: string; background: string } => {
  switch (tingkat) {
    case "BAIK":
      return { teks: "#15803d", background: "#dcfce7" }; // Hijau (Good)
    case "SEDANG":
      return { teks: "#b45309", background: "#fef3c7" }; // Kuning/Amber (Moderate)
    case "TIDAK_SEHAT":
      return { teks: "#c2410c", background: "#ffedd5" }; // Oranye kemerahan (Unhealthy)
    case "BERBAHAYA":
      return { teks: "#b91c1c", background: "#fee2e2" }; // Merah pekat (Hazardous)
    default:
      return { teks: "#475569", background: "#f1f5f9" }; // Default Slate
  }
};

// Fungsi helper format label teks
const formatTingkat = (tingkat: LaporanUdara["tingkat"]): string => {
  switch (tingkat) {
    case "BAIK":
      return "Baik";
    case "SEDANG":
      return "Sedang";
    case "TIDAK_SEHAT":
      return "Tidak Sehat";
    case "BERBAHAYA":
      return "Berbahaya";
    default:
      return tingkat;
  }
};

export const IndikatorAQI: React.FC<IndikatorAQIProps> = ({ data }) => {
  const { kota, indeksAQI, tingkat, diperbaruiPada } = data;
  const warna = getWarnaTingkat(tingkat);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.kota}>{kota}</Text>
        {diperbaruiPada ? (
          <Text style={styles.waktu}>Diperbarui: {diperbaruiPada}</Text>
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.aqiContainer}>
          <Text style={styles.labelAQI}>AQI</Text>
          <Text style={[styles.nilaiAQI, { color: warna.teks }]}>
            {indeksAQI}
          </Text>
        </View>

        {/* Badge Status dengan warna teks & background dinamis */}
        <View style={[styles.badge, { backgroundColor: warna.background }]}>
          <Text style={[styles.badgeText, { color: warna.teks }]}>
            {formatTingkat(tingkat)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  kota: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  waktu: {
    fontSize: 12,
    color: "#64748b",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aqiContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  labelAQI: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  nilaiAQI: {
    fontSize: 32,
    fontWeight: "800",
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
  },
});

export default IndikatorAQI;
