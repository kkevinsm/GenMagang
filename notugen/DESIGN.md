# DESIGN.md — notugen

## 1. Product Identity
- **Name:** notugen
- **Purpose:** Arsip terpusat, generator berbasis AI (Gemini), dan pelacak tindak lanjut (action items) notulensi rapat korporat dengan format resmi standar perbankan/BUMN.
- **Audience:** Profesional, project manager, tech lead, dan tim korporat yang membutuhkan pencatatan rapat cepat tanpa kehilangan detail teknis dan kepatuhan format formal.

## 2. Visual Direction & Mood (Inspired by Reference UI)
- **Mood:** Tenang, rapi, presisi, bernuansa ruang kerja desktop macOS modern (editorial warmth meets technical precision).
- **Canvas & Palette:**
  - Background Canvas: Warm mist cream (#F8F6F1 transitioning subtly into #F1EDE5).
  - Surface / Cards: Pure white frosted card (rgba(255, 255, 255, 0.92) with backdrop-filter: blur(16px) and subtle 1px border rgba(0, 0, 0, 0.07)).
  - Text Primary: Deep charcoal slate (#1C1917).
  - Text Secondary / Muted: Warm graphite (#57534E / #78716C).
  - Accent Pastels (Project Folders):
    - Forest Sage: linear-gradient(135deg, #E6F4EA, #CEEAD6) (FSCM / Backend)
    - Iris Lavender: linear-gradient(135deg, #F3E8FD, #E9D5FF) (Core Banking / iCons)
    - Warm Amber: linear-gradient(135deg, #FEF3C7, #FDE68A) (Migrasi & Data)
    - Rose Clay: linear-gradient(135deg, #FCE7F3, #FBCFE8) (Bisnis & Rekomendasi)
  - Interactive Accent: Deep Onyx (#18181B) for primary actions with white text; Warm Emerald (#059669) for completed items.

## 3. Typography
- **Display Headings:** Editorial serif (Newsreader / Playfair Display) for hero greetings and section headers to give a sophisticated, authoritative tone.
- **Body & UI:** Plus Jakarta Sans and Inter for exceptional legibility across dense agenda items, timestamps, and attendee badges.
- **Document Output (Official Sheet):** Clean corporate sans (Arial, Inter, Helvetica) matching official corporate memo standards.

## 4. Dials & Levers
- **ENERGY:** 2 (Calm, focused, intentional work environment; no screaming neon or distracting animations).
- **RHYTHM:** 2 (Carefully balanced spacing: generous breathing room in navigation, compact readable tables for meeting records).
- **MOTION:** 1 (Fast, functional micro-transitions: 150ms-200ms ease for tab switches, dialog backdrop fade, checkmark toggles).

## 5. Functional Scope
1. **Penyimpanan Lokal & Riwayat:** Data notulen tersimpan di browser via localStorage / IndexedDB (Local-first & offline-capable).
2. **AI Generator (Gemini):** Prompt terstandarisasi untuk mentransformasi transkrip/catatan mentah/rekaman meeting menjadi 6 komponen resmi (Header/Metadata, Agenda, Keputusan, Memo Dinamika/PIC, Kesimpulan, Action Items).
3. **Ekspor Cetak PDF Presisi:** @media print CSS yang menghasilkan tata letak tabel formal, logo korporat, running header, dan nomor halaman sesuai referensi PDF nyata.
4. **Action Items Tracker:** Dashboard tugas lintas rapat terorganisir per unit kerja (Pengembang, QA, Bisnis, Core Banking, PM).
5. **Quick Search (Cmd+K):** Modal pencarian cepat berdasarkan kata kunci, topik, tanggal, atau nama PIC.
