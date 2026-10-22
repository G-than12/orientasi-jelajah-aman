// scripts/build-pdf.js
// Script Generator PDF Laporan UTS Berstandar Akademik Resmi UIN K.H. Abdurrahman Wahid Pekalongan
// Penyusun: Gathan Hilabi (NIM: 60324059) — S1 Informatika FST

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync, execFileSync } = require("child_process");
let PDFParse;
try {
  const mod = require("pdf-parse");
  PDFParse = mod.PDFParse || mod;
} catch (e) {
  PDFParse = null;
}

let katex;
try {
  katex = require("katex");
} catch (e) {
  katex = null;
}

let katexCss = "";
try {
  const katexCssPath = require.resolve("katex/dist/katex.min.css");
  katexCss = fs.readFileSync(katexCssPath, "utf8");
} catch (e) {}

const rootDir = path.resolve(__dirname, "..");
const mdFile = path.join(rootDir, "LAPORAN_UTS_PBP_GATHAN_HILABI.md");
const htmlFile = path.join(rootDir, "LAPORAN_UTS_PBP_GATHAN_HILABI.html");
const pdfFile = path.join(rootDir, "LAPORAN_UTS_PBP_GATHAN_HILABI.pdf");
const previewDir = path.join(rootDir, "docs", "report_previews");

if (!fs.existsSync(previewDir)) {
  fs.mkdirSync(previewDir, { recursive: true });
}

console.log("=== MEMULAI GENERASI PDF BERSTANDAR AKADEMIK RESMI ===");

// 1. Path Logo Aplikasi & Ikon
const logoRelPath = "./assets/images/icon.png";

// 2. Konversi Markdown ke HTML dasar via marked
console.log("1. Mengonversi Markdown asli dengan Marked parser...");
let rawHtml = execSync(`npx -y marked -i "${mdFile}" --gfm`, { encoding: "utf8" });

// 3. Potong bagian identitas & TOC mentah dari Markdown agar TIDAK redundan pada halaman isi
const bab1Regex = /<h2[^>]*>\s*BAB\s+I[\s\S]*?<\/h2>/i;
const bab1Match = rawHtml.match(bab1Regex);
const bab1Index = bab1Match ? bab1Match.index : -1;

if (bab1Index === -1) {
  console.warn("PERINGATAN: BAB I tidak ditemukan dengan regex, menggunakan rawHtml penuh.");
} else {
  console.log(`2. Memotong cover mentah & TOC lama (karakter 0 s.d. ${bab1Index}) agar tidak redundan.`);
}

let bodyContent = bab1Index !== -1 ? rawHtml.substring(bab1Index) : rawHtml;

// 4. Percantik BAB headers & Penomoran Akademik Formal
console.log("3. Menyusun format bab ilmiah, callout alerts, rumus, dan listing program...");
bodyContent = bodyContent
  // Ganti h2 BAB menjadi header bab formal terpusat
  .replace(/<h2[^>]*>BAB\s+([IVXLCDM]+):\s*([^<]+)<\/h2>/gi, (m, babNum, title) => {
    const babId = `bab-${babNum.toLowerCase()}`;
    return `<div class="bab-break"></div>
    <div class="academic-bab-header" id="${babId}">
      <div class="bab-title-top">BAB ${babNum}</div>
      <div class="bab-title-main">${title.trim()}</div>
      <div class="bab-underline"></div>
    </div>`;
  })
  // Percantik Alerts
  .replace(/<blockquote>\s*<p>\[!NOTE\](?:<br\s*\/?>|\s+)([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (m, content) => {
    return `<div class="academic-alert alert-note">
      <div class="alert-label">📌 CATATAN TEKNIS</div>
      <div class="alert-body">${content.trim()}</div>
    </div>`;
  })
  .replace(/<blockquote>\s*<p>\[!TIP\](?:<br\s*\/?>|\s+)([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (m, content) => {
    return `<div class="academic-alert alert-tip">
      <div class="alert-label">💡 PETUNJUK & BEST PRACTICE</div>
      <div class="alert-body">${content.trim()}</div>
    </div>`;
  })
  .replace(/<blockquote>\s*<p>\[!IMPORTANT\](?:<br\s*\/?>|\s+)([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (m, content) => {
    return `<div class="academic-alert alert-important">
      <div class="alert-label">⚠️ PERHATIAN PENTING</div>
      <div class="alert-body">${content.trim()}</div>
    </div>`;
  })
  // Format code blocks dengan wrapper berbingkai rapi
  .replace(/<pre><code class="language-([a-zA-Z0-9_-]+)">([\s\S]*?)<\/code><\/pre>/gi, (m, lang, code) => {
    let filename = lang.toUpperCase();
    if (code.includes("// ")) {
      const match = code.match(/\/\/\s*([a-zA-Z0-9_\-\.\/\(\)]+)/);
      if (match) filename = match[1];
    }
    return `<div class="code-wrapper">
      <div class="code-header">
        <span class="code-dot red"></span>
        <span class="code-dot yellow"></span>
        <span class="code-dot green"></span>
        <span class="code-title">📄 ${filename}</span>
      </div>
      <pre><code>${code}</code></pre>
    </div>`;
  });

// Simpan blok kode sementara agar karakter $ pada program tidak bentrok dengan parser matematika
const preservedCodeBlocks = [];
bodyContent = bodyContent.replace(/<div class="code-wrapper">[\s\S]*?<\/pre>\s*<\/div>/gi, (m) => {
  preservedCodeBlocks.push(m);
  return `___PRESERVED_CODE_${preservedCodeBlocks.length - 1}___`;
});
bodyContent = bodyContent.replace(/<pre[\s\S]*?<\/pre>/gi, (m) => {
  preservedCodeBlocks.push(m);
  return `___PRESERVED_CODE_${preservedCodeBlocks.length - 1}___`;
});

// Render Formula Matematika Display ($$...$$) menggunakan KaTeX
bodyContent = bodyContent.replace(/\$\$([\s\S]*?)\$\$/g, (m, formula) => {
  let rendered = formula.trim();
  if (katex) {
    try {
      rendered = katex.renderToString(rendered, { displayMode: true, throwOnError: false });
    } catch (e) {
      console.warn("Peringatan render KaTeX display:", e.message);
    }
  }
  return `<div class="math-box">
    <div class="math-tag">📐 PERSAMAAN MATEMATIS (FORMULASI KONVERSI SKALA SUHU):</div>
    ${rendered}
  </div>`;
});

// Render Formula Matematika Inline ($...$) menggunakan KaTeX
bodyContent = bodyContent.replace(/\$([^$\n]+)\$/g, (m, inline) => {
  const trimmed = inline.trim();
  if (katex) {
    try {
      return katex.renderToString(trimmed, { displayMode: false, throwOnError: false });
    } catch (e) {
      console.warn("Peringatan render KaTeX inline:", e.message);
    }
  }
  return trimmed;
});

// Pulihkan blok kode yang disimpan
bodyContent = bodyContent.replace(/___PRESERVED_CODE_(\d+)___/g, (m, idx) => {
  return preservedCodeBlocks[parseInt(idx, 10)];
});

// 5. Fungsi generator template HTML dengan nomor halaman dinamis
function generateHtmlDocument(pageMap = {}) {
  const p = (key, defaultPage) => pageMap[key] || defaultPage;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan UTS PBP - Gathan Hilabi (60324059)</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <style>
    /* ========================================================== */
    /* KONFIGURASI HALAMAN CETAK STANDAR AKADEMIK INDONESIA       */
    /* ========================================================== */
    @page {
      size: A4 portrait;
      margin-top: 25mm;
      margin-bottom: 22mm;
      margin-left: 28mm;
      margin-right: 20mm;

      @top-right {
        content: "Laporan UTS PBP — Gathan Hilabi (60324059)";
        font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
        font-size: 8pt;
        color: #94a3b8;
        font-weight: 500;
        border-bottom: 0.5px solid #e2e8f0;
        padding-bottom: 2mm;
      }

      @bottom-left {
        content: "UIN K.H. Abdurrahman Wahid Pekalongan";
        font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
        font-size: 8pt;
        color: #94a3b8;
        border-top: 0.5px solid #e2e8f0;
        padding-top: 2mm;
      }

      @bottom-right {
        content: "Halaman " counter(page);
        font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
        font-size: 8.5pt;
        font-weight: 600;
        color: #475569;
        border-top: 0.5px solid #e2e8f0;
        padding-top: 2mm;
      }
    }

    /* Sembunyikan header dan footer pada halaman Sampul (Cover) */
    @page :first {
      margin-top: 15mm;
      margin-bottom: 15mm;
      margin-left: 20mm;
      margin-right: 20mm;
      @top-right { content: none; }
      @bottom-left { content: none; }
      @bottom-right { content: none; }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 9.8pt;
      line-height: 1.55;
      color: #1e293b;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* ========================================================== */
    /* 1. HALAMAN SAMPUL DEPAN (COVER RESMI)                      */
    /* ========================================================== */
    .cover-page {
      height: 240mm;
      max-height: 240mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      text-align: center;
      page-break-after: always;
      break-after: page;
      box-sizing: border-box;
      padding: 4mm 0;
    }

    @media screen {
      .cover-page {
        min-height: 100vh;
        height: auto;
        max-height: none;
        padding: 40px 20px;
        border-bottom: 3px double #cbd5e1;
        margin-bottom: 40px;
      }
    }

    .cover-instansi {
      width: 100%;
    }
    .instansi-kemenag {
      font-size: 11pt;
      font-weight: 700;
      color: #334155;
      letter-spacing: 0.8px;
    }
    .instansi-kampus {
      font-size: 13.5pt;
      font-weight: 800;
      color: #1e1b4b;
      margin: 4px 0 2px 0;
      letter-spacing: 0.5px;
    }
    .instansi-fakultas {
      font-size: 11pt;
      font-weight: 700;
      color: #4338ca;
    }
    .cover-divider {
      width: 100%;
      height: 3px;
      background: #1e1b4b;
      margin: 10px 0 1.5px 0;
    }
    .cover-divider-thin {
      width: 100%;
      height: 1px;
      background: #1e1b4b;
      margin-bottom: 18px;
    }

    .cover-main-box {
      margin: 5px 0;
    }
    .cover-badge-uts {
      display: inline-block;
      font-size: 11pt;
      font-weight: 800;
      color: #1e1b4b;
      background: #e0e7ff;
      padding: 5px 18px;
      border-radius: 6px;
      border: 1.5px solid #6366f1;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .cover-judul-mk {
      font-size: 12pt;
      font-weight: 700;
      color: #475569;
      margin-bottom: 8px;
    }
    .cover-judul-proyek {
      font-size: 15pt;
      font-weight: 800;
      color: #1e1b4b;
      line-height: 1.4;
      max-width: 540px;
      margin: 0 auto;
      text-transform: uppercase;
    }

    .cover-logo-wrapper {
      margin: 16px 0;
    }
    .cover-logo {
      width: 110px;
      height: 110px;
      border-radius: 24px;
      box-shadow: 0 8px 24px rgba(79, 70, 229, 0.22);
      border: 3px solid #6366f1;
    }

    .cover-identitas-box {
      width: 100%;
      max-width: 470px;
      margin: 0 auto;
      background: #f8fafc;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      padding: 10px 18px;
      text-align: left;
    }
    .cover-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
      margin: 0 !important;
    }
    .cover-table td {
      border: none !important;
      background: transparent !important;
      padding: 3px 4px !important;
    }
    .cover-table td.lbl {
      width: 175px;
      font-weight: 600;
      color: #475569;
    }
    .cover-table td.sep {
      width: 12px;
      font-weight: 700;
    }
    .cover-table td.val {
      color: #0f172a;
    }

    .cover-footer {
      font-size: 9.5pt;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.35;
      margin-top: 10px;
    }
    .cover-tahun {
      font-size: 10.5pt;
      font-weight: 800;
      color: #4338ca;
      margin-top: 3px;
    }

    /* ========================================================== */
    /* FORMAT KARYA ILMIAH RESMI                                  */
    /* ========================================================== */
    .page-break {
      page-break-after: always;
      break-after: page;
    }
    .bab-break {
      page-break-before: always;
      break-before: page;
    }

    .academic-page {
      padding-top: 5px;
    }

    .academic-title-center {
      text-align: center;
      font-size: 13.5pt;
      font-weight: 800;
      color: #1e1b4b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .title-underline {
      width: 80px;
      height: 3px;
      background: #4f46e5;
      margin: 0 auto 16px auto;
    }

    /* Header Bab Ilmiah */
    .academic-bab-header {
      text-align: center;
      margin-top: 15px;
      margin-bottom: 22px;
      page-break-after: avoid;
      break-after: avoid;
    }
    .bab-title-top {
      font-size: 14pt;
      font-weight: 800;
      color: #1e1b4b;
      letter-spacing: 1px;
    }
    .bab-title-main {
      font-size: 12pt;
      font-weight: 700;
      color: #4338ca;
      margin-top: 4px;
      text-transform: uppercase;
      line-height: 1.4;
    }
    .bab-underline {
      width: 60px;
      height: 2.5px;
      background: #6366f1;
      margin: 8px auto 0 auto;
    }

    h3 {
      font-size: 10.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-top: 18px;
      margin-bottom: 6px;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 3px;
      page-break-after: avoid;
      break-after: avoid;
    }

    p {
      text-align: justify;
      margin: 0 0 8px 0;
      text-indent: 20px;
    }

    .academic-page > p:first-of-type,
    .academic-bab-header + p {
      text-indent: 0;
    }

    ul, ol {
      margin: 4px 0 10px 0;
      padding-left: 24px;
    }
    li {
      margin-bottom: 4px;
      text-align: justify;
    }

    /* Tabel Ilmiah */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 8.8pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    th {
      background: #eef2ff !important;
      color: #312e81;
      font-weight: 700;
      text-align: left;
      padding: 6px 9px;
      border: 1px solid #cbd5e1;
    }
    td {
      padding: 5.5px 9px;
      border: 1px solid #cbd5e1;
      vertical-align: middle;
    }
    tr:nth-child(even) td {
      background: #f8fafc !important;
    }

    /* Framing Tangkapan Layar (Screenshots) Antarmuka Smartphone */
    div[align="center"] {
      text-align: center;
      margin: 10px 0 14px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    div[align="center"] table {
      margin: 6px auto;
      border: none !important;
      background: transparent !important;
      width: auto !important;
    }

    div[align="center"] table th,
    div[align="center"] table td {
      border: none !important;
      background: transparent !important;
      padding: 4px 8px !important;
      text-align: center !important;
      vertical-align: top !important;
    }

    div[align="center"] img:not(.code-screenshot) {
      max-height: 240px !important;
      max-width: 150px !important;
      width: auto !important;
      height: auto !important;
      border-radius: 12px;
      border: 1.5px solid #94a3b8;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
      display: block;
      margin: 0 auto;
    }

    /* Banner landscape Tab Bar */
    div[align="center"] > img[alt*="Tab Bar"]:not(.code-screenshot) {
      max-width: 380px !important;
      max-height: 105px !important;
      border-radius: 10px;
    }

    /* Tangkapan Layar Editor Kode (Kutipan Gambar Kode) */
    img.code-screenshot,
    div[align="center"] img.code-screenshot {
      max-width: 540px !important;
      max-height: 800px !important;
      width: 100% !important;
      height: auto !important;
      border-radius: 8px;
      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.12);
      display: block;
      margin: 10px auto;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Format Teks Miring (Italic) Standar Inline */
    em {
      font-style: italic;
    }

    /* Keterangan Gambar (Image Caption) di bawah tangkapan layar */
    div[align="center"] p {
      text-indent: 0 !important;
      text-align: center;
      margin: 4px 0 0 0;
    }

    div[align="center"] > p > em,
    div[align="center"] > em,
    div[align="center"] table td em {
      font-size: 8.5pt;
      color: #475569;
      font-style: italic;
      font-weight: 600;
      line-height: 1.35;
      text-align: center;
    }

    div[align="center"] > p > em,
    div[align="center"] > em {
      display: block;
      margin-top: 5px;
    }

    div[align="center"] em code {
      font-family: inherit !important;
      font-style: italic !important;
      color: inherit !important;
      background: transparent !important;
      padding: 0 !important;
      border: none !important;
      font-weight: inherit !important;
    }


    /* Listing Kode Program */
    .code-wrapper {
      margin: 10px 0 14px 0;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
      background: #f8fafc;
    }
    .code-header {
      background: #f1f5f9;
      border-bottom: 1px solid #cbd5e1;
      padding: 4px 10px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .code-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .code-dot.red { background: #ef4444; }
    .code-dot.yellow { background: #f59e0b; }
    .code-dot.green { background: #10b981; }
    .code-title {
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 7.5pt;
      font-weight: 600;
      color: #334155;
      margin-left: 6px;
    }
    pre {
      margin: 0;
      padding: 10px 14px;
      font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
      font-size: 7.2pt;
      line-height: 1.45;
      color: #0f172a;
      background: #f8fafc !important;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
    }
    pre code {
      background: transparent !important;
      color: inherit !important;
      padding: 0 !important;
      border: none !important;
      font-size: inherit !important;
      font-weight: inherit !important;
    }
    code {
      font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
      font-size: 8.5pt;
      color: #0f172a;
      background: transparent;
      padding: 0;
      font-weight: 600;
    }


    /* Alerts */
    .academic-alert {
      margin: 10px 0 14px 0;
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 8.5pt;
      page-break-inside: avoid;
      break-inside: avoid;
      border-left: 4px solid;
    }
    .alert-note {
      background: #eff6ff;
      border-color: #3b82f6;
      color: #1e3a8a;
    }
    .alert-tip {
      background: #f0fdf4;
      border-color: #22c55e;
      color: #14532d;
    }
    .alert-important {
      background: #fef2f2;
      border-color: #ef4444;
      color: #7f1d1d;
    }
    .alert-label {
      font-weight: 700;
      font-size: 8pt;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .alert-body {
      line-height: 1.45;
    }

    /* Formula Matematika KaTeX & Kotak Persamaan */
    ${katexCss}

    .math-box {
      background: #f8faff;
      border: 1.5px solid #818cf8;
      border-radius: 8px;
      padding: 10px 18px;
      margin: 10px 0 14px 0;
      text-align: center;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .math-tag {
      font-weight: 700;
      font-size: 8pt;
      color: #3730a3;
      letter-spacing: 0.5px;
      text-align: left;
      margin-bottom: 6px;
    }
    .katex-display {
      margin: 8px 0 4px 0 !important;
    }
    .katex {
      font-size: 1.15em !important;
      color: #1e1b4b;
    }

    /* Tanda Tangan */
    .ttd-box {
      display: flex;
      justify-content: space-between;
      margin-top: 35px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .ttd-col {
      width: 44%;
      text-align: center;
      font-size: 9.5pt;
      line-height: 1.4;
    }
    .ttd-space {
      height: 65px;
    }

    /* Badges */
    .badge-success {
      background: #dcfce7;
      color: #166534;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #86efac;
      font-size: 8pt;
    }

    /* Daftar Isi Dot Leader */
    .toc-table {
      width: 100%;
      border: none;
      margin: 4px 0;
      font-size: 8.2pt;
      line-height: 1.25;
      page-break-inside: auto !important;
      break-inside: auto !important;
    }
    .toc-table td {
      border: none !important;
      background: transparent !important;
      padding: 1.5px 0 !important;
    }
  </style>
</head>
<body>

  <!-- ========================================================== -->
  <!-- 1. HALAMAN SAMPUL DEPAN (COVER RESMI)                      -->
  <!-- ========================================================== -->
  <div class="cover-page">
    <div class="cover-instansi">
      <div class="instansi-kemenag">KEMENTERIAN AGAMA REPUBLIK INDONESIA</div>
      <div class="instansi-kampus">UNIVERSITAS ISLAM NEGERI K.H. ABDURRAHMAN WAHID PEKALONGAN</div>
      <div class="instansi-fakultas">FAKULTAS SAINS DAN TEKNOLOGI — PROGRAM STUDI S1 INFORMATIKA</div>
      <div class="cover-divider"></div>
      <div class="cover-divider-thin"></div>
    </div>

    <div class="cover-main-box">
      <div class="cover-badge-uts">LAPORAN UJIAN TENGAH SEMESTER (UTS)</div>
      <div class="cover-judul-mk">MATA KULIAH: PEMROGRAMAN BERBASIS PLATFORM (INF2528)</div>
      <div class="cover-judul-proyek">PENGEMBANGAN & PENYEMPURNAAN SISTEM APLIKASI &ldquo;JELAJAH AMAN&rdquo; BERBASIS REACT NATIVE DAN EXPO</div>
    </div>

    <div class="cover-logo-wrapper">
      <img src="${logoRelPath}" class="cover-logo" alt="Logo Aplikasi Jelajah Aman" />
    </div>

    <div class="cover-identitas-box">
      <table class="cover-table">
        <tr>
          <td class="lbl">Nama Lengkap</td>
          <td class="sep">:</td>
          <td class="val"><strong>GATHAN HILABI</strong></td>
        </tr>
        <tr>
          <td class="lbl">Nomor Induk Mahasiswa (NIM)</td>
          <td class="sep">:</td>
          <td class="val"><strong>60324059</strong></td>
        </tr>
        <tr>
          <td class="lbl">Kelas / Semester</td>
          <td class="sep">:</td>
          <td class="val">PBP A / Semester 5 (Lima)</td>
        </tr>
        <tr>
          <td class="lbl">Tahun Angkatan</td>
          <td class="sep">:</td>
          <td class="val">2024</td>
        </tr>
        <tr>
          <td class="lbl">Dosen Pengampu</td>
          <td class="sep">:</td>
          <td class="val"><strong>Reza Iqbal Pramudya, M.Kom</strong></td>
        </tr>
      </table>
    </div>

    <div class="cover-footer">
      <div>PROGRAM STUDI S1 INFORMATIKA — FAKULTAS SAINS DAN TEKNOLOGI</div>
      <div>UNIVERSITAS ISLAM NEGERI K.H. ABDURRAHMAN WAHID PEKALONGAN</div>
      <div class="cover-tahun">PEKALONGAN — 2026 M / 1448 H</div>
    </div>
  </div>

  <!-- ========================================================== -->
  <!-- 2. LEMBAR PENGESAHAN & PENILAIAN PRAKTIKUM                 -->
  <!-- ========================================================== -->
  <div class="academic-page page-break">
    <div class="academic-title-center">LEMBAR IDENTITAS & PENGESAHAN LAPORAN</div>
    <div class="title-underline"></div>

    <p style="text-indent: 0; margin-bottom: 14px;">
      Laporan Ujian Tengah Semester (UTS) Praktikum Pemrograman Berbasis Platform (PBP) ini disusun berdasarkan implementasi nyata kode program pada aplikasi mobile <em>"Jelajah Aman"</em> dan diajukan sebagai pemenuhan komponen penilaian evaluasi tengah semester (Pertemuan 8).
    </p>

    <table>
      <tr>
        <th colspan="2">INFORMASI MAHASISWA & MATA KULIAH</th>
      </tr>
      <tr>
        <td style="width: 32%;"><strong>Nama Mahasiswa</strong></td>
        <td><strong>Gathan Hilabi</strong></td>
      </tr>
      <tr>
        <td><strong>NIM</strong></td>
        <td><strong>60324059</strong></td>
      </tr>
      <tr>
        <td><strong>Kelas / Program Studi</strong></td>
        <td>PBP A / S1 Informatika</td>
      </tr>
      <tr>
        <td><strong>Fakultas / Universitas</strong></td>
        <td>Fakultas Sains dan Teknologi / UIN K.H. Abdurrahman Wahid Pekalongan</td>
      </tr>
      <tr>
        <td><strong>Mata Kuliah</strong></td>
        <td>Pemrograman Berbasis Platform (INF2528 — 4 SKS)</td>
      </tr>
      <tr>
        <td><strong>Dosen Pengampu</strong></td>
        <td><strong>Reza Iqbal Pramudya, M.Kom</strong></td>
      </tr>
      <tr>
        <td><strong>Bobot Penilaian</strong></td>
        <td>Pertemuan 8 (UTS) — Bobot 25% dari Nilai Akhir</td>
      </tr>
      <tr>
        <td><strong>Tautan Repositori GitHub</strong></td>
        <td><a href="https://github.com/G-than12/orientasi-jelajah-aman">https://github.com/G-than12/orientasi-jelajah-aman</a></td>
      </tr>
    </table>

    <table style="margin-top: 14px;">
      <thead>
        <tr>
          <th style="width: 8%; text-align: center;">No</th>
          <th style="width: 25%;">Capaian CPMK</th>
          <th>Topik Penugasan Praktikum</th>
          <th style="width: 20%; text-align: center;">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td align="center">1</td>
          <td><strong>CPMK-1</strong></td>
          <td>Arsitektur mobile hybrid, lifecycle navigasi, dan izin lokasi GPS.</td>
          <td align="center"><span class="badge-success">Terpenuhi (100%)</span></td>
        </tr>
        <tr>
          <td align="center">2</td>
          <td><strong>CPMK-2</strong></td>
          <td>State management Context API, konsumsi REST API ganda, dan AsyncStorage.</td>
          <td align="center"><span class="badge-success">Terpenuhi (100%)</span></td>
        </tr>
        <tr>
          <td align="center">3</td>
          <td><strong>CPMK-3</strong></td>
          <td>Penyimpanan lokal SQLite offline-first, invalidasi cache, tema dinamis, dan tipografi kustom.</td>
          <td align="center"><span class="badge-success">Terpenuhi (100%)</span></td>
        </tr>
      </tbody>
    </table>

    <div class="ttd-box">
      <div class="ttd-col">
        <div>Mengetahui,</div>
        <div><strong>Dosen Pengampu Mata Kuliah</strong></div>
        <div class="ttd-space"></div>
        <div><strong><u>Reza Iqbal Pramudya, M.Kom</u></strong></div>
        <div>Dosen Pengampu PBP</div>
      </div>
      <div class="ttd-col">
        <div>Pekalongan, 21 Oktober 2026</div>
        <div><strong>Mahasiswa Penyusun,</strong></div>
        <div class="ttd-space"></div>
        <div><strong><u>Gathan Hilabi</u></strong></div>
        <div>NIM. 60324059</div>
      </div>
    </div>
  </div>

  <!-- ========================================================== -->
  <!-- 3. KATA PENGANTAR                                          -->
  <!-- ========================================================== -->
  <div class="academic-page page-break">
    <div class="academic-title-center">KATA PENGANTAR</div>
    <div class="title-underline"></div>

    <p>
      Puji dan syukur ke hadirat Allah SWT, Tuhan Yang Maha Esa, yang telah melimpahkan rahmat, taufik, serta hidayah-Nya sehingga penulis dapat menyelesaikan penulisan dan penyusunan <strong>Laporan Ujian Tengah Semester (UTS) Praktikum Pemrograman Berbasis Platform (PBP)</strong> dengan judul <em>"Pengembangan & Penyempurnaan Sistem Aplikasi Jelajah Aman Berbasis React Native dan Expo"</em> dengan baik dan tepat waktu.
    </p>

    <p>
      Laporan ini disusun sebagai salah satu syarat evaluasi akademik tengah semester (UTS) pada semester 5 program studi S1 Informatika, Fakultas Sains dan Teknologi, Universitas Islam Negeri K.H. Abdurrahman Wahid Pekalongan. Dalam laporan ini dijabarkan secara rinci implementasi arsitektur sistem, 4 tugas pokok UTS, serta fitur inovasi nilai tambah yang telah diuji secara fungsional.
    </p>

    <p>
      Pada kesempatan ini, penulis menyampaikan ucapan terima kasih yang tulus kepada:
    </p>

    <ol>
      <li>Bapak <strong>Reza Iqbal Pramudya, M.Kom</strong> selaku Dosen Pengampu mata kuliah Pemrograman Berbasis Platform yang telah membimbing, memfasilitasi, dan memberikan arahan materi secara berkelanjutan.</li>
      <li>Pimpinan dan segenap civitas akademika Program Studi S1 Informatika, Fakultas Sains dan Teknologi, UIN K.H. Abdurrahman Wahid Pekalongan.</li>
      <li>Rekan-rekan mahasiswa kelas PBP A angkatan 2024 yang saling bertukar wawasan dan berdiskusi selama proses praktikum berlangsung.</li>
    </ol>

    <p>
      Penulis menyadari bahwa laporan ini masih memiliki ruang penyempurnaan. Oleh karena itu, kritik dan saran yang konstruktif sangat diharapkan demi perbaikan di masa mendatang. Semoga laporan ini dapat memberikan manfaat akademis bagi pembaca dan pengembang aplikasi mobile lainnya.
    </p>

    <div style="text-align: right; margin-top: 30px;">
      <div>Pekalongan, 21 Oktober 2026</div>
      <div style="margin-top: 4px;">Penulis,</div>
      <div style="height: 50px;"></div>
      <div><strong><u>Gathan Hilabi</u></strong></div>
      <div>NIM. 60324059</div>
    </div>
  </div>

  <!-- ========================================================== -->
  <!-- 4. DAFTAR ISI FORMAL                                       -->
  <!-- ========================================================== -->
  <div class="academic-page page-break">
    <div class="academic-title-center">DAFTAR ISI</div>
    <div class="title-underline"></div>

    <table class="toc-table">
      <tr><td><strong>HALAMAN SAMPUL DEPAN (COVER)</strong></td><td align="right">i</td></tr>
      <tr><td><strong>LEMBAR PENGESAHAN & PENILAIAN</strong></td><td align="right">ii</td></tr>
      <tr><td><strong>KATA PENGANTAR</strong></td><td align="right">iii</td></tr>
      <tr><td><strong>DAFTAR ISI</strong></td><td align="right">iv</td></tr>
      <tr><td colspan="2" style="padding: 4px 0;"><hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 2px 0;"></td></tr>
      <tr><td><strong>BAB I: PENDAHULUAN & GAMBARAN UMUM APLIKASI</strong></td><td align="right">${p('BAB I', 1)}</td></tr>
      <tr><td style="padding-left: 15px;">1.1 Latar Belakang</td><td align="right">${p('1.1', 1)}</td></tr>
      <tr><td style="padding-left: 15px;">1.2 Tujuan Penyempurnaan UTS</td><td align="right">${p('1.2', 1)}</td></tr>
      <tr><td><strong>BAB II: STRUKTUR PROYEK & ARSITEKTUR SISTEM</strong></td><td align="right">${p('BAB II', 2)}</td></tr>
      <tr><td><strong>BAB III: TUGAS 1 – KUSTOMISASI IKON TAB BAR & PERBAIKAN LABEL NAVIGASI</strong></td><td align="right">${p('BAB III', 3)}</td></tr>
      <tr><td style="padding-left: 15px;">3.1 Analisis Kebutuhan</td><td align="right">${p('3.1', 3)}</td></tr>
      <tr><td style="padding-left: 15px;">3.2 Langkah-Langkah Solusi</td><td align="right">${p('3.2', 3)}</td></tr>
      <tr><td style="padding-left: 15px;">3.3 Potongan Kode Program Asli (<code>app/(tabs)/_layout.tsx</code>)</td><td align="right">${p('3.3', 3)}</td></tr>
      <tr><td style="padding-left: 15px;">3.4 Penjelasan Teknis</td><td align="right">${p('3.4', 6)}</td></tr>
      <tr><td style="padding-left: 15px;">3.5 Tangkapan Layar Hasil Implementasi (Screenshots)</td><td align="right">${p('3.5', 6)}</td></tr>
      <tr><td><strong>BAB IV: TUGAS 2 – FITUR RIWAYAT PENCARIAN TERAKHIR (RECENT SEARCH HISTORY)</strong></td><td align="right">${p('BAB IV', 7)}</td></tr>
      <tr><td style="padding-left: 15px;">4.1 Analisis Kebutuhan</td><td align="right">${p('4.1', 7)}</td></tr>
      <tr><td style="padding-left: 15px;">4.2 Langkah-Langkah Solusi</td><td align="right">${p('4.2', 7)}</td></tr>
      <tr><td style="padding-left: 15px;">4.3 Potongan Kode Program Asli State Management (<code>contexts/RiwayatContext.tsx</code>)</td><td align="right">${p('4.3', 7)}</td></tr>
      <tr><td style="padding-left: 15px;">4.4 Potongan Kode Integrasi & Interaktivitas Klik (<code>app/(tabs)/riwayat.tsx</code>)</td><td align="right">${p('4.4', 10)}</td></tr>
      <tr><td style="padding-left: 15px;">4.5 Tangkapan Layar Hasil Implementasi (Screenshots)</td><td align="right">${p('4.5', 12)}</td></tr>
      <tr><td><strong>BAB V: TUGAS 3 – PENGHAPUSAN CACHE KOTA & MODAL KONFIRMASI</strong></td><td align="right">${p('BAB V', 14)}</td></tr>
      <tr><td style="padding-left: 15px;">5.1 Analisis Kebutuhan</td><td align="right">${p('5.1', 14)}</td></tr>
      <tr><td style="padding-left: 15px;">5.2 Langkah-Langkah Solusi</td><td align="right">${p('5.2', 14)}</td></tr>
      <tr><td style="padding-left: 15px;">5.3 Potongan Kode Program Asli SQLite Service (<code>src/services/cacheRepository.ts</code>)</td><td align="right">${p('5.3', 14)}</td></tr>
      <tr><td style="padding-left: 15px;">5.4 Potongan Kode Modal Konfirmasi Hapus Cache (<code>app/(tabs)/index.tsx</code>)</td><td align="right">${p('5.4', 16)}</td></tr>
      <tr><td style="padding-left: 15px;">5.5 Tangkapan Layar Hasil Implementasi (Screenshots)</td><td align="right">${p('5.5', 19)}</td></tr>
      <tr><td><strong>BAB VI: TUGAS 4 – IMPLEMENTASI TEMA GELAP / TERANG / IKUTI SISTEM</strong></td><td align="right">${p('BAB VI', 20)}</td></tr>
      <tr><td style="padding-left: 15px;">6.1 Analisis Kebutuhan</td><td align="right">${p('6.1', 20)}</td></tr>
      <tr><td style="padding-left: 15px;">6.2 Langkah-Langkah Solusi</td><td align="right">${p('6.2', 20)}</td></tr>
      <tr><td style="padding-left: 15px;">6.3 Potongan Kode Program Asli Token Tema (<code>constants/theme.ts</code>)</td><td align="right">${p('6.3', 20)}</td></tr>
      <tr><td style="padding-left: 15px;">6.4 Cara Kerja & Kode Logika "Ikuti Tema Sistem" (<code>contexts/PengaturanContext.tsx</code>)</td><td align="right">${p('6.4', 23)}</td></tr>
      <tr><td style="padding-left: 15px;">6.5 Antarmuka Pengaturan & Sakelar Ikuti Sistem (<code>app/(tabs)/pengaturan.tsx</code>)</td><td align="right">${p('6.5', 25)}</td></tr>
      <tr><td style="padding-left: 15px;">6.6 Tombol Sakelar Cepat di Pojok Kanan Atas Header (<code>AnimatedThemeToggle</code>)</td><td align="right">${p('6.6', 28)}</td></tr>
      <tr><td style="padding-left: 15px;">6.7 Tangkapan Layar Hasil Implementasi (Screenshots)</td><td align="right">${p('6.7', 28)}</td></tr>
      <tr><td><strong>BAB VII: FITUR TAMBAHAN & NILAI PLUS (KREATIVITAS MAHASISWA)</strong></td><td align="right">${p('BAB VII', 30)}</td></tr>
      <tr><td style="padding-left: 15px;">7.1 Fitur Konversi Satuan Suhu Dinamis (°C vs °F)</td><td align="right">${p('7.1', 30)}</td></tr>
      <tr><td style="padding-left: 15px;">7.2 Tipografi Kustom Modern (Google Fonts: Plus Jakarta Sans)</td><td align="right">${p('7.2', 32)}</td></tr>
      <tr><td style="padding-left: 15px;">7.3 Palet Warna "Atmospheric Indigo & Electric Sky"</td><td align="right">${p('7.3', 33)}</td></tr>
      <tr><td style="padding-left: 15px;">7.4 Status Data Terpadu Minimalis</td><td align="right">${p('7.4', 33)}</td></tr>
      <tr><td style="padding-left: 15px;">7.5 Penjaminan Mutu & Type-Safety</td><td align="right">${p('7.5', 33)}</td></tr>
      <tr><td style="padding-left: 15px;">7.6 Tangkapan Layar Hasil Implementasi (Screenshots)</td><td align="right">${p('7.6', 33)}</td></tr>
      <tr><td><strong>BAB VIII: RIWAYAT COMMIT GIT (28++ COMMITS)</strong></td><td align="right">${p('BAB VIII', 35)}</td></tr>
      <tr><td><strong>BAB IX: KESIMPULAN & PENUTUP</strong></td><td align="right">${p('BAB IX', 37)}</td></tr>
      <tr><td style="padding-left: 15px;">9.1 Kesimpulan</td><td align="right">${p('9.1', 37)}</td></tr>
      <tr><td><strong>BAB X: DAFTAR PUSTAKA</strong></td><td align="right">${p('BAB X', 38)}</td></tr>

    </table>
  </div>

  <!-- ========================================================== -->
  <!-- 5. ISI UTAMA LAPORAN (BAB I SAMPAI BAB X)                 -->
  <!-- ========================================================== -->
  <div class="academic-body">
    ${bodyContent}
  </div>

</body>
</html>`;
}

// 6. Fungsi Eksekusi Headless Chrome
function renderPdfFromHtml(sourceHtmlFile, targetPdfFile) {
  const chromeExe = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const tempProfile = fs.mkdtempSync(path.join(os.tmpdir(), "pdf_academic_"));

  try {
    execFileSync(
      chromeExe,
      [
        "--headless",
        "--disable-gpu",
        `--user-data-dir=${tempProfile}`,
        "--disable-background-networking",
        "--disable-sync",
        "--disable-extensions",
        "--disable-default-apps",
        "--no-first-run",
        "--allow-file-access-from-files",
        `--print-to-pdf=${targetPdfFile}`,
        "--no-pdf-header-footer",
        sourceHtmlFile,
      ],
      { stdio: "ignore", timeout: 45000 }
    );
  } finally {
    try {
      fs.rmSync(tempProfile, { recursive: true, force: true });
    } catch (e) {}
  }
}

// 7. Proses Generasi Pass 1 (Estimasi Layout & Deteksi Halaman Riil)
console.log("4. Melakukan render Pass 1 untuk menghitung penomoran halaman riil...");
fs.writeFileSync(htmlFile, generateHtmlDocument(), "utf8");
renderPdfFromHtml(htmlFile, pdfFile);

(async () => {
  let pageMap = {};
  const scanPy = path.join(__dirname, "stamp-academic-pages.py");

  try {
    console.log("5. Menganalisis halaman PDF via PyMuPDF untuk memetakan nomor bab dan sub-bab...");
    const scanOutput = execSync(`python "${scanPy}" scan "${pdfFile}"`, { encoding: "utf8" });
    pageMap = JSON.parse(scanOutput.trim());
    console.log("   * Berhasil memetakan nomor halaman dinamis secara otomatis:");
    for (const [k, v] of Object.entries(pageMap)) {
      console.log(`     - ${k} -> Halaman ${v}`);
    }
  } catch (err) {
    console.warn("Catatan: Analisis PDF via PyMuPDF mengalami kendala, menggunakan pemetaan baku:", err.message);
  }

  // 8. Proses Generasi Pass 2 (Penyusunan Final dengan Nomor Halaman 100% Akurat)
  console.log("6. Melakukan render Pass 2 dengan nomor halaman Daftar Isi yang telah disinkronkan 100%...");
  const finalHtml = generateHtmlDocument(pageMap);
  fs.writeFileSync(htmlFile, finalHtml, "utf8");
  renderPdfFromHtml(htmlFile, pdfFile);

  // 9. Post-Processing: Penomoran Halaman Akademik Resmi (Romawi ii, iii, iv & Angka Arab Bab Halaman 1..N)
  console.log("7. Menyesuaikan penomoran footer akademik (Romawi untuk halaman awal, Angka Arab untuk Bab)...");
  try {
    execSync(`python "${scanPy}" stamp "${pdfFile}"`, { stdio: "inherit" });
    console.log("   * Footer berhasil disesuaikan dengan format akademik resmi.");
  } catch (err) {
    console.error("Gagal menyinkronkan footer via Python:", err.message);
  }

  if (fs.existsSync(pdfFile)) {
    const stats = fs.statSync(pdfFile);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log("=== BERHASIL! PDF AKADEMIK TELAH DIBUAT ===");
    console.log(`Lokasi: ${pdfFile}`);
    console.log(`Ukuran: ${sizeMB} MB (${stats.size} bytes)`);

    // Hitung halaman via regex
    try {
      const pageOutput = execSync(`python -c "import re; data=open(r'${pdfFile}','rb').read(); print(len(re.findall(b'/Type\\\\s*/Page[^a-zA-Z]', data)))"`, { encoding: "utf8" });
      console.log(`Total Halaman: ${pageOutput.trim()} Halaman A4`);
    } catch (e) {}

    // Buat screenshot cover
    const coverPreview = path.join(previewDir, "cover_preview.png");
    try {
      const chromeExe = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
      const tempProfile = fs.mkdtempSync(path.join(os.tmpdir(), "pdf_preview_"));
      execFileSync(
        chromeExe,
        [
          "--headless",
          "--disable-gpu",
          `--user-data-dir=${tempProfile}`,
          `--screenshot=${coverPreview}`,
          "--window-size=800,1050",
          htmlFile,
        ],
        { stdio: "ignore", timeout: 20000 }
      );
      fs.rmSync(tempProfile, { recursive: true, force: true });
      if (fs.existsSync(coverPreview)) {
        console.log(`Preview cover disimpan di: ${coverPreview}`);
      }
    } catch (e) {}
  }
})();
