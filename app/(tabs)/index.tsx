// app/(tabs)/index.tsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { HasilGeocoding } from "../../types/geocoding";

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasil, setHasil] = useState<HasilGeocoding[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  // [Latihan Mandiri 2]: Ubah delay debounce menjadi 800ms
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

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 16 }}>
      <SearchBox onCari={setTeksCari} />

      {/* 1. Kondisi Memuat (Loading) */}
      {sedangMemuat && <ActivityIndicator size="large" color="#2563eb" />}

      {/* 2. Kondisi Gagal (Error) + [Latihan Mandiri 3: accessibilityLabel] */}
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

      {/* 3. Kondisi Kosong (Empty) + [Latihan Mandiri 3: accessibilityLabel] */}
      {!sedangMemuat &&
        !pesanError &&
        teksTertunda.length > 0 &&
        hasil.length === 0 && (
          <Text
            accessible
            accessibilityLabel="Pencarian selesai, kota yang dicari tidak ditemukan"
            style={{ color: "#64748b", textAlign: "center", marginTop: 12 }}
          >
            Kota tidak ditemukan
          </Text>
        )}

      {/* [Latihan Mandiri 1]: Indikator Jumlah Hasil */}
      {!sedangMemuat && !pesanError && hasil.length > 0 && (
        <Text
          accessible
          accessibilityLabel={`Ditemukan ${hasil.length} kota`}
          style={{ fontSize: 14, fontWeight: "600", color: "#475569" }}
        >
          Ditemukan {hasil.length} kota
        </Text>
      )}

      {/* 4. Kondisi Berhasil (Daftar Kota) */}
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
        {hasil.map((kota) => (
          <WeatherCard
            key={kota.id}
            kota={`${kota.name}${kota.admin1 ? `, ${kota.admin1}` : ""}`}
            suhu={29}
            tingkatAQI="BAIK"
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
