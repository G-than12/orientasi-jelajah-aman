// services/geocodingService.ts
import { GeocodingResponse, HasilGeocoding } from "../types/geocoding";

const BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export async function cariKota(nama: string): Promise<HasilGeocoding[]> {
  const url = `${BASE_URL}?name=${encodeURIComponent(nama)}&count=5&language=id&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Gagal memuat data (status ${response.status})`);
    }
    const data: GeocodingResponse = await response.json();
    return data.results ?? [];
  } catch (err) {
    if (err instanceof Error) {
      const pesan = err.message.toLowerCase();
      if (
        pesan.includes("failed to fetch") ||
        pesan.includes("network request failed") ||
        pesan.includes("networkerror")
      ) {
        throw new Error(
          "Tidak ada koneksi internet. Silakan nyalakan data seluler atau Wi-Fi Anda untuk mencari kota."
        );
      }
    }
    throw err;
  }
}

