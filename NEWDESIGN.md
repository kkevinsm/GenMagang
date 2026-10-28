# UI Design Specification: GenMagang Landing Page

Dokumen ini memuat spesifikasi teknis dan visual untuk perancangan ulang antarmuka website **GenMagang**. Pendekatan desain menggabungkan **layout eksisting yang dipertahankan posisinya** dengan **gaya visual modern, pencahayaan alami, dan glassmorphism** yang terinspirasi dari referensi.

---

## 1. Konsep & Arah Visual (Visual Direction)

* **Mood & Feel**: Segar, cerah, modern, profesional, dan futuristik tanpa menghilangkan kesan ramah pengguna.
* **Background Atmosphere**:
  * Pemandangan lanskap padang rumput dan langit biru beresolusi tinggi dengan kedalaman visual (*depth-of-field* lembut).
  * Lapisan gradasi overlay putih/transparan (`linear-gradient(to bottom, rgba(255,255,255,0.4), rgba(255,255,255,0.85))`) untuk memastikan seluruh teks dan komponen memiliki rasio kontras yang memenuhi standar aksesibilitas WCAG AA.
* **Glassmorphism & Surfaces**:
  * Efek kartu mengambang (*floating surfaces*) dengan `backdrop-filter: blur(16px)`.
  * Border halus semi-transparan (`1px solid rgba(255, 255, 255, 0.6)`).
  * Bayangan difus lembut bertingkat (*multi-layered ambient shadow*): `box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.08)`.

---

## 2. Sistem Desain (Design System)

### 2.1. Tipografi
* **Hero Display (H1)**: Kombinasi Serif modern (seperti *Instrument Serif*, *Playfair Display*, atau *Newsreader*) dengan Sans-serif geometris (*Plus Jakarta Sans* atau *Inter*).
* **Headings (H2, H3)**: Sans-serif medium-to-bold (`font-semibold` / `font-bold`).
* **Body Text**: Clean Sans-serif dengan *line-height* 1.6 (`leading-relaxed`).
* **Tags, Validation, & Code**: Sans-serif monospaced ringan atau condensed pill tags (`text-xs tracking-wide uppercase font-mono`).

### 2.2. Palet Warna (Color Palette)

| Kategori | Nama Variabel / Token | Nilai Hex | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Primary** | `--color-brand-blue` | `#2563EB` / `#1D4ED8` | CTA utama, aksen tombol interaktif |
| **Accent / Success**| `--color-success-green`| `#10B981` / `#059669` | Validasi Monev lolos, badge status aktif |
| **Text Primary** | `--color-text-title` | `#0F172A` | Judul utama, heading tebal |
| **Text Secondary**| `--color-text-body` | `#475569` | Paragraf penjelasan, keterangan kartu |
| **Surface Glass** | `--color-card-bg` | `rgba(255, 255, 255, 0.88)` | Latar kartu fungsional |
| **Border Glass** | `--color-card-border` | `rgba(255, 255, 255, 0.65)` | Garis tepi kartu dan pill container |

---

## 3. Komponen & Penempatan Layout (Layout Mapping)

Setiap elemen diatur secara ketat sesuai dengan posisi pada desain eksisting.

```
+-----------------------------------------------------------------------------------+
|  [Logo GenMagang] [● Platform Asisten #1]               [GenMonev] [GenNotulis →] |  <- Header / Navbar
+-----------------------------------------------------------------------------------+
|                                                                                   |
|                                [ Floating Badge ]                                 |
|                     Platform AI All-in-One untuk Anak Magang                      |  <- Hero Header
|                                 (Subheadline)                                     |
|                                                                                   |
|   (🔒 Aman)            [ Buka GenMonev → ]   [ Buka GenNotulis → ]     (⏱ 3 Detik) |  <- Dual Quick Action
|                                                                                   |
|   (⚡ Validasi)    +-----------------------------------------------+               |
|                    | [Simulasi Monev] [Simulasi Notulis]     Link> |               |
|                    | 1. Uraian Aktivitas   [184 Karakter Lolos ✓]  |               |  <- Simulator Interaktif
|                    | [2. Pembelajaran]     [3. Kendala & Solusi]   |               |
|                    | (SIAPkerja Integrated)        [Generate CTA →]|               |
|                    +-----------------------------------------------+               |
|                                                                                   |
|                             DIRANCANG KHUSUS ANAK MAGANG                          |
|                                Kenapa Harus GenMagang?                            |  <- Value Proposition
|                                                                                   |
|      [ Hemat 1-2 Jam ]          [ Standar Formal ]           [ Aman Terenkripsi ] |  <- 3 Benefit Cards
|                                                                                   |
+-----------------------------------------------------------------------------------+
|  GenMagang — Asisten AI                     [GenMonev]   [GenNotulis]   [GitHub]  |  <- Footer
+-----------------------------------------------------------------------------------+
```

---

## 4. Rincian Spesifikasi Komponen

### 4.1. Navigation Bar (Header)
* **Posisi**: Terpasang di bagian atas halaman (*fixed* atau *floating island*).
* **Komponen Kiri**:
  * **Brand Logo**: Teks `GenMagang` tebal dengan sub-label huruf kapital kecil `ALL-IN-ONE SUITE`.
  * **Status Badge**: Pill tag `● Platform Asisten Magang #1` berlatar belakang semi-transparan dengan border lembut.
* **Komponen Kanan**:
  * Button `GenMonev` (ikon kalender/laporan, tombol border kaca halus).
  * Button `GenNotulis →` (tombol solid pill kontras tinggi / dark pill).

### 4.2. Hero Title & Subheadline
* **Floating Badge Atas**: Pill kecil terpusat dengan teks penanda.
* **Judul Utama (H1)**:
  * Teks: `"Platform AI All-in-One untuk Anak Magang"`
  * Penekanan Tipografi: Frasa `"Platform AI All-in-One untuk"` menggunakan Serif gelap yang elegan, sedangkan `"Anak Magang"` memakai Sans-serif bergradien toska/biru yang tegas.
* **Subheadline**:
  * Menjelaskan proposisi nilai: penyelesaian otomatis laporan Monev Kemnaker dan notulensi rapat korporat dengan AI.
  * Ukuran teks seimbang (`text-base` atau `text-lg`), *center-aligned*, dengan lebar maksimal 700px.

### 4.3. Dual Action Cards (Kartu Akses Cepat)
* **Posisi**: Bersebelahan secara horizontal di bawah subheadline.
* **Kartu Kiri - Buka GenMonev**:
  * Ikon: Gradien hijau toska di dalam kontainer *squircle*.
  * Teks: **Buka GenMonev** (Heading) & *Laporan MagangHub & Absensi* (Deskripsi pendek).
  * Aksi: Ikon tombol panah `→` di sisi kanan kartu.
* **Kartu Kanan - Buka GenNotulis**:
  * Ikon: Gradien biru gelap / slate di dalam kontainer *squircle*.
  * Teks: **Buka GenNotulis** (Heading) & *Notulen Rapat & Action Items* (Deskripsi pendek).
  * Aksi: Ikon tombol panah `→` di sisi kanan kartu.
* **Gaya Visual**: Sudut membulat lebar (`rounded-2xl`), efek saat disentuh (*hover lift* sebesar `-4px` dengan peningkatan bayangan lembut).

### 4.4. Floating Status Badges (Aksen Dekoratif Inspirasi Referensi)
* **Posisi**: Mengambang di area kiri dan kanan di luar kartu simulasi (*desktop only*).
* **Badge Kiri**:
  * `🔒 Non-custodial / Aman & Terenkripsi`
  * `⚡ Lolos Validasi 100 Karakter`
* **Badge Kanan**:
  * `⏱ Selesai dalam 3 Detik`
* **Styling**: Kapsul melayang mini dengan efek *frosted glass* halus dan animasi melayang lembut (*floating keyframe animation*).

### 4.5. Interactive Simulator Module (Kartu Pratinjau Utama)
* **Posisi**: Terpusat di tengah layar di bawah Dual Action Cards.
* **Struktur Kartu**:
  1. **Top Bar (Tab & Navigasi Modul)**:
     * Kiri: Tab saklar aktif `Simulasi GenMonev` dan tab pasif `Simulasi GenNotulis`.
     * Kanan: Tautan teks interaktif `Buka Modul GenMonev Lengkap →`.
  2. **Card Body (Output Pratinjau)**:
     * **Bagian 1 (Uraian Aktivitas)**: Dilengkapi dengan counter karakter kapsul hijau: `184 / 100 Karakter (Lolos Validasi ✓)`. Teks simulasi ditampilkan dalam font yang bersih dan rapi.
     * **Bagian 2 & 3 (Sub-Output)**: Dua kolom berdampingan untuk *2. Pembelajaran (142 Karakter ✓)* dan *3. Kendala & Solusi (118 Karakter ✓)*.
  3. **Bottom Bar (Action & Integrasi)**:
     * Kiri: Catatan kredibilitas: *"Terintegrasi langsung dengan login SIAPkerja Kemnaker ID untuk auto-submit harian."*
     * Kanan: Tombol CTA utama: `Generate Laporan Monev Anda Sekarang →` berlatar warna tegas dengan sudut melengkung halus.

### 4.6. Value Proposition Section ("Kenapa Harus GenMagang?")
* **Header Bagian**:
  * Tag kapsul kecil di atas: `DIRANCANG KHUSUS ANAK MAGANG`.
  * Heading (H2): `Kenapa Harus GenMagang?`
  * Paragraf pengantar: Menggarisbawahi solusi atas dua rutinitas paling memakan waktu selama magang.
* **Grid 3 Kartu Keunggulan (3 Kolom Sejajar Horizontal)**:
  1. **Hemat 1-2 Jam Tiap Hari**: Ikon jam/waktu, menjelaskan otomatisasi perumusan teks tanpa perlu mengetik ulang berjam-jam.
  2. **Standar Formal Korporat**: Ikon pilar/gedung, menjelaskan output bahasa formal standar instansi pemerintah dan BUMN.
  3. **Aman & Terenkripsi**: Ikon keamanan, menjelaskan standar enkripsi token dan data pengguna.
* **Gaya Visual Kartu**: Menggunakan kontainer bertepi membulat besar (`rounded-3xl`), latar belakang kaca semi-transparan, dan aksen batas tepi halus.

### 4.7. Footer
* **Posisi**: Bagian terbawah halaman dengan pembatas garis tipis transparan.
* **Sisi Kiri**: Teks hak cipta / penanda: `GenMagang — Asisten AI Andalan Anak Magang Indonesia`.
* **Sisi Kanan**: Menu navigasi tautan ringkas (`GenMonev (Kemnaker)`, `GenNotulis (Rapat)`, `GitHub`).

---

## 5. Pertimbangan Teknis & Responsivitas

* **Breakpoint Desktop (> 1024px)**: Semua grid mempertahankan formasi horizontal sesuai desain eksisting.
* **Breakpoint Mobile (< 768px)**:
  * Dual Action Cards beralih menjadi 1 kolom bertumpuk (*stacked*).
  * Kartu Simulator menyesuaikan kolom Pembelajaran dan Kendala menjadi tata letak vertikal.
  * Floating Badges dekoratif disembunyikan agar tampilan mobile tetap rapi dan bebas distraksi.
  * Tiga kartu keunggulan (*Value Proposition*) disusun secara vertikal 1 kolom dengan jarak antar elemen yang proporsional.