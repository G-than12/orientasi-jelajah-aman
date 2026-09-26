// app/(tabs)/index.tsx
import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, Button } from "react-native";
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

  // Menunda pencarian 500ms sampai pengguna berhenti mengetik
  const teksTertunda = useDebounce(teksCari, 500);

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
      {sedangMemuat && <ActivityIndicator />}

      {/* 2. Kondisi Gagal (Error) */}
      {pesanError && (
        <View>
          <Text>{pesanError}</Text>
          <Button title="Coba Lagi" onPress={() => ambilData(teksTertunda)} />
        </View>
      )}

      {/* 3. Kondisi Kosong (Empty) */}
      {!sedangMemuat &&
        !pesanError &&
        teksTertunda.length > 0 &&
        hasil.length === 0 && <Text>Kota tidak ditemukan</Text>}

      {/* 4. Kondisi Berhasil (Success) */}
      {hasil.map((kota) => (
        <WeatherCard
          key={kota.id}
          kota={kota.name}
          suhu={29}
          tingkatAQI="BAIK"
        />
      ))}
    </SafeAreaView>
  );
}
