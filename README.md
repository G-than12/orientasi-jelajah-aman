# 🌤️ Jelajah Aman — Aplikasi Monitoring Cuaca & Kualitas Udara

[![Expo](https://img.shields.io/badge/Expo-v57.0-blue.svg?logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB.svg?logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![API Open-Meteo](https://img.shields.io/badge/Data_API-Open--Meteo-orange.svg)](https://open-meteo.com/)
[![Storage: AsyncStorage](https://img.shields.io/badge/Storage-AsyncStorage-blueviolet.svg)](https://react-native-async-storage.github.io/async-storage/)
[![Location: Expo Location](https://img.shields.io/badge/Location-Expo_Location-success.svg)](https://docs.expo.dev/versions/latest/sdk/location/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Jelajah Aman** adalah aplikasi *mobile* berbasis **React Native** dan **Expo Router** yang dirancang untuk membantu mobilitas pengguna secara aman, nyaman, dan terencana melalui penyajian data cuaca dan kualitas udara (*Air Quality Index* / AQI) secara *real-time*.

Proyek ini dikembangkan sebagai bagian dari praktikum mata kuliah **Pemrograman Berbasis Platform (INF2528)** pada Program Studi **Informatika, Fakultas Sains dan Teknologi, UIN K.H. Abdurrahman Wahid Pekalongan**.

---

## 🌟 Fitur Utama

### 1. 📍 Deteksi Lokasi GPS & Manajemen Izin (*Permission Lifecycle*)
* Mengintegrasikan package **`expo-location`** untuk mendeteksi koordinat perangkat terkini secara akurat.
* Menerapkan prinsip privasi **Minimalisasi Data**: hanya meminta izin saat aplikasi aktif (*When In Use / Foreground only*) dan mencantumkan deskripsi izin yang jelas pada `app.json`.
* Menangani secara adaptif **tiga kondisi izin**:
  * **Granted (Diizinkan):** Mengambil koordinat GPS dan memuat cuaca lokasi saat ini secara otomatis.
  * **Denied (Ditolak):** Menampilkan banner edukatif tanpa memutus alur pengguna, menyediakan pencarian kota manual sebagai jalan keluar.
  * **Unavailable (Tidak Aktif):** Mendeteksi layanan GPS perangkat yang dinonaktifkan secara aman tanpa menyebabkan *crash*.

### 2. 💾 Persistensi Kota Favorit (*AsyncStorage Engine*)
* Menggunakan **`@react-native-async-storage/async-storage`** untuk menyimpan daftar kota pilihan pengguna secara permanen dan bertahan meskipun aplikasi ditutup penuh (*app restart*).
* Dilengkapi arsitektur penyimpanan modular berbasis *service layer* (`favoritStorage.ts`) dengan kunci terisolasi `@jelajah_aman:favorit`.
* Pencegahan duplikasi cerdas berbasis *dual-check* (ID kota dan normalisasi nama kota *case-insensitive*).

### 3. ⭐ Sinkronisasi Status Favorit Real-Time (Beranda & Detail)
* Tombol **"Tambahkan ke Favorit"** di Beranda dan halaman Detail otomatis sinkron menggunakan hook `useFocusEffect`.
* Jika kota aktif sudah ada di daftar favorit, tombol otomatis dinonaktifkan (`disabled`) dengan status visual **"Sudah di Favorit ✓"**.
* Penerusan parameter lengkap (`id`, `nama`, `lat`, `lon`) antar rute memastikan integritas data tetap konsisten.

### 4. 🗑️ Manajemen Tab Riwayat & Modal Konfirmasi Hapus In-App
* Tab Riwayat memuat daftar favorit nyata secara dinamis dengan penanda jumlah (*badge*) **"Tersimpan X kota"**.
* Dilengkapi dialog konfirmasi penghapusan in-app yang modern dan elegan:
  * Menggantikan alert browser bawaan (`window.confirm`) dan alert sistem dengan **Modal Dialog In-App** yang seragam di seluruh platform (Web, Android, iOS).
  * Dilengkapi kartu tinjauan kota (*preview card*), indikator memuat (*loading indicator*), serta tombol aksi "Batal" dan "Ya, Hapus" yang aman.
* Mekanisme penghapusan *dual-check* menjamin item segera terhapus dari memori lokal dan tampilan layar seketika.

### 5. 🔍 Live Search Geocoding Cerdas
* Pencarian kota instan ke seluruh dunia menggunakan **Open-Meteo Geocoding API**.
* Dilengkapi *custom hook* `useDebounce` untuk menghemat kuota *request* dan mencegah pemanggilan API berulang saat pengguna mengetik.
* Penanganan 4 kondisi UI yang lengkap: **Memuat (*loading*)**, **Berhasil**, **Kosong (*not found*)**, dan **Gagal (*error connection*)**.

### 6. ⚡ Real-Time Weather & Air Quality Engine
* Memanggil **dua API Open-Meteo sekaligus** (*Weather Forecast* dan *Air Quality*) secara paralel menggunakan `Promise.all` untuk efisiensi waktu respon.
* Mekanisme **Pencegahan *Race Condition*** berbasis `useRef` agar respon API antar kota tidak saling tumpang tindih.
* Perlindungan waktu tunggu jaringan (**Network Timeout Protection**) menggunakan `AbortController`.

### 7. 📊 Visualisasi Cuaca & Metrik Lingkungan Lengkap
* **Kamus Kode Cuaca WMO:** Menerjemahkan 17 kode cuaca standar dunia ke dalam Bahasa Indonesia lengkap dengan ikon visual (☀️ Cerah, ⛅ Berawan, 🌧️ Hujan, ⛈️ Badai, dll.).
* **Adapter AQI:** Mengonversi indeks numerik AQI Eropa ke dalam 4 kategori warna standar (*Baik*, *Sedang*, *Tidak Sehat*, *Berbahaya*).
* **Grid Metrik Lingkungan:** Menampilkan kecepatan angin (km/j), rentang suhu harian (Min/Maks °C), serta kadar partikel debu polutan **PM2.5** dan **PM10** ($\mu\text{g/m}^3$).

### 8. ♿ Aksesibilitas & UI/UX Responsif
* Desain adaptif berbasis `SafeAreaView` yang nyaman di berbagai ukuran layar perangkat Android, iOS, dan Web.
* Standar aksesibilitas lengkap (`accessibilityLabel`, `accessibilityRole`) untuk mendukung pembaca layar (*screen reader* / TalkBack).
* Sistem token desain terstruktur (*type scale* dan *spacing system*).

---

## 📱 Struktur Navigasi Aplikasi

Aplikasi dibangun menggunakan struktur **Expo Router** (*file-based routing*):

```
app/
├── _layout.tsx              # Root Layout dibungkus RiwayatProvider
├── (tabs)/                  # Bottom Tab Navigator
│   ├── _layout.tsx          # Konfigurasi Icon & Tab Bar
│   ├── index.tsx            # Tab Beranda (Pencarian, GPS Lokasi, Cuaca & Tambah Favorit)
│   ├── riwayat.tsx          # Tab Riwayat Favorit (Daftar Tersimpan & Konfirmasi Hapus)
│   ├── pengaturan.tsx       # Tab Preferensi Suhu & Notifikasi
│   └── tentang.tsx          # Tab Informasi Pengembang & Aplikasi
├── detail/
│   └── [kota].tsx           # Halaman Detail Cuaca Lengkap & Status Favorit Terhubung
└── tambah-favorit.tsx       # Modal Dialog Simpan Kota ke AsyncStorage
```

---

## 🛠️ Arsitektur Direktori Proyek

```bash
orientasi-jelajah-aman/
├── app/                     # Halaman & Routing (Expo Router)
├── components/              # Komponen UI Reusable
│   ├── AtribusiCuaca.tsx    # Komponen Atribusi Lisensi Open-Meteo
│   ├── RiwayatList.tsx      # Komponen Daftar Riwayat Pencarian
│   ├── SearchBox.tsx        # Kotak Pencarian dengan Live Search & Clear Button
│   └── WeatherCard.tsx      # Kartu Cuaca Utama & Grid Metrik Simetris
├── constants/               # Konstanta Desain & Kamus Data
│   ├── styles.ts            # Type Scale & Spacing System
│   └── weatherCodes.ts      # Kamus Terjemahan Kode Cuaca WMO & Ikon
├── contexts/                # State Global Aplikasi
│   └── RiwayatContext.tsx   # Context Penyimpan Riwayat Pencarian Kota
├── hooks/                   # Custom React Hooks
│   └── use-debounce.ts      # Hook Debounce untuk Live Search API
├── services/                # Lapisan Integrasi Layanan & API
│   ├── airQualityService.ts # Pemanggil Open-Meteo Air Quality API
│   ├── favoritStorage.ts    # Service Persistensi Favorit via AsyncStorage
│   ├── geocodingService.ts  # Pemanggil Open-Meteo Geocoding API
│   ├── locationService.ts   # Service Izin & Pengambilan Koordinat GPS Expo
│   ├── weatherAdapter.ts    # Adapter Konversi Skala AQI ke Kategori
│   └── weatherService.ts    # Pemanggil Open-Meteo Forecast API + Timeout
└── types/                   # Definisi Tipe Data TypeScript
    ├── cuaca.ts             # Tipe Data WeatherCard & Tingkat AQI
    ├── favorit.ts           # Interface KotaFavorit (AsyncStorage)
    ├── geocoding.ts         # Tipe Data Hasil Geocoding
    └── weather.ts           # Tipe Data Respon API Cuaca & Kualitas Udara
```

---

## 🚀 Panduan Memulai (Instalasi & Penggunaan)

### Prasyarat
* [Node.js](https://nodejs.org/) (Versi 18 LTS atau lebih baru)
* Paket manajer `npm`
* Aplikasi **Expo Go** pada ponsel fisik (Android / iOS) atau Emulator / Simulator

### Langkah Instalasi

1. **Kloning Repositori:**
   ```bash
   git clone https://github.com/G-than12/orientasi-jelajah-aman.git
   cd orientasi-jelajah-aman
   ```

2. **Instal Dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan Server Pengembang Expo:**
   ```bash
   npx expo start
   ```

4. **Menjalankan di Ponsel / Emulator:**
   * Buka aplikasi **Expo Go** di Android, lalu pindai (*scan*) QR Code yang muncul di terminal.
   * Untuk pengguna iOS, pindai QR Code menggunakan aplikasi Kamera bawaan.
   * Tekan tombol `a` untuk membuka Android Emulator atau `w` untuk membuka versi Web di browser.

---

## 📋 Ringkasan Perkembangan Modul Praktikum

| Pertemuan | Topik Utama | Rincian Pencapaian |
|---|---|---|
| **Pertemuan 1** | Fondasi & Setup Expo | Inisialisasi proyek Expo dengan TypeScript dan konfigurasi lingkungan pengembang. |
| **Pertemuan 2** | UI Cuaca & Komponen Dasar | Pembuatan komponen `WeatherCard`, sistem styling modular, dan indikator kategori AQI. |
| **Pertemuan 3** | Navigasi & Aksesibilitas | Implementasi Tab Navigation (`(tabs)`), modal favorit, type scale, spacing, dan label aksesibilitas. |
| **Pertemuan 4** | Geocoding & Live Search | Integrasi Open-Meteo Geocoding API, custom hook `useDebounce`, serta routing dinamis `/detail/[kota]`. |
| **Pertemuan 5** | API Realtime Cuaca & AQI | Integrasi API Cuaca & Kualitas Udara ganda paralel, pencegahan race condition, kamus WMO, dan timeout handler. |
| **Pertemuan 6** | Lokasi, Permission & AsyncStorage | Integrasi GPS `expo-location` (3 kondisi izin), persistensi `AsyncStorage`, modal tambah favorit berbasis parameter, tab riwayat dinamis, konfirmasi hapus lintas platform, dan sinkronisasi status duplikat. |

---

## ⚖️ Sumber Data & Atribusi

Data cuaca dan pemantauan kualitas udara disediakan secara publik oleh:
* **Prakiraan Cuaca & Geocoding:** [Open-Meteo Weather Forecast API](https://open-meteo.com/)
* **Indeks Kualitas Udara (AQI, PM2.5, PM10):** [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api)

Data disediakan di bawah ketentuan lisensi non-komersial Open-Meteo dengan mencantumkan atribusi resmi pada aplikasi.

---

## 👤 Pengembang

* **Nama:** Gathan Hilabi
* **NIM / Email:** `059`/`gathan.hilabi24059@mhs.uingusdur.ac.id`
* **Program Studi:** Informatika
* **Perguruan Tinggi:** UIN K.H. Abdurrahman Wahid Pekalongan
* **Dosen Pengampu:** Reza Iqbal Pramudya, M.Kom

---
*Dibuat dengan ❤️ untuk kemudahan penjelajahan yang aman dan sehat.*
