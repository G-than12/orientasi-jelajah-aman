// services/pengaturanStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface PreferensiPengguna {
  celcius: boolean;
  notifikasi: boolean;
  darkMode: boolean;
}

const KUNCI_PENGATURAN = "@jelajah_aman:pengaturan";

export const PREFERENSI_DEFAULT: PreferensiPengguna = {
  celcius: true,
  notifikasi: true,
  darkMode: false,
};

/**
 * Mengambil preferensi pengguna dari AsyncStorage.
 * Jika belum ada atau parsing gagal, mengembalikan nilai bawaan PREFERENSI_DEFAULT.
 */
export async function ambilPreferensi(): Promise<PreferensiPengguna> {
  try {
    const raw = await AsyncStorage.getItem(KUNCI_PENGATURAN);
    if (!raw) return PREFERENSI_DEFAULT;
    const parsed = JSON.parse(raw);
    return {
      celcius:
        typeof parsed.celcius === "boolean"
          ? parsed.celcius
          : PREFERENSI_DEFAULT.celcius,
      notifikasi:
        typeof parsed.notifikasi === "boolean"
          ? parsed.notifikasi
          : PREFERENSI_DEFAULT.notifikasi,
      darkMode:
        typeof parsed.darkMode === "boolean"
          ? parsed.darkMode
          : PREFERENSI_DEFAULT.darkMode,
    };
  } catch (err) {
    console.error("Gagal membaca preferensi pengguna dari storage:", err);
    return PREFERENSI_DEFAULT;
  }
}

/**
 * Menyimpan sebagian atau seluruh preferensi pengguna ke AsyncStorage.
 */
export async function simpanPreferensi(
  preferensiBaru: Partial<PreferensiPengguna>
): Promise<PreferensiPengguna> {
  try {
    const dataLama = await ambilPreferensi();
    const dataGabungan: PreferensiPengguna = {
      ...dataLama,
      ...preferensiBaru,
    };
    await AsyncStorage.setItem(KUNCI_PENGATURAN, JSON.stringify(dataGabungan));
    return dataGabungan;
  } catch (err) {
    console.error("Gagal menyimpan preferensi pengguna ke storage:", err);
    return PREFERENSI_DEFAULT;
  }
}
