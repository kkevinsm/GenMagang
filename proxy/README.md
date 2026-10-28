# Panduan Setup Proxy Kemnaker (api.genmagang.web.id)

File dalam folder ini (`index.php` dan `.htaccess`) adalah backend proxy mandiri untuk meneruskan otentikasi & pengiriman absensi langsung ke server Kemnaker (tanpa pihak ketiga).

Proxy ini diperlukan karena IP server Vercel (datacenter Cloudflare) sering diblokir oleh Cloudflare WAF Kemnaker jika melakukan request langsung. Dengan proxy di hosting cPanel/Hostinger, request menggunakan IP shared hosting lokal Indonesia yang aman dari blokir WAF.

---

## Langkah Setup di Indo Domains / Hostinger:

1. **Buat Subdomain:**
   - Buka cPanel / Dashboard Hosting Anda di https://app.indo.domains/.
   - Masuk ke menu **Subdomains** / **Domains**.
   - Buat subdomain baru: `api.genmagang.web.id`
   - Tentukan folder Document Root (misal: `public_html/api` atau `domains/genmagang.web.id/public_html/api`).

2. **Upload File:**
   - Upload file `index.php` dan `.htaccess` ke folder Document Root subdomain tersebut.

3. **Verifikasi Status:**
   - Buka `https://api.genmagang.web.id` di browser.
   - Jika berhasil, Anda akan melihat respons JSON:
     ```json
     {
       "status": "online",
       "service": "GenMagang Kemnaker Direct Proxy",
       "message": "Server proxy aktif — koneksi langsung ke Kemnaker (tanpa absen-hub)."
     }
     ```

4. **Koneksi dengan Vercel:**
   - Web App GenMagang di Vercel secara default akan otomatis memanggil `https://api.genmagang.web.id`.
   - Jika subdomain belum selesai propagasi DNS, sistem secara otomatis fallback sementara ke `https://api.mobogen.online` sehingga operasional absensi tidak pernah terganggu.
