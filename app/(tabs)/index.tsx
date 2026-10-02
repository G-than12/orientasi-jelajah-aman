// app/(tabs)/index.tsx
import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import RiwayatList from "../../components/RiwayatList";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { ambilCuaca } from "../../services/weatherService";
import { ambilKualitasUdara } from "../../services/airQualityService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { HasilGeocoding } from "../../types/geocoding";
import { DataCuacaLengkap, DataKualitasUdara } from "../../types/weather";
import { useRiwayat } from "../../contexts/RiwayatContext";

export default function HalamanUtama() {
  const { riwayat, tambahRiwayat } = useRiwayat();

  // State kota aktif (default Pekalongan)
  const [kotaAktif, setKotaAktif] = useState<{
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
  }>({ name: "Pekalongan", latitude: -6.8886, longitude: 109.6753 });

  // State data cuaca & AQI realtime
  const [cuaca, setCuaca] = useState<DataCuacaLengkap | null>(null);
  const [kualitasUdara, setKualitasUdara] = useState<DataKualitasUdara | null>(
    null
  );
  const [sedangMemuatCuaca, setSedangMemuatCuaca] = useState(false);
  const [pesanErrorCuaca, setPesanErrorCuaca] = useState<string | null>(null);

  // State Live Search Geocoding
  const [teksCari, setTeksCari] = useState("");
  const [hasil, setHasil] = useState<HasilGeocoding[]>([]);
  const [sedangMemuatGeocoding, setSedangMemuatGeocoding] = useState(false);
  const [pesanErrorGeocoding, setPesanErrorGeocoding] = useState<string | null>(
    null
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
        "Gagal memuat data cuaca. Periksa koneksi internet Anda."
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
        "Gagal mencari kota. Periksa koneksi internet Anda."
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
});
