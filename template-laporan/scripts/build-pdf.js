// template-laporan/scripts/build-pdf.js
// Generator Dokumen PDF Laporan Ilmiah Berstandar Akademik Resmi Nasional

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync, execFileSync } = require("child_process");

// =========================================================================
// 1. KONFIGURASI IDENTITAS LAPORAN (SESUAIKAN DENGAN KEBUTUHAN ANDA)
// =========================================================================
const CONFIG = {
  kementerian: "KEMENTERIAN AGAMA REPUBLIK INDONESIA",
  kampus: "UNIVERSITAS ISLAM NEGERI K.H. ABDURRAHMAN WAHID PEKALONGAN",
  fakultas: "FAKULTAS SAINS DAN TEKNOLOGI — PROGRAM STUDI S1 INFORMATIKA",
  kategoriLaporan: "LAPORAN PRAKTIKUM / TUGAS AKHIR SEMESTER",
  mataKuliah: "MATA KULIAH: PEMROGRAMAN BERBASIS PLATFORM",
  judulLaporan: "PENGEMBANGAN SISTEM APLIKASI MODERN BERBASIS PLATFORM HYBRID",
  namaMahasiswa: "GATHAN HILABI",
  nim: "60324059",
  dosenPengampu: "Reza Iqbal Pramudya, M.Kom",
  nipDosen: "Dosen Pengampu Mata Kuliah",
  kotaTanggal: "Pekalongan, 21 Oktober 2026",
  tahunAjaran: "TAHUN AKADEMIK 2026 / 2027",
  logoRelPath: "./assets/images/logo.png"
};

// =========================================================================
// 2. DEPENDENSI PUSTAKA (KATEX & MARKED)
// =========================================================================
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

// 3. Konversi Markdown ke HTML via marked
console.log("1. Mengonversi Markdown asli...");
let rawHtml = execSync(`npx -y marked -i "${mdFile}" --gfm`, { encoding: "utf8" });

// Potong bagian cover/TOC mentah markdown agar tidak ganda
const bab1Regex = /<h2[^>]*>\s*BAB\s+I[\s\S]*?<\/h2>/i;
const bab1Match = rawHtml.match(bab1Regex);
let bodyContent = bab1Match ? rawHtml.substring(bab1Match.index) : rawHtml;

// 4. Transformasi Elemen Khusus Karya Ilmiah
bodyContent = bodyContent
  // Judul Bab Terpusat
  .replace(/<h2[^>]*>BAB\s+([IVXLCDM]+):\s*([^<]+)<\/h2>/gi, (m, babNum, title) => {
    return `<div class="bab-break"></div>
    <div class="academic-bab-header" id="bab-${babNum.toLowerCase()}">
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
    return `<div class="academic-alert alert-tip"><div class="alert-label">💡 PETUNJUK & BEST PRACTICE</div><div class="alert-body">${c.trim()}</div></div>`;
  })
  .replace(/<blockquote>\s*<p>\[!IMPORTANT\](?:<br\s*\/?>|\s+)([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (m, c) => {
    return `<div class="academic-alert alert-important"><div class="alert-label">⚠️ PERHATIAN PENTING</div><div class="alert-body">${c.trim()}</div></div>`;
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
        <span class="code-dot red"></span><span class="code-dot yellow"></span><span class="code-dot green"></span>
        <span class="code-title">📄 ${filename}</span>
      </div>
      <pre><code>${code}</code></pre>
    </div>`;
  });

// Isolasi blok kode agar sintaks $ pada program tidak bentrok dengan parser matematika
const preservedCodeBlocks = [];
bodyContent = bodyContent.replace(/<div class="code-wrapper">[\s\S]*?<\/pre>\s*<\/div>/gi, m => {
  preservedCodeBlocks.push(m);
  return `___PRESERVED_CODE_${preservedCodeBlocks.length - 1}___`;
});
bodyContent = bodyContent.replace(/<pre[\s\S]*?<\/pre>/gi, m => {
  preservedCodeBlocks.push(m);
  return `___PRESERVED_CODE_${preservedCodeBlocks.length - 1}___`;
});

// Render Formula Matematika Display ($$...$$) menggunakan KaTeX
bodyContent = bodyContent.replace(/\$\$([\s\S]*?)\$\$/g, (m, formula) => {
  let rendered = formula.trim();
  if (katex) {
    try { rendered = katex.renderToString(rendered, { displayMode: true, throwOnError: false }); } catch (e) {}
  }
  return `<div class="math-box">
    <div class="math-tag">📐 PERSAMAAN MATEMATIS:</div>
    ${rendered}
  </div>`;
});

// Render Formula Matematika Inline ($...$) menggunakan KaTeX
bodyContent = bodyContent.replace(/\$([^$\n]+)\$/g, (m, inline) => {
  const trimmed = inline.trim();
  if (katex) {
    try { return katex.renderToString(trimmed, { displayMode: false, throwOnError: false }); } catch (e) {}
  }
  return trimmed;
});

// Pulihkan blok kode yang disimpan
bodyContent = bodyContent.replace(/___PRESERVED_CODE_(\d+)___/g, (m, idx) => {
  return preservedCodeBlocks[parseInt(idx, 10)];
});

// 5. Generator Template HTML Cetak Lengkap
function generateHtmlDocument(pageMap = {}) {
  const p = (key, defaultPage) => pageMap[key] || defaultPage;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${CONFIG.judulLaporan}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
  <style>
    @page {
      size: A4 portrait;
      margin-top: 25mm;
      margin-bottom: 22mm;
      margin-left: 28mm;
      margin-right: 20mm;

      @top-right {
        content: "${CONFIG.judulLaporan} — ${CONFIG.namaMahasiswa} (${CONFIG.nim})";
        font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
        font-size: 8pt; color: #94a3b8; font-weight: 500;
        border-bottom: 0.5px solid #e2e8f0; padding-bottom: 2mm;
      }
      @bottom-left {
        content: "${CONFIG.kampus}";
        font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
        font-size: 8pt; color: #94a3b8;
        border-top: 0.5px solid #e2e8f0; padding-top: 2mm;
      }
      @bottom-right {
        content: "Halaman " counter(page);
        font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
        font-size: 8.5pt; font-weight: 600; color: #475569;
        border-top: 0.5px solid #e2e8f0; padding-top: 2mm;
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
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 9.8pt; line-height: 1.55; color: #1e293b; background: #ffffff; margin: 0; padding: 0;
    }
    .cover-page {
      height: 240mm; max-height: 240mm; display: flex; flex-direction: column; justify-content: space-between;
      align-items: center; text-align: center; page-break-after: always; break-after: page; padding: 4mm 0;
    }
    .instansi-kemenag { font-size: 11pt; font-weight: 700; color: #334155; letter-spacing: 0.8px; }
    .instansi-kampus { font-size: 13.5pt; font-weight: 800; color: #1e1b4b; margin: 4px 0 2px 0; }
    .instansi-fakultas { font-size: 11pt; font-weight: 700; color: #4338ca; }
    .cover-badge {
      display: inline-block; font-size: 11pt; font-weight: 800; color: #1e1b4b; background: #e0e7ff;
      padding: 5px 18px; border-radius: 6px; border: 1.5px solid #6366f1; letter-spacing: 1px; margin-bottom: 10px;
    }
    .cover-judul-mk { font-size: 12pt; font-weight: 700; color: #475569; margin-bottom: 8px; }
    .cover-judul { font-size: 15pt; font-weight: 800; color: #1e1b4b; line-height: 1.4; max-width: 540px; margin: 0 auto; text-transform: uppercase; }
    .cover-logo { width: 110px; height: 110px; border-radius: 20px; border: 3px solid #6366f1; box-shadow: 0 8px 24px rgba(79,70,229,0.2); }
    .cover-table { width: 100%; max-width: 470px; margin: 0 auto; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px 18px; font-size: 9.5pt; }
    .cover-table td { border: none !important; padding: 3px 4px !important; }
    .page-break { page-break-after: always; break-after: page; }
    .bab-break { page-break-before: always; break-before: page; }
    .academic-page { padding-top: 5px; }
    .academic-title-center { text-align: center; font-size: 13.5pt; font-weight: 800; color: #1e1b4b; text-transform: uppercase; margin-bottom: 4px; }
    .title-underline { width: 80px; height: 3px; background: #4f46e5; margin: 0 auto 16px auto; }
    .academic-bab-header { text-align: center; margin: 15px 0 22px 0; page-break-after: avoid; break-after: avoid; }
    .bab-title-top { font-size: 14pt; font-weight: 800; color: #1e1b4b; letter-spacing: 1px; }
    .bab-title-main { font-size: 12pt; font-weight: 700; color: #4338ca; margin-top: 4px; text-transform: uppercase; }
    .bab-underline { width: 60px; height: 2.5px; background: #6366f1; margin: 8px auto 0 auto; }
    h3 { font-size: 10.5pt; font-weight: 700; color: #0f172a; margin-top: 18px; margin-bottom: 6px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 3px; page-break-after: avoid; }
    p { text-align: justify; margin: 0 0 8px 0; text-indent: 20px; }
    .academic-page > p:first-of-type, .academic-bab-header + p { text-indent: 0; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 8.8pt; page-break-inside: avoid; }
    th { background: #eef2ff !important; color: #312e81; font-weight: 700; padding: 6px 9px; border: 1px solid #cbd5e1; }
    td { padding: 5.5px 9px; border: 1px solid #cbd5e1; }
    .code-wrapper { margin: 10px 0 14px 0; border-radius: 6px; border: 1px solid #cbd5e1; overflow: hidden; page-break-inside: avoid; background: #f8fafc; }
    .code-header { background: #f1f5f9; border-bottom: 1px solid #cbd5e1; padding: 4px 10px; display: flex; align-items: center; gap: 5px; }
    .code-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .code-dot.red { background: #ef4444; } .code-dot.yellow { background: #f59e0b; } .code-dot.green { background: #10b981; }
    .code-title { font-family: monospace; font-size: 7.5pt; font-weight: 600; color: #334155; margin-left: 6px; }
    pre { margin: 0; padding: 10px 14px; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 7.2pt; line-height: 1.45; color: #0f172a; white-space: pre-wrap; word-break: break-word; }
    div[align="center"] img { max-width: 540px !important; width: 100% !important; border-radius: 8px; border: 1px solid #cbd5e1; box-shadow: 0 4px 14px rgba(15,23,42,0.12); display: block; margin: 10px auto; page-break-inside: avoid; }
    div[align="center"] p { text-indent: 0 !important; text-align: center; }
    div[align="center"] em { font-size: 8.5pt; color: #475569; font-style: italic; font-weight: 600; }
    /* KaTeX & Math Box */
    ${katexCss}
    .math-box { background: #f8faff; border: 1.5px solid #818cf8; border-radius: 8px; padding: 10px 18px; margin: 10px 0 14px 0; text-align: center; page-break-inside: avoid; }
    .math-tag { font-weight: 700; font-size: 8pt; color: #3730a3; text-align: left; margin-bottom: 6px; }
    .katex-display { margin: 8px 0 4px 0 !important; }
    .katex { font-size: 1.15em !important; color: #1e1b4b; }
    /* Callout Alerts */
    .academic-alert { margin: 10px 0 14px 0; padding: 8px 14px; border-radius: 6px; font-size: 8.5pt; page-break-inside: avoid; border-left: 4px solid; }
    .alert-note { background: #eff6ff; border-color: #3b82f6; color: #1e3a8a; }
    .alert-tip { background: #f0fdf4; border-color: #22c55e; color: #14532d; }
    .alert-important { background: #fef2f2; border-color: #ef4444; color: #7f1d1d; }
    .alert-label { font-weight: 700; font-size: 8pt; margin-bottom: 2px; }
    /* Tanda Tangan */
    .ttd-box { display: flex; justify-content: space-between; margin-top: 35px; page-break-inside: avoid; }
    .ttd-col { width: 44%; text-align: center; font-size: 9.5pt; }
    .ttd-space { height: 65px; }
    /* TOC */
    .toc-table { width: 100%; border: none; font-size: 8.4pt; }
    .toc-table td { border: none !important; padding: 2px 0 !important; }
  </style>
</head>
<body>

  <!-- ========================================================== -->
  <!-- 1. HALAMAN SAMPUL DEPAN (COVER RESMI)                      -->
  <!-- ========================================================== -->
  <div class="cover-page">
    <div>
      <div class="instansi-kemenag">${CONFIG.kementerian}</div>
      <div class="instansi-kampus">${CONFIG.kampus}</div>
      <div class="instansi-fakultas">${CONFIG.fakultas}</div>
      <div style="height: 3px; background: #1e1b4b; margin: 10px 0 1.5px 0;"></div>
      <div style="height: 1px; background: #1e1b4b;"></div>
    </div>

    <div>
      <div class="cover-badge">${CONFIG.kategoriLaporan}</div>
      <div class="cover-judul-mk">${CONFIG.mataKuliah}</div>
      <div class="cover-judul">${CONFIG.judulLaporan}</div>
    </div>

    <div>
      <img src="${CONFIG.logoRelPath}" class="cover-logo" alt="Logo" />
    </div>

    <table class="cover-table">
      <tr><td style="width: 160px; font-weight: 600; color: #475569;">Nama Lengkap</td><td style="width: 10px;">:</td><td><strong>${CONFIG.namaMahasiswa}</strong></td></tr>
      <tr><td style="font-weight: 600; color: #475569;">Nomor Induk Mahasiswa (NIM)</td><td>:</td><td><strong>${CONFIG.nim}</strong></td></tr>
      <tr><td style="font-weight: 600; color: #475569;">Dosen Pengampu</td><td>:</td><td><strong>${CONFIG.dosenPengampu}</strong></td></tr>
    </table>

    <div style="font-size: 10.5pt; font-weight: 800; color: #4338ca;">${CONFIG.tahunAjaran}</div>
  </div>

  <!-- ========================================================== -->
  <!-- 2. LEMBAR PENGESAHAN                                       -->
  <!-- ========================================================== -->
  <div class="academic-page page-break">
    <div class="academic-title-center">LEMBAR PENGESAHAN & PENILAIAN</div>
    <div class="title-underline"></div>
    <p>Laporan tugas praktikum ini telah diperiksa, disetujui, dan disahkan oleh Dosen Pengampu mata kuliah sebagai pemenuhan evaluasi akademik.</p>
    
    <div class="ttd-box">
      <div class="ttd-col">
        <div>Mengetahui,</div>
        <div><strong>Dosen Pengampu Mata Kuliah</strong></div>
        <div class="ttd-space"></div>
        <div><strong><u>${CONFIG.dosenPengampu}</u></strong></div>
        <div>${CONFIG.nipDosen}</div>
      </div>
      <div class="ttd-col">
        <div>${CONFIG.kotaTanggal}</div>
        <div><strong>Mahasiswa Penyusun,</strong></div>
        <div class="ttd-space"></div>
        <div><strong><u>${CONFIG.namaMahasiswa}</u></strong></div>
        <div>NIM. ${CONFIG.nim}</div>
      </div>
    </div>
  </div>

  <!-- ========================================================== -->
  <!-- 3. KATA PENGANTAR                                          -->
  <!-- ========================================================== -->
  <div class="academic-page page-break">
    <div class="academic-title-center">KATA PENGANTAR</div>
    <div class="title-underline"></div>
    <p>Puji dan syukur ke hadirat Allah SWT, Tuhan Yang Maha Esa, atas limpahan rahmat dan hidayah-Nya sehingga laporan ini dapat diselesaikan dengan baik dan tepat waktu.</p>
    <p>Penulis menyampaikan ucapan terima kasih yang tulus kepada Bapak/Ibu Dosen Pengampu, rekan-rekan mahasiswa, serta seluruh pihak yang telah memberikan bimbingan dan dukungan.</p>
    <div style="text-align: right; margin-top: 30px;">
      <div>${CONFIG.kotaTanggal}</div>
      <div style="margin-top: 4px;">Penulis,</div>
      <div style="height: 50px;"></div>
      <div><strong><u>${CONFIG.namaMahasiswa}</u></strong></div>
      <div>NIM. ${CONFIG.nim}</div>
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
      <tr><td colspan="2"><hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 4px 0;"></td></tr>
      <tr><td><strong>BAB I: PENDAHULUAN</strong></td><td align="right">${p('BAB I', 1)}</td></tr>
      <tr><td><strong>BAB II: TINJAUAN PUSTAKA & ARSITEKTUR</strong></td><td align="right">${p('BAB II', 2)}</td></tr>
      <tr><td><strong>BAB III: METODOLOGI & IMPLEMENTASI</strong></td><td align="right">${p('BAB III', 3)}</td></tr>
      <tr><td><strong>BAB IV: HASIL PENGUJIAN & ANALISIS</strong></td><td align="right">${p('BAB IV', 4)}</td></tr>
      <tr><td><strong>BAB V: KESIMPULAN & PENUTUP</strong></td><td align="right">${p('BAB V', 5)}</td></tr>
    </table>
  </div>

  <!-- ========================================================== -->
  <!-- 5. ISI UTAMA LAPORAN                                       -->
  <!-- ========================================================== -->
  <div class="academic-body">
    ${bodyContent}
  </div>

</body>
</html>`;
}

// 6. Eksekutor Google Chrome Headless
function renderPdf(srcHtml, outPdf) {
  const chromeExe = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const tempProfile = fs.mkdtempSync(path.join(os.tmpdir(), "pdf_starter_"));

  try {
    execFileSync(
      chromeExe,
      [
        "--headless",
        "--disable-gpu",
        `--user-data-dir=${tempProfile}`,
        "--no-first-run",
        "--allow-file-access-from-files",
        `--print-to-pdf=${outPdf}`,
        "--no-pdf-header-footer",
        srcHtml,
      ],
      { stdio: "ignore", timeout: 45000 }
    );
  } finally {
    try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch (e) {}
  }
}

// 7. Eksekusi Two-Pass Compilation
console.log("2. Render Pass 1 (Menghitung letak fisik halaman)...");
fs.writeFileSync(htmlFile, generateHtmlDocument(), "utf8");
renderPdf(htmlFile, pdfFile);

const scanPy = path.join(__dirname, "stamp-academic-pages.py");
let pageMap = {};
try {
  const scanOutput = execSync(`python "${scanPy}" scan "${pdfFile}"`, { encoding: "utf8" });
  pageMap = JSON.parse(scanOutput.trim());
  console.log("   * Berhasil memetakan nomor halaman dinamis secara otomatis.");
} catch (err) {
  console.warn("   * Catatan pemindaian:", err.message);
}

console.log("3. Render Pass 2 (Sinkronisasi Daftar Isi)...");
fs.writeFileSync(htmlFile, generateHtmlDocument(pageMap), "utf8");
renderPdf(htmlFile, pdfFile);

console.log("4. Menyesuaikan penomoran footer akademik (Romawi & Angka Arab)...");
try {
  execSync(`python "${scanPy}" stamp "${pdfFile}"`, { stdio: "inherit" });
  console.log("   * Footer akademik berhasil distamp.");
} catch (err) {}

if (fs.existsSync(pdfFile)) {
  const stats = fs.statSync(pdfFile);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log("=== BERHASIL! DOKUMEN PDF SIAP ===");
  console.log(`Lokasi File: ${pdfFile}`);
  console.log(`Ukuran File: ${sizeMB} MB`);
}
