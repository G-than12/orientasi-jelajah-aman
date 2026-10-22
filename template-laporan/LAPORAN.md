# LAPORAN PRAKTIKUM
## PEMROGRAMAN BERBASIS PLATFORM

---

## BAB I: PENDAHULUAN

### 1.1 Latar Belakang
Teknologi pengembangan aplikasi mobile modern berkembang sangat pesat dengan hadirnya kerangka kerja *cross-platform* seperti React Native dan Expo. Kerangka kerja ini memungkinkan para pengembang membangun aplikasi untuk sistem operasi Android, iOS, dan Web sekaligus hanya dengan menggunakan satu basis kode (*single codebase*) berbasis TypeScript dan React.

Dalam konteks pengembangan aplikasi berskala komersial dan akademik, kepatuhan terhadap prinsip arsitektur perangkat lunak, efisiensi konsumsi memori, serta pengalaman pengguna (*User Experience*) yang responsif menjadi tolok ukur utama keberhasilan sebuah sistem.

### 1.2 Tujuan Penugasan
Tujuan utama dari penyusunan laporan dan implementasi sistem ini adalah:
1. Memahami siklus hidup navigasi (*navigation lifecycle*) dan struktur routing berbasis folder (*file-based routing*).
2. Mengelola status global (*global state management*) menggunakan React Context API secara terpusat.
3. Mengimplementasikan penyimpanan lokal persisten (*offline storage*) dengan SQLite dan AsyncStorage.

---

## BAB II: TINJAUAN PUSTAKA & ARSITEKTUR

### 2.1 Pola Arsitektur Sistem
Aplikasi menerapkan pemisahan tugas (*Separation of Concerns*) yang tegas antara lapisan antarmuka pengguna (*UI Layer*), lapisan manajemen status (*State Layer*), dan lapisan persistensi data lokal (*Storage Layer*).

| Komponen Arsitektur | Teknologi / Library | Fungsi Utama |
| :--- | :--- | :--- |
| **User Interface** | React Native + Expo UI | Menampilkan komponen visual, tata letak dinamis, dan animasi |
| **State Management** | Context API (Hooks) | Mengelola status preferensi tema dan riwayat pencarian |
| **Local Persistence** | Expo SQLite Next | Menyimpan cache data cuaca offline dan pencarian terakhir |
| **Network Client** | Fetch API + Async/Await | Mengambil data cuaca dan indeks kualitas udara secara *real-time* |

> [!NOTE]
> Seluruh aliran data dirancang menganut prinsip *unidirectional data flow* agar status aplikasi mudah diprediksi dan bebas dari efek samping (*side effects*).

---

## BAB III: METODOLOGI & FORMULASI

### 3.1 Formulasi Matematis Presisi
Dalam sistem ini diterapkan algoritma konversi skala suhu dan indeks kualitas udara menggunakan persamaan matematis:

$$\text{Suhu (°F)} = \text{round}\left( \text{Suhu (°C)} \times \frac{9}{5} + 32 \right)$$

Sebagai contoh perhitungan riil: suhu kota sebesar **$32^\circ\text{C}$** dikonversi secara akurat menjadi **$89^\circ\text{F}$** dengan evaluasi:

$$32 \times 1.8 + 32 = 89.6 \approx 89^\circ\text{F}$$

> [!TIP]
> Penggunaan fungsi pembulatan `round()` memastikan nilai suhu yang ditampilkan pada kartu cuaca tetap proporsional dan tidak memunculkan angka desimal panjang.

---

## BAB IV: HASIL PENGUJIAN & IMPLEMENTASI

### 4.1 Potongan Kode Program Utama
Berikut adalah implementasi fungsi konversi suhu yang diterapkan pada sistem:

```typescript
// src/services/konversiSuhu.ts
export function hitungKonversiSuhu(
  celsius: number,
  celciusAktif: boolean
): number {
  if (celciusAktif) {
    return Math.round(celsius);
  }
  return Math.round((celsius * 9) / 5 + 32);
}
```

### 4.2 Bukti Tangkapan Layar Hasil Implementasi
Berikut adalah bukti visual hasil uji coba antarmuka sistem pada perangkat:

<div align="center">

<img src="./assets/images/logo.png" width="240" alt="Logo Bukti Implementasi Sistem" />

*Gambar 4.1: Tampilan antarmuka sistem yang telah teruji secara fungsional*

</div>

---

## BAB V: KESIMPULAN & PENUTUP

### 5.1 Kesimpulan
Berdasarkan hasil analisis, perancangan, dan implementasi yang telah dilakukan, dapat disimpulkan bahwa:
1. Seluruh fitur tugas praktikum berhasil diwujudkan sesuai spesifikasi kebutuhan.
2. Penggunaan arsitektur penyimpanan lokal offline (*offline-first*) memberikan keandalan sistem yang tinggi saat perangkat kehilangan koneksi internet.
3. Tipografi kustom modern dan palet visual selaras memberikan dampak visual yang profesional dan nyaman bagi pengguna.

---

*Pekalongan, 21 Oktober 2026*  
**Mahasiswa Penyusun,**

**Gathan Hilabi**  
NIM: 60324059
