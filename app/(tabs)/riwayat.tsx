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
import { Ionicons } from "@expo/vector-icons";
import { fonts, spacing } from "../../constants/styles";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { KotaFavorit } from "../../types/favorit";
import { usePengaturan } from "../../contexts/PengaturanContext";
import { useRiwayat, KotaRiwayat } from "../../contexts/RiwayatContext";

export default function TabRiwayat() {
  const { theme } = usePengaturan();
  const { riwayat, hapusRiwayat } = useRiwayat();

  // State tab kapsul aktif: "riwayat" (pencarian terakhir) atau "favorit" (kota favorit)
  const [tabAktif, setTabAktif] = useState<"riwayat" | "favorit">("riwayat");

  // State daftar favorit
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [targetHapusFavorit, setTargetHapusFavorit] =
    useState<KotaFavorit | null>(null);
  const [sedangMenghapusFavorit, setSedangMenghapusFavorit] = useState(false);

  // State konfirmasi hapus riwayat
  const [targetHapusRiwayat, setTargetHapusRiwayat] = useState<KotaRiwayat | null>(
    null
  );
  const [sedangMenghapusRiwayat, setSedangMenghapusRiwayat] = useState(false);

  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit().then(setDaftarFavorit);
    }, [])
  );

  // Navigasi langsung ke Detail Cuaca untuk kota yang dipilih dari riwayat
  function pilihKotaDariRiwayat(kota: KotaRiwayat) {
    router.push({
      pathname: "/detail/[kota]" as any,
      params: {
        kota: kota.name,
        id: kota.id !== undefined ? String(kota.id) : undefined,
        lat: String(kota.latitude),
        lon: String(kota.longitude),
      },
    });
  }

  // Eksekusi hapus satu item riwayat pencarian (hanya menghapus riwayat, tidak menyentuh cache offline)
  async function eksekusiHapusRiwayat() {
    if (!targetHapusRiwayat) return;
    setSedangMenghapusRiwayat(true);
    try {
      await hapusRiwayat(targetHapusRiwayat.name);
      setTargetHapusRiwayat(null);
    } catch (error) {
      console.error("Gagal menghapus item riwayat:", error);
    } finally {
      setSedangMenghapusRiwayat(false);
    }
  }

  function batalkanHapusRiwayat() {
    if (sedangMenghapusRiwayat) return;
    setTargetHapusRiwayat(null);
  }

  // Eksekusi hapus kota dari daftar favorit SQLite
  async function eksekusiHapusFavorit() {
    if (!targetHapusFavorit) return;
    setSedangMenghapusFavorit(true);
    try {
      await hapusFavorit(targetHapusFavorit.id, targetHapusFavorit.nama);
      setDaftarFavorit((prev) =>
        prev.filter(
          (k) =>
            !(
              (Number.isFinite(targetHapusFavorit.id) &&
                Number.isFinite(k.id) &&
                k.id === targetHapusFavorit.id) ||
              k.nama.trim().toLowerCase() ===
              targetHapusFavorit.nama.trim().toLowerCase()
            )
        )
      );
      setTargetHapusFavorit(null);
    } catch (error) {
      console.error("Gagal menghapus kota favorit:", error);
    } finally {
      setSedangMenghapusFavorit(false);
    }
  }

  function batalkanHapusFavorit() {
    if (sedangMenghapusFavorit) return;
    setTargetHapusFavorit(null);
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.bg }]}
      edges={["top", "left", "right"]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tab Kapsul Switcher (Riwayat Pencarian vs Kota Favorit) */}
        <View
          style={[
            styles.tabSwitcher,
            {
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tabSwitcherBtn,
              tabAktif === "riwayat" && {
                backgroundColor: theme.primary,
                shadowColor: theme.primary,
                shadowOpacity: 0.25,
                shadowRadius: 6,
                elevation: 3,
              },
            ]}
            onPress={() => setTabAktif("riwayat")}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: tabAktif === "riwayat" }}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={tabAktif === "riwayat" ? "#ffffff" : theme.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabSwitcherText,
                {
                  color:
                    tabAktif === "riwayat" ? "#ffffff" : theme.textSecondary,
                  fontWeight: tabAktif === "riwayat" ? "700" : "600",
                },
              ]}
            >
              Riwayat ({riwayat.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabSwitcherBtn,
              tabAktif === "favorit" && {
                backgroundColor: theme.primary,
                shadowColor: theme.primary,
                shadowOpacity: 0.25,
                shadowRadius: 6,
                elevation: 3,
              },
            ]}
            onPress={() => setTabAktif("favorit")}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityState={{ selected: tabAktif === "favorit" }}
          >
            <Ionicons
              name="star-outline"
              size={16}
              color={tabAktif === "favorit" ? "#ffffff" : theme.textSecondary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabSwitcherText,
                {
                  color:
                    tabAktif === "favorit" ? "#ffffff" : theme.textSecondary,
                  fontWeight: tabAktif === "favorit" ? "700" : "600",
                },
              ]}
            >
              Favorit ({daftarFavorit.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* KONTEN TAB 1: RIWAYAT PENCARIAN TERAKHIR (MAKS 10 KOTA) */}
        {/* ======================================================== */}
        {tabAktif === "riwayat" && (
          <View style={styles.sectionWrapper}>
            <View style={styles.headerRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="time" size={18} color={theme.primary} />
                <Text style={[styles.judulSection, { color: theme.text }]}>
                  Riwayat Pencarian
                </Text>
              </View>
            </View>

            {riwayat.length === 0 ? (
              <View
                style={[
                  styles.emptyContainer,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={46}
                  color={theme.textMuted}
                  style={{ marginBottom: 8 }}
                />
                <Text style={[styles.emptyText, { color: theme.text }]}>
                  Belum ada riwayat pencarian
                </Text>
                <Text
                  style={[styles.emptySubtext, { color: theme.textSecondary }]}
                >
                  Cari nama kota di Beranda untuk menyimpan data perkiraan cuaca
                  secara offline otomatis (maksimal 10 pencarian terakhir).
                </Text>
              </View>
            ) : (
              <View style={styles.list}>
                {riwayat.map((kota, index) => (
                  <View
                    key={`riwayat-${kota.name}-${index}`}
                    style={[
                      styles.cardItem,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.cardBorder,
                        borderLeftColor: theme.primary,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.kotaLeft}
                      activeOpacity={0.7}
                      onPress={() => pilihKotaDariRiwayat(kota)}
                      accessibilityRole="button"
                      accessibilityLabel={`Buka detail cuaca ${kota.name}`}
                    >
                      <Text style={[styles.kotaText, { color: theme.text }]}>
                        {kota.name}
                      </Text>

                      <View style={styles.koordinatRow}>
                        <Ionicons
                          name="location-outline"
                          size={12}
                          color={theme.textMuted}
                        />
                        <Text
                          style={[
                            styles.koordinatText,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {kota.latitude.toFixed(2)}°, {kota.longitude.toFixed(2)}°
                          {kota.admin1 ? ` • ${kota.admin1}` : ""}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.actionGroup}>
                      <TouchableOpacity
                        style={styles.hapusButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={() => setTargetHapusRiwayat(kota)}
                        activeOpacity={0.6}
                        accessibilityRole="button"
                        accessibilityLabel={`Hapus riwayat ${kota.name}`}
                      >
                        <Ionicons name="trash-outline" size={19} color="#ef4444" />
                      </TouchableOpacity>

                      <View
                        style={[
                          styles.actionDivider,
                          { backgroundColor: theme.cardBorder },
                        ]}
                      />

                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => pilihKotaDariRiwayat(kota)}
                        style={styles.chevronButton}
                        accessibilityLabel={`Buka detail cuaca ${kota.name}`}
                      >
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={theme.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ======================================================== */}
        {/* KONTEN TAB 2: DAFTAR KOTA FAVORIT TERSIMPAN               */}
        {/* ======================================================== */}
        {tabAktif === "favorit" && (
          <View style={styles.sectionWrapper}>
            <View style={styles.headerRow}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="star" size={18} color="#eab308" />
                <Text style={[styles.judulSection, { color: theme.text }]}>
                  Kota Favorit
                </Text>
              </View>
            </View>

            {daftarFavorit.length === 0 ? (
              <View
                style={[
                  styles.emptyContainer,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <Ionicons
                  name="star-outline"
                  size={46}
                  color={theme.textMuted}
                  style={{ marginBottom: 8 }}
                />
                <Text style={[styles.emptyText, { color: theme.text }]}>
                  Belum ada kota favorit
                </Text>
                <Text
                  style={[styles.emptySubtext, { color: theme.textSecondary }]}
                >
                  Tambahkan kota favorit Anda dari Beranda atau Detail Cuaca.
                </Text>
              </View>
            ) : (
              <View style={styles.list}>
                {daftarFavorit.map((kota, index) => (
                  <View
                    key={`favorit-${kota.id}-${kota.nama}-${index}`}
                    style={[
                      styles.cardItem,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.cardBorder,
                        borderLeftColor: "#eab308",
                      },
                    ]}
                  >
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
                      <Text style={[styles.kotaText, { color: theme.text }]}>
                        {kota.nama}
                      </Text>

                      <View style={styles.koordinatRow}>
                        <Ionicons
                          name="location-outline"
                          size={12}
                          color={theme.textMuted}
                        />
                        <Text
                          style={[
                            styles.koordinatText,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {kota.latitude.toFixed(2)}°, {kota.longitude.toFixed(2)}°
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <View style={styles.actionGroup}>
                      <TouchableOpacity
                        style={styles.hapusButton}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        onPress={() => setTargetHapusFavorit(kota)}
                        activeOpacity={0.6}
                        accessibilityRole="button"
                        accessibilityLabel={`Hapus ${kota.nama} dari favorit`}
                      >
                        <Ionicons name="trash-outline" size={19} color="#ef4444" />
                      </TouchableOpacity>

                      <View
                        style={[
                          styles.actionDivider,
                          { backgroundColor: theme.cardBorder },
                        ]}
                      />

                      <TouchableOpacity
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
                        style={styles.chevronButton}
                        accessibilityLabel={`Buka detail cuaca ${kota.nama}`}
                      >
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color={theme.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL KONFIRMASI HAPUS RIWAYAT PENCARIAN                 */}
      {/* ======================================================== */}
      <Modal
        visible={targetHapusRiwayat !== null}
        transparent
        animationType="fade"
        onRequestClose={batalkanHapusRiwayat}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdropPressable}
            onPress={batalkanHapusRiwayat}
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
              Hapus Riwayat Pencarian?
            </Text>
            <Text
              style={[styles.modalKeterangan, { color: theme.textSecondary }]}
            >
              Apakah Anda yakin ingin menghapus kota ini dari riwayat pencarian?
            </Text>

            {targetHapusRiwayat && (
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
                    name="time-outline"
                    size={16}
                    color="#2563eb"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalPreviewNama, { color: theme.text }]}>
                    {targetHapusRiwayat.name}
                  </Text>
                  <Text
                    style={[
                      styles.modalPreviewKoordinat,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {targetHapusRiwayat.latitude.toFixed(2)}°,{" "}
                    {targetHapusRiwayat.longitude.toFixed(2)}°
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                style={[
                  styles.modalBatalButton,
                  { backgroundColor: theme.cardSecondary },
                ]}
                onPress={batalkanHapusRiwayat}
                disabled={sedangMenghapusRiwayat}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Batal menghapus riwayat"
              >
                <Text style={[styles.modalBatalButtonText, { color: theme.text }]}>
                  Batal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalHapusButton}
                onPress={eksekusiHapusRiwayat}
                disabled={sedangMenghapusRiwayat}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Konfirmasi hapus riwayat"
              >
                {sedangMenghapusRiwayat ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.modalHapusButtonText}>Ya, Hapus</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL KONFIRMASI HAPUS FAVORIT                             */}
      {/* ======================================================== */}
      <Modal
        visible={targetHapusFavorit !== null}
        transparent
        animationType="fade"
        onRequestClose={batalkanHapusFavorit}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdropPressable}
            onPress={batalkanHapusFavorit}
            accessibilityLabel="Tutup dialog konfirmasi favorit"
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
                { backgroundColor: "#fef3c7" },
              ]}
            >
              <Ionicons name="star" size={28} color="#eab308" />
            </View>

            <Text style={[styles.modalJudul, { color: theme.text }]}>
              Hapus Kota Favorit?
            </Text>
            <Text
              style={[styles.modalKeterangan, { color: theme.textSecondary }]}
            >
              Apakah Anda yakin ingin menghapus kota ini dari daftar favorit?
            </Text>

            {targetHapusFavorit && (
              <View
                style={[
                  styles.modalPreviewCard,
                  {
                    backgroundColor: theme.cardSecondary,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.modalPreviewIconWrapper,
                    { backgroundColor: "#fef3c7" },
                  ]}
                >
                  <Ionicons name="location-outline" size={16} color="#eab308" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalPreviewNama, { color: theme.text }]}>
                    {targetHapusFavorit.nama}
                  </Text>
                  <Text
                    style={[
                      styles.modalPreviewKoordinat,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {targetHapusFavorit.latitude.toFixed(2)}°,{" "}
                    {targetHapusFavorit.longitude.toFixed(2)}°
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                style={[
                  styles.modalBatalButton,
                  { backgroundColor: theme.cardSecondary },
                ]}
                onPress={batalkanHapusFavorit}
                disabled={sedangMenghapusFavorit}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Batal menghapus favorit"
              >
                <Text style={[styles.modalBatalButtonText, { color: theme.text }]}>
                  Batal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalHapusButton}
                onPress={eksekusiHapusFavorit}
                disabled={sedangMenghapusFavorit}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Konfirmasi hapus ${targetHapusFavorit?.nama ?? "kota"}`}
              >
                {sedangMenghapusFavorit ? (
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
  topHeader: {
    marginBottom: 4,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  mainSubtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  tabSwitcher: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  tabSwitcherBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabSwitcherText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
  },
  sectionWrapper: {
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  judulSection: {
    fontFamily: fonts.bold,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  badgeJumlah: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeJumlahText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    fontWeight: "700",
  },
  list: {
    gap: 10,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  kotaLeft: {
    flex: 1,
    justifyContent: "center",
  },
  kotaTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  kotaText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  tagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  tagBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  koordinatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  koordinatText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: "500",
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
  chevronButton: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  chipOffline: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 4,
  },
  chipOfflineText: {
    fontSize: 11,
    fontWeight: "700",
  },
  hapusButton: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  hapusCacheButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  hapusButtonText: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyContainer: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    marginTop: 10,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
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
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
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
    fontFamily: fonts.bold,
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  modalKeterangan: {
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  modalPreviewCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
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
    fontFamily: fonts.bold,
    fontSize: 15,
    fontWeight: "700",
  },
  modalPreviewKoordinat: {
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 2,
  },
  modalButtonGroup: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  modalBatalButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBatalButtonText: {
    fontFamily: fonts.semiBold,
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
    fontFamily: fonts.bold,
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
