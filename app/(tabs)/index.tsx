// app/(tabs)/index.tsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import RiwayatList from "../../components/RiwayatList";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { HasilGeocoding } from "../../types/geocoding";

export default function HalamanUtama() {
  // State dari Pertemuan 3 (Kota Aktif & Riwayat tetap ada!)
  const [kotaAktif, setKotaAktif] = useState("Pekalongan");
  const [riwayat, setRiwayat] = useState<string[]>(["Pekalongan"]);

  // State dari Pertemuan 4 (Live Search Geocoding API)
  const [teksCari, setTeksCari] = useState("");
  const [hasil, setHasil] = useState<HasilGeocoding[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  const teksTertunda = useDebounce(teksCari, 800);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasil([]);
      setPesanError(null);
      return;
    }
    ambilData(teksTertunda);
  }, [teksTertunda]);

  async function ambilData(nama: string) {
    setSedangMemuat(true);
    setPesanError(null);
    try {
      const data = await cariKota(nama);
      setHasil(data);
    } catch (err) {
      setPesanError("Gagal mengambil data. Periksa koneksi internet Anda.");
    } finally {
      setSedangMemuat(false);
    }
  }

  // Fungsi saat salah satu kota hasil pencarian dipilih
  function pilihKota(namaKota: string) {
    setKotaAktif(namaKota);
    if (!riwayat.includes(namaKota)) {
      setRiwayat([namaKota, ...riwayat]);
    }
    setTeksCari(""); // Tutup daftar pencarian setelah dipilih
    setHasil([]);
  }

  const sedangMencari = teksTertunda.trim().length > 0;

  return (
    <SafeAreaView
      style={{ flex: 1, padding: 16, gap: 16, backgroundColor: "#f8fafc" }}
    >
      <SearchBox onCari={setTeksCari} />

      <ScrollView contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        {/* --- BAGIAN PENCARIAN API (PERTEMUAN 4) --- */}
        {sedangMemuat && <ActivityIndicator size="large" color="#2563eb" />}

        {pesanError && (
          <View style={{ gap: 8 }}>
            <Text
              accessible
              accessibilityLabel={`Terjadi kesalahan: ${pesanError}`}
              style={{ color: "#dc2626" }}
            >
              {pesanError}
            </Text>
            <Button title="Coba Lagi" onPress={() => ambilData(teksTertunda)} />
          </View>
        )}

        {!sedangMemuat &&
          !pesanError &&
          sedangMencari &&
          hasil.length === 0 && (
            <Text
              accessible
              accessibilityLabel="Kota tidak ditemukan"
              style={{ color: "#64748b", textAlign: "center" }}
            >
              Kota tidak ditemukan
            </Text>
          )}

        {!sedangMemuat && !pesanError && hasil.length > 0 && (
          <View style={{ gap: 12 }}>
            <Text
              accessible
              accessibilityLabel={`Ditemukan ${hasil.length} kota`}
              style={{ fontSize: 14, fontWeight: "600", color: "#475569" }}
            >
              Ditemukan {hasil.length} kota (Ketuk untuk memilih):
            </Text>

            {hasil.map((kota) => (
              <TouchableOpacity
                key={kota.id}
                onPress={() => pilihKota(kota.name)}
                activeOpacity={0.8}
              >
                <WeatherCard
                  kota={`${kota.name}${kota.admin1 ? `, ${kota.admin1}` : ""}`}
                  suhu={29}
                  tingkatAQI="BAIK"
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* --- BAGIAN TAMPILAN UTAMA & RIWAYAT (PERTEMUAN 3) --- */}
        {/* Tampil saat tidak sedang mengetik pencarian */}
        {!sedangMencari && (
          <View style={{ gap: 16 }}>
            <WeatherCard kota={kotaAktif} suhu={29} tingkatAQI="BAIK" />
            <RiwayatList daftarKota={riwayat} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
