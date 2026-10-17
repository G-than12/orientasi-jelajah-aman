import { Ionicons } from "@expo/vector-icons";

export interface InfoKodeCuaca {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

export const kamusKodeCuaca: Record<number, InfoKodeCuaca> = {
  0: { label: "Cerah", iconName: "sunny", iconColor: "#f59e0b" },
  1: { label: "Cerah Berawan", iconName: "partly-sunny", iconColor: "#f59e0b" },
  2: { label: "Berawan Sebagian", iconName: "cloudy", iconColor: "#38bdf8" },
  3: { label: "Mendung", iconName: "cloud", iconColor: "#64748b" },
  45: { label: "Berkabut", iconName: "reorder-three-outline", iconColor: "#94a3b8" },
  48: { label: "Kabut Beku", iconName: "reorder-three-outline", iconColor: "#94a3b8" },
  51: { label: "Gerimis Ringan", iconName: "rainy-outline", iconColor: "#38bdf8" },
  53: { label: "Gerimis Sedang", iconName: "rainy-outline", iconColor: "#0284c7" },
  55: { label: "Gerimis Lebat", iconName: "rainy", iconColor: "#0369a1" },
  61: { label: "Hujan Ringan", iconName: "rainy-outline", iconColor: "#38bdf8" },
  63: { label: "Hujan Sedang", iconName: "rainy", iconColor: "#0284c7" },
  65: { label: "Hujan Lebat", iconName: "rainy", iconColor: "#0369a1" },
  71: { label: "Salju Ringan", iconName: "snow-outline", iconColor: "#93c5fd" },
  80: { label: "Hujan Lokal Ringan", iconName: "partly-sunny-outline", iconColor: "#0284c7" },
  81: { label: "Hujan Lokal Sedang", iconName: "rainy-outline", iconColor: "#0284c7" },
  82: { label: "Hujan Lokal Lebat", iconName: "thunderstorm", iconColor: "#1d4ed8" },
  95: { label: "Badai Petir", iconName: "thunderstorm", iconColor: "#4338ca" },
};

export function infoCuaca(kode: number): InfoKodeCuaca {
  return (
    kamusKodeCuaca[kode] ?? {
      label: "Tidak diketahui",
      iconName: "help-circle-outline",
      iconColor: "#94a3b8",
    }
  );
}

export function labelKodeCuaca(kode: number): string {
  const item = kamusKodeCuaca[kode];
  if (!item) return "Tidak diketahui";
  return item.label;
}
