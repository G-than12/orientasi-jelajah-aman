// components/RiwayatList.tsx
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

interface RiwayatListProps {
  daftarKota: string[];
}

export default function RiwayatList({ daftarKota }: RiwayatListProps) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.judulSection}>Riwayat Pencarian</Text>
        {daftarKota.length > 0 && (
          <Text style={styles.jumlahBadge}>{daftarKota.length} Kota</Text>
        )}
      </View>

      {daftarKota.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Belum ada riwayat pencarian kota.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {daftarKota.map((kota) => (
            <Link
              key={kota}
              href={{ pathname: "/detail/[kota]" as any, params: { kota } } as any}
              style={styles.cardItem}
            >
              <View style={styles.itemRow}>
                <View style={styles.kotaLeft}>
                  <Text style={styles.pinIcon}>📍</Text>
                  <Text style={styles.kotaText}>{kota}</Text>
                </View>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </Link>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  judulSection: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  jumlahBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  list: {
    gap: 8,
  },
  cardItem: {
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  kotaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pinIcon: {
    fontSize: 15,
  },
  kotaText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  arrowText: {
    fontSize: 18,
    color: "#94a3b8",
  },
  emptyContainer: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
  },
});
