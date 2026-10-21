import { Ionicons } from "@expo/vector-icons";
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
import { fonts, spacing } from "../../constants/styles";
import { usePengaturan } from "../../contexts/PengaturanContext";
import { hapusSemuaCache } from "../../services/cacheRepository";

export default function TabPengaturan() {
  const {
    celcius,
    setCelcius,
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
      setPesan("Cache cuaca berhasil dibersihkan");
      setTampilkanModalHapus(false);
      setTimeout(() => setPesan(null), 3000);
    } catch {
      setPesan("Gagal membersihkan cache");
      setTampilkanModalHapus(false);
      setTimeout(() => setPesan(null), 3000);
    } finally {
      setSedangMenghapus(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["bottom", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================================== */}
        {/* SEKSI 1: PREFERENSI APLIKASI                             */}
        {/* ======================================================== */}
        <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>
          Preferensi
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
          {/* 1. Satuan Suhu */}
          <View style={styles.row}>
            <View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor: theme.primaryBg,
                },
              ]}
            >
              <Ionicons
                name="thermometer-outline"
                size={18}
                color={celcius ? theme.primary : "#f59e0b"}
              />
            </View>

            <View style={styles.textWrapper}>
              <Text style={[styles.itemTitle, { color: theme.text }]}>
                Satuan Suhu
              </Text>
              <Text
                style={[styles.itemSubtitle, { color: theme.textSecondary }]}
              >
                {celcius ? "Celsius (°C)" : "Fahrenheit (°F)"}
              </Text>
            </View>

            <Switch
              value={celcius}
              onValueChange={setCelcius}
              trackColor={{ false: "#cbd5e1", true: theme.primary }}
              thumbColor="#ffffff"
              accessibilityRole="switch"
              accessibilityLabel={`Satuan suhu: ${celcius ? "Celsius" : "Fahrenheit"}`}
            />
          </View>

          <View
            style={[styles.insetDivider, { backgroundColor: theme.divider }]}
          />

          {/* 2. Ikuti Tema Sistem */}
          <View style={styles.row}>
            <View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor: theme.cardSecondary,
                },
              ]}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={18}
                color={ikutiSistem ? theme.primary : theme.textSecondary}
              />
            </View>

            <View style={styles.textWrapper}>
              <Text style={[styles.itemTitle, { color: theme.text }]}>
                Ikuti Tema Sistem
              </Text>
              <Text
                style={[styles.itemSubtitle, { color: theme.textSecondary }]}
              >
                {ikutiSistem
                  ? `Otomatis (${temaSistem === "dark" ? "Gelap" : "Terang"})`
                  : "Manual"}
              </Text>
            </View>

            <Switch
              value={ikutiSistem}
              onValueChange={setIkutiSistem}
              trackColor={{ false: "#cbd5e1", true: theme.primary }}
              thumbColor="#ffffff"
              accessibilityRole="switch"
              accessibilityLabel="Ikuti tema sistem perangkat"
            />
          </View>
        </View>

        {/* ======================================================== */}
        {/* SEKSI 2: PENYIMPANAN                                     */}
        {/* ======================================================== */}
        <Text
          style={[
            styles.sectionHeader,
            { color: theme.textMuted, marginTop: spacing.sedang },
          ]}
        >
          Penyimpanan
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
            <View
              style={[
                styles.iconWrapper,
                {
                  backgroundColor: theme.primaryBg,
                },
              ]}
            >
              <Ionicons
                name="cloud-offline-outline"
                size={18}
                color={theme.primary}
              />
            </View>

            <TouchableOpacity
              style={styles.textWrapper}
              activeOpacity={0.7}
              onPress={() => setTampilkanModalHapus(true)}
              accessibilityRole="button"
              accessibilityLabel="Hapus Cache Cuaca Offline"
            >
              <Text style={[styles.itemTitle, { color: theme.text }]}>
                Cache Cuaca Offline
              </Text>
              <Text
                style={[styles.itemSubtitle, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                Kosongkan data cuaca lokal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hapusButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => setTampilkanModalHapus(true)}
              disabled={sedangMenghapus}
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityLabel="Hapus cache cuaca"
            >
              {sedangMenghapus ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <Ionicons name="trash-outline" size={19} color="#ef4444" />
              )}
            </TouchableOpacity>
          </View>

          {pesan && (
            <View
              style={[
                styles.pesanBox,
                {
                  backgroundColor: darkMode ? "#064e3b" : "#ecfdf5",
                  borderColor: darkMode ? "#047857" : "#a7f3d0",
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={15}
                color="#10b981"
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.pesanText,
                  { color: darkMode ? "#6ee7b7" : "#047857" },
                ]}
              >
                {pesan}
              </Text>
            </View>
          )}
        </View>

        {/* Minimalist Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            Jelajah Aman • Versi 1.0.0
          </Text>
        </View>
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL KONFIRMASI HAPUS CACHE CUACA                      */}
      {/* ======================================================== */}
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
              <Ionicons name="trash-outline" size={26} color="#ef4444" />
            </View>

            <Text style={[styles.modalJudul, { color: theme.text }]}>
              Hapus Cache Cuaca?
            </Text>
            <Text
              style={[styles.modalKeterangan, { color: theme.textSecondary }]}
            >
              Tindakan ini akan mengosongkan semua salinan data cuaca offline
              dan perkiraan lokal dari perangkat.
            </Text>

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
    paddingBottom: 40,
  },
  sectionHeader: {
    fontFamily: fonts.bold,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
  },
  itemSubtitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2,
  },
  insetDivider: {
    height: 1,
    marginLeft: 62,
  },
  actionGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionDivider: {
    width: 1,
    height: 18,
    marginHorizontal: 4,
  },
  hapusButton: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  chevronButton: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  pesanBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  pesanText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    marginBottom: 16,
  },
  footerText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
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
    maxWidth: 340,
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    zIndex: 10,
  },
  modalIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalJudul: {
    fontFamily: fonts.bold,
    fontSize: 18,
    marginBottom: 6,
    textAlign: "center",
  },
  modalKeterangan: {
    fontFamily: fonts.regular,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  modalButtonGroup: {
    flexDirection: "row",
    width: "100%",
    gap: 10,
  },
  modalBatalButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBatalButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
  },
  modalHapusButton: {
    flex: 1,
    backgroundColor: "#ef4444",
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalHapusButtonText: {
    fontFamily: fonts.bold,
    color: "#ffffff",
    fontSize: 14,
  },
});
