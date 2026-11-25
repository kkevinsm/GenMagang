# 🎓 GenMagang — Platform AI All-in-One untuk Anak Magang Indonesia

**GenMagang** adalah platform produktivitas terintegrasi berbasis AI yang dirancang khusus untuk membebaskan mahasiswa dan peserta maganghub di Indonesia dari rutinitas administratif yang repetitif.

GenMagang menggabungkan 2 pilar solusi utama:
1. **🤖 GenMonev:** Otomatisasi penyusunan laporan harian Monitoring dan Evaluasi (Monev) Maganghub berstandar formal Kemnaker (> 100 karakter) dengan integrasi akun SIAPkerja ID dan Bot Telegram asisten absensi.
2. **📝 GenNotulis:** Platform intelejen notulensi rapat korporat yang mengubah transkrip, rekaman suara mikrofon, maupun file video meeting menjadi risalah keputusan resmi berstandar korporat dan daftar tindak lanjut (*action items*).

---

## 🚀 Arsitektur & Rute Aplikasi

Aplikasi dibangun sebagai **Next.js (App Router)** terpadu:

* **`/`** — **Dashboard Utama GenMagang:** Portal landing page interaktif dengan tema *Liquid Glassmorphism*, visual orbit melingkar konsentris (*concentric circular orbits*), tipografi **Inter**, dan palet warna hijau khas (*Signature Deep Teal Green* `#134f5c`).
* **`/monev`** — **GenMonev:** Generator laporan harian MagangHub Kemnaker & asisten Telegram.
* **`/notulen`** — **GenNotulis:** Studio notulensi rapat, audio/video AI transcriber, lembar resmi korporat, dan pelacak tindak lanjut.
* **`/api/...`** — Backend API routes untuk integrasi Gemini AI, webhook Telegram, dan proxy Kemnaker.

---

## 🛠️ Menjalankan Secara Lokal

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Konfigurasi Environment Variables
Salin file `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```
Lengkapi konfigurasi API:
* `GEMINI_API_KEY`: Dapatkan API Key gratis di [Google AI Studio](https://aistudio.google.com/app/apikey)
* `TELEGRAM_BOT_TOKEN`: Token bot dari @BotFather (opsional jika menggunakan bot Telegram)

### 3. Jalankan Server Development
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---
