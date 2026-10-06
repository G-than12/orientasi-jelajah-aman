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
  indeksAQI,
  kondisi,
  kecepatanAngin,
  suhuMaks,
  suhuMin,
  pm25,
  pm10,
  tampilkanDetail = true,
}: WeatherCardProps) {
  const tema = getTemaAQI(tingkatAQI);

  const teksAQI =
    indeksAQI !== undefined
      ? `AQI: ${indeksAQI} • ${tema.label}`
      : `AQI: ${tema.label}`;

  const labelAksesibilitas =
    indeksAQI !== undefined
      ? `Cuaca ${kota}, suhu ${suhu} derajat Celsius${
          kondisi ? `, cuaca ${kondisi}` : ""
        }, indeks kualitas udara ${indeksAQI}, kategori ${tingkatAQI}`
      : `Cuaca ${kota}, suhu ${suhu} derajat Celsius${
          kondisi ? `, cuaca ${kondisi}` : ""
        }, kualitas udara ${tingkatAQI}`;

  const adaInfoTambahan =
    tampilkanDetail &&
    (kecepatanAngin !== undefined ||
      suhuMaks !== undefined ||
      suhuMin !== undefined ||
      pm25 !== undefined ||
      pm10 !== undefined);

  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={styles.card}
    >
      {/* 1. Header: Nama Kota, Kondisi Cuaca & Badge AQI */}
      <View style={styles.header}>
        <View style={styles.kotaWrapper}>
          <Text style={styles.kota}>{kota}</Text>
          {kondisi ? <Text style={styles.kondisiText}>{kondisi}</Text> : null}
        </View>
        <View style={[styles.badge, { backgroundColor: tema.bg }]}>
          <Text style={[styles.badgeText, { color: tema.teks }]}>
            {teksAQI}
          </Text>
        </View>
      </View>

      {/* 2. Suhu Utama & Satuan */}
      <View style={styles.content}>
        <Text style={styles.suhu}>{suhu}°</Text>
        <View style={styles.satuanContainer}>
          <Text style={styles.satuan}>Celsius</Text>
        </View>
      </View>

      {/* 3. Footer Petunjuk untuk Tampilan Ringkas di Beranda */}
      {!tampilkanDetail && (
        <View style={styles.ringkasFooter}>
          <Text style={styles.ringkasFooterText}>
            Ketuk untuk melihat detail cuaca →
          </Text>
        </View>
      )}

      {/* 4. Informasi Lingkungan Terpadu & Simetris (Grid 2x2) untuk Tampilan Detail */}
      {adaInfoTambahan && (
        <View style={styles.infoTambahanContainer}>
          <View style={styles.divider} />

          {/* Baris 1: Angin & Rentang Suhu */}
          <View style={styles.infoGridRow}>
            {kecepatanAngin !== undefined && (
              <View style={styles.infoGridItem}>
                <Text style={styles.infoItemLabel}>💨 Angin</Text>
                <Text style={styles.infoItemValue}>{kecepatanAngin} km/j</Text>
              </View>
            )}

            {suhuMaks !== undefined && suhuMin !== undefined && (
              <View style={styles.infoGridItem}>
                <Text style={styles.infoItemLabel}>🌡️ Min / Maks</Text>
                <Text style={styles.infoItemValue}>
                  {suhuMin}° / {suhuMaks}°
                </Text>
              </View>
            )}
          </View>

          {/* Baris 2: Partikel Kualitas Udara (PM2.5 & PM10) */}
          {(pm25 !== undefined || pm10 !== undefined) && (
            <View style={[styles.infoGridRow, { marginTop: 10 }]}>
              {pm25 !== undefined && (
                <View style={styles.infoGridItem}>
                  <Text style={styles.infoItemLabel}>🍃 PM2.5</Text>
                  <Text style={styles.infoItemValue}>{pm25} µg/m³</Text>
                </View>
              )}

              {pm10 !== undefined && (
                <View style={styles.infoGridItem}>
                  <Text style={styles.infoItemLabel}>🌫️ PM10</Text>
                  <Text style={styles.infoItemValue}>{pm10} µg/m³</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}
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
    borderColor: "#e2e8f0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sedang,
  },
  kotaWrapper: {
    flex: 1,
    marginRight: 8,
  },
  kota: {
    fontSize: typeScale.judul,
    fontWeight: "700",
    color: "#0f172a",
  },
  kondisiText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 3,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: typeScale.keterangan,
    fontWeight: "700",
  },
  content: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  suhu: {
    fontSize: 46,
    fontWeight: "800",
    color: "#1e293b",
  },
  satuanContainer: {
    justifyContent: "center",
  },
  satuan: {
    fontSize: typeScale.subjudul,
    color: "#64748b",
    fontWeight: "600",
  },
  rentangSuhuRingkas: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 2,
  },
  ringkasFooter: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  ringkasFooterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
  },
  infoTambahanContainer: {
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 14,
  },
  infoGridRow: {
    flexDirection: "row",
    gap: 10,
  },
  infoGridItem: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoItemLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 4,
  },
  infoItemValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
});
