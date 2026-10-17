// app/(tabs)/pengaturan.tsx
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing } from "../../constants/styles";
import { hapusSemuaCache } from "../../services/cacheRepository";

export default function TabPengaturan() {
  const [notifikasi, setNotifikasi] = useState(true);
  const [celcius, setCelcius] = useState(true);
  const [pesan, setPesan] = useState<string | null>(null);
  const [sedangMenghapus, setSedangMenghapus] = useState(false);

  async function hapusDataTersimpan() {
    setSedangMenghapus(true);
    try {
      await hapusSemuaCache();
      setPesan("Data cuaca tersimpan sudah dihapus.");
    } catch {
      setPesan("Gagal menghapus cache cuaca.");
    } finally {
      setSedangMenghapus(false);
    }
  }

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

        {/* Bagian Manajemen Cache & Penyimpanan Offline */}
        <Text style={[styles.sectionHeader, { marginTop: spacing.sedang }]}>
          Penyimpanan & Cache SQLite
        </Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.itemTitle}>Cache Cuaca Offline</Text>
              <Text style={styles.itemSubtitle}>
                Hapus salinan database lokal untuk membebaskan ruang atau uji
                first-run
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.tombolHapusCache}
            activeOpacity={0.8}
            onPress={hapusDataTersimpan}
            disabled={sedangMenghapus}
            accessibilityRole="button"
            accessibilityLabel="Hapus Data Cuaca Tersimpan"
          >
            {sedangMenghapus ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <>
                <Text style={styles.tombolHapusCacheIcon}>🗑️</Text>
                <Text style={styles.tombolHapusCacheText}>
                  Hapus Data Cuaca Tersimpan
                </Text>
              </>
            )}
          </TouchableOpacity>

          {pesan && (
            <View style={styles.pesanBox}>
              <Text style={styles.pesanBoxText} accessibilityLabel={pesan}>
                {pesan}
              </Text>
            </View>
          )}
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
    paddingVertical: 10,
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
  tombolHapusCache: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 8,
    gap: 8,
  },
  tombolHapusCacheIcon: {
    fontSize: 15,
  },
  tombolHapusCacheText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "700",
  },
  pesanBox: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  pesanBoxText: {
    fontSize: 13,
    color: "#1e40af",
    fontWeight: "500",
    textAlign: "center",
  },
});
