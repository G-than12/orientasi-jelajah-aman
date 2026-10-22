# Panduan Lengkap: Generator PDF Laporan Akademik Berstandar Resmi (Antigravity Typesetting Blueprint)

Buku panduan ini dirancang agar dapat **langsung digunakan pada proyek baru manapun** (baik proyek tugas kuliah, laporan praktikum, skripsi, maupun dokumentasi teknis profesional) di lingkungan IDE Antigravity / VS Code.

> 📦 **FOLDER STARTER KIT SIAP SALIN TELAH DIBUAT**:
> Folder template lengkap dan sudah teruji siap pakai tersedia di direktori:
> [`template-laporan/`](file:///c:/Users/LabIoT_01/Downloads/PBP/orientasi-jelajah-aman/template-laporan/)
> Anda dapat langsung menyalin folder `template-laporan/` ini ke proyek baru manapun dengan 1 perintah terminal:
> ```powershell
> Copy-Item -Recurse template-laporan "c:\Path\Ke\Folder\TugasBaru"
> ```

---

## 📌 DAFTAR ISI
0. [Cara Paling Cepat: Salin Folder Starter Kit](#0-cara-paling-cepat-salin-folder-starter-kit)
1. [Konsep & Keunggulan Sistem](#1-konsep--keunggulan-sistem)
2. [Persiapan Awal di Folder Proyek Baru (Setup 2 Menit)](#2-persiapan-awal-di-folder-proyek-baru-setup-2-menit)
3. [Struktur Berkas Proyek](#3-struktur-berkas-proyek)
4. [Skrip Otomasi 1: Stamping Halaman Akademik (`stamp-academic-pages.py`)](#4-skrip-otomasi-1-stamping-halaman-akademik-stamp-academic-pagespy)
5. [Skrip Otomasi 2: Mesin Generator PDF (`build-pdf.js`)](#5-skrip-otomasi-2-mesin-generator-pdf-build-pdfjs)
6. [Template Markdown Laporan Siap Pakai (`LAPORAN_TEMPLATE.md`)](#6-template-markdown-laporan-siap-pakai-laporan_templatemd)
7. [Koleksi Template Prompt Siap Salin ke Antigravity](#7-koleksi-template-prompt-siap-salin-ke-antigravity)
8. [Troubleshooting & Solusi Masalah Umum](#8-troubleshooting--solusi-masalah-umum)

---

## 0. Cara Paling Cepat: Salin Folder Starter Kit

Jika Anda ingin langsung memulai tanpa harus membuat berkas satu per satu:

1. **Salin Folder `template-laporan` ke Folder Tugas Baru Anda:**
   * **Di Windows PowerShell:**
     ```powershell
     Copy-Item -Recurse template-laporan "../Tugas_Praktikum_Baru"
     ```
   * **Di Git Bash / Linux / macOS:**
     ```bash
     cp -r template-laporan ../Tugas_Praktikum_Baru
     ```
2. **Masuk ke folder baru dan pasang dependensi sekali saja:**
   ```bash
   cd ../Tugas_Praktikum_Baru
   npm install
   pip install pymupdf
   ```
3. **Buka dan edit `LAPORAN.md`** dengan materi tugas Anda.
4. **Jalankan perintah render:**
   ```bash
   npm run build-pdf
   ```
   *Berkas PDF akademik langsung terbit di folder tersebut (`LAPORAN.pdf`).*

---

## 1. Konsep & Keunggulan Sistem

Mengapa cara ini jauh lebih unggul dibandingkan ekspor manual dari Microsoft Word atau Google Docs?

1. **Two-Pass Dynamic Compilation**: Sama seperti compiler LaTeX ilmiah. Fase 1 merender tata letak riil, fase kedua memindai letak fisik bab untuk menghasilkan Daftar Isi yang **100% akurat tanpa perlu diketik manual**.
2. **Kaidah Penomoran Buku Akademik Resmi Indonesia**:
   * Halaman Awal (Lembar Pengesahan, Kata Pengantar, Daftar Isi) menggunakan **angka Romawi kecil** (`ii`, `iii`, `iv`).
   * Halaman Isi Utama (Mulai BAB I s.d. selesai) **direset kembali dari Halaman 1**.
   * Cover bersih tanpa nomor halaman (`@page :first`).
3. **Anti-Break & Anti-Orphan**: Tidak ada lagi judul bab yang menggantung di bawah kertas atau potongan kode yang terpotong jelek antar halaman.
4. **Formula Matematika KaTeX Presisi**: Rumus dirender menjadi simbol matematika nyata (pecahan vertikal, simbol perkalian silang, kurung adaptif, akar, pangkat).
5. **Blok Kode Bergaya IDE Modern**: Setiap blok kode program dibungkus menyerupai jendela editor macOS/VS Code lengkap dengan nama file.

---

## 2. Persiapan Awal di Folder Proyek Baru (Setup 2 Menit)

Buka terminal di folder proyek baru Anda, lalu jalankan perintah berikut:

### A. Inisialisasi & Pemasangan Pustaka Node.js
```bash
# Inisialisasi npm jika belum ada package.json
npm init -y

# Pasang modul parser markdown, matematika katex, dan pembaca pdf
npm install -D marked katex pdf-parse
```

### B. Pasang Modul Manipulasi PDF Python
```bash
pip install pymupdf
```

### C. Tambahkan Perintah Build ke `package.json`
Buka `package.json`, tambahkan baris berikut pada bagian `"scripts"`:
```json
"scripts": {
  "build-pdf": "node ./scripts/build-pdf.js"
}
```

---

## 3. Struktur Berkas Proyek

Buat struktur folder berikut di dalam proyek Anda:

```text
NAMA_PROYEK/
│
├── assets/
│   └── images/
│       └── logo.png                  # Logo kampus atau logo aplikasi
│
├── docs/
│   ├── screenshots/                  # Seluruh tangkapan layar bukti praktikum
│   └── report_previews/              # Pratinjau cover & halaman hasil render
│
├── scripts/
│   ├── stamp-academic-pages.py       # Skrip Python pemindai bab & pencap romawi
│   └── build-pdf.js                  # Generator utama HTML & PDF
│
├── LAPORAN.md                        # Berkas sumber isi laporan
└── package.json
```

---

## 4. Skrip Otomasi 1: Stamping Halaman Akademik (`stamp-academic-pages.py`)

Simpan kode berikut di `scripts/stamp-academic-pages.py`:

```python
# scripts/stamp-academic-pages.py
# Modul Sinkronisasi Penomoran Halaman Akademik (Romawi Awal & Angka Arab Bab)

import sys
import os
import json
import re
import pymupdf

def scan_sections(pdf_path):
    doc = pymupdf.open(pdf_path)
    
    # Target regex bab dan sub-bab utama
    targets = {
        'BAB I': r'BAB\s+I\b',
        'BAB II': r'BAB\s+II\b',
        'BAB III': r'BAB\s+III\b',
        'BAB IV': r'BAB\s+IV\b',
        'BAB V': r'BAB\s+V\b',
        'BAB VI': r'BAB\s+VI\b',
        'BAB VII': r'BAB\s+VII\b',
        'BAB VIII': r'BAB\s+VIII\b',
        'BAB IX': r'BAB\s+IX\b',
        'BAB X': r'BAB\s+X\b',
    }
    
    results = {}
    for key, pattern in targets.items():
        pat = re.compile(pattern, re.IGNORECASE)
        # Scan dari fisik halaman 5 (indeks 4) ke atas (melewati 4 halaman awal)
        for idx in range(4, len(doc)):
            text = doc[idx].get_text()
            if pat.search(text):
                # Halaman dokumen = indeks halaman fisik - 3 (halaman fisik 5 = Halaman 1)
                doc_page = idx - 3
                results[key] = doc_page
                break
                
    doc.close()
    return results

def stamp_footers(pdf_path, output_path=None):
    if output_path is None:
        output_path = pdf_path
        
    doc = pymupdf.open(pdf_path)
    fontname = "helv"
    fontsize = 8.5
    color = (0.28, 0.33, 0.41) # Abu-abu gelap elegan (#475569)
    
    for i in range(1, len(doc)):
        page = doc[i]
        
        # Penomoran Romawi pada lembar pendahuluan
        if i == 1:
            lbl = "ii"
        elif i == 2:
            lbl = "iii"
        elif i == 3:
            lbl = "iv"
        else:
            doc_page = i - 3
            lbl = f"Halaman {doc_page}"
            
        # 1. Hapus teks lama di pojok kanan bawah
        redact_rect = pymupdf.Rect(430, 805, 545, 824)
        page.add_redact_annot(redact_rect, fill=(1, 1, 1))
        page.apply_redactions()
        
        # 2. Cetak label baru rata kanan
        tw = pymupdf.get_text_length(lbl, fontname=fontname, fontsize=fontsize)
        right_margin_x = 538.6
        pos = pymupdf.Point(right_margin_x - tw, 816.8)
        page.insert_text(pos, lbl, fontname=fontname, fontsize=fontsize, color=color)
        
    if output_path == pdf_path:
        temp_out = pdf_path + ".tmp.pdf"
        doc.save(temp_out)
        doc.close()
        os.replace(temp_out, pdf_path)
    else:
        doc.save(output_path)
        doc.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python stamp-academic-pages.py <scan|stamp> <pdf_path> [output_path]")
        sys.exit(1)
        
    mode = sys.argv[1]
    pdf_in = sys.argv[2]
    
    if mode == "scan":
        mapping = scan_sections(pdf_in)
        print(json.dumps(mapping))
    elif mode == "stamp":
        pdf_out = sys.argv[3] if len(sys.argv) > 3 else pdf_in
        stamp_footers(pdf_in, pdf_out)
        print("SUCCESS_STAMP")
```

---

## 5. Skrip Otomasi 2: Mesin Generator PDF (`build-pdf.js`)

Simpan kode berikut di `scripts/build-pdf.js`. Anda cukup menyesuaikan variabel identitas kampus dan judul pada bagian atas skrip:

```javascript
// scripts/build-pdf.js
// Generator Dokumen PDF Ilmiah Premium Berstandar Akademik Nasional

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync, execFileSync } = require("child_process");

let katex;
try { katex = require("katex"); } catch (e) { katex = null; }

let katexCss = "";
try {
  const katexCssPath = require.resolve("katex/dist/katex.min.css");
  katexCss = fs.readFileSync(katexCssPath, "utf8");
} catch (e) {}

const rootDir = path.resolve(__dirname, "..");
const mdFile = path.join(rootDir, "LAPORAN.md");
const htmlFile = path.join(rootDir, "LAPORAN.html");
const pdfFile = path.join(rootDir, "LAPORAN.pdf");
const previewDir = path.join(rootDir, "docs", "report_previews");

if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir, { recursive: true });

console.log("=== MEMULAI GENERASI PDF BERSTANDAR AKADEMIK RESMI ===");

// 1. Konversi Markdown ke HTML via marked
console.log("1. Mengonversi Markdown asli...");
let rawHtml = execSync(`npx -y marked -i "${mdFile}" --gfm`, { encoding: "utf8" });

// Potong cover mentah markdown jika BAB I dimulai
const bab1Regex = /<h2[^>]*>\s*BAB\s+I[\s\S]*?<\/h2>/i;
const bab1Match = rawHtml.match(bab1Regex);
let bodyContent = bab1Match ? rawHtml.substring(bab1Match.index) : rawHtml;

// 2. Format Elemen Akademik Khusus
bodyContent = bodyContent
  // Judul Bab Terpusat
  .replace(/<h2[^>]*>BAB\s+([IVXLCDM]+):\s*([^<]+)<\/h2>/gi, (m, babNum, title) => {
    return `<div class="bab-break"></div>
    <div class="academic-bab-header">
      <div class="bab-title-top">BAB ${babNum}</div>
      <div class="bab-title-main">${title.trim()}</div>
      <div class="bab-underline"></div>
    </div>`;
  })
  // Alert Callout Boxes
  .replace(/<blockquote>\s*<p>\[!NOTE\](?:<br\s*\/?>|\s+)([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (m, c) => {
    return `<div class="academic-alert alert-note"><div class="alert-label">📌 CATATAN TEKNIS</div><div class="alert-body">${c.trim()}</div></div>`;
  })
  .replace(/<blockquote>\s*<p>\[!TIP\](?:<br\s*\/?>|\s+)([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (m, c) => {
    return `<div class="academic-alert alert-tip"><div class="alert-label">💡 PETUNJUK</div><div class="alert-body">${c.trim()}</div></div>`;
  })
  .replace(/<blockquote>\s*<p>\[!IMPORTANT\](?:<br\s*\/?>|\s+)([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (m, c) => {
    return `<div class="academic-alert alert-important"><div class="alert-label">⚠️ PERHATIAN PENTING</div><div class="alert-body">${c.trim()}</div></div>`;
  })
  // Code Blocks IDE Style
  .replace(/<pre><code class="language-([a-zA-Z0-9_-]+)">([\s\S]*?)<\/code><\/pre>/gi, (m, lang, code) => {
    let filename = lang.toUpperCase();
    if (code.includes("// ")) {
      const match = code.match(/\/\/\s*([a-zA-Z0-9_\-\.\/\(\)]+)/);
      if (match) filename = match[1];
    }
    return `<div class="code-wrapper">
      <div class="code-header">
        <span class="code-dot red"></span><span class="code-dot yellow"></span><span class="code-dot green"></span>
        <span class="code-title">📄 ${filename}</span>
      </div>
      <pre><code>${code}</code></pre>
    </div>`;
  });

// Isolasi blok kode agar sintaks $ pada program tidak bentrok dengan rumus
const preservedCode = [];
bodyContent = bodyContent.replace(/<div class="code-wrapper">[\s\S]*?<\/pre>\s*<\/div>/gi, m => {
  preservedCode.push(m);
  return `___CODE_${preservedCode.length - 1}___`;
});

// Render Formula KaTeX
bodyContent = bodyContent.replace(/\$\$([\s\S]*?)\$\$/g, (m, formula) => {
  let ren = formula.trim();
  if (katex) try { ren = katex.renderToString(ren, { displayMode: true, throwOnError: false }); } catch(e){}
  return `<div class="math-box"><div class="math-tag">📐 PERSAMAAN MATEMATIS:</div>${ren}</div>`;
});

bodyContent = bodyContent.replace(/\$([^$\n]+)\$/g, (m, inline) => {
  let ren = inline.trim();
  if (katex) try { ren = katex.renderToString(ren, { displayMode: false, throwOnError: false }); } catch(e){}
  return ren;
});

// Kembalikan blok kode
bodyContent = bodyContent.replace(/___CODE_(\d+)___/g, (m, idx) => preservedCode[parseInt(idx, 10)]);

// 3. Generator HTML Dokumen Lengkap
function generateHtmlDocument(pageMap = {}) {
  const p = (k, def) => pageMap[k] || def;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan Resmi Akademik</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <style>
    @page {
      size: A4 portrait;
      margin-top: 25mm;
      margin-bottom: 22mm;
      margin-left: 28mm;
      margin-right: 20mm;
      @top-right {
        content: "Laporan Tugas Praktikum Akademik";
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 8pt; color: #94a3b8; border-bottom: 0.5px solid #e2e8f0; padding-bottom: 2mm;
      }
      @bottom-left {
        content: "Program Studi Informatika — Fakultas Sains dan Teknologi";
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 8pt; color: #94a3b8; border-top: 0.5px solid #e2e8f0; padding-top: 2mm;
      }
      @bottom-right {
        content: "Halaman " counter(page);
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 8.5pt; font-weight: 600; color: #475569; border-top: 0.5px solid #e2e8f0; padding-top: 2mm;
      }
    }
    @page :first {
      margin: 15mm 20mm;
      @top-right { content: none; }
      @bottom-left { content: none; }
      @bottom-right { content: none; }
    }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      font-size: 9.8pt; line-height: 1.55; color: #1e293b; background: #fff; margin: 0;
    }
    .cover-page {
      height: 240mm; display: flex; flex-direction: column; justify-content: space-between;
      align-items: center; text-align: center; page-break-after: always; break-after: page;
    }
    .instansi-kampus { font-size: 13.5pt; font-weight: 800; color: #1e1b4b; }
    .cover-judul { font-size: 15pt; font-weight: 800; color: #1e1b4b; text-transform: uppercase; margin: 15px 0; }
    .page-break { page-break-after: always; break-after: page; }
    .bab-break { page-break-before: always; break-before: page; }
    .academic-title-center { text-align: center; font-size: 13.5pt; font-weight: 800; color: #1e1b4b; text-transform: uppercase; }
    .title-underline { width: 80px; height: 3px; background: #4f46e5; margin: 0 auto 16px auto; }
    .academic-bab-header { text-align: center; margin: 15px 0 22px 0; page-break-after: avoid; break-after: avoid; }
    .bab-title-top { font-size: 14pt; font-weight: 800; color: #1e1b4b; }
    .bab-title-main { font-size: 12pt; font-weight: 700; color: #4338ca; text-transform: uppercase; }
    .bab-underline { width: 60px; height: 2.5px; background: #6366f1; margin: 8px auto 0 auto; }
    h3 { font-size: 10.5pt; font-weight: 700; color: #0f172a; margin-top: 18px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 3px; page-break-after: avoid; }
    p { text-align: justify; margin: 0 0 8px 0; text-indent: 20px; }
    .academic-bab-header + p, .academic-page > p:first-of-type { text-indent: 0; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 8.8pt; page-break-inside: avoid; }
    th { background: #eef2ff !important; color: #312e81; font-weight: 700; padding: 6px 9px; border: 1px solid #cbd5e1; text-align: left; }
    td { padding: 5.5px 9px; border: 1px solid #cbd5e1; }
    .code-wrapper { margin: 10px 0; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; page-break-inside: avoid; background: #f8fafc; }
    .code-header { background: #f1f5f9; padding: 4px 10px; display: flex; align-items: center; gap: 5px; border-bottom: 1px solid #cbd5e1; }
    .code-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .code-dot.red { background: #ef4444; } .code-dot.yellow { background: #f59e0b; } .code-dot.green { background: #10b981; }
    .code-title { font-family: monospace; font-size: 7.5pt; font-weight: 600; color: #334155; margin-left: 5px; }
    pre { margin: 0; padding: 10px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 7.2pt; line-height: 1.45; }
    div[align="center"] img { max-width: 540px !important; width: 100% !important; border-radius: 6px; border: 1px solid #cbd5e1; box-shadow: 0 4px 14px rgba(15,23,42,0.12); margin: 8px auto; page-break-inside: avoid; }
    div[align="center"] p { text-indent: 0 !important; text-align: center; }
    div[align="center"] em { font-size: 8.5pt; color: #475569; font-style: italic; font-weight: 600; }
    ${katexCss}
    .math-box { background: #f8faff; border: 1.5px solid #818cf8; border-radius: 8px; padding: 10px 18px; margin: 10px 0; text-align: center; page-break-inside: avoid; }
    .math-tag { font-weight: 700; font-size: 8pt; color: #3730a3; text-align: left; margin-bottom: 6px; }
    .toc-table { width: 100%; border: none; font-size: 8.4pt; }
    .toc-table td { border: none !important; padding: 2px 0 !important; }
  </style>
</head>
<body>

  <!-- 1. COVER RESMI -->
  <div class="cover-page">
    <div>
      <div class="instansi-kampus">UNIVERSITAS ISLAM NEGERI K.H. ABDURRAHMAN WAHID PEKALONGAN</div>
      <div style="font-weight: 700; color: #4338ca;">FAKULTAS SAINS DAN TEKNOLOGI — S1 INFORMATIKA</div>
      <div style="height: 3px; background: #1e1b4b; margin-top: 10px;"></div>
    </div>
    <div>
      <div style="background: #e0e7ff; display: inline-block; padding: 4px 16px; border-radius: 6px; font-weight: 800; color: #1e1b4b;">LAPORAN PRAKTIKUM</div>
      <div class="cover-judul">JUDUL LAPORAN TUGAS PRAKTIKUM LENGKAP</div>
    </div>
    <div style="width: 100%; max-width: 440px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px; text-align: left;">
      <table style="width: 100%; margin: 0; border: none;">
        <tr><td style="border:none; width: 120px;"><b>Nama Lengkap</b></td><td style="border:none;">: <b>Gathan Hilabi</b></td></tr>
        <tr><td style="border:none;"><b>NIM</b></td><td style="border:none;">: <b>60324059</b></td></tr>
      </table>
    </div>
    <div style="font-weight: 800; color: #4338ca;">TAHUN 2026 / 2027</div>
  </div>

  <!-- 2. LEMBAR PENGESAHAN -->
  <div class="academic-page page-break">
    <div class="academic-title-center">LEMBAR PENGESAHAN</div>
    <div class="title-underline"></div>
    <p>Laporan praktikum ini telah diperiksa, disetujui, dan disahkan sebagai pemenuhan evaluasi akademik.</p>
  </div>

  <!-- 3. KATA PENGANTAR -->
  <div class="academic-page page-break">
    <div class="academic-title-center">KATA PENGANTAR</div>
    <div class="title-underline"></div>
    <p>Puji dan syukur ke hadirat Allah SWT atas terselesaikannya laporan ini tepat waktu.</p>
  </div>

  <!-- 4. DAFTAR ISI DINAMIS -->
  <div class="academic-page page-break">
    <div class="academic-title-center">DAFTAR ISI</div>
    <div class="title-underline"></div>
    <table class="toc-table">
      <tr><td><strong>HALAMAN SAMPUL DEPAN (COVER)</strong></td><td align="right">i</td></tr>
      <tr><td><strong>LEMBAR PENGESAHAN</strong></td><td align="right">ii</td></tr>
      <tr><td><strong>KATA PENGANTAR</strong></td><td align="right">iii</td></tr>
      <tr><td><strong>DAFTAR ISI</strong></td><td align="right">iv</td></tr>
      <tr><td colspan="2"><hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 4px 0;"></td></tr>
      <tr><td><strong>BAB I: PENDAHULUAN</strong></td><td align="right">${p('BAB I', 1)}</td></tr>
      <tr><td><strong>BAB II: TINJAUAN PUSTAKA & ARSITEKTUR</strong></td><td align="right">${p('BAB II', 2)}</td></tr>
      <tr><td><strong>BAB III: METODOLOGI & IMPLEMENTASI</strong></td><td align="right">${p('BAB III', 3)}</td></tr>
      <tr><td><strong>BAB IV: HASIL PENGUJIAN & ANALISIS</strong></td><td align="right">${p('BAB IV', 4)}</td></tr>
      <tr><td><strong>BAB V: PENUTUP</strong></td><td align="right">${p('BAB V', 5)}</td></tr>
    </table>
  </div>

  <!-- 5. KONTEN DOKUMEN -->
  <div class="academic-body">${bodyContent}</div>
</body>
</html>`;
}

// 4. Eksekusi Cetak Headless Chrome
function renderPdf(srcHtml, outPdf) {
  const chrome = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pdf_run_"));
  try {
    execFileSync(chrome, [
      "--headless", "--disable-gpu", `--user-data-dir=${tmp}`,
      "--no-first-run", "--allow-file-access-from-files",
      `--print-to-pdf=${outPdf}`, "--no-pdf-header-footer", srcHtml
    ], { stdio: "ignore", timeout: 45000 });
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch(e){}
  }
}

// 5. Multi-Pass Execution
console.log("2. Render Pass 1 (Menghitung letak fisik halaman)...");
fs.writeFileSync(htmlFile, generateHtmlDocument(), "utf8");
renderPdf(htmlFile, pdfFile);

const scanPy = path.join(__dirname, "stamp-academic-pages.py");
let pageMap = {};
try {
  const scanOut = execSync(`python "${scanPy}" scan "${pdfFile}"`, { encoding: "utf8" });
  pageMap = JSON.parse(scanOut.trim());
} catch(e) {}

console.log("3. Render Pass 2 (Sinkronisasi Daftar Isi)...");
fs.writeFileSync(htmlFile, generateHtmlDocument(pageMap), "utf8");
renderPdf(htmlFile, pdfFile);

console.log("4. Stamping Footer Akademik (Romawi & Angka Arab)...");
try {
  execSync(`python "${scanPy}" stamp "${pdfFile}"`, { stdio: "inherit" });
} catch(e) {}

console.log("=== BERHASIL! File PDF siap di:", pdfFile);
```

---

## 6. Template Markdown Laporan Siap Pakai (`LAPORAN_TEMPLATE.md`)

Gunakan template struktur di bawah ini saat menyusun isi laporan:

```markdown
## BAB I: PENDAHULUAN

### 1.1 Latar Belakang
Teks paragraf pertama dimulai rata kiri tanpa indentasi.

Paragraf kedua dan seterusnya akan otomatis memiliki indentasi ke dalam sebesar 20px dengan perataan teks rata kanan-kiri (*justify*).

### 1.2 Rumusan Masalah
1. Bagaimana mengimplementasikan sistem yang handal?
2. Bagaimana memvalidasi hasil pengujian?

---

## BAB II: METODOLOGI & FORMULASI

### 2.1 Formulasi Matematis Presisi
Berikut adalah persamaan matematis yang digunakan dalam sistem:

$$\text{Akurasi} = \left( \frac{\text{TP} + \text{TN}}{\text{TP} + \text{TN} + \text{FP} + \text{FN}} \right) \times 100\%$$

Persamaan inline dapat dituliskan dengan mudah seperti $E = mc^2$ atau parameter $PM_{2.5}$.

> [!NOTE]
> Kotak ini akan terformat otomatis menjadi kartu catatan bernuansa biru muda yang elegan.

---

## BAB III: IMPLEMENTASI PROGRAM & SCREENSHOT

### 3.1 Potongan Kode Program
Berikut adalah implementasi fungsi utama pada sistem:

```typescript
// src/services/calculator.ts
export function hitungTotal(a: number, b: number): number {
  return a + b;
}
```

### 3.2 Bukti Hasil Tangkapan Layar
Berikut adalah bukti visual hasil uji coba antarmuka:

<div align="center">

<img src="./docs/screenshots/contoh_hasil.png" width="540" alt="Tangkapan Layar Hasil" />

*Gambar 3.1: Bukti hasil eksekusi program pada perangkat*

</div>

---

## BAB IV: PENUTUP

### 4.1 Kesimpulan
Seluruh target penugasan telah berhasil diselesaikan dengan tingkat akurasi 100%.
```

---

## 7. Koleksi Template Prompt Siap Salin ke Antigravity

Salin prompt di bawah ini ke chat Antigravity saat Anda berada di folder proyek baru:

### 🚀 Prompt A: Inisiasi Pembuatan PDF di Folder Baru
```markdown
Halo Antigravity, saya ingin membuat sistem otomatisasi generator PDF laporan akademik di folder ini dari berkas LAPORAN.md.

Tolong lakukan langkah berikut secara mandiri:
1. Pastikan dependensi terpasang: `npm i -D marked katex pdf-parse` dan `pip install pymupdf`.
2. Buatkan skrip `scripts/stamp-academic-pages.py` untuk pemindaian nomor halaman Bab dan stamping nomor halaman akademik (Romawi ii, iii, iv untuk halaman depan dan Halaman 1..N untuk Bab isi).
3. Buatkan skrip `scripts/build-pdf.js` dengan standar CSS Paged Media A4, tipografi Plus Jakarta Sans, blok kode bergaya IDE, rendering matematika KaTeX, dan pencegah elemen terpotong (page-break-inside: avoid).
4. Tambahkan script `"build-pdf": "node ./scripts/build-pdf.js"` ke package.json.
5. Jalankan perintah `npm run build-pdf` dan konfirmasi bahwa PDF telah berhasil dibuat.
```

### 🎨 Prompt B: Menyesuaikan Data Identitas Mahasiswa & Kampus
```markdown
Tolong sesuaikan identitas cover dan header/footer pada skrip `scripts/build-pdf.js` dengan data berikut:
- Nama Mahasiswa: [Gathan Hilabi]
- NIM: [60324059]
- Program Studi: [S1 Informatika]
- Mata Kuliah: [Nama Mata Kuliah]
- Dosen Pengampu: [Nama Dosen, M.Kom]
- Nama Kampus: [Universitas Islam Negeri K.H. Abdurrahman Wahid Pekalongan]
Lalu jalankan `npm run build-pdf` ulang.
```

### 🔍 Prompt C: Menyelaraskan Daftar Isi Setelah Menambah Konten
```markdown
Saya baru saja menambahkan beberapa gambar dan paragraf baru di file Markdown sehingga halaman bergeser. Tolong jalankan `npm run build-pdf` agar Two-Pass Scanner mendeteksi ulang nomor halaman fisik terbaru dan memperbarui tabel Daftar Isi secara presisi.
```

---

## 8. Troubleshooting & Solusi Masalah Umum

| Masalah | Penyebab | Solusi Cepat |
| :--- | :--- | :--- |
| `chrome.exe not found` | Path instalasi Google Chrome berbeda di sistem operasi Anda. | Buka `build-pdf.js`, ubah variabel `chromeExe` menjadi path Chrome Anda (misal: `C:\Program Files\Google\Chrome\Application\chrome.exe` atau `/usr/bin/google-chrome` di Linux). |
| Nomor halaman Daftar Isi tidak pas | Konten bergeser setelah penambahan teks baru. | Jalankan `npm run build-pdf`. Sistem 2-Pass akan memindai ulang letak fisik halaman dan memperbarui tabel secara otomatis. |
| Gambar screenshot meluber keluar kertas | Resolusi gambar terlalu besar tanpa pembatas lebar. | Selalu gunakan atribut `width="540"` pada tag `<img src="..." width="540" />` di Markdown. |
| Simbol `$` pada kode program rusak | Bentrok dengan parser LaTeX. | Skrip `build-pdf.js` di atas telah dilengkapi sistem isolasi blok kode (`preservedCodeBlocks`) untuk mencegah hal ini. |
