# template-laporan/scripts/stamp-academic-pages.py
# Modul Sinkronisasi Penomoran Halaman Akademik Resmi
# Penomoran Romawi pada lembar awal (ii, iii, iv) & Angka Arab Bab (Halaman 1..N)

import sys
import os
import json
import re
import pymupdf

def scan_sections(pdf_path):
    doc = pymupdf.open(pdf_path)
    
    # Target regex bab utama (BAB I s.d. BAB X)
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
        # Scan dari fisik halaman 5 (indeks 4) ke atas
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
    color = (0.28, 0.33, 0.41) # Warna abu-abu teks (#475569)
    
    for i in range(1, len(doc)):
        page = doc[i]
        
        # Tentukan nomor halaman akademik
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
        
        # 2. Sisipkan label baru rata kanan
        tw = pymupdf.get_text_length(lbl, fontname=fontname, fontsize=fontsize)
        right_margin_x = 538.6
        pos = pymupdf.Point(right_margin_x - tw, 816.8)
        page.insert_text(pos, lbl, fontname=fontname, fontsize=fontsize, color=color)
        
    # Simpan
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
