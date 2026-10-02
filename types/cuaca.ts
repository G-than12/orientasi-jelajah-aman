// types/cuaca.ts
export interface DataCuaca {
  kota: string;
  suhu: number;
  kelembapan: number;
  catatan?: string;
}
export type TingkatAQI = "BAIK" | "SEDANG" | "TIDAK_SEHAT" | "BERBAHAYA";

export interface WeatherCardProps {
  kota: string;
  suhu: number;
  tingkatAQI: TingkatAQI;
  indeksAQI?: number; // Nilai angka indeks AQI asli dari API
  kondisi?: string; // Keterangan kondisi cuaca (misal: "☀️ Cerah")
  kecepatanAngin?: number; // Kecepatan angin dalam km/j
  suhuMaks?: number; // Suhu maksimal harian (°C)
  suhuMin?: number; // Suhu minimal harian (°C)
  pm25?: number; // Partikel debu halus PM2.5 (µg/m³)
  pm10?: number; // Partikel debu kasar PM10 (µg/m³)
  tampilkanDetail?: boolean; // false untuk ringkas di Beranda, true untuk lengkap di halaman Detail
}
