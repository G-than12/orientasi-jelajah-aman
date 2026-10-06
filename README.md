# 🌤️ Jelajah Aman — Aplikasi Monitoring Cuaca & Kualitas Udara 

[![Expo](https://img.shields.io/badge/Expo-v57.0-blue.svg?logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB.svg?logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![API Open-Meteo](https://img.shields.io/badge/Data_API-Open--Meteo-orange.svg)](https://open-meteo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Jelajah Aman** adalah aplikasi *mobile* berbasis **React Native** dan **Expo Router** yang dirancang untuk membantu mobilitas pengguna secara aman, nyaman, dan terencana melalui penyajian data cuaca dan kualitas udara (*Air Quality Index* / AQI) secara *real-time*.

Proyek ini dikembangkan sebagai bagian dari praktikum mata kuliah **Pemrograman Berbasis Platform (INF2528)** pada Program Studi **Informatika, Fakultas Sains dan Teknologi, UIN K.H. Abdurrahman Wahid Pekalongan**.

---

## 🌟 Fitur Utama

### 1. 🔍 Live Search Geocoding Cerdas
* Pencarian kota instan ke seluruh dunia menggunakan **Open-Meteo Geocoding API**.
* Dilengkapi *custom hook* `useDebounce` (500ms) untuk menghemat kuota *request* dan mencegah pemanggilan API berulang saat pengguna mengetik.
* Penanganan 4 kondisi UI yang lengkap: **Memuat (*loading*)**, **Berhasil**, **Kosong (*not found*)**, dan **Gagal (*error connection*)**.

### 2. ⚡ Real-Time Weather & Air Quality Engine
* Memanggil **dua API Open-Meteo sekaligus** (*Weather Forecast* dan *Air Quality*) secara paralel menggunakan `Promise.all` untuk efisiensi waktu respon.
* Dilengkapi mekanisme **Pencegahan *Race Condition*** berbasis `useRef` agar data antar kota yang dicari cepat tidak saling tumpang tindih (*out-of-order responses*).
* Perlindungan waktu tunggu jaringan (**Network Timeout Protection**) menggunakan `AbortController` dengan batas waktu terukur.

### 3. 📊 Visualisasi Cuaca & Metrik Lingkungan Lengkap
* **Kamus Kode Cuaca WMO:** Menerjemahkan 17 kode cuaca standar dunia ke dalam Bahasa Indonesia lengkap dengan ikon visual (☀️ Cerah, ⛅ Berawan, 🌧️ Hujan, ⛈️ Badai, dll.).
* **Adapter AQI:** Mengonversi indeks numerik AQI Eropa ke dalam 4 kategori warna standar (*Baik*, *Sedang*, *Tidak Sehat*, *Berbahaya*).
* **Grid Metrik Lingkungan:** Menampilkan kecepatan angin (km/j), rentang suhu harian (Min/Maks °C), serta kadar partikel debu polutan **PM2.5** dan **PM10** ($\mu\text{g/m}^3$).

### 4. 🗂️ Sinkronisasi Riwayat Antar Tab (*Global State Context*)
* State riwayat pencarian dikelola secara global menggunakan React Context (`RiwayatContext`).
* Kota yang dicari di tab Beranda otomatis tercatat dan tersinkronisasi ke tab Riwayat.
* Riwayat pencarian dapat di-scroll dengan mulus dan dapat langsung diketuk untuk membuka halaman detail kota.

### 5. ♿ Aksesibilitas & UI/UX Responsif
* Desain responsif berbasis `SafeAreaView` yang nyaman di berbagai ukuran layar perangkat Android dan iOS.
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
│   ├── index.tsx            # Tab Beranda (Pencarian & Cuaca Kota Aktif)
│   ├── riwayat.tsx          # Tab Riwayat Pencarian Kota
│   ├── pengaturan.tsx       # Tab Preferensi Suhu & Notifikasi
│   └── tentang.tsx          # Tab Informasi Pengembang & Aplikasi
├── detail/
│   └── [kota].tsx           # Halaman Detail Cuaca & Kualitas Udara Real-Time
└── tambah-favorit.tsx       # Modal Dialog Tambah Kota Favorit
```

---

## 🛠️ Arsitektur Direktori Proyek

```bash
orientasi-jelajah-aman/
├── app/                     # Halaman & Routing (Expo Router)
├── components/              # Komponen UI Reusable
│   ├── AtribusiCuaca.tsx    # Komponen Atribusi Lisensi Open-Meteo
│   ├── RiwayatList.tsx      # Komponen Daftar Riwayat Interaktif
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
│   ├── geocodingService.ts  # Pemanggil Open-Meteo Geocoding API
│   ├── weatherAdapter.ts    # Adapter Konversi Skala AQI ke Kategori
│   └── weatherService.ts    # Pemanggil Open-Meteo Forecast API + Timeout
└── types/                   # Definisi Tipe Data TypeScript
    ├── cuaca.ts             # Tipe Data WeatherCard & Tingkat AQI
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

4. **Menjalankan di Ponsel:**
   * Buka aplikasi **Expo Go** di Android, lalu pindai (*scan*) QR Code yang muncul di terminal.
   * Untuk pengguna iOS, pindai QR Code menggunakan aplikasi Kamera bawaan.

---

## 📋 Ringkasan Perkembangan Modul Praktikum

| Pertemuan | Topik Utama | Rincian Pencapaian |
|---|---|---|
| **Pertemuan 1** | Fondasi & Setup Expo | Inisialisasi proyek Expo dengan TypeScript dan konfigurasi lingkungan pengembang. |
| **Pertemuan 2** | UI Cuaca & Komponen Dasar | Pembuatan komponen `WeatherCard`, sistem styling modular, dan indikator kategori AQI. |
| **Pertemuan 3** | Navigasi & Aksesibilitas | Implementasi Tab Navigation (`(tabs)`), modal favorit, type scale, spacing, dan label aksesibilitas. |
| **Pertemuan 4** | Geocoding & Live Search | Integrasi Open-Meteo Geocoding API, custom hook `useDebounce`, serta routing dinamis `/detail/[kota]`. |
| **Pertemuan 5** | API Realtime Cuaca & AQI | Integrasi API Cuaca & Kualitas Udara ganda, pencegahan race condition, kamus WMO, timeout handler, dan sinkronisasi context. |

---

## ⚖️ Sumber Data & Atribusi

Data cuaca dan pemantauan kualitas udara disediakan secara publik oleh:
* **Prakiraan Cuaca & Geocoding:** [Open-Meteo Weather Forecast API](https://open-meteo.com/)
* **Indeks Kualitas Udara (AQI, PM2.5, PM10):** [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api)

Data disediakan di bawah ketentuan lisensi non-komersial Open-Meteo dengan mencantumkan atribusi resmi pada aplikasi.

---

## 👤 Pengembang

* **Nama:** Gathan Hilabi
* **NIM / Email:** `gathan.hilabi24059@mhs.uingusdur.ac.id`
* **Program Studi:** Informatika
* **Perguruan Tinggi:** UIN K.H. Abdurrahman Wahid Pekalongan
* **Dosen Pengampu:** Reza Iqbal Pramudya, M.Kom

---
*Dibuat dengan ❤️ untuk kemudahan penjelajahan yang aman dan sehat.*
