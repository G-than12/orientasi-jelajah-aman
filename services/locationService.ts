// services/locationService.ts
import * as Location from "expo-location";

export type StatusIzinLokasi = "granted" | "denied" | "unavailable";

export async function mintaIzinLokasi(): Promise<StatusIzinLokasi> {
  const layananAktif = await Location.hasServicesEnabledAsync();
  if (!layananAktif) {
    return "unavailable";
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted" ? "granted" : "denied";
}

export async function ambilKoordinatSaatIni() {
  const lokasi = await Location.getCurrentPositionAsync({});
  return {
    latitude: lokasi.coords.latitude,
    longitude: lokasi.coords.longitude,
  };
}

export async function ambilNamaKotaDariKoordinat(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    const hasil = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (hasil && hasil.length > 0) {
      const item = hasil[0];
      const nama = item.city || item.subregion || item.region || item.district;
      if (nama) return nama;
    }
  } catch {
    // Abaikan jika platform (seperti web) tidak mendukung atau terjadi kegagalan jaringan
  }
  return "Lokasi Saat Ini";
}

