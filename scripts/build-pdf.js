// scripts/build-pdf.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const mdFile = path.join(rootDir, "LAPORAN_UTS_PBP_GATHAN_HILABI.md");
const htmlFile = path.join(rootDir, "temp_report.html");
const pdfFile = path.join(rootDir, "LAPORAN_UTS_PBP_GATHAN_HILABI.pdf");

console.log("=== MEMULAI GENERASI PDF LAPORAN UTS ===");

// 1. Parsing Markdown to HTML using marked CLI
console.log("1. Mengonversi Markdown ke HTML...");
const rawHtml = execSync(`npx -y marked -i "${mdFile}" --gfm`, { encoding: "utf8" });

// 2. Enhance HTML (Alerts, Math formatting, Callouts)
console.log("2. Memproses styling alert, matematika, dan layout...");
let processedHtml = rawHtml
  // Alerts
  .replace(/<blockquote>\s*<p>\[!NOTE\]<br>([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (match, content) => {
    return `<div class="alert alert-note"><div class="alert-icon">ℹ️</div><div class="alert-content"><strong>Catatan Penting:</strong><br>${content}</div></div>`;
  })
  .replace(/<blockquote>\s*<p>\[!TIP\]<br>([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (match, content) => {
    return `<div class="alert alert-tip"><div class="alert-icon">💡</div><div class="alert-content"><strong>Tips & Petunjuk:</strong><br>${content}</div></div>`;
  })
  .replace(/<blockquote>\s*<p>\[!IMPORTANT\]<br>([\s\S]*?)<\/p>\s*<\/blockquote>/gi, (match, content) => {
    return `<div class="alert alert-important"><div class="alert-icon">⚡</div><div class="alert-content"><strong>Penting:</strong><br>${content}</div></div>`;
  })
  // Subscripts & formulas
  .replace(/\$PM_\{2\.5\}\$/g, "PM<sub>2.5</sub>")
  .replace(/\$PM_\{10\}\$/g, "PM<sub>10</sub>")
  .replace(/\$\$([\s\S]*?)\$\$/g, (m, formula) => {
    return `<div class="math-box"><b>Formula Matematika:</b> <code>${formula.trim()}</code></div>`;
  })
  .replace(/\$32\^\\circ\\text\{C\}\$/g, "32°C")
  .replace(/\$89\^\\circ\\text\{F\}\$/g, "89°F");

// 3. Full Document Template with Academic Print CSS
const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Laporan UTS PBP - Gathan Hilabi (60324059)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 16mm 18mm 16mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.65;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* Headings */
    h1 {
      font-size: 20pt;
      font-weight: 800;
      color: #1e1b4b;
      margin-top: 0;
      margin-bottom: 6px;
      text-align: center;
      letter-spacing: -0.5px;
    }

    h2 {
      font-size: 14pt;
      font-weight: 700;
      color: #4338ca;
      border-bottom: 2px solid #e0e7ff;
      padding-bottom: 6px;
      margin-top: 24pt;
      margin-bottom: 12pt;
      page-break-after: avoid;
    }

    /* Page break before each BAB except the first few */
    h2:not(#daftar-isi):not(#identitas-mahasiswa--informasi-kuliah) {
      page-break-before: always;
    }

    h3 {
      font-size: 12pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 14pt;
      margin-bottom: 6pt;
      page-break-after: avoid;
    }

    h4 {
      font-size: 11pt;
      font-weight: 600;
      color: #334155;
      margin-top: 10pt;
      margin-bottom: 4pt;
      page-break-after: avoid;
    }

    p {
      margin: 0 0 8pt 0;
      text-align: justify;
    }

    ul, ol {
      margin: 0 0 10pt 0;
      padding-left: 20pt;
    }

    li {
      margin-bottom: 4pt;
    }

    hr {
      border: 0;
      border-top: 1.5px solid #e2e8f0;
      margin: 16pt 0;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10pt 0 14pt 0;
      font-size: 9.5pt;
      page-break-inside: avoid;
    }

    th {
      background: #eef2ff !important;
      color: #3730a3;
      font-weight: 700;
      text-align: left;
      padding: 7pt 9pt;
      border: 1px solid #c7d2fe;
    }

    td {
      padding: 6pt 9pt;
      border: 1px solid #e2e8f0;
      vertical-align: middle;
    }

    tr:nth-child(even) td {
      background: #f8fafc !important;
    }

    /* Images and Screenshots */
    img {
      max-width: 100%;
      height: auto;
      border-radius: 10px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      display: inline-block;
      margin: 4pt 0;
      page-break-inside: avoid;
    }

    table img {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      margin: 2pt auto;
      display: block;
    }

    div[align="center"] {
      text-align: center;
      margin: 10pt 0 14pt 0;
      page-break-inside: avoid;
    }

    em {
      font-size: 8.5pt;
      color: #64748b;
      display: block;
      margin-top: 4pt;
      font-style: normal;
      font-weight: 500;
    }

    /* Code Blocks */
    pre {
      background: #0f172a !important;
      color: #f1f5f9 !important;
      font-family: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
      font-size: 8pt;
      line-height: 1.45;
      padding: 10pt 12pt;
      border-radius: 8px;
      border: 1px solid #1e293b;
      overflow-x: auto;
      margin: 8pt 0 12pt 0;
      page-break-inside: avoid;
    }

    pre code {
      background: transparent !important;
      color: inherit !important;
      padding: 0;
      font-size: inherit;
    }

    code {
      font-family: 'JetBrains Mono', 'Consolas', monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      color: #4f46e5;
      padding: 2pt 5pt;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    /* Callouts / Alerts */
    .alert {
      display: flex;
      gap: 10pt;
      padding: 8pt 12pt;
      border-radius: 8px;
      margin: 10pt 0 14pt 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }

    .alert-note {
      background: #eff6ff !important;
      border-left: 4px solid #3b82f6;
      color: #1e3a8a;
    }

    .alert-tip {
      background: #f0fdf4 !important;
      border-left: 4px solid #22c55e;
      color: #14532d;
    }

    .alert-important {
      background: #fef2f2 !important;
      border-left: 4px solid #ef4444;
      color: #7f1d1d;
    }

    .alert-icon {
      font-size: 14pt;
      line-height: 1;
      padding-top: 2pt;
    }

    .alert-content {
      flex: 1;
    }

    .math-box {
      background: #eef2ff;
      border: 1px dashed #6366f1;
      border-radius: 6px;
      padding: 6pt 10pt;
      margin: 8pt 0;
      color: #312e81;
      font-size: 9pt;
      page-break-inside: avoid;
    }

    /* Links */
    a {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 600;
    }

    /* Header & Footer banner */
    .doc-header-banner {
      background: linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%);
      color: white;
      padding: 14pt 18pt;
      border-radius: 12px;
      margin-bottom: 16pt;
      text-align: center;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.2);
    }

    .doc-header-banner h1 {
      color: white;
      margin: 0;
      font-size: 16pt;
    }

    .doc-header-banner p {
      color: #e0e7ff;
      margin: 4pt 0 0 0;
      font-size: 10pt;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="doc-header-banner">
    <h1>UNIVERSITAS ISLAM NEGERI K.H. ABDURRAHMAN WAHID PEKALONGAN</h1>
    <p>FAKULTAS SAINS DAN TEKNOLOGI — PROGRAM STUDI S1 INFORMATIKA</p>
  </div>
  ${processedHtml}
</body>
</html>`;

fs.writeFileSync(htmlFile, fullHtml, "utf8");
console.log("3. Berkas HTML sementara berhasil ditulis ke: " + htmlFile);

// 4. Render to PDF using Chrome Headless
console.log("4. Merender ke format PDF menggunakan Google Chrome headless...");
const chromeExe = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const command = `powershell -Command "Start-Process '${chromeExe}' -ArgumentList '--headless --disable-gpu --print-to-pdf=\\"${pdfFile}\\" --no-pdf-header-footer \\"${htmlFile}\\"' -Wait -NoNewWindow"`;

execSync(command, { stdio: "inherit" });

// 5. Verify PDF output
if (fs.existsSync(pdfFile)) {
  const stats = fs.statSync(pdfFile);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`=== BERHASIL! PDF SELESAI DIBUAT ===`);
  console.log(`Lokasi Berkas: ${pdfFile}`);
  console.log(`Ukuran Berkas: ${sizeMB} MB (${stats.size} bytes)`);

  // Clean up temporary HTML
  if (fs.existsSync(htmlFile)) {
    fs.unlinkSync(htmlFile);
    console.log("Berkas HTML sementara berhasil dibersihkan.");
  }
} else {
  console.error("Gagal membuat berkas PDF. Berkas tidak ditemukan.");
  process.exit(1);
}
