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
import { Ionicons } from "@expo/vector-icons";
import { spacing } from "../../constants/styles";
import { hapusSemuaCache } from "../../services/cacheRepository";
import { usePengaturan } from "../../contexts/PengaturanContext";

export default function TabPengaturan() {
  const {
    celcius,
    setCelcius,
    notifikasi,
    setNotifikasi,
    darkMode,
    theme,
  } = usePengaturan();
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["bottom", "left", "right"]}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Bagian Preferensi Tampilan & Cuaca */}
        <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>
          Tampilan & Preferensi
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          {/* 1. Pengaturan Satuan Suhu */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={styles.titleWithIcon}>
                <Ionicons
                  name="thermometer-outline"
                  size={18}
                  color={celcius ? "#2563eb" : "#f59e0b"}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.itemTitle, { color: theme.text }]}>
                  Satuan Suhu
                </Text>
              </View>
              <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
                {celcius ? "Celsius (°C)" : "Fahrenheit (°F)"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View
                style={[
                  styles.satuanBadge,
                  {
                    backgroundColor: celcius
                      ? darkMode
                        ? "#1e293b"
                        : "#eff6ff"
                      : darkMode
                      ? "#332211"
                      : "#fef3c7",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.satuanBadgeText,
                    { color: celcius ? (darkMode ? "#60a5fa" : "#2563eb") : "#f59e0b" },
                  ]}
                >
                  {celcius ? "°C" : "°F"}
                </Text>
              </View>
              <Switch
                value={celcius}
                onValueChange={setCelcius}
                trackColor={{ false: "#f59e0b", true: "#2563eb" }}
                thumbColor="#ffffff"
                accessibilityRole="switch"
                accessibilityLabel={`Satuan suhu aktif: ${
                  celcius ? "Celsius" : "Fahrenheit"
                }`}
              />
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* 3. Pengaturan Notifikasi Cuaca Buruk */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={styles.titleWithIcon}>
                <Ionicons
                  name="notifications-outline"
                  size={18}
                  color={darkMode ? "#60a5fa" : "#2563eb"}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.itemTitle, { color: theme.text }]}>
                  Notifikasi Cuaca Buruk
                </Text>
              </View>
              <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
                Peringatan dini saat AQI tidak sehat
              </Text>
            </View>
            <Switch
              value={notifikasi}
              onValueChange={setNotifikasi}
              trackColor={{ false: darkMode ? "#334155" : "#cbd5e1", true: "#2563eb" }}
              thumbColor="#ffffff"
              accessibilityRole="switch"
              accessibilityLabel="Notifikasi cuaca buruk"
            />
          </View>
        </View>

        {/* Bagian Manajemen Cache & Penyimpanan Offline */}
        <Text
          style={[
            styles.sectionHeader,
            { color: theme.textMuted, marginTop: spacing.sedang },
          ]}
        >
          Penyimpanan & Cache SQLite
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.itemTitle, { color: theme.text }]}>
                Cache Cuaca Offline
              </Text>
              <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
                Hapus salinan database lokal untuk membebaskan ruang atau uji
                first-run
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.tombolHapusCache,
              {
                backgroundColor: theme.tombolHapusBg,
                borderColor: theme.tombolHapusBorder,
              },
            ]}
            activeOpacity={0.8}
            onPress={hapusDataTersimpan}
            disabled={sedangMenghapus}
            accessibilityRole="button"
            accessibilityLabel="Hapus Data Cuaca Tersimpan"
          >
            {sedangMenghapus ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
                <Text style={styles.tombolHapusCacheText}>
                  Hapus Data Cuaca Tersimpan
                </Text>
              </>
            )}
          </TouchableOpacity>

          {pesan && (
            <View
              style={[
                styles.pesanBox,
                {
                  backgroundColor: darkMode ? "#1e293b" : "#eff6ff",
                  borderColor: darkMode ? "#3b82f6" : "#bfdbfe",
                },
              ]}
            >
              <Text
                style={[
                  styles.pesanBoxText,
                  { color: darkMode ? "#93c5fd" : "#1e40af" },
                ]}
                accessibilityLabel={pesan}
              >
                {pesan}
              </Text>
            </View>
          )}
        </View>

        {/* Bagian Informasi Aplikasi */}
        <Text
          style={[
            styles.sectionHeader,
            { color: theme.textMuted, marginTop: spacing.sedang },
          ]}
        >
          Tentang Sistem
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <View style={styles.row}>
            <Text style={[styles.itemTitle, { color: theme.text }]}>
              Nama Aplikasi
            </Text>
            <Text style={[styles.itemValue, { color: theme.textSecondary }]}>
              Jelajah Aman
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.divider }]} />
          <View style={styles.row}>
            <Text style={[styles.itemTitle, { color: theme.text }]}>Versi</Text>
            <Text style={[styles.itemValue, { color: theme.textSecondary }]}>
              1.0.0 (Expo Router)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.sedang,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  titleWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  itemSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
  },
  tombolHapusCache: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 8,
    gap: 8,
  },
  tombolHapusCacheText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "700",
  },
  pesanBox: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  pesanBoxText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  satuanBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 32,
    alignItems: "center",
  },
  satuanBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
