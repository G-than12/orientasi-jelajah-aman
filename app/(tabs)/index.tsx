// app/(tabs)/index.tsx
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AtribusiCuaca from "../../components/AtribusiCuaca";
import RiwayatList from "../../components/RiwayatList";
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useRiwayat } from "../../contexts/RiwayatContext";
import { useDebounce } from "../../hooks/use-debounce";
import { ambilKualitasUdara } from "../../services/airQualityService";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { cariKota } from "../../services/geocodingService";
import {
  ambilKoordinatSaatIni,
  mintaIzinLokasi,
} from "../../services/locationService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { ambilCuaca } from "../../services/weatherService";
import { HasilGeocoding } from "../../types/geocoding";
import { DataCuacaLengkap, DataKualitasUdara } from "../../types/weather";

export default function HalamanUtama() {
  const { riwayat, tambahRiwayat } = useRiwayat();

  // State kota aktif (default Pekalongan)
  const [kotaAktif, setKotaAktif] = useState<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
  }>({ id: 1632766, name: "Pekalongan", latitude: -6.8886, longitude: 109.6753 });

  // State pesan dan status perizinan lokasi GPS
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const [sedangMemuatLokasi, setSedangMemuatLokasi] = useState(false);

  // State data cuaca & AQI realtime
  const [cuaca, setCuaca] = useState<DataCuacaLengkap | null>(null);
  const [kualitasUdara, setKualitasUdara] = useState<DataKualitasUdara | null>(
    null,
  );
  const [sedangMemuatCuaca, setSedangMemuatCuaca] = useState(false);
  const [pesanErrorCuaca, setPesanErrorCuaca] = useState<string | null>(null);

  // State status favorit kota aktif
  const [sudahFavorit, setSudahFavorit] = useState(false);

  const cekStatusFavorit = useCallback(async (id: number) => {
    try {
      const daftar = await ambilSemuaFavorit();
      const ditemukan = daftar.some((k) => k.id === id);
      setSudahFavorit(ditemukan);
    } catch {
      setSudahFavorit(false);
    }
  }, []);

  useEffect(() => {
    cekStatusFavorit(kotaAktif.id);
  }, [kotaAktif.id, cekStatusFavorit]);

  useFocusEffect(
    useCallback(() => {
      cekStatusFavorit(kotaAktif.id);
    }, [kotaAktif.id, cekStatusFavorit])
  );

  // State Live Search Geocoding
  const [teksCari, setTeksCari] = useState("");
  const [hasil, setHasil] = useState<HasilGeocoding[]>([]);
  const [sedangMemuatGeocoding, setSedangMemuatGeocoding] = useState(false);
  const [pesanErrorGeocoding, setPesanErrorGeocoding] = useState<string | null>(
    null,
  );

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition

  // Muat data cuaca awal saat aplikasi dibuka
  useEffect(() => {
    muatDataCuaca(kotaAktif.latitude, kotaAktif.longitude);
  }, []);

  // Fetch API Cuaca & Kualitas Udara Realtime
  async function muatDataCuaca(lat: number, lon: number) {
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuatCuaca(true);
    setPesanErrorCuaca(null);

    try {
      const [dataCuaca, dataAQI] = await Promise.all([
        ambilCuaca(lat, lon),
        ambilKualitasUdara(lat, lon),
      ]);

      // Jika ada permintaan baru yang dikirim setelah ini, abaikan hasil lama
      if (idSaatIni !== requestIdRef.current) return;

      setCuaca(dataCuaca);
      setKualitasUdara(dataAQI);
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      setPesanErrorCuaca(
        "Gagal memuat data cuaca. Periksa koneksi internet Anda.",
      );
    } finally {
      if (idSaatIni === requestIdRef.current) {
        setSedangMemuatCuaca(false);
      }
    }
  }

  // Live search Geocoding saat teks pencarian berubah (dengan debounce)
  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasil([]);
      setPesanErrorGeocoding(null);
      return;
    }
    ambilDataGeocoding(teksTertunda);
  }, [teksTertunda]);

  async function ambilDataGeocoding(nama: string) {
    setSedangMemuatGeocoding(true);
    setPesanErrorGeocoding(null);
    try {
      const data = await cariKota(nama);
      setHasil(data);
    } catch (err) {
      setHasil([]);
      setPesanErrorGeocoding(
        "Gagal mencari kota. Periksa koneksi internet Anda.",
      );
    } finally {
      setSedangMemuatGeocoding(false);
    }
  }

  // Fungsi saat pengguna memilih salah satu kota dari hasil pencarian
  function pilihKota(kota: HasilGeocoding) {
    // 1. Segera bersihkan pencarian agar tidak ada delay atau teks "kota tidak ditemukan"
    setTeksCari("");
    setHasil([]);
    setPesanErrorGeocoding(null);

    // 2. Set kota aktif & simpan ke riwayat
    const kotaBaru = {
      id: kota.id,
      name: kota.name,
      latitude: kota.latitude,
      longitude: kota.longitude,
      admin1: kota.admin1,
    };
    setKotaAktif(kotaBaru);
    tambahRiwayat(kotaBaru);

    // 3. Panggil langsung API cuaca realtime untuk koordinat kota yang dipilih
    muatDataCuaca(kota.latitude, kota.longitude);
  }

  // Fungsi mengambil lokasi perangkat saat ini dengan penanganan 3 kondisi izin
  async function gunakanLokasiSaatIni() {
    setSedangMemuatLokasi(true);
    setPesanLokasi(null);
    try {
      const status = await mintaIzinLokasi();
      if (status === "denied") {
        setPesanLokasi(
          "Izin lokasi ditolak. Silakan cari kota secara manual di atas."
        );
        return;
      }
      if (status === "unavailable") {
        setPesanLokasi(
          "Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual."
        );
        return;
      }
      setPesanLokasi(null);
      const koordinat = await ambilKoordinatSaatIni();
      pilihKota({
        id: -1,
        name: "Lokasi Saat Ini",
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: "",
      });
    } catch (err) {
      setPesanLokasi(
        "Gagal mengambil lokasi saat ini. Silakan cari kota secara manual."
      );
    } finally {
      setSedangMemuatLokasi(false);
    }
  }

  // Status pencarian aktif jika kotak input memiliki teks
  const sedangMencari = teksCari.trim().length > 0;

  // Hanya tampilkan "Kota tidak ditemukan" jika:
  // - Pengguna sedang mengetik pencarian
  // - Debounce sudah selesai (teksTertunda cocok dengan teksCari)
  // - Tidak sedang memuat data API geocoding
  // - Tidak ada error koneksi
  // - Hasil pencarian memang 0
  const tampilkanTidakDitemukan =
    sedangMencari &&
    teksTertunda.trim().length > 0 &&
    teksTertunda.trim().toLowerCase() === teksCari.trim().toLowerCase() &&
    !sedangMemuatGeocoding &&
    !pesanErrorGeocoding &&
    hasil.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <SearchBox onCari={setTeksCari} nilai={teksCari} />

      {/* Tombol Lokasi Saat Ini (GPS) */}
      <TouchableOpacity
        style={styles.tombolLokasi}
        onPress={gunakanLokasiSaatIni}
        disabled={sedangMemuatLokasi}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Gunakan Lokasi Saat Ini"
      >
        {sedangMemuatLokasi ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : (
          <Text style={styles.tombolLokasiIcon}>📍</Text>
        )}
        <Text style={styles.tombolLokasiText}>
          {sedangMemuatLokasi
            ? "Mencari Lokasi GPS..."
            : "Gunakan Lokasi Saat Ini"}
        </Text>
      </TouchableOpacity>

      {pesanLokasi && (
        <View style={styles.pesanLokasiBox}>
          <Text style={styles.pesanLokasiIcon}>⚠️</Text>
          <Text style={styles.pesanLokasiText}>{pesanLokasi}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- HASIL PENCARIAN LIVE SEARCH --- */}
        {sedangMemuatGeocoding && (
          <View style={styles.loadingPencarian}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingPencarianText}>Mencari kota...</Text>
          </View>
        )}

        {pesanErrorGeocoding && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{pesanErrorGeocoding}</Text>
          </View>
        )}

        {tampilkanTidakDitemukan && (
          <View style={styles.tidakDitemukanContainer}>
            <Text
              accessible
              accessibilityLabel="Kota tidak ditemukan"
              style={styles.tidakDitemukanText}
            >
              Kota tidak ditemukan
            </Text>
          </View>
        )}

        {!sedangMemuatGeocoding && !pesanErrorGeocoding && hasil.length > 0 && (
          <View style={styles.hasilPencarianList}>
            <Text
              accessible
              accessibilityLabel={`Ditemukan ${hasil.length} kota`}
              style={styles.hasilPencarianHeader}
            >
              Ditemukan {hasil.length} kota (Ketuk untuk melihat cuaca):
            </Text>

            {hasil.map((kota) => (
              <TouchableOpacity
                key={kota.id}
                onPress={() => pilihKota(kota)}
                activeOpacity={0.7}
                style={styles.hasilItem}
              >
                <View style={styles.hasilIconBg}>
                  <Text style={{ fontSize: 18 }}>📍</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.hasilNamaKota}>{kota.name}</Text>
                  <Text style={styles.hasilWilayahKota}>
                    {[kota.admin1, kota.country].filter(Boolean).join(", ")}
                  </Text>
                </View>
                <View style={styles.hasilPilihBadge}>
                  <Text style={styles.hasilPilihText}>Pilih →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* --- TAMPILAN UTAMA CUACA & RIWAYAT --- */}
        {!sedangMencari && (
          <View style={styles.mainContainer}>
            {/* Loading Indicator Cuaca Realtime */}
            {sedangMemuatCuaca && (
              <View style={styles.cardLoading}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.cardLoadingText}>
                  Memuat data cuaca realtime {kotaAktif.name}...
                </Text>
              </View>
            )}

            {/* Error Cuaca & Tombol Coba Lagi */}
            {pesanErrorCuaca && (
              <View style={styles.errorCard}>
                <Text
                  accessible
                  accessibilityLabel={`Terjadi kesalahan: ${pesanErrorCuaca}`}
                  style={styles.errorText}
                >
                  {pesanErrorCuaca}
                </Text>
                <Button
                  title="Coba Lagi"
                  onPress={() =>
                    muatDataCuaca(kotaAktif.latitude, kotaAktif.longitude)
                  }
                />
              </View>
            )}

            {/* Kartu Cuaca Utama di Beranda: Tampilan Ringkas (Ketuk untuk buka detail lengkap) */}
            {!sedangMemuatCuaca && !pesanErrorCuaca && cuaca && (
              <View style={styles.cuacaContainer}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push({
                      pathname: "/detail/[kota]",
                      params: { kota: kotaAktif.name },
                    })
                  }
                >
                  <WeatherCard
                    kota={kotaAktif.name}
                    suhu={Math.round(cuaca.saatIni.suhu)}
                    tingkatAQI={
                      kualitasUdara
                        ? konversiTingkatAQI(kualitasUdara.indeksAQI)
                        : "BAIK"
                    }
                    indeksAQI={kualitasUdara?.indeksAQI}
                    kondisi={labelKodeCuaca(cuaca.saatIni.kodeCuaca)}
                    tampilkanDetail={false}
                  />
                </TouchableOpacity>

                {/* Tombol Tambahkan ke Favorit (dinonaktifkan jika sudah tersimpan) */}
                <TouchableOpacity
                  style={[
                    styles.tombolFavorit,
                    sudahFavorit && styles.tombolFavoritDisabled,
                  ]}
                  activeOpacity={0.8}
                  disabled={sudahFavorit}
                  onPress={() =>
                    router.push({
                      pathname: "/tambah-favorit",
                      params: {
                        id: String(kotaAktif.id),
                        nama: kotaAktif.name,
                        lat: String(kotaAktif.latitude),
                        lon: String(kotaAktif.longitude),
                      },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={
                    sudahFavorit
                      ? "Kota ini sudah ada di daftar favorit"
                      : "Tambahkan ke Favorit"
                  }
                >
                  <Text style={styles.tombolFavoritIcon}>
                    {sudahFavorit ? "✓" : "⭐"}
                  </Text>
                  <Text
                    style={[
                      styles.tombolFavoritText,
                      sudahFavorit && styles.tombolFavoritTextDisabled,
                    ]}
                  >
                    {sudahFavorit
                      ? "Sudah di Favorit"
                      : "Tambahkan ke Favorit"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Riwayat Pencarian Kota yang Terhubung Global */}
            <RiwayatList daftarKota={riwayat.map((k) => k.name)} />

            {/* Atribusi Resmi Lisensi Open-Meteo */}
            <AtribusiCuaca />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    padding: 16,
    gap: 16,
    backgroundColor: "#f8fafc",
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 24,
  },
  loadingPencarian: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  loadingPencarianText: {
    color: "#64748b",
    fontSize: 14,
  },
  tidakDitemukanContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  tidakDitemukanText: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
  },
  hasilPencarianList: {
    gap: 10,
  },
  hasilPencarianHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 2,
  },
  hasilItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  hasilIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  hasilNamaKota: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  hasilWilayahKota: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  hasilPilihBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  hasilPilihText: {
    color: "#2563eb",
    fontSize: 12,
    fontWeight: "700",
  },
  mainContainer: {
    gap: 16,
  },
  cardLoading: {
    backgroundColor: "#ffffff",
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12,
  },
  cardLoadingText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  errorContainer: {
    padding: 12,
    alignItems: "center",
  },
  errorCard: {
    backgroundColor: "#fef2f2",
    padding: 16,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    color: "#dc2626",
    textAlign: "center",
    fontSize: 14,
  },
  tombolLokasi: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#bfdbfe",
    gap: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tombolLokasiIcon: {
    fontSize: 16,
  },
  tombolLokasiText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "700",
  },
  pesanLokasiBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 8,
  },
  pesanLokasiIcon: {
    fontSize: 14,
  },
  pesanLokasiText: {
    flex: 1,
    color: "#92400e",
    fontSize: 13,
    fontWeight: "500",
  },
  cuacaContainer: {
    gap: 12,
  },
  tombolFavorit: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  tombolFavoritIcon: {
    fontSize: 16,
  },
  tombolFavoritText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  tombolFavoritDisabled: {
    backgroundColor: "#e2e8f0",
    shadowOpacity: 0,
    elevation: 0,
  },
  tombolFavoritTextDisabled: {
    color: "#64748b",
  },
});
