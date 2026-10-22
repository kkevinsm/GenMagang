# 🎓 GenMagang — Platform AI All-in-One untuk Anak Magang Indonesia

**GenMagang** adalah platform produktivitas terintegrasi berbasis AI yang dirancang khusus untuk membebaskan mahasiswa dan peserta magang di Indonesia dari rutinitas administratif yang repetitif.

GenMagang menggabungkan 2 pilar solusi utama:
1. **🤖 GenMonev (Eks Mobogen):** Otomatisasi penyusunan laporan harian Monitoring dan Evaluasi (Monev) berstandar formal Kemnaker (> 100 karakter) dengan integrasi akun SIAPkerja ID dan Bot Telegram asisten absensi.
2. **📝 GenNotulis (Eks Notugen):** Platform intelejen notulensi rapat korporat yang mengubah transkrip, rekaman suara mikrofon, maupun file video meeting menjadi risalah keputusan resmi berstandar BNI/korporat dan daftar tindak lanjut (*action items*).

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

## 🚢 Panduan Deploy ke Vercel

Repositori ini siap langsung di-deploy ke Vercel:

1. Buka [Vercel Dashboard](https://vercel.com/new).
2. Pilih repositori GitHub: `https://github.com/kkevinsm/GenMagang.git`.
3. Di bagian **Environment Variables**, tambahkan:
   * `GEMINI_API_KEY` = *<API_KEY_ANDA>*
   * `GEMINI_MODEL` = `gemini-flash-latest` (atau `gemini-2.5-flash`)
   * `TELEGRAM_BOT_TOKEN` = *<TOKEN_BOT_ANDA>* (jika ada)
4. Klik **Deploy**. Selesai!
   Vercel akan otomatis menyajikan dashboard utama di `/`, GenMonev di `/monev`, dan GenNotulis di `/notulen`.

---

## 📄 Lisensi
MIT License © 2026 GenMagang by Kevin Simanjuntak
