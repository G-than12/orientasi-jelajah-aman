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

> 📄 **Laporan Lengkap Ujian Tengah Semester (UTS):**  
> Dokumentasi teknis terperinci per bab penugasan, analisis kode, dan galeri tangkapan layar fitur tersedia pada berkas [LAPORAN_UTS_PBP_GATHAN_HILABI.md](./LAPORAN_UTS_PBP_GATHAN_HILABI.md).

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

### 4. 🗂️ Tab Aktivitas Terpadu & Filter Cerdas (Favorit + Riwayat)
* Menggabungkan daftar **Kota Favorit** dan **Riwayat Pencarian** ke dalam satu tab **Aktivitas** yang rapi dan terorganisir.
* Dilengkapi **Filter Chip Kategori** instan: **Semua**, **Favorit**, dan **Riwayat**.
* Dilengkapi kotak **Pencarian Cepat** untuk menyaring aktivitas kota secara *real-time*.
* Tersedia opsi **"Hapus Riwayat"** berbasis dialog konfirmasi aman tanpa menghapus daftar favorit.
* Dialog konfirmasi penghapusan in-app modern dengan kartu tinjauan (*preview card*), menggantikan alert browser bawaan di semua platform (Web, Android, iOS).

### 5. 🔍 Live Search Geocoding Cerdas
* Pencarian kota instan ke seluruh dunia menggunakan **Open-Meteo Geocoding API**.
* Dilengkapi *custom hook* `useDebounce` untuk menghemat kuota *request* dan mencegah pemanggilan API berulang saat pengguna mengetik.
* Penanganan 4 kondisi UI yang lengkap: **Memuat (*loading*)**, **Berhasil**, **Kosong (*not found*)**, dan **Gagal (*error connection*)**.
* Pencarian *offline fallback*: jika koneksi internet terputus, pencarian otomatis mencocokkan nama kota dengan data yang tersimpan di SQLite lokal.

### 6. ⚡ Real-Time Weather & Air Quality Engine
* Memanggil **dua API Open-Meteo sekaligus** (*Weather Forecast* dan *Air Quality*) secara paralel menggunakan `Promise.all` untuk efisiensi waktu respon.
* Mekanisme **Pencegahan *Race Condition*** berbasis `useRef` agar respon API antar kota tidak saling tumpang tindih.
* Perlindungan waktu tunggu jaringan (**Network Timeout Protection**) menggunakan `AbortController`.

### 7. 📊 Visualisasi Cuaca & Metrik Lingkungan Lengkap
* **Kamus Kode Cuaca WMO:** Menerjemahkan 17 kode cuaca standar dunia ke dalam Bahasa Indonesia lengkap dengan ikon visual (☀️ Cerah, ⛅ Berawan, 🌧️ Hujan, ⛈️ Badai, dll.).
* **Adapter AQI:** Mengonversi indeks numerik AQI Eropa ke dalam 4 kategori warna standar (*Baik*, *Sedang*, *Tidak Sehat*, *Berbahaya*).
* **Grid Metrik Lingkungan:** Menampilkan kecepatan angin (km/j), rentang suhu harian (Min/Maks °C), serta kadar partikel debu polutan **PM2.5** dan **PM10** ($\mu\text{g/m}^3$).
* **Footer Status Data Terpadu:** Kartu cuaca menampilkan titik status (*Online* hijau, *Tersimpan* biru, *Offline* oranye) dan umur pembaruan data secara minimalis tanpa memenuhi layar.

### 8. ♿ Aksesibilitas & UI/UX Responsif
* Desain adaptif berbasis `SafeAreaView` yang nyaman di berbagai ukuran layar perangkat Android, iOS, dan Web.
* Standar aksesibilitas lengkap (`accessibilityLabel`, `accessibilityRole`) untuk mendukung pembaca layar (*screen reader* / TalkBack).
* Sistem token desain terstruktur (*type scale* dan *spacing system*).

### 9. 🌙 Mode Gelap & Sinkronisasi Tema Sistem
* **Toggle Beranimasi:** Switch bertema siang/malam interaktif dengan rotasi 360° ikon matahari/bulan serta detail partikel bintang dan awan.
* **Efek Circular Reveal:** Transisi perubahan tema meluas secara melingkar (*ripple wave expansion*) dari titik sentuh tombol toggle menutupi layar tanpa *screen flashing* atau *flicker*.
* **Ikuti Tema Sistem (System Theme):** Sakelar cerdas di tab Pengaturan yang secara otomatis menyelaraskan tema aplikasi dengan pengaturan sistem operasi perangkat (Light / Dark mode via `useColorScheme`).
* **Persistensi Tema:** Pilihan tema tersimpan permanen di `AsyncStorage` melalui `PengaturanContext`.

### 10. 🗃️ Carousel Horizontal "Tersimpan Offline" & Navigasi Desktop
* **Hemat Ruang:** Daftar kota tersimpan di SQLite ditampilkan dalam format *carousel horizontal* kompak sehingga tidak menghabiskan ruang vertikal Beranda.
* **Judul Minimalis:** Label disederhanakan menjadi **"Tersimpan Offline"** satu baris rapi berdampingan dengan badge kuota `(X/5)`.
* **Ramah Desktop & PC:**
  * Tombol navigasi panah **`‹`** dan **`›`** untuk menggeser daftar kota dengan satu kali klik.
  * Dukungan geser **Mouse Drag-to-Scroll** (kursor otomatis berubah menjadi *grab*) meniru pengalaman usap layar sentuh di ponsel.
  * Dukungan putar **Roda Mouse (*Mouse Wheel*)** untuk menggeser daftar secara horizontal.
* **Penghapusan Presisi per Kota (*Single-City Invalidation*):** Menghapus salah satu kota hanya membuang cache kota yang dipilih dari SQLite dan AsyncStorage Web dengan pembaruan tampilan instan (*optimistic update*).

### 11. 🧭 Kustomisasi Ikon Tab Bar Representatif (`Ionicons`)
* **Ikon Adaptif `@expo/vector-icons`:** Menggantikan ikon default dengan ikon representatif yang bertransformasi dinamis antara *focused* (solid) dan *unfocused* (outline) untuk Beranda (`home`), Aktivitas (`time`), Pengaturan (`settings`), dan Tentang (`information-circle`).
* **Area Aman Layar (*Safe Area*):** Menghitung dimensi `useSafeAreaInsets` untuk memastikan teks label dan tombol tidak terpotong pada Android *gesture bar* maupun iOS *home indicator*.

### 12. 🕒 Riwayat Pencarian Terakhir (Maksimal 10 Kota, LIFO & Deduplikasi)
* **Penyimpanan Cerdas `AsyncStorage`:** Otomatis merekam kota hasil pencarian pengguna ke kunci persisten `@jelajah_aman:riwayat_pencarian`.
* **Kapasitas & Deduplikasi:** Dibatasi maksimal 10 pencarian terakhir secara LIFO (*Last-In, First-Out*). Jika kota yang sama dicari ulang, posisinya otomatis dipindahkan ke urutan teratas tanpa menduplikasi baris.
* **Navigasi Cepat:** Setiap kartu riwayat dapat diklik langsung untuk membuka halaman detail cuaca kota tersebut.

### 13. 🗑️ Modal Dialog Konfirmasi Interaktif Hapus Cache
* **Keamanan Data Pengguna:** Dilengkapi modal pop-up kustom *"Hapus Cache Offline?"* sebelum data dihapus secara permanen dari database SQLite.
* **Konsistensi UI:** Menggunakan komponen modal terpadu beranimasi fade yang serasi dengan tema aplikasi di Android, iOS, maupun Web (menggantikan dialog alert bawaan browser).

### 14. 🔤 Tipografi Modern Google Fonts (Plus Jakarta Sans) & Palet Atmospheric Indigo
* **Google Fonts Terintegrasi:** Mengadopsi font **Plus Jakarta Sans** dengan 5 varian bobot (`Regular 400`, `Medium 500`, `SemiBold 600`, `Bold 700`, `ExtraBold 800`).
* **Pembersihan Android `fontWeight` Clash:** Menghilangkan redundansi bobot font sehingga sistem Android tidak mengalami *fallback* ke Roboto.
* **Palet Cuaca Internasional:** Menggunakan warna **Atmospheric Indigo `#4F46E5`**, **Electric Sky `#0EA5E9`**, serta latar malam **Twilight Midnight `#0D1527`** dengan garis tepi **Indigo Glow**.

### 15. 🌡️ Konversi Satuan Suhu Dinamis (Celsius °C $\leftrightarrow$ Fahrenheit °F)
* **Sakelar Preferensi Global:** Mengizinkan pengguna beralih antara satuan metrik **Celsius (°C)** dan imperial **Fahrenheit (°F)** dari menu Pengaturan.
* **Kalkulasi Reaktif Presisi:** Menerapkan rumus konversi $\text{°F} = \text{round}(\text{°C} \times 9/5 + 32)$ secara otomatis pada seluruh antarmuka kartu cuaca.

---

## 📱 Struktur Navigasi Aplikasi

Aplikasi dibangun menggunakan struktur **Expo Router** (*file-based routing*):

```
app/
├── _layout.tsx              # Root Layout dibungkus PengaturanProvider & RiwayatProvider
├── (tabs)/                  # Bottom Tab Navigator
│   ├── _layout.tsx          # Konfigurasi Icon & Tab Bar (Tinggi Dinamis & Label Rapi)
│   ├── index.tsx            # Tab Beranda (Pencarian, GPS Lokasi, Cuaca, Carousel Offline)
│   ├── riwayat.tsx          # Tab Aktivitas (Daftar Favorit & Riwayat Pencarian dengan Filter Kategori)
│   ├── pengaturan.tsx       # Tab Pengaturan (Satuan Suhu, Mode Gelap, Ikuti Sistem, Hapus Cache)
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
│   ├── AnimatedThemeToggle.tsx # Switch Mode Gelap Beranimasi (Sun/Moon Morphing)
│   ├── AtribusiCuaca.tsx    # Komponen Atribusi Lisensi Open-Meteo
│   ├── CircularThemeOverlay.tsx# Overlay Efek Gelombang Melingkar (Circular Reveal)
│   ├── SearchBox.tsx        # Kotak Pencarian dengan Live Search & Clear Button
│   ├── StatusData.tsx       # Re-ekspor Komponen Status Data & Helper
│   └── WeatherCard.tsx      # Kartu Cuaca Utama dengan Footer Status Terpadu
├── constants/               # Konstanta Desain & Kamus Data
│   ├── styles.ts            # Type Scale & Spacing System
│   ├── theme.ts             # Skema Warna Tema Light & Dark
│   └── weatherCodes.ts      # Kamus Terjemahan Kode Cuaca WMO & Ikon
├── contexts/                # State Global Aplikasi
│   ├── PengaturanContext.tsx# Context Satuan Suhu (°C/°F), Mode Gelap & Ikuti Sistem
│   └── RiwayatContext.tsx   # Context Riwayat Pencarian Kota (AsyncStorage)
├── hooks/                   # Custom React Hooks
│   └── use-debounce.ts      # Hook Debounce untuk Live Search API
├── services/                # Lapisan Integrasi Layanan & API Eksternal
│   ├── airQualityService.ts # Pemanggil Open-Meteo Air Quality API
│   ├── favoritStorage.ts    # Service Persistensi Favorit via AsyncStorage
│   ├── geocodingService.ts  # Pemanggil Open-Meteo Geocoding API
│   ├── locationService.ts   # Service Izin & Pengambilan Koordinat GPS Expo
│   ├── pengaturanStorage.ts # Service Persistensi Pengaturan via AsyncStorage
│   ├── weatherAdapter.ts    # Adapter Konversi Skala AQI ke Kategori
│   └── weatherService.ts    # Pemanggil Open-Meteo Forecast API + Timeout
├── src/                     # Arsitektur Database & Layanan Offline-First
│   ├── components/
│   │   └── StatusData.tsx   # Komponen Indikator Status Asal Data (Varian Default & Minimalis)
│   ├── db/
│   │   ├── database.ts      # Koneksi SQLite Native (expo-sqlite) & Migrasi Skema v1/v2
│   │   └── database.web.ts  # Adapter SQLite Mock untuk Web Browser (AsyncStorage Engine)
│   └── services/
│       ├── cacheRepository.ts # CRUD Operasi Database SQLite (Simpan, Ambil, Hapus per Kota)
│       └── cuacaRepository.ts # Orkestrasi Offline-First (Cache-First + Network Fallback)
└── types/                   # Definisi Tipe Data TypeScript
    ├── cache.ts             # Interface Cache SQLite & Ringkasan Kota Tersimpan
    ├── cuaca.ts             # Tipe Data WeatherCardProps & Metrik Cuaca
    ├── favorit.ts           # Interface KotaFavorit (AsyncStorage)
    ├── geocoding.ts         # Tipe Data Hasil Geocoding Open-Meteo
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
| **Pertemuan 7** | SQLite, Cache & Mode Offline | Integrasi SQLite (`expo-sqlite`) dengan migrasi skema v1 & v2 (`PRAGMA user_version`), caching offline-first dengan TTL 30 menit, komponen `StatusData` (asal & umur data), fallback data basi saat offline, dan fitur invalidasi cache manual di tab Pengaturan. |
| **Pertemuan 8 (UTS)** | Kustomisasi Ikon, Riwayat Pencarian, Modal Konfirmasi, Tema Dinamis & Desain Premium | Penyelesaian 4 tugas pokok UTS & inovasi nilai plus: Kustomisasi Ikon Tab Bar (`Ionicons` aktif/inaktif), Riwayat Pencarian Terakhir (`AsyncStorage` max 10 kota, LIFO & deduplikasi otomatis), Modal Dialog Konfirmasi Interaktif Hapus Cache, Sinkronisasi Tema Sistem (`useColorScheme`), Tipografi Modern Google Fonts Plus Jakarta Sans, Palet Warna Atmospheric Indigo, dan Konversi Suhu Dinamis (°C/°F). |

---

## ⚡ Arsitektur Offline-First & Dokumentasi Status Data (Pertemuan 7)

Aplikasi Jelajah Aman menerapkan strategi penyimpanan cerdas **Offline-First** berbasis **SQLite (`expo-sqlite`)** untuk menjamin ketersediaan informasi cuaca di setiap kondisi jaringan:
* **Cache Segar (`cache-segar`):** Data cuaca dan kualitas udara yang tersimpan di database lokal dengan umur di bawah batas TTL (*Time To Live* 30 menit); data ini disajikan seketika tanpa melakukan panggilan jaringan berulang.
* **Cache Basi (`cache-basi`):** Data cadangan lokal yang umurnya telah melebihi 30 menit namun tetap aman ditampilkan sebagai *graceful fallback* saat jaringan internet terputus atau mode pesawat aktif.
* **First-Run Offline:** Kondisi ketika aplikasi pertama kali dibuka tanpa koneksi internet dan belum memiliki riwayat penyimpanan cache lokal sama sekali, ditangani secara elegan melalui pesan informatif dan tombol *Coba Lagi* tanpa menyebabkan aplikasi terhenti (*crash*).
* **Urgensi Label Status Data:** Penyajian label status data (`sumber`) dan stempel waktu (*timestamp*) sangat penting bagi pengguna guna memberikan transparansi dan kejujuran informasi, sehingga pengguna mengetahui secara pasti apakah angka cuaca merupakan kondisi aktual terkini atau perkiraan sebelumnya saat merencanakan perjalanan.

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
