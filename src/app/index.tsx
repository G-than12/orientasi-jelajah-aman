// src/app/index.tsx
import { View, ScrollView } from "react-native";
import { useState, useEffect } from "react";

import WeatherCard from "../../components/WeatherCard";
import SearchBox from "../../components/SearchBox";
import RiwayatList from "../../components/RiwayatList";

// 1. Import komponen IndikatorAQI dan interface LaporanUdara
import { IndikatorAQI } from "../../components/IndikatorAQI";
import { LaporanUdara } from "../../types/udara";

export default function HalamanUtama() {
  const [kotaAktif, setKotaAktif] = useState("Pekalongan");
  const [riwayat, setRiwayat] = useState<string[]>(["Pekalongan"]);

  // Tambahkan useEffect untuk mencatat perubahan kota aktif
  useEffect(() => {
    console.log("Kota aktif berubah menjadi:", kotaAktif);
  }, [kotaAktif]);

  function handleCari(kota: string) {
    setKotaAktif(kota);
    if (!riwayat.includes(kota)) {
      setRiwayat([...riwayat, kota]);
    }
  }

  // 2. Siapkan data laporan udara sesuai interface LaporanUdara
  const dataLaporanUdara: LaporanUdara = {
    kota: kotaAktif,
    indeksAQI: 42,
    tingkat: "BAIK", // Coba ganti ke "SEDANG", "TIDAK_SEHAT", atau "BERBAHAYA" untuk melihat perubahan warna
    diperbaruiPada: "11:30 WIB",
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 16, paddingTop: 50, gap: 16 }}
    >
      {/* Kolom Pencarian */}
      <SearchBox onCari={handleCari} />

      {/* Kartu Cuaca */}
      <WeatherCard kota={kotaAktif} suhu={29} tingkatAQI="BAIK" />

      {/* 3. Tampilkan Komponen IndikatorAQI */}
      <IndikatorAQI data={dataLaporanUdara} />

      {/* Daftar Riwayat */}
      <RiwayatList daftarKota={riwayat} />
    </ScrollView>
  );
}
