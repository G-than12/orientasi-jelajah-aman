// app/(tabs)/riwayat.tsx
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing } from "../../constants/styles";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { KotaFavorit } from "../../types/favorit";

export default function TabRiwayat() {
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [targetHapus, setTargetHapus] = useState<KotaFavorit | null>(null);
  const [sedangMenghapus, setSedangMenghapus] = useState(false);

  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit().then(setDaftarFavorit);
    }, [])
  );

  async function eksekusiHapus() {
    if (!targetHapus) return;
    setSedangMenghapus(true);
    try {
      await hapusFavorit(targetHapus.id, targetHapus.nama);
      setDaftarFavorit((prev) =>
        prev.filter(
          (k) =>
            !(
              (Number.isFinite(targetHapus.id) &&
                Number.isFinite(k.id) &&
                k.id === targetHapus.id) ||
              k.nama.trim().toLowerCase() === targetHapus.nama.trim().toLowerCase()
            )
        )
      );
      setTargetHapus(null);
    } catch (error) {
      console.error("Gagal menghapus kota favorit:", error);
    } finally {
      setSedangMenghapus(false);
    }
  }

  function batalkanHapus() {
    if (sedangMenghapus) return;
    setTargetHapus(null);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.judulSection}>Kota Favorit</Text>
          <View style={styles.badgeJumlah}>
            <Text style={styles.badgeJumlahText}>
              Tersimpan {daftarFavorit.length} kota
            </Text>
          </View>
        </View>

        {daftarFavorit.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={styles.emptyText}>Belum ada kota favorit</Text>
            <Text style={styles.emptySubtext}>
              Tambahkan kota favorit Anda dari Beranda atau Detail Cuaca.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {daftarFavorit.map((kota, index) => (
              <View key={`${kota.id}-${kota.nama}-${index}`} style={styles.cardItem}>
                <TouchableOpacity
                  style={styles.kotaLeft}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/detail/[kota]" as any,
                      params: {
                        kota: kota.nama,
                        id: String(kota.id),
                        lat: String(kota.latitude),
                        lon: String(kota.longitude),
                      },
                    })
                  }
                >
                  <View style={styles.iconBg}>
                    <Text style={{ fontSize: 16 }}>⭐</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.kotaText}>{kota.nama}</Text>
                    <Text style={styles.koordinatText}>
                      {kota.latitude.toFixed(2)}°, {kota.longitude.toFixed(2)}°
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.hapusButton}
                  onPress={() => setTargetHapus(kota)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Hapus ${kota.nama} dari favorit`}
                >
                  <Text style={styles.hapusButtonText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal Konfirmasi Hapus In-App (Bukan Alert Browser) */}
      <Modal
        visible={targetHapus !== null}
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
            style={styles.modalContent}
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
          >
            <View style={styles.modalIconContainer}>
              <Text style={styles.modalIcon}>🗑️</Text>
            </View>

            <Text style={styles.modalJudul}>Hapus Kota Favorit?</Text>
            <Text style={styles.modalKeterangan}>
              Apakah Anda yakin ingin menghapus kota ini dari daftar favorit?
            </Text>

            {targetHapus && (
              <View style={styles.modalPreviewCard}>
                <View style={styles.modalPreviewIconWrapper}>
                  <Text style={{ fontSize: 15 }}>📍</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalPreviewNama}>{targetHapus.nama}</Text>
                  <Text style={styles.modalPreviewKoordinat}>
                    {targetHapus.latitude.toFixed(2)}°, {targetHapus.longitude.toFixed(2)}°
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                style={styles.modalBatalButton}
                onPress={batalkanHapus}
                disabled={sedangMenghapus}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Batal menghapus"
              >
                <Text style={styles.modalBatalButtonText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalHapusButton}
                onPress={eksekusiHapus}
                disabled={sedangMenghapus}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Konfirmasi hapus ${targetHapus?.nama ?? "kota"}`}
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
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    padding: spacing.sedang,
    paddingBottom: 40,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  judulSection: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: 0.2,
  },
  badgeJumlah: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  badgeJumlahText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  list: {
    gap: 10,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  kotaLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
  },
  kotaText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  koordinatText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  hapusButton: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  hapusButtonText: {
    color: "#dc2626",
    fontSize: 13,
    fontWeight: "700",
  },
  emptyContainer: {
    backgroundColor: "#ffffff",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginTop: 20,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "center",
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
