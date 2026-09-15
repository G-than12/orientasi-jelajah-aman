// components/RiwayatList.tsx
import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

interface RiwayatListProps {
  daftarKota: string[];
}

export default function RiwayatList({ daftarKota }: RiwayatListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.judulSection}>Riwayat Pencarian</Text>
      <View style={styles.list}>
        {daftarKota.map((kota) => (
          <Link
            key={kota}
            href={{ pathname: "../detail/[kota]", params: { kota } }}
            style={styles.cardItem}
          >
            <View style={styles.itemRow}>
              <Text style={styles.kotaText}>{kota}</Text>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </Link>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  judulSection: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  list: {
    gap: 8,
  },
  cardItem: {
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
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
});
