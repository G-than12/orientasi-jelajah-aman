# scripts/stamp-academic-pages.py
# Modul Sinkronisasi Penomoran Halaman Akademik (Romawi Awal & Angka Arab Bab)
# Sesuai Pedoman Akademik Resmi UIN K.H. Abdurrahman Wahid Pekalongan

import sys
import os
import json
import re
import pymupdf

def scan_sections(pdf_path):
    doc = pymupdf.open(pdf_path)
    
    # Target pencarian bab dan sub-bab
    targets = {
        'BAB I': r'BAB\s+I\b',
        '1.1': r'1\.1\s+Latar\s+Belakang',
        '1.2': r'1\.2\s+Tujuan\s+Penyempurnaan',
        'BAB II': r'BAB\s+II\b',
        'BAB III': r'BAB\s+III\b',
        '3.1': r'3\.1\s+Analisis',
        '3.2': r'3\.2\s+Langkah',
        '3.3': r'3\.3\s+(?:Potongan|Tangkapan)',
        '3.4': r'3\.4\s+Penjelasan',
        '3.5': r'3\.5\s+Tangkapan',
        'BAB IV': r'BAB\s+IV\b',
        '4.1': r'4\.1\s+Analisis',
        '4.2': r'4\.2\s+Langkah',
        '4.3': r'4\.3\s+(?:Potongan|Tangkapan)',
        '4.4': r'4\.4\s+(?:Potongan|Tangkapan)',
        '4.5': r'4\.5\s+Tangkapan',
        'BAB V': r'BAB\s+V\b',
        '5.1': r'5\.1\s+Analisis',
        '5.2': r'5\.2\s+Langkah',
        '5.3': r'5\.3\s+(?:Potongan|Tangkapan)',
        '5.4': r'5\.4\s+(?:Potongan|Tangkapan)',
        '5.5': r'5\.5\s+Tangkapan',
        'BAB VI': r'BAB\s+VI\b',
        '6.1': r'6\.1\s+Analisis',
        '6.2': r'6\.2\s+Langkah',
        '6.3': r'6\.3\s+(?:Potongan|Tangkapan)',
        '6.4': r'6\.4\s+(?:Cara|Tangkapan)',
        '6.5': r'6\.5\s+(?:Antarmuka|Tangkapan)',
        '6.6': r'6\.6\s+(?:Tombol|Tangkapan)',
        '6.7': r'6\.7\s+Tangkapan',
        'BAB VII': r'BAB\s+VII\b',
        '7.1': r'7\.1\s+(?:Fitur|Tangkapan)',
        '7.2': r'7\.2\s+(?:Tipografi|Tangkapan)',
        '7.3': r'7\.3\s+(?:Palet|Tangkapan)',
        '7.4': r'7\.4\s+(?:Status|Tangkapan)',
        '7.5': r'7\.5\s+(?:Penjaminan|Tangkapan)',
        '7.6': r'7\.6\s+Tangkapan',
        'BAB VIII': r'BAB\s+VIII\b',
        'BAB IX': r'BAB\s+IX\b',
        '9.1': r'9\.1\s+Kesimpulan',
        'BAB X': r'BAB\s+X\b',
    }
    
    results = {}
    for key, pattern in targets.items():
        pat = re.compile(pattern, re.IGNORECASE)
        # Scan dari halaman fisik 5 (indeks 4) ke atas
        for idx in range(4, len(doc)):
            text = doc[idx].get_text()
            if pat.search(text):
                # Halaman dokumen dimulai dari 1 pada halaman fisik 5
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
    # Warna abu-abu teks footer (#475569)
    color = (0.28, 0.33, 0.41)
    
    for i in range(1, len(doc)):
        page = doc[i]
        
        # Tentukan label halaman
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
        
        # 2. Sisipkan teks label baru rata kanan
        tw = pymupdf.get_text_length(lbl, fontname=fontname, fontsize=fontsize)
        right_margin_x = 538.6
        pos = pymupdf.Point(right_margin_x - tw, 816.8)
        page.insert_text(pos, lbl, fontname=fontname, fontsize=fontsize, color=color)
        
    # Simpan ke file sementara lalu timpa jika sama
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
    else:
        print(f"Unknown mode: {mode}")
        sys.exit(1)
