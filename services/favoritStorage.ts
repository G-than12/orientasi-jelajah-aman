// services/favoritStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KotaFavorit } from "../types/favorit";

const KUNCI_PENYIMPANAN = "@jelajah_aman:favorit";

export async function ambilSemuaFavorit(): Promise<KotaFavorit[]> {
  const json = await AsyncStorage.getItem(KUNCI_PENYIMPANAN);
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item, idx) => ({
      ...item,
      id: Number.isFinite(item.id) ? item.id : Date.now() + idx,
    }));
  } catch {
    return [];
  }
}

export async function tambahFavorit(kota: KotaFavorit): Promise<void> {
  const daftar = await ambilSemuaFavorit();
  const sudahAda = daftar.some(
    (k) =>
      (k.id !== -1 && kota.id !== -1 && k.id === kota.id) ||
      k.nama.trim().toLowerCase() === kota.nama.trim().toLowerCase()
  );
  if (sudahAda) return;
  const daftarBaru = [...daftar, kota];
  await AsyncStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(daftarBaru));
}

export async function hapusFavorit(id: number, nama?: string): Promise<void> {
  const daftar = await ambilSemuaFavorit();
  const daftarBaru = daftar.filter(
    (k) =>
      !(
        (Number.isFinite(id) && Number.isFinite(k.id) && k.id === id) ||
        (nama && k.nama.trim().toLowerCase() === nama.trim().toLowerCase())
      )
  );
  await AsyncStorage.setItem(KUNCI_PENYIMPANAN, JSON.stringify(daftarBaru));
}
