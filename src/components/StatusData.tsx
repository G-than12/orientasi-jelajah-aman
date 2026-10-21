import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SumberData } from "../types/cache";
import { fonts } from "../../constants/styles";
import { usePengaturan } from "../../contexts/PengaturanContext";

interface StatusDataProps {
  sumber: SumberData;
  disimpanPada: number;
  variant?: "default" | "minimalis";
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
  if (sumber === "cache-segar") return "Data tersimpan di perangkat";
  return "Mode offline (data tersimpan)";
}

export function labelSumberMinimalis(sumber: SumberData): string {
  if (sumber === "jaringan") return "Online";
  if (sumber === "cache-segar") return "Tersimpan";
  return "Offline";
}

export default function StatusData({
  sumber,
  disimpanPada,
  variant = "default",
}: StatusDataProps) {
  const { darkMode } = usePengaturan();
  const basi = sumber === "cache-basi";
  const segar = sumber === "cache-segar";
  const label = labelSumber(sumber);
  const umur = formatUmur(disimpanPada);

  const getTheme = () => {
    if (basi) {
      return {
        bg: darkMode ? "#451a03" : "#fef3c7",
        border: darkMode ? "#78350f" : "#fde68a",
        text: darkMode ? "#fcd34d" : "#b45309",
        subtext: darkMode ? "#fef3c7" : "#92400e",
        iconName: "alert-circle-outline" as const,
      };
    }
    if (segar) {
      return {
        bg: darkMode ? "#064e3b" : "#ecfdf5",
        border: darkMode ? "#047857" : "#a7f3d0",
        text: darkMode ? "#6ee7b7" : "#065f46",
        subtext: darkMode ? "#a7f3d0" : "#047857",
        iconName: "flash-outline" as const,
      };
    }
    return {
      bg: darkMode ? "rgba(99, 102, 241, 0.18)" : "#eef2ff",
      border: darkMode ? "rgba(99, 102, 241, 0.45)" : "#c7d2fe",
      text: darkMode ? "#a5b4fc" : "#4338ca",
      subtext: darkMode ? "#c7d2fe" : "#4f46e5",
      iconName: "globe-outline" as const,
    };
  };

  const theme = getTheme();

  if (variant === "minimalis") {
    return (
      <View
        accessible
        accessibilityLabel={label + ", diperbarui " + umur}
        style={[
          styles.minimalisContainer,
          {
            borderBottomColor: darkMode
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(148, 163, 184, 0.15)",
          },
        ]}
      >
        <View
          style={[
            styles.minimalisBadge,
            {
              backgroundColor: theme.bg,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons name={theme.iconName} size={11} color={theme.text} />
          <Text style={[styles.minimalisBadgeText, { color: theme.text }]}>
            {labelSumberMinimalis(sumber)}
          </Text>
        </View>
        <Text
          style={[
            styles.minimalisUmur,
            { color: darkMode ? "#94a3b8" : "#64748b" },
          ]}
        >
          Diperbarui {umur}
        </Text>
      </View>
    );
  }

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
      <Ionicons name={theme.iconName} size={20} color={theme.text} />
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
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  umur: {
    fontFamily: fonts.medium,
    fontSize: 11,
    marginTop: 2,
  },
  minimalisContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.15)",
  },
  minimalisBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  minimalisBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  minimalisUmur: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
});
