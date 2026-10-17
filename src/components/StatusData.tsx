// src/components/StatusData.tsx
import { View, Text, StyleSheet } from "react-native";
import { SumberData } from "../types/cache";

interface StatusDataProps {
  sumber: SumberData;
  disimpanPada: number;
}

export function formatUmur(disimpanPada: number): string {
  const menit = Math.floor((Date.now() - disimpanPada) / 60000);
  if (menit < 1) return "baru saja";
  if (menit < 60) return menit + " menit lalu";
  const jam = Math.floor(menit / 60);
  if (jam < 24) return jam + " jam lalu";
  return Math.floor(jam / 24) + " hari lalu";
}

export function labelSumber(sumber: SumberData): string {
  if (sumber === "jaringan") return "Data terbaru dari internet";
  if (sumber === "cache-segar") return "Data tersimpan (masih segar)";
  return "Mode offline - data tersimpan mungkin sudah usang";
}

export default function StatusData({ sumber, disimpanPada }: StatusDataProps) {
  const basi = sumber === "cache-basi";
  const segar = sumber === "cache-segar";
  const label = labelSumber(sumber);
  const umur = formatUmur(disimpanPada);

  const getTheme = () => {
    if (basi) {
      return {
        bg: "#fef3c7",
        border: "#fde68a",
        text: "#b45309",
        subtext: "#92400e",
        icon: "⚠️",
      };
    }
    if (segar) {
      return {
        bg: "#ecfdf5",
        border: "#a7f3d0",
        text: "#065f46",
        subtext: "#047857",
        icon: "⚡",
      };
    }
    return {
      bg: "#eff6ff",
      border: "#bfdbfe",
      text: "#1e40af",
      subtext: "#2563eb",
      icon: "🌐",
    };
  };

  const theme = getTheme();

  return (
    <View
      accessible
      accessibilityLabel={label + ", diperbarui " + umur}
      style={[
        styles.container,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border,
        },
      ]}
    >
      <Text style={styles.icon}>{theme.icon}</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.umur, { color: theme.subtext }]}>
          Diperbarui {umur}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 4,
    gap: 10,
  },
  icon: {
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
  },
  umur: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
});
