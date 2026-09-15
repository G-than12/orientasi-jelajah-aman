// types/udara.ts (atau tambahkan ke types/cuaca.ts)

export type TingkatKualitasUdara =
  | "BAIK"
  | "SEDANG"
  | "TIDAK_SEHAT"
  | "BERBAHAYA";

export interface LaporanUdara {
  kota: string; // Wajib
  indeksAQI: number; // Wajib
  tingkat: TingkatKualitasUdara; // Union type, wajib
  diperbaruiPada?: string; // Opsional
}
