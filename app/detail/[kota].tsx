// app/detail/[kota].tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import WeatherCard from "../../components/WeatherCard";
import { typeScale, spacing } from "../../constants/styles";

export default function HalamanDetail() {
  const { kota } = useLocalSearchParams<{ kota: string }>();
  const namaKota = kota ?? "Kota Pilihan";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Kartu Cuaca Utama */}
      <WeatherCard kota={namaKota} suhu={29} tingkatAQI="BAIK" />

      {/* 2. Grid Info Detail Cuaca Tambahan */}
      <View style={styles.gridSection}>
        <Text style={styles.sectionTitle}>Kondisi Lingkungan</Text>
        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>💧</Text>
            <Text style={styles.metricLabel}>Kelembapan</Text>
            <Text style={styles.metricValue}>78%</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>💨</Text>
            <Text style={styles.metricLabel}>Kecepatan Angin</Text>
            <Text style={styles.metricValue}>12 km/j</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>☀️</Text>
            <Text style={styles.metricLabel}>Indeks UV</Text>
            <Text style={styles.metricValue}>Rendah (2)</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricIcon}>👁️</Text>
            <Text style={styles.metricLabel}>Jarak Pandang</Text>
            <Text style={styles.metricValue}>9 km</Text>
          </View>
        </View>
      </View>

      {/* 3. Tombol Tambahkan ke Favorit yang Elegan */}
      <TouchableOpacity
        style={styles.favButton}
        onPress={() => router.push("/tambah-favorit")}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Tambahkan ${namaKota} ke daftar favorit`}
      >
        <Text style={styles.favButtonIcon}>⭐</Text>
        <Text style={styles.favButtonText}>Tambahkan ke Favorit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: spacing.sedang,
    gap: spacing.sedang,
  },
  sectionTitle: {
    fontSize: typeScale.subjudul,
    fontWeight: "700",
    color: "#334155",
    marginBottom: spacing.kecil,
  },
  gridSection: {
    marginTop: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  metricIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: typeScale.keterangan,
    color: "#64748b",
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 2,
  },
  favButton: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  favButtonIcon: {
    fontSize: 18,
  },
  favButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
