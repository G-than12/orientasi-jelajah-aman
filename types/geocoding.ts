// types/geocoding.ts

export interface HasilGeocoding {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // tanda ? artinya opsional (nama provinsi belum tentu selalu ada)
}

export interface GeocodingResponse {
  results?: HasilGeocoding[]; // tanda ? artinya opsional (tidak ada saat pencarian kosong/tidak ditemukan)
}