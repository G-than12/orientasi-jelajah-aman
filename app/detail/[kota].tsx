// app/detail/[kota].tsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import WeatherCard from "../../components/WeatherCard";
import { spacing } from "../../constants/styles";
import { ambilCuaca } from "../../services/weatherService";
import { ambilKualitasUdara } from "../../services/airQualityService";
import { cariKota } from "../../services/geocodingService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useRiwayat } from "../../contexts/RiwayatContext";
import { DataCuacaLengkap, DataKualitasUdara } from "../../types/weather";

export default function HalamanDetail() {
  const { kota } = useLocalSearchParams<{ kota: string }>();
  const namaKota = kota ?? "Kota Pilihan";

  const { riwayat } = useRiwayat();
  const kotaData = riwayat.find(
    (k) => k.name.toLowerCase() === namaKota.toLowerCase()
  );

  const [cuaca, setCuaca] = useState<DataCuacaLengkap | null>(null);
  const [kualitasUdara, setKualitasUdara] = useState<DataKualitasUdara | null>(
    null
  );
  const [sedangMemuat, setSedangMemuat] = useState(true);
  const [pesanError, setPesanError] = useState<string | null>(null);

  useEffect(() => {
    async function inisialisasi() {
      setSedangMemuat(true);
      setPesanError(null);

      let lat = kotaData?.latitude;
      let lon = kotaData?.longitude;

      // Jika koordinat belum ada di riwayat, cari via geocoding
      if (lat === undefined || lon === undefined) {
        try {
          const hasil = await cariKota(namaKota);
          if (hasil.length > 0) {
            lat = hasil[0].latitude;
            lon = hasil[0].longitude;
          }
        } catch (e) {
          // Abaikan error geocoding fallback
        }
      }

      if (lat === undefined || lon === undefined) {
        setPesanError("Koordinat kota tidak ditemukan.");
        setSedangMemuat(false);
        return;
      }

      muatData(lat, lon);
    }

    inisialisasi();
  }, [namaKota]);

  async function muatData(lat: number, lon: number) {
    setSedangMemuat(true);
    setPesanError(null);
    try {
      const [dataCuaca, dataAQI] = await Promise.all([
        ambilCuaca(lat, lon),
        ambilKualitasUdara(lat, lon),
      ]);
      setCuaca(dataCuaca);
      setKualitasUdara(dataAQI);
    } catch (err) {
      setPesanError("Gagal memuat data cuaca. Periksa koneksi internet Anda.");
    } finally {
      setSedangMemuat(false);
    }
  }

  if (sedangMemuat) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, color: "#64748b" }}>
          Memuat data cuaca {namaKota}...
        </Text>
      </View>
    );
  }

  if (pesanError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <Text style={{ color: "#dc2626", textAlign: "center" }}>
          {pesanError}
        </Text>
      </View>
    );
  }

  const suhu = cuaca ? Math.round(cuaca.saatIni.suhu) : 0;
  const tingkatAQI = kualitasUdara
    ? konversiTingkatAQI(kualitasUdara.indeksAQI)
    : "BAIK";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 1. Kartu Cuaca Utama dengan Informasi Lengkap Sesuai Desain */}
      <WeatherCard
        kota={namaKota}
        suhu={suhu}
        tingkatAQI={tingkatAQI}
        indeksAQI={kualitasUdara?.indeksAQI}
        kondisi={cuaca ? labelKodeCuaca(cuaca.saatIni.kodeCuaca) : undefined}
        kecepatanAngin={cuaca?.saatIni.kecepatanAngin}
        suhuMaks={cuaca?.harian.suhuMaksimal?.[0]}
        suhuMin={cuaca?.harian.suhuMinimal?.[0]}
        pm25={kualitasUdara?.pm25}
        pm10={kualitasUdara?.pm10}
        tampilkanDetail={true}
      />

      {/* 2. Tombol Tambahkan ke Favorit Langsung di Bawah Kartu */}
      <TouchableOpacity
        style={styles.favButton}
        onPress={() => router.push("/tambah-favorit")}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Tambahkan ${namaKota} ke daftar favorit`}
      >
        <Text style={styles.favButtonIcon}>⭐</Text>
        <Text style={styles.favButtonText}>Tambahkan ke Favorit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: spacing.sedang,
    gap: spacing.sedang,
  },
  favButton: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  favButtonIcon: {
    fontSize: 18,
  },
  favButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
