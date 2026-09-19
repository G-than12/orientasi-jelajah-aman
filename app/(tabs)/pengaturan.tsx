// app/(tabs)/pengaturan.tsx
import React, { useState } from "react";
import { View, Text, Switch, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typeScale, spacing } from "../../constants/styles";

export default function TabPengaturan() {
  const [notifikasi, setNotifikasi] = useState(true);
  const [celcius, setCelcius] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Bagian Preferensi */}
        <Text style={styles.sectionHeader}>Preferensi Cuaca</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View>
              <Text style={styles.itemTitle}>Notifikasi Cuaca Buruk</Text>
              <Text style={styles.itemSubtitle}>
                Peringatan dini saat AQI tidak sehat
              </Text>
            </View>
            <Switch value={notifikasi} onValueChange={setNotifikasi} />
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View>
              <Text style={styles.itemTitle}>Satuan Suhu</Text>
              <Text style={styles.itemSubtitle}>
                {celcius ? "Celsius (°C)" : "Fahrenheit (°F)"}
              </Text>
            </View>
            <Switch value={celcius} onValueChange={setCelcius} />
          </View>
        </View>

        {/* Bagian Informasi Aplikasi */}
        <Text style={[styles.sectionHeader, { marginTop: spacing.sedang }]}>
          Tentang Sistem
        </Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.itemTitle}>Nama Aplikasi</Text>
            <Text style={styles.itemValue}>Jelajah Aman</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.itemTitle}>Versi</Text>
            <Text style={styles.itemValue}>1.0.0 (Expo Router)</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: spacing.sedang,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
  },
  itemSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  itemValue: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
  },
});
