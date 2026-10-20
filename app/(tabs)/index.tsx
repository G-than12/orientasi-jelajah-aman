// app/(tabs)/index.tsx
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import AtribusiCuaca from "../../components/AtribusiCuaca";
import SearchBox from "../../components/SearchBox";
import StatusData from "../../components/StatusData";
import WeatherCard from "../../components/WeatherCard";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { useRiwayat } from "../../contexts/RiwayatContext";
import { usePengaturan } from "../../contexts/PengaturanContext";
import { useDebounce } from "../../hooks/use-debounce";
import {
  bersihkanCacheLama,
  daftarKotaTersimpan,
  hapusCacheKota,
} from "../../services/cacheRepository";
import {
  ambilCuacaOfflineFirst,
  BATAS_CACHE_MS,
} from "../../services/cuacaRepository";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { cariKota } from "../../services/geocodingService";
import {
  ambilKoordinatSaatIni,
  ambilNamaKotaDariKoordinat,
  mintaIzinLokasi,
} from "../../services/locationService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../types/cache";
import { HasilGeocoding } from "../../types/geocoding";

export default function HalamanUtama() {
  const { theme } = usePengaturan();
  const { tambahRiwayat } = useRiwayat();

  // State kota aktif (default Pekalongan)
  const [kotaAktif, setKotaAktif] = useState<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
  }>({
    id: 1632766,
    name: "Pekalongan",
    latitude: -6.8886,
    longitude: 109.6753,
  });

  // State pesan dan status perizinan lokasi GPS
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const [sedangMemuatLokasi, setSedangMemuatLokasi] = useState(false);

  // State data cuaca offline-first (SQLite + Cache + Jaringan)
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [sedangMemuatCuaca, setSedangMemuatCuaca] = useState(false);
  const [pesanErrorCuaca, setPesanErrorCuaca] = useState<string | null>(null);

  // State daftar kota yang tersimpan di cache SQLite lokal (maksimal 5 kota)
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>(
    [],
  );
  const [targetHapusOffline, setTargetHapusOffline] =
    useState<RingkasanKotaTersimpan | null>(null);
  const [sedangMenghapusOffline, setSedangMenghapusOffline] = useState(false);

  // State status favorit kota aktif
  const [sudahFavorit, setSudahFavorit] = useState(false);

  const cekStatusFavorit = useCallback(
    async (target: { id: number; name: string }) => {
      try {
        const daftar = await ambilSemuaFavorit();
        const ditemukan = daftar.some(
          (k) =>
            (k.id !== -1 && target.id !== -1 && k.id === target.id) ||
            k.nama.trim().toLowerCase() === target.name.trim().toLowerCase(),
        );
        setSudahFavorit(ditemukan);
      } catch {
        setSudahFavorit(false);
      }
    },
    [],
  );

  async function muatKotaTersimpan() {
    try {
      const daftar = await daftarKotaTersimpan(5);
      setKotaTersimpan(daftar.slice(0, 5));
    } catch {
      // Abaikan jika database belum siap
    }
  }

  async function eksekusiHapusOffline() {
    if (!targetHapusOffline) return;
    const targetKunci = targetHapusOffline.kunci;
    const targetNama = targetHapusOffline.nama;
    setSedangMenghapusOffline(true);
    try {
      // 1. Optimistic update: langsung hapus HANYA kota yang dipilih dari tampilan
      setKotaTersimpan((prev) =>
        prev.filter(
          (k) =>
            k.kunci !== targetKunci &&
            k.nama.toLowerCase() !== targetNama.toLowerCase()
        )
      );
      // 2. Hapus spesifik kota ini dari SQLite berdasarkan kunci dan nama
      await hapusCacheKota(targetKunci, targetNama);
      // 3. Sinkronkan ulang daftar kota yang tersimpan
      await muatKotaTersimpan();
      setTargetHapusOffline(null);
    } catch (err) {
      console.error("Gagal menghapus cache offline:", err);
      await muatKotaTersimpan();
    } finally {
      setSedangMenghapusOffline(false);
    }
  }

  function batalkanHapusOffline() {
    if (sedangMenghapusOffline) return;
    setTargetHapusOffline(null);
  }

  // Saat aplikasi dibuka: buang cache > 7 hari, lalu tampilkan daftar tersimpan & muat kota default
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => { });
    pilihKota(kotaAktif);
  }, []);

  useEffect(() => {
    cekStatusFavorit({ id: kotaAktif.id, name: kotaAktif.name });
  }, [kotaAktif.id, kotaAktif.name, cekStatusFavorit]);

  useFocusEffect(
    useCallback(() => {
      cekStatusFavorit({ id: kotaAktif.id, name: kotaAktif.name });
      muatKotaTersimpan();
    }, [kotaAktif.id, kotaAktif.name, cekStatusFavorit]),
  );

  // State Live Search Geocoding
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [sedangMemuatGeocoding, setSedangMemuatGeocoding] = useState(false);
  const [pesanErrorGeocoding, setPesanErrorGeocoding] = useState<string | null>(
    null,
  );

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition
  const scrollViewRef = useRef<ScrollView>(null);
  const horizontalScrollRef = useRef<ScrollView>(null);
  const scrollPosisiOffline = useRef(0);
  const isDraggingOfflineRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [posisiCuacaY, setPosisiCuacaY] = useState(0);

  function geserOffline(arah: "kiri" | "kanan") {
    const jarak = 220;
    const node =
      Platform.OS === "web"
        ? (horizontalScrollRef.current as any)?.getScrollableNode?.() ||
        (horizontalScrollRef.current as any)
        : null;

    if (node && typeof node.scrollBy === "function") {
      node.scrollBy({
        left: arah === "kanan" ? jarak : -jarak,
        behavior: "smooth",
      });
      scrollPosisiOffline.current =
        node.scrollLeft + (arah === "kanan" ? jarak : -jarak);
    } else {
      const targetX =
        arah === "kanan"
          ? scrollPosisiOffline.current + jarak
          : Math.max(0, scrollPosisiOffline.current - jarak);
      horizontalScrollRef.current?.scrollTo({ x: targetX, animated: true });
      scrollPosisiOffline.current = targetX;
    }
  }

  function scrollKeCuaca() {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: posisiCuacaY > 0 ? Math.max(0, posisiCuacaY - 10) : 320,
        animated: true,
      });
    }, 120);
  }

  // Live search Geocoding saat teks pencarian berubah (dengan debounce)
  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
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
      setHasilPencarian(data);
    } catch (err) {
      // Jika offline, cari apakah nama kota yang diketik cocok dengan data yang sudah tersimpan di SQLite
      const cocokOffline = kotaTersimpan
        .filter((k) => k.nama.toLowerCase().includes(nama.toLowerCase()))
        .map((k) => ({
          id: k.id,
          name: k.nama,
          latitude: k.latitude,
          longitude: k.longitude,
          country: "Tersimpan Offline",
        }));

      if (cocokOffline.length > 0) {
        setHasilPencarian(cocokOffline);
        setPesanErrorGeocoding(null);
      } else {
        setHasilPencarian([]);
        let pesan =
          "Tidak ada koneksi internet. Silakan nyalakan data seluler atau Wi-Fi Anda untuk mencari kota.";
        if (err instanceof Error) {
          const pesanAsli = err.message.toLowerCase();
          if (
            !pesanAsli.includes("failed to fetch") &&
            !pesanAsli.includes("network request failed") &&
            !pesanAsli.includes("networkerror")
          ) {
            pesan = err.message;
          }
        }
        setPesanErrorGeocoding(pesan);
      }
    } finally {
      setSedangMemuatGeocoding(false);
    }
  }

  // Fungsi utama memilih kota & mengambil cuaca offline-first
  async function pilihKota(
    kota:
      | HasilGeocoding
      | {
        id: number;
        name: string;
        latitude: number;
        longitude: number;
        country?: string;
        admin1?: string;
      },
    paksaPerbarui = false,
  ) {
    // 1. Bersihkan pencarian
    setTeksCari("");
    setHasilPencarian([]);
    setPesanErrorGeocoding(null);

    // 2. Set kota aktif & simpan ke riwayat
    const kotaBaru = {
      id: kota.id,
      name: "name" in kota ? kota.name : (kota as any).nama,
      latitude: kota.latitude,
      longitude: kota.longitude,
      admin1: "admin1" in kota ? kota.admin1 : undefined,
    };
    setKotaAktif(kotaBaru);
    tambahRiwayat(kotaBaru);

    // 3. Ambil data dengan strategi Offline-First
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuatCuaca(true);
    setPesanErrorCuaca(null);

    try {
      const data = await ambilCuacaOfflineFirst(
        {
          id: kotaBaru.id,
          nama: kotaBaru.name,
          latitude: kotaBaru.latitude,
          longitude: kotaBaru.longitude,
        },
        { paksaPerbarui },
      );

      // Jika ada request baru, abaikan hasil yang basi
      if (idSaatIni !== requestIdRef.current) return;

      setHasil(data);
      await muatKotaTersimpan();
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      // Jika first-run offline atau gagal tanpa cache, kosongkan data lama
      setHasil(null);
      setPesanErrorCuaca(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi.",
      );
    } finally {
      if (idSaatIni === requestIdRef.current) {
        setSedangMemuatCuaca(false);
      }
    }
  }

  // Tangani parameter rute saat pengguna memilih kota dari tab Aktivitas / Riwayat
  const params = useLocalSearchParams<{
    kota?: string;
    lat?: string;
    lon?: string;
    id?: string;
    admin1?: string;
  }>();

  useEffect(() => {
    if (params.kota && params.lat && params.lon) {
      const lat = parseFloat(params.lat);
      const lon = parseFloat(params.lon);
      if (!isNaN(lat) && !isNaN(lon)) {
        pilihKota({
          id: params.id ? parseInt(params.id, 10) : -1,
          name: String(params.kota),
          latitude: lat,
          longitude: lon,
          admin1: params.admin1 ? String(params.admin1) : undefined,
        });
        scrollKeCuaca();
      }
    }
  }, [params.kota, params.lat, params.lon, params.id, params.admin1]);

  // Fungsi mengambil lokasi perangkat saat ini dengan penanganan 3 kondisi izin
  async function gunakanLokasiSaatIni() {
    setSedangMemuatLokasi(true);
    setPesanLokasi(null);
    try {
      const status = await mintaIzinLokasi();
      if (status === "denied") {
        setPesanLokasi(
          "Izin lokasi ditolak. Silakan cari kota secara manual di atas.",
        );
        return;
      }
      if (status === "unavailable") {
        setPesanLokasi(
          "Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.",
        );
        return;
      }
      setPesanLokasi(null);
      const koordinat = await ambilKoordinatSaatIni();
      const namaKota = await ambilNamaKotaDariKoordinat(
        koordinat.latitude,
        koordinat.longitude
      );
      pilihKota({
        id: -1,
        name: namaKota,
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: "",
      });
      scrollKeCuaca();
    } catch (err) {
      setPesanLokasi(
        "Gagal mengambil lokasi saat ini. Silakan cari kota secara manual.",
      );
    } finally {
      setSedangMemuatLokasi(false);
    }
  }

  // Status pencarian aktif jika kotak input memiliki teks
  const sedangMencari = teksCari.trim().length > 0;

  const tampilkanTidakDitemukan =
    sedangMencari &&
    teksTertunda.trim().length > 0 &&
    teksTertunda.trim().toLowerCase() === teksCari.trim().toLowerCase() &&
    !sedangMemuatGeocoding &&
    !pesanErrorGeocoding &&
    hasilPencarian.length === 0;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.bg }]}>
      <SearchBox onCari={setTeksCari} nilai={teksCari} />

      {/* Tombol Lokasi Saat Ini (GPS) */}
      <TouchableOpacity
        style={[
          styles.tombolLokasi,
          {
            backgroundColor: theme.card,
            borderColor: theme.cardBorder,
          },
        ]}
        onPress={gunakanLokasiSaatIni}
        disabled={sedangMemuatLokasi}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Gunakan Lokasi Saat Ini"
      >
        {sedangMemuatLokasi ? (
          <ActivityIndicator size="small" color="#2563eb" />
        ) : (
          <Ionicons name="navigate-outline" size={18} color="#2563eb" />
        )}
        <Text style={styles.tombolLokasiText}>
          {sedangMemuatLokasi
            ? "Mencari Lokasi GPS..."
            : "Gunakan Lokasi Saat Ini"}
        </Text>
      </TouchableOpacity>

      {pesanLokasi && (
        <View style={styles.pesanLokasiBox}>
          <Ionicons name="alert-circle-outline" size={18} color="#92400e" />
          <Text accessibilityLabel={pesanLokasi} style={styles.pesanLokasiText}>
            {pesanLokasi}
          </Text>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* --- HASIL PENCARIAN LIVE SEARCH --- */}
        {sedangMemuatGeocoding && (
          <View style={styles.loadingPencarian}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={[styles.loadingPencarianText, { color: theme.textSecondary }]}>
              Mencari kota...
            </Text>
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
              style={[styles.tidakDitemukanText, { color: theme.textSecondary }]}
            >
              Kota tidak ditemukan
            </Text>
          </View>
        )}

        {!sedangMemuatGeocoding &&
          !pesanErrorGeocoding &&
          hasilPencarian.length > 0 && (
            <View style={styles.hasilPencarianList}>
              <Text
                accessible
                accessibilityLabel={`Ditemukan ${hasilPencarian.length} kota`}
                style={[styles.hasilPencarianHeader, { color: theme.textMuted }]}
              >
                Ditemukan {hasilPencarian.length} kota:
              </Text>

              {hasilPencarian.map((kota) => (
                <TouchableOpacity
                  key={kota.id}
                  onPress={() => pilihKota(kota)}
                  activeOpacity={0.7}
                  style={[
                    styles.hasilItem,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.hasilIconBg,
                      { backgroundColor: theme.primaryBg },
                    ]}
                  >
                    <Ionicons name="location-outline" size={18} color="#2563eb" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.hasilNamaKota, { color: theme.text }]}>
                      {kota.name}
                    </Text>
                    <Text
                      style={[
                        styles.hasilWilayahKota,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {[kota.admin1, kota.country].filter(Boolean).join(", ")}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.hasilPilihBadge,
                      { backgroundColor: theme.badgeBg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.hasilPilihText,
                        { color: theme.badgeText },
                      ]}
                    >
                      Pilih →
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

        {/* --- TAMPILAN UTAMA CUACA & CACHE OFFLINE --- */}
        {!sedangMencari && (
          <View style={styles.mainContainer}>
            {/* Daftar Kota Tersimpan di SQLite (Bisa dibuka offline, Maksimal 5) */}
            {kotaTersimpan.length > 0 && (
              <View
                style={[
                  styles.kotaTersimpanCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <View style={styles.kotaTersimpanHeaderRow}>
                  <Ionicons name="cloud-offline-outline" size={18} color={theme.primary} />
                  <Text
                    style={[
                      styles.kotaTersimpanHeaderTitle,
                      { color: theme.text },
                    ]}
                    numberOfLines={1}
                  >
                    Tersimpan Offline
                  </Text>

                  {/* Tombol Panah Navigasi Geser (Membantu di PC / Mouse) */}
                  {kotaTersimpan.length > 1 && (
                    <View style={styles.panahNavigasiRow}>
                      <TouchableOpacity
                        style={[
                          styles.tombolPanahScroll,
                          {
                            backgroundColor: theme.cardSecondary,
                            borderColor: theme.cardBorder,
                          },
                        ]}
                        activeOpacity={0.7}
                        onPress={() => geserOffline("kiri")}
                        accessibilityRole="button"
                        accessibilityLabel="Geser daftar ke kiri"
                      >
                        <Ionicons name="chevron-back" size={14} color={theme.text} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.tombolPanahScroll,
                          {
                            backgroundColor: theme.cardSecondary,
                            borderColor: theme.cardBorder,
                          },
                        ]}
                        activeOpacity={0.7}
                        onPress={() => geserOffline("kanan")}
                        accessibilityRole="button"
                        accessibilityLabel="Geser daftar ke kanan"
                      >
                        <Ionicons name="chevron-forward" size={14} color={theme.text} />
                      </TouchableOpacity>
                    </View>
                  )}

                  <View
                    style={[
                      styles.kotaTersimpanCountBadge,
                      { backgroundColor: theme.badgeBg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.kotaTersimpanCountBadgeText,
                        { color: theme.badgeText },
                      ]}
                    >
                      {kotaTersimpan.length}/5
                    </Text>
                  </View>
                </View>
                {/* List Horizontal yang bisa digeser ke kanan dan kiri (bisa pakai mouse wheel / tombol panah di PC) */}
                <ScrollView
                  ref={horizontalScrollRef}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  onScroll={(e) => {
                    scrollPosisiOffline.current = e.nativeEvent.contentOffset.x;
                  }}
                  scrollEventThrottle={16}
                  contentContainerStyle={styles.kotaTersimpanHorizontalList}
                  {...(Platform.OS === "web"
                    ? {
                      onWheel: (e: any) => {
                        if (e.deltaY !== 0 || e.deltaX !== 0) {
                          const node =
                            (horizontalScrollRef.current as any)?.getScrollableNode?.() ||
                            (horizontalScrollRef.current as any);
                          if (node) {
                            node.scrollLeft += e.deltaY !== 0 ? e.deltaY : e.deltaX;
                            scrollPosisiOffline.current = node.scrollLeft;
                          }
                        }
                      },
                      onMouseDown: (e: any) => {
                        isDraggingOfflineRef.current = true;
                        hasDraggedRef.current = false;
                        dragStartXRef.current = e.pageX;
                        const node =
                          (horizontalScrollRef.current as any)?.getScrollableNode?.() ||
                          (horizontalScrollRef.current as any);
                        dragScrollLeftRef.current =
                          node?.scrollLeft || scrollPosisiOffline.current;
                      },
                      onMouseMove: (e: any) => {
                        if (!isDraggingOfflineRef.current) return;
                        const delta = e.pageX - dragStartXRef.current;
                        if (Math.abs(delta) > 5) {
                          hasDraggedRef.current = true;
                        }
                        const node =
                          (horizontalScrollRef.current as any)?.getScrollableNode?.() ||
                          (horizontalScrollRef.current as any);
                        if (node) {
                          node.scrollLeft = dragScrollLeftRef.current - delta;
                          scrollPosisiOffline.current = node.scrollLeft;
                        }
                      },
                      onMouseUp: () => {
                        isDraggingOfflineRef.current = false;
                        setTimeout(() => {
                          hasDraggedRef.current = false;
                        }, 50);
                      },
                      onMouseLeave: () => {
                        isDraggingOfflineRef.current = false;
                      },
                      style: {
                        cursor: "grab",
                      } as any,
                    }
                    : {})}
                >
                  {kotaTersimpan.slice(0, 5).map((k) => (
                    <View
                      key={k.kunci}
                      style={[
                        styles.kotaTersimpanItem,
                        {
                          backgroundColor: theme.cardSecondary,
                          borderColor: theme.cardBorder,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.kotaTersimpanItemLeft}
                        activeOpacity={0.7}
                        onPress={() => {
                          if (hasDraggedRef.current) return;
                          pilihKota({
                            id: k.id,
                            name: k.nama,
                            latitude: k.latitude,
                            longitude: k.longitude,
                            country: "",
                          });
                          scrollKeCuaca();
                        }}
                      >
                        <Ionicons name="location-outline" size={15} color={theme.primary} />
                        <Text
                          style={[
                            styles.kotaTersimpanItemNama,
                            { color: theme.text },
                          ]}
                          numberOfLines={1}
                        >
                          {k.nama}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.kotaTersimpanAksiRow}>
                        <TouchableOpacity
                          style={[
                            styles.kotaTersimpanBadge,
                            { backgroundColor: theme.badgeBg },
                          ]}
                          activeOpacity={0.7}
                          onPress={() => {
                            if (hasDraggedRef.current) return;
                            pilihKota({
                              id: k.id,
                              name: k.nama,
                              latitude: k.latitude,
                              longitude: k.longitude,
                              country: "",
                            });
                            scrollKeCuaca();
                          }}
                        >
                          <Text
                            style={[
                              styles.kotaTersimpanBadgeText,
                              { color: theme.badgeText },
                            ]}
                          >
                            Buka Offline
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.tombolHapusOffline}
                          activeOpacity={0.6}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          onPress={() => {
                            if (hasDraggedRef.current) return;
                            setTargetHapusOffline(k);
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={`Hapus cache offline ${k.nama}`}
                        >
                          <Ionicons name="trash-outline" size={16} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Wrapper Bagian Tampilan Cuaca (Target Auto-Scroll) */}
            <View
              onLayout={(e) => {
                setPosisiCuacaY(e.nativeEvent.layout.y);
              }}
              style={styles.cuacaWrapper}
            >
              {/* Loading Indicator Cuaca */}
              {sedangMemuatCuaca && (
                <View
                  style={[
                    styles.cardLoading,
                    {
                      backgroundColor: theme.card,
                      borderColor: theme.cardBorder,
                    },
                  ]}
                >
                  <ActivityIndicator size="large" color="#2563eb" />
                  <Text
                    style={[
                      styles.cardLoadingText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Memuat data cuaca {kotaAktif.name}...
                  </Text>
                </View>
              )}

              {/* Error Cuaca & Tombol Coba Lagi */}
              {pesanErrorCuaca && (
                <View style={styles.errorCard}>
                  <Text
                    accessible
                    accessibilityLabel={pesanErrorCuaca}
                    style={styles.errorText}
                  >
                    {pesanErrorCuaca}
                  </Text>
                  <TouchableOpacity
                    style={styles.tombolCobaLagi}
                    activeOpacity={0.8}
                    onPress={() => kotaAktif && pilihKota(kotaAktif, true)}
                  >
                    <Text style={styles.tombolCobaLagiText}>Coba Lagi</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Tampilan Cuaca Lengkap: WeatherCard (Terpadu Status Data Minimalis), Perbarui, Tambah Favorit */}
              {hasil && kotaAktif && !sedangMemuatCuaca && (
                <View style={styles.cuacaContainer}>
                  {/* Kartu Cuaca Interaktif (Status Data Terpadu Minimalis di dalam Card) */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push({
                        pathname: "/detail/[kota]" as any,
                        params: {
                          kota: kotaAktif.name,
                          id: String(kotaAktif.id),
                          lat: String(kotaAktif.latitude),
                          lon: String(kotaAktif.longitude),
                        },
                      })
                    }
                  >
                    <WeatherCard
                      kota={kotaAktif.name}
                      suhu={hasil.cuaca.saatIni.suhu}
                      tingkatAQI={konversiTingkatAQI(
                        hasil.kualitasUdara.indeksAQI,
                      )}
                      indeksAQI={hasil.kualitasUdara.indeksAQI}
                      kodeCuaca={hasil.cuaca.saatIni.kodeCuaca}
                      kondisi={labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}
                      tampilkanDetail={false}
                      sumberData={hasil.sumber}
                      disimpanPada={hasil.disimpanPada}
                    />
                  </TouchableOpacity>

                  {/* 3. Tombol Perbarui Sekarang (Paksa Memanggil Jaringan Internet) */}
                  <TouchableOpacity
                    style={[
                      styles.tombolPerbarui,
                      {
                        backgroundColor: theme.card,
                        borderColor: theme.cardBorder,
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => pilihKota(kotaAktif, true)}
                    accessibilityRole="button"
                    accessibilityLabel="Perbarui Sekarang"
                  >
                    <Ionicons name="refresh-outline" size={17} color="#2563eb" />
                    <Text style={styles.tombolPerbaruiText}>
                      Perbarui Sekarang
                    </Text>
                  </TouchableOpacity>

                  {/* 4. Tombol Tambahkan ke Favorit */}
                  <TouchableOpacity
                    style={[
                      styles.tombolFavorit,
                      sudahFavorit && {
                        backgroundColor: theme.cardSecondary,
                        borderColor: theme.cardBorder,
                      },
                    ]}
                    activeOpacity={0.8}
                    disabled={sudahFavorit}
                    onPress={() =>
                      router.push({
                        pathname: "/tambah-favorit" as any,
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
                    <Ionicons
                      name={sudahFavorit ? "checkmark-circle" : "star"}
                      size={17}
                      color={sudahFavorit ? "#64748b" : "#ffffff"}
                    />
                    <Text
                      style={[
                        styles.tombolFavoritText,
                        sudahFavorit && styles.tombolFavoritTextDisabled,
                      ]}
                    >
                      {sudahFavorit ? "Sudah di Favorit" : "Tambahkan ke Favorit"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Atribusi Resmi Lisensi Open-Meteo */}
            <AtribusiCuaca />
          </View>
        )}
      </ScrollView>

      {/* Modal Konfirmasi Hapus Cache Offline (Index) */}
      <Modal
        visible={targetHapusOffline !== null}
        transparent
        animationType="fade"
        onRequestClose={batalkanHapusOffline}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdropPressable}
            onPress={batalkanHapusOffline}
            accessibilityLabel="Tutup dialog konfirmasi"
          />
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
              },
            ]}
            accessibilityRole="alert"
            accessibilityLiveRegion="assertive"
          >
            <View
              style={[
                styles.modalIconContainer,
                { backgroundColor: theme.tombolHapusBg },
              ]}
            >
              <Ionicons name="trash-outline" size={28} color="#ef4444" />
            </View>

            <Text style={[styles.modalJudul, { color: theme.text }]}>
              Hapus Cache Offline?
            </Text>
            <Text
              style={[styles.modalKeterangan, { color: theme.textSecondary }]}
            >
              Apakah Anda yakin ingin menghapus data cuaca offline untuk kota ini dari perangkat?
            </Text>

            {targetHapusOffline && (
              <View
                style={[
                  styles.modalPreviewCard,
                  {
                    backgroundColor: theme.cardSecondary,
                    borderColor: theme.cardBorder,
                  },
                ]}
              >
                <View style={styles.modalPreviewIconWrapper}>
                  <Ionicons
                    name="cloud-offline-outline"
                    size={16}
                    color="#2563eb"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalPreviewNama, { color: theme.text }]}>
                    {targetHapusOffline.nama}
                  </Text>
                  <Text
                    style={[
                      styles.modalPreviewKoordinat,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {targetHapusOffline.latitude.toFixed(2)}°,{" "}
                    {targetHapusOffline.longitude.toFixed(2)}°
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                style={[
                  styles.modalBatalButton,
                  { backgroundColor: theme.cardSecondary },
                ]}
                onPress={batalkanHapusOffline}
                disabled={sedangMenghapusOffline}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Batal menghapus cache offline"
              >
                <Text style={[styles.modalBatalButtonText, { color: theme.text }]}>
                  Batal
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalHapusButton}
                onPress={eksekusiHapusOffline}
                disabled={sedangMenghapusOffline}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Konfirmasi hapus cache offline"
              >
                {sedangMenghapusOffline ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.modalHapusButtonText}>Ya, Hapus</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  kotaTersimpanCard: {
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
    gap: 10,
  },
  kotaTersimpanHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingBottom: 4,
  },
  kotaTersimpanIcon: {
    fontSize: 14,
  },
  kotaTersimpanHeaderTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
  },
  kotaTersimpanCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  kotaTersimpanCountBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  panahNavigasiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginRight: 6,
  },
  tombolPanahScroll: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  kotaTersimpanHorizontalList: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 6,
  },
  kotaTersimpanItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
    flexShrink: 0,
  },
  kotaTersimpanItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  kotaTersimpanAksiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tombolHapusOffline: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  kotaTersimpanItemPin: {
    fontSize: 14,
  },
  kotaTersimpanItemNama: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  kotaTersimpanBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  kotaTersimpanBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2563eb",
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
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  errorText: {
    color: "#dc2626",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  tombolCobaLagi: {
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 4,
  },
  tombolCobaLagiText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
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
  cuacaWrapper: {
    gap: 12,
  },
  cuacaContainer: {
    gap: 12,
  },
  tombolPerbarui: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  tombolPerbaruiIcon: {
    fontSize: 14,
  },
  tombolPerbaruiText: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "700",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBackdropPressable: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  modalContent: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 28,
  },
  modalJudul: {
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  modalKeterangan: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  modalPreviewCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    width: "100%",
    gap: 12,
    marginBottom: 20,
  },
  modalPreviewIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
  },
  modalPreviewNama: {
    fontSize: 15,
    fontWeight: "700",
  },
  modalPreviewKoordinat: {
    fontSize: 12,
    marginTop: 2,
  },
  modalButtonGroup: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalBatalButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBatalButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  modalHapusButton: {
    flex: 1,
    backgroundColor: "#dc2626",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  modalHapusButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
