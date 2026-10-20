import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
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
    ikutiSistem,
    setIkutiSistem,
    temaSistem,
    theme,
  } = usePengaturan();
  const [pesan, setPesan] = useState<string | null>(null);
  const [sedangMenghapus, setSedangMenghapus] = useState(false);
  const [tampilkanModalHapus, setTampilkanModalHapus] = useState(false);

  function batalkanHapus() {
    if (sedangMenghapus) return;
    setTampilkanModalHapus(false);
  }

  async function eksekusiHapusCache() {
    setSedangMenghapus(true);
    try {
      await hapusSemuaCache();
      setPesan("Data cuaca tersimpan sudah dihapus.");
      setTampilkanModalHapus(false);
    } catch {
      setPesan("Gagal menghapus cache cuaca.");
      setTampilkanModalHapus(false);
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

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          {/* 3. Pengaturan Ikuti Tema Sistem */}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={styles.titleWithIcon}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={18}
                  color={ikutiSistem ? "#2563eb" : darkMode ? "#60a5fa" : "#64748b"}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.itemTitle, { color: theme.text }]}>
                  Ikuti Tema Sistem
                </Text>
              </View>
              <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
                {ikutiSistem
                  ? `Otomatis ikuti tema HP (${temaSistem === "dark" ? "Gelap" : "Terang"})`
                  : "Atur tema secara manual lewat tombol di atas"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View
                style={[
                  styles.satuanBadge,
                  {
                    backgroundColor: ikutiSistem
                      ? darkMode
                        ? "#1e293b"
                        : "#eff6ff"
                      : darkMode
                      ? "#1e293b"
                      : "#f1f5f9",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.satuanBadgeText,
                    {
                      color: ikutiSistem
                        ? darkMode
                          ? "#60a5fa"
                          : "#2563eb"
                        : theme.textMuted,
                    },
                  ]}
                >
                  {ikutiSistem ? "Otomatis" : "Manual"}
                </Text>
              </View>
              <Switch
                value={ikutiSistem}
                onValueChange={setIkutiSistem}
                trackColor={{
                  false: darkMode ? "#334155" : "#cbd5e1",
                  true: "#2563eb",
                }}
                thumbColor="#ffffff"
                accessibilityRole="switch"
                accessibilityLabel="Ikuti tema sistem perangkat"
              />
            </View>
          </View>

          {ikutiSistem && (
            <View
              style={[
                styles.systemInfoBox,
                {
                  backgroundColor: darkMode ? "#0f172a" : "#eff6ff",
                  borderColor: darkMode ? "#1e293b" : "#bfdbfe",
                },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={darkMode ? "#60a5fa" : "#2563eb"}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.systemInfoText,
                  { color: darkMode ? "#93c5fd" : "#1d4ed8" },
                ]}
              >
                Sistem HP Anda saat ini:{" "}
                <Text style={{ fontWeight: "700" }}>
                  Mode {temaSistem === "dark" ? "Gelap (Dark)" : "Terang (Light)"}
                </Text>
              </Text>
            </View>
          )}
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
            onPress={() => setTampilkanModalHapus(true)}
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

      {/* Modal Konfirmasi Hapus Cache Cuaca */}
      <Modal
        visible={tampilkanModalHapus}
        transparent
        animationType="fade"
        onRequestClose={batalkanHapus}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdropPressable}
            onPress={batalkanHapus}
            accessibilityLabel="Tutup dialog konfirmasi"
          />
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
              },
            ]}
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
          >
            <View
              style={[
                styles.modalIconContainer,
                { backgroundColor: theme.tombolHapusBg },
              ]}
            >
              <Ionicons name="trash-outline" size={28} color="#ef4444" />
            </View>

            <Text style={[styles.modalJudul, { color: theme.text }]}>
              Hapus Cache Cuaca?
            </Text>
            <Text
              style={[
                styles.modalKeterangan,
                { color: theme.textSecondary },
              ]}
            >
              Apakah Anda yakin ingin menghapus seluruh salinan data cuaca offline
              dari perangkat? Tindakan ini akan mengosongkan cache lokal SQLite.
            </Text>

            <View
              style={[
                styles.modalPreviewCard,
                {
                  backgroundColor: theme.cardSecondary,
                  borderColor: theme.cardBorder,
                },
              ]}
            >
              <View style={styles.modalPreviewIconWrapper}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={18}
                  color="#2563eb"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.modalPreviewNama, { color: theme.text }]}
                >
                  Penyimpanan SQLite Lokal
                </Text>
                <Text
                  style={[
                    styles.modalPreviewKoordinat,
                    { color: theme.textSecondary },
                  ]}
                >
                  Semua cache perkiraan cuaca & AQI akan dibersihkan
                </Text>
              </View>
            </View>

            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                style={[
                  styles.modalBatalButton,
                  { backgroundColor: theme.cardSecondary },
                ]}
                onPress={batalkanHapus}
                disabled={sedangMenghapus}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Batal menghapus"
              >
                <Text
                  style={[styles.modalBatalButtonText, { color: theme.text }]}
                >
                  Batal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalHapusButton}
                onPress={eksekusiHapusCache}
                disabled={sedangMenghapus}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Konfirmasi hapus cache cuaca"
              >
                {sedangMenghapus ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.modalHapusButtonText}>Ya, Hapus</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  systemInfoBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: 6,
  },
  systemInfoText: {
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.sedang,
  },
  modalBackdropPressable: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContent: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
    zIndex: 10,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 4,
    borderColor: "#fef2f2",
  },
  modalIcon: {
    fontSize: 26,
  },
  modalJudul: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  modalKeterangan: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  modalPreviewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    width: "100%",
    marginBottom: 20,
    gap: 12,
  },
  modalPreviewIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  modalPreviewNama: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  modalPreviewKoordinat: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  modalButtonGroup: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  modalBatalButton: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBatalButtonText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
  },
  modalHapusButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  modalHapusButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
