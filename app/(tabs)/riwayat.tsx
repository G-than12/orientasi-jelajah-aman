// app/(tabs)/riwayat.tsx
import { useCallback, useState } from "react";
import {
  Alert,
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

  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit().then(setDaftarFavorit);
    }, [])
  );

  async function hapus(id: number) {
    await hapusFavorit(id);
    setDaftarFavorit((prev) => prev.filter((k) => k.id !== id));
  }

  function konfirmasiHapus(kota: KotaFavorit) {
    Alert.alert(
      "Konfirmasi Hapus",
      `Yakin hapus ${kota.nama}?`,
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => hapus(kota.id),
        },
      ]
    );
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
            {daftarFavorit.map((kota) => (
              <View key={kota.id} style={styles.cardItem}>
                <TouchableOpacity
                  style={styles.kotaLeft}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: "/detail/[kota]",
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
                  onPress={() => konfirmasiHapus(kota)}
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
});
