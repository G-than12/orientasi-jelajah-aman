// constants/weatherCodes.ts

const kamusKodeCuaca: Record<number, { label: string; icon: string }> = {
  0: { label: "Cerah", icon: "☀️" },
  1: { label: "Cerah Berawan", icon: "🌤️" },
  2: { label: "Berawan Sebagian", icon: "⛅" },
  3: { label: "Mendung", icon: "☁️" },
  45: { label: "Berkabut", icon: "🌫️" },
  48: { label: "Kabut Beku", icon: "🌫️" },
  51: { label: "Gerimis Ringan", icon: "🌦️" },
  53: { label: "Gerimis Sedang", icon: "🌦️" },
  55: { label: "Gerimis Lebat", icon: "🌧️" },
  61: { label: "Hujan Ringan", icon: "🌧️" },
  63: { label: "Hujan Sedang", icon: "🌧️" },
  65: { label: "Hujan Lebat", icon: "🌧️" },
  71: { label: "Salju Ringan", icon: "🌨️" },
  80: { label: "Hujan Lokal Ringan", icon: "🌦️" },
  81: { label: "Hujan Lokal Sedang", icon: "🌧️" },
  82: { label: "Hujan Lokal Lebat", icon: "⛈️" },
  95: { label: "Badai Petir", icon: "⛈️" },
};

export function labelKodeCuaca(kode: number): string {
  const item = kamusKodeCuaca[kode];
  if (!item) return "Tidak diketahui";
  return `${item.icon} ${item.label}`;
}
