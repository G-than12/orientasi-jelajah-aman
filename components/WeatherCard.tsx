import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WeatherCardProps } from "../types/cuaca";
import { fonts, typeScale, spacing } from "../constants/styles";
import { infoCuaca } from "../constants/weatherCodes";
import { usePengaturan } from "../contexts/PengaturanContext";
import { formatUmur } from "./StatusData";

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
  kodeCuaca,
  kondisi,
  kecepatanAngin,
  suhuMaks,
  suhuMin,
  pm25,
  pm10,
  tampilkanDetail = true,
  celcius: celciusProp,
  sumberData,
  disimpanPada,
}: WeatherCardProps) {
  const { celcius: celciusGlobal, konversiSuhu, theme } = usePengaturan();
  const celciusAktif = celciusProp !== undefined ? celciusProp : celciusGlobal;

  const suhuTampil = konversiSuhu(suhu, celciusAktif);
  const suhuMaksTampil =
    suhuMaks !== undefined ? konversiSuhu(suhuMaks, celciusAktif) : undefined;
  const suhuMinTampil =
    suhuMin !== undefined ? konversiSuhu(suhuMin, celciusAktif) : undefined;
  const namaSatuan = celciusAktif ? "Celsius" : "Fahrenheit";

  const tema = getTemaAQI(tingkatAQI);
  const info = kodeCuaca !== undefined ? infoCuaca(kodeCuaca) : null;
  const labelKondisiTeks = info ? info.label : kondisi;

  const teksAQI =
    indeksAQI !== undefined
      ? `AQI: ${indeksAQI} • ${tema.label}`
      : `AQI: ${tema.label}`;

  const labelAksesibilitas =
    indeksAQI !== undefined
      ? `Cuaca ${kota}, suhu ${suhuTampil} derajat ${namaSatuan}${
          labelKondisiTeks ? `, cuaca ${labelKondisiTeks}` : ""
        }, indeks kualitas udara ${indeksAQI}, kategori ${tingkatAQI}`
      : `Cuaca ${kota}, suhu ${suhuTampil} derajat ${namaSatuan}${
          labelKondisiTeks ? `, cuaca ${labelKondisiTeks}` : ""
        }, kualitas udara ${tingkatAQI}`;

  const adaInfoTambahan =
    tampilkanDetail &&
    (kecepatanAngin !== undefined ||
      suhuMaks !== undefined ||
      suhuMin !== undefined ||
      pm25 !== undefined ||
      pm10 !== undefined);

  const getStatusInfo = () => {
    if (!sumberData || disimpanPada === undefined) return null;
    const umur = formatUmur(disimpanPada);
    if (sumberData === "jaringan") {
      return {
        label: "Online",
        umur,
        dotColor: "#10b981",
      };
    }
    if (sumberData === "cache-segar") {
      return {
        label: "Tersimpan",
        umur,
        dotColor: "#0284c7",
      };
    }
    return {
      label: "Offline",
      umur,
      dotColor: "#f59e0b",
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.cardBorder,
        },
      ]}
    >
      {/* 1. Header Bersih: Nama Kota, Kondisi Cuaca & Badge AQI */}
      <View style={styles.header}>
        <View style={styles.kotaWrapper}>
          <Text style={[styles.kota, { color: theme.text }]}>{kota}</Text>
          {info ? (
            <View style={styles.kondisiWrapper}>
              <Ionicons name={info.iconName} size={16} color={info.iconColor} />
              <Text style={[styles.kondisiText, { color: theme.textSecondary }]}>
                {info.label}
              </Text>
            </View>
          ) : kondisi ? (
            <Text style={[styles.kondisiText, { color: theme.textSecondary }]}>
              {kondisi}
            </Text>
          ) : null}
        </View>
        <View style={[styles.badge, { backgroundColor: tema.bg }]}>
          <Text style={[styles.badgeText, { color: tema.teks }]}>
            {teksAQI}
          </Text>
        </View>
      </View>

      {/* 2. Suhu Utama & Satuan */}
      <View style={styles.content}>
        <Text style={[styles.suhu, { color: theme.text }]}>{suhuTampil}°</Text>
        <View style={styles.satuanContainer}>
          <Text style={[styles.satuan, { color: theme.textSecondary }]}>
            {namaSatuan}
          </Text>
        </View>
      </View>

      {/* 4. Informasi Lingkungan Terpadu & Simetris (Grid 2x2) untuk Tampilan Detail */}
      {adaInfoTambahan && (
        <View style={styles.infoTambahanContainer}>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* Baris 1: Angin & Rentang Suhu */}
          <View style={styles.infoGridRow}>
            {kecepatanAngin !== undefined && (
              <View
                style={[
                  styles.infoGridItem,
                  {
                    backgroundColor: theme.cardSecondary,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <View style={styles.infoItemHeader}>
                  <Ionicons name="speedometer-outline" size={14} color="#0284c7" />
                  <Text style={[styles.infoItemLabel, { color: theme.textSecondary }]}>
                    Angin
                  </Text>
                </View>
                <Text style={[styles.infoItemValue, { color: theme.text }]}>
                  {kecepatanAngin} km/j
                </Text>
              </View>
            )}

            {suhuMaksTampil !== undefined && suhuMinTampil !== undefined && (
              <View
                style={[
                  styles.infoGridItem,
                  {
                    backgroundColor: theme.cardSecondary,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <View style={styles.infoItemHeader}>
                  <Ionicons name="thermometer-outline" size={14} color="#ea580c" />
                  <Text style={[styles.infoItemLabel, { color: theme.textSecondary }]}>
                    Min / Maks
                  </Text>
                </View>
                <Text style={[styles.infoItemValue, { color: theme.text }]}>
                  {suhuMinTampil}° / {suhuMaksTampil}°
                </Text>
              </View>
            )}
          </View>

          {/* Baris 2: Partikel Kualitas Udara (PM2.5 & PM10) */}
          {(pm25 !== undefined || pm10 !== undefined) && (
            <View style={[styles.infoGridRow, { marginTop: 10 }]}>
              {pm25 !== undefined && (
                <View
                  style={[
                    styles.infoGridItem,
                    {
                      backgroundColor: theme.cardSecondary,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  <View style={styles.infoItemHeader}>
                    <Ionicons name="leaf-outline" size={14} color="#16a34a" />
                    <Text style={[styles.infoItemLabel, { color: theme.textSecondary }]}>
                      PM2.5
                    </Text>
                  </View>
                  <Text style={[styles.infoItemValue, { color: theme.text }]}>
                    {pm25} µg/m³
                  </Text>
                </View>
              )}

              {pm10 !== undefined && (
                <View
                  style={[
                    styles.infoGridItem,
                    {
                      backgroundColor: theme.cardSecondary,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  <View style={styles.infoItemHeader}>
                    <Ionicons name="cloudy-outline" size={14} color="#64748b" />
                    <Text style={[styles.infoItemLabel, { color: theme.textSecondary }]}>
                      PM10
                    </Text>
                  </View>
                  <Text style={[styles.infoItemValue, { color: theme.text }]}>
                    {pm10} µg/m³
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* 4. Footer Kartu Cuaca: Status Data Terpadu & Link Detail Minimalis */}
      {(statusInfo || !tampilkanDetail) && (
        <View style={[styles.cardFooter, { borderTopColor: theme.divider }]}>
          {statusInfo ? (
            <View style={styles.statusFooterLeft}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusInfo.dotColor },
                ]}
              />
              <Text
                style={[
                  styles.statusFooterText,
                  { color: theme.textSecondary },
                ]}
              >
                {statusInfo.label} • {statusInfo.umur}
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          {!tampilkanDetail && (
            <View style={styles.detailLinkWrapper}>
              <Text style={[styles.detailLinkText, { color: theme.primary }]}>
                Lihat Detail
              </Text>
              <Ionicons name="chevron-forward" size={13} color={theme.primary} />
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
    marginBottom: 10,
  },
  kotaWrapper: {
    flex: 1,
    marginRight: 8,
  },
  kota: {
    fontFamily: fonts.bold,
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },
  kondisiWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  kondisiText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    fontWeight: "700",
  },
  content: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginVertical: 4,
  },
  suhu: {
    fontFamily: fonts.extraBold,
    fontSize: 44,
    fontWeight: "800",
    color: "#1e293b",
    letterSpacing: -1,
  },
  satuanContainer: {
    justifyContent: "center",
  },
  satuan: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: "#64748b",
    fontWeight: "600",
  },
  rentangSuhuRingkas: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
    marginTop: 2,
  },
  cardFooter: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusFooterLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusFooterText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: "500",
  },
  detailLinkWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginLeft: 8,
  },
  detailLinkText: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
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
  infoItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  infoItemLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  infoItemValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
});
