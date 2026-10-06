// app/detail/[kota].tsx
import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import WeatherCard from "../../components/WeatherCard";
import { spacing } from "../../constants/styles";
import { ambilCuaca } from "../../services/weatherService";
import { ambilKualitasUdara } from "../../services/airQualityService";
import { cariKota } from "../../services/geocodingService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useRiwayat } from "../../contexts/RiwayatContext";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { DataCuacaLengkap, DataKualitasUdara } from "../../types/weather";

export default function HalamanDetail() {
  const { kota, id, lat, lon } = useLocalSearchParams<{
    kota: string;
    id?: string;
    lat?: string;
    lon?: string;
  }>();
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
  const [sudahFavorit, setSudahFavorit] = useState(false);

  const [koordinatAktif, setKoordinatAktif] = useState<{
    id?: number;
    lat: number;
    lon: number;
  } | null>(null);

  const cekStatusFavorit = useCallback(
    async (nama: string, idNum?: number) => {
      try {
        const daftar = await ambilSemuaFavorit();
        const ditemukan = daftar.some(
          (k) =>
            (idNum !== undefined && idNum !== -1 && k.id !== -1 && k.id === idNum) ||
            k.nama.trim().toLowerCase() === nama.trim().toLowerCase()
        );
        setSudahFavorit(ditemukan);
      } catch {
        setSudahFavorit(false);
      }
    },
    []
  );

  useEffect(() => {
    async function inisialisasi() {
      setSedangMemuat(true);
      setPesanError(null);

      let latitude = lat ? Number(lat) : kotaData?.latitude;
      let longitude = lon ? Number(lon) : kotaData?.longitude;
      let idKota = id ? Number(id) : 1;

      // Jika koordinat belum ada di params/riwayat, cari via geocoding
      if (latitude === undefined || longitude === undefined || isNaN(latitude) || isNaN(longitude)) {
        try {
          const hasil = await cariKota(namaKota);
          if (hasil.length > 0) {
            latitude = hasil[0].latitude;
            longitude = hasil[0].longitude;
            idKota = hasil[0].id;
          }
        } catch (e) {
          // Abaikan error geocoding fallback
        }
      }

      if (latitude === undefined || longitude === undefined || isNaN(latitude) || isNaN(longitude)) {
        setPesanError("Koordinat kota tidak ditemukan.");
        setSedangMemuat(false);
        return;
      }

      setKoordinatAktif({ id: idKota, lat: latitude, lon: longitude });
      cekStatusFavorit(namaKota, idKota);
      muatData(latitude, longitude);
    }

    inisialisasi();
  }, [namaKota, id, lat, lon, cekStatusFavorit]);

  useFocusEffect(
    useCallback(() => {
      cekStatusFavorit(namaKota, koordinatAktif?.id);
    }, [namaKota, koordinatAktif?.id, cekStatusFavorit])
  );

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
        style={[
          styles.favButton,
          sudahFavorit && styles.favButtonDisabled,
        ]}
        onPress={() =>
          router.push({
            pathname: "/tambah-favorit",
            params: {
              id: String(koordinatAktif?.id ?? 1),
              nama: namaKota,
              lat: String(koordinatAktif?.lat ?? 0),
              lon: String(koordinatAktif?.lon ?? 0),
            },
          })
        }
        disabled={sudahFavorit}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={
          sudahFavorit
            ? `${namaKota} sudah ada di daftar favorit`
            : `Tambahkan ${namaKota} ke daftar favorit`
        }
      >
        <Text style={styles.favButtonIcon}>{sudahFavorit ? "✓" : "⭐"}</Text>
        <Text
          style={[
            styles.favButtonText,
            sudahFavorit && styles.favButtonTextDisabled,
          ]}
        >
          {sudahFavorit ? "Sudah di Favorit" : "Tambahkan ke Favorit"}
        </Text>
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
  favButtonDisabled: {
    backgroundColor: "#e2e8f0",
    shadowOpacity: 0,
    elevation: 0,
  },
  favButtonIcon: {
    fontSize: 18,
  },
  favButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  favButtonTextDisabled: {
    color: "#64748b",
  },
});
