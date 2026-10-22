'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function GenMagangLanding() {
  const [activeTab, setActiveTab] = useState<'monev' | 'notulen'>('monev');

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FBFBFA] text-surface-900 font-sans selection:bg-primary-500 selection:text-white">
      
      {/* =========================================================================
          BACKGROUND CONCENTRIC ORBITAL RINGS (Inspired by Reference Design)
          ========================================================================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex items-center justify-center -top-24 md:-top-16">
        {/* Subtle radial glow at center */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-primary-100/40 via-emerald-100/30 to-transparent blur-3xl opacity-70"></div>
        
        {/* Inner Orbit 1 */}
        <div className="absolute w-[500px] h-[500px] rounded-full border border-primary-500/10"></div>
        
        {/* Middle Orbit 2 */}
        <div className="absolute w-[800px] h-[800px] rounded-full border border-dashed border-primary-500/15"></div>
        
        {/* Outer Orbit 3 */}
        <div className="absolute w-[1100px] h-[1100px] rounded-full border border-primary-500/10"></div>
        
        {/* Max Orbit 4 */}
        <div className="absolute w-[1450px] h-[1450px] rounded-full border border-dashed border-primary-500/5"></div>
      </div>

      {/* =========================================================================
          TOP FLOATING LIQUID GLASS NAVBAR PILL
          ========================================================================= */}
      <header className="sticky top-6 z-50 px-4 max-w-5xl mx-auto">
        <nav className="liquid-glass-pill rounded-full px-4 py-2.5 flex items-center justify-between shadow-xl">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 pl-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[1.12rem] tracking-tight leading-none text-primary-900">
                Gen<span className="text-emerald-600">Magang</span>
              </span>
              <span className="text-[0.62rem] text-surface-500 font-medium tracking-wide">AI ALL-IN-ONE SUITE</span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-7 text-[0.88rem] font-medium text-surface-700">
            <Link href="#preview" className="hover:text-primary-600 transition-colors">
              Simulasi Fitur
            </Link>
            <Link href="/monev" className="flex items-center gap-1.5 hover:text-primary-600 transition-colors">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              GenMonev
            </Link>
            <Link href="/notulen" className="flex items-center gap-1.5 hover:text-primary-600 transition-colors">
              <span className="w-2 h-2 rounded-full bg-primary-500"></span>
              GenNotulis
            </Link>
            <Link href="#keunggulan" className="hover:text-primary-600 transition-colors">
              Keunggulan
            </Link>
          </div>

          {/* Right Action Launcher Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/monev"
              className="hidden sm:inline-flex items-center text-xs font-semibold px-3.5 py-1.5 rounded-full text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors"
            >
              Monev Kemnaker
            </Link>
            <Link
              href="/notulen"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 shadow-md shadow-primary-500/25 hover:shadow-lg transition-all"
            >
              <span>Mulai Gratis</span>
              <span>→</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* =========================================================================
          HERO SECTION WITH CONCENTRIC ORBIT BADGES
          ========================================================================= */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 pt-12 md:pt-20 pb-24 text-center">
        
        {/* Floating Liquid Glass Badges Along Orbits (Positioned as per reference) */}
        
        {/* Badge 1: Monev Kemnaker (Top Left) */}
        <div className="hidden lg:flex absolute top-16 left-6 liquid-glass-badge rounded-2xl p-3 items-center gap-3 animate-float-slow">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg shadow-inner">
            🤖
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-surface-900">Monev MagangHub</div>
            <div className="text-[0.7rem] text-surface-500">3 Bagian Laporan &gt; 100 Karakter</div>
          </div>
        </div>

        {/* Badge 2: Notulen Rapat (Top Right) */}
        <div className="hidden lg:flex absolute top-20 right-8 liquid-glass-badge rounded-2xl p-3 items-center gap-3 animate-float-alt">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-lg shadow-inner">
            🎙️
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-surface-900">GenNotulis Rapat</div>
            <div className="text-[0.7rem] text-surface-500">Rekam Suara &amp; Video ke PDF</div>
          </div>
        </div>

        {/* Badge 3: Telegram Bot (Mid Left) */}
        <div className="hidden xl:flex absolute top-72 left-2 liquid-glass-badge rounded-2xl p-2.5 items-center gap-2.5 animate-float-alt">
          <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-base">
            📱
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-surface-900">Bot Telegram</div>
            <div className="text-[0.68rem] text-surface-500">Kirim Absensi via Chat</div>
          </div>
        </div>

        {/* Badge 4: Action Items (Mid Right) */}
        <div className="hidden xl:flex absolute top-72 right-4 liquid-glass-badge rounded-2xl p-2.5 items-center gap-2.5 animate-float-slow">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-base">
            📋
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-surface-900">Pelacak Tindak Lanjut</div>
            <div className="text-[0.68rem] text-surface-500">Action Items per Tim</div>
          </div>
        </div>

        {/* Top Trust & Rating Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-pill mb-6 text-xs font-medium text-surface-700 shadow-sm">
          <span className="flex text-amber-500 text-xs">★★★★★</span>
          <span className="font-semibold text-primary-900">4.9/5 Rating</span>
          <span className="text-surface-300">•</span>
          <span>Dipercaya 1,500+ Mahasiswa &amp; Peserta Magang di Indonesia</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-surface-900 max-w-4xl mx-auto leading-[1.12]">
          Platform AI All-in-One untuk{' '}
          <span className="gradient-text-emerald inline-block">Anak Magang</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-surface-600 max-w-2xl mx-auto leading-relaxed">
          Selesaikan 2 beban terbesar anak magang dalam hitungan detik: pengisian laporan <strong>Monev harian MagangHub Kemnaker</strong> dan perumusan <strong>notulensi rapat korporat resmi</strong> dengan bantuan AI Gemini.
        </p>

        {/* =========================================================================
            THE 2 MAIN ACTION BUTTONS (As requested by USER)
            ========================================================================= */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
          
          {/* Button 1: Mobogen (Monev) */}
          <Link
            href="/monev"
            className="w-full sm:w-auto flex-1 group liquid-glass p-4 rounded-2xl flex items-center gap-3.5 border-2 border-emerald-500/30 hover:border-emerald-500 hover:bg-white/90 transition-all duration-300 shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-primary-600 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
              🤖
            </div>
            <div className="text-left flex-1">
              <div className="text-sm font-bold text-surface-900 group-hover:text-emerald-700 transition-colors">
                Buka GenMonev
              </div>
              <div className="text-xs text-surface-500">
                Laporan MagangHub &amp; Bot Telegram
              </div>
            </div>
            <div className="text-emerald-600 font-bold text-lg group-hover:translate-x-1 transition-transform pr-1">
              →
            </div>
          </Link>

          {/* Button 2: Notugen (Notulensi) */}
          <Link
            href="/notulen"
            className="w-full sm:w-auto flex-1 group liquid-glass p-4 rounded-2xl flex items-center gap-3.5 border-2 border-primary-500/30 hover:border-primary-600 hover:bg-white/90 transition-all duration-300 shadow-lg shadow-primary-500/10 hover:shadow-xl hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
              📝
            </div>
            <div className="text-left flex-1">
              <div className="text-sm font-bold text-surface-900 group-hover:text-primary-700 transition-colors">
                Buka GenNotulis
              </div>
              <div className="text-xs text-surface-500">
                Notulen Rapat &amp; Action Items
              </div>
            </div>
            <div className="text-primary-600 font-bold text-lg group-hover:translate-x-1 transition-transform pr-1">
              →
            </div>
          </Link>

        </div>

        {/* =========================================================================
            INTERACTIVE DUAL-SUITE LIQUID GLASS SHOWCASE (Inspired by reference card)
            ========================================================================= */}
        <section id="preview" className="mt-16 max-w-4xl mx-auto">
          <div className="liquid-glass-card rounded-3xl p-4 sm:p-7 text-left shadow-2xl relative overflow-hidden border border-white/80">
            
            {/* Top Switcher Tabs */}
            <div className="flex flex-col sm:flex-row items-center justify-between pb-5 border-b border-surface-200 gap-3">
              <div className="flex items-center gap-2 p-1 bg-surface-100 rounded-xl w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('monev')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'monev'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-surface-600 hover:text-surface-900'
                  }`}
                >
                  <span>🤖</span>
                  <span>Simulasi GenMonev</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('notulen')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'notulen'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-surface-600 hover:text-surface-900'
                  }`}
                >
                  <span>📝</span>
                  <span>Simulasi GenNotulis</span>
                </button>
              </div>

              {/* Action direct to real page */}
              {activeTab === 'monev' ? (
                <Link
                  href="/monev"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  Buka Modul Monev Penuh →
                </Link>
              ) : (
                <Link
                  href="/notulen"
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  Buka Modul Notulen Penuh →
                </Link>
              )}
            </div>

            {/* TAB CONTENT 1: MONEV PREVIEW */}
            {activeTab === 'monev' && (
              <div className="mt-5 space-y-4 animate-fade-in">
                <div className="bg-white/80 rounded-2xl p-4 border border-surface-200">
                  <div className="flex items-center justify-between text-xs text-surface-500 mb-1.5 font-medium">
                    <span className="font-bold text-surface-800">1. Uraian Aktivitas</span>
                    <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                      184/100 Karakter (Lolos Syarat ✓)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-surface-700 leading-relaxed">
                    Hari ini melaksanakan analisis kebutuhan fungsional modul pembayaran, menghadiri sesi koordinasi berkala bersama tim pengembang, serta melakukan pengujian verifikasi data transaksi pada lingkungan staging guna memastikan kelancaran integrasi sistem.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/80 rounded-2xl p-4 border border-surface-200">
                    <div className="flex items-center justify-between text-xs text-surface-500 mb-1.5 font-medium">
                      <span className="font-bold text-surface-800">2. Pembelajaran</span>
                      <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                        142/100 Karakter ✓
                      </span>
                    </div>
                    <p className="text-xs text-surface-700 leading-relaxed">
                      Memahami alur verifikasi payload token OAuth2 dan pentingnya kepatuhan SLA dalam penanganan tiket temuan uji fungsional perbankan.
                    </p>
                  </div>

                  <div className="bg-white/80 rounded-2xl p-4 border border-surface-200">
                    <div className="flex items-center justify-between text-xs text-surface-500 mb-1.5 font-medium">
                      <span className="font-bold text-surface-800">3. Kendala &amp; Solusi</span>
                      <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                        118/100 Karakter ✓
                      </span>
                    </div>
                    <p className="text-xs text-surface-700 leading-relaxed">
                      Menemukan keterlambatan respon server pada modul staging yang berhasil diatasi melalui penyesuaian parameter query bersama tim mentor.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-surface-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Tersinkronisasi otomatis dengan akun SIAPkerja ID Kemnaker</span>
                  </div>
                  <Link
                    href="/monev"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-primary-600 text-white font-bold text-xs text-center shadow-md hover:shadow-lg transition-all"
                  >
                    Generate Laporan Monev Anda Sekarang
                  </Link>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: NOTULEN PREVIEW */}
            {activeTab === 'notulen' && (
              <div className="mt-5 space-y-4 animate-fade-in">
                <div className="bg-white/80 rounded-2xl p-4 border border-surface-200">
                  <div className="flex items-center justify-between text-xs text-surface-500 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-primary-100 text-primary-800 font-bold text-[0.7rem]">
                        RESMI KORPORAT
                      </span>
                      <span>📅 Selasa, 20 Oktober 2026 • 14.00 WIB</span>
                    </div>
                    <span className="text-primary-700 font-semibold">📍 Ms. Teams &amp; RDTX Square</span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-surface-900">
                    Penyelarasan Timeline Migrasi Wave 2 &amp; Uji Balance Widget
                  </h4>
                  <div className="mt-3 space-y-1.5 text-xs text-surface-700">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓ Keputusan:</span>
                      <span>Performance test formal ditiadakan, fokus optimasi query teknis Balance Widget &lt; 30 detik.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓ Skema:</span>
                      <span>Eksekusi migrasi Semen Baturaja dan Pupuk Indonesia diprioritaskan lebih dulu.</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 rounded-2xl p-4 border border-surface-200">
                  <div className="text-xs font-bold text-surface-800 mb-2.5 flex items-center justify-between">
                    <span>Daftar Tindak Lanjut (Action Items per Tim)</span>
                    <span className="text-primary-600 font-medium">3 Tugas Menunggu</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-50 border border-surface-100">
                      <input type="checkbox" defaultChecked className="rounded text-primary-600" readOnly />
                      <span className="line-through text-surface-400 flex-1">Memastikan query stabil di Pre-Prod</span>
                      <span className="text-[0.68rem] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">Tim Dev</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2 rounded-lg bg-surface-50 border border-surface-100">
                      <input type="checkbox" className="rounded text-primary-600" readOnly />
                      <span className="text-surface-800 flex-1">Siapkan 100 test case migrasi Baturaja</span>
                      <span className="text-[0.68rem] bg-primary-50 text-primary-700 px-2 py-0.5 rounded">Tim QA</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-surface-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                    <span>Format resmi standar BNI, ekspor PDF &amp; format ringkas WhatsApp</span>
                  </div>
                  <Link
                    href="/notulen"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-800 text-white font-bold text-xs text-center shadow-md hover:shadow-lg transition-all"
                  >
                    Buka Notugen Sekarang
                  </Link>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* =========================================================================
            KEY FEATURES GRID
            ========================================================================= */}
        <section id="keunggulan" className="mt-24 pt-10 border-t border-surface-200/60 max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Dirancang Khusus Anak Magang
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 mt-3">
              Kenapa Harus GenMagang?
            </h2>
            <p className="text-sm text-surface-600 mt-2">
              Dua produk yang mengatasi rutinitas paling menguras waktu selama masa magang Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="liquid-glass rounded-2xl p-6 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4">
                ⏱️
              </div>
              <h3 className="text-base font-bold text-surface-900">Hemat 1-2 Jam Tiap Hari</h3>
              <p className="text-xs text-surface-600 mt-2 leading-relaxed">
                Tidak perlu lagi memeras otak merangkai kata demi memenuhi batas minimal 100 karakter Monev, atau begadang mengetik ulang hasil rapat seharian.
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-6 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-2xl mb-4">
                🎯
              </div>
              <h3 className="text-base font-bold text-surface-900">Standar Formal Korporat</h3>
              <p className="text-xs text-surface-600 mt-2 leading-relaxed">
                Setiap laporan dan notulensi diformulasikan dengan bahasa formal profesional standar instansi BUMN dan kementerian pemerintah.
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-6 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-2xl mb-4">
                🔒
              </div>
              <h3 className="text-base font-bold text-surface-900">Aman &amp; Terenkripsi</h3>
              <p className="text-xs text-surface-600 mt-2 leading-relaxed">
                Kredensial disimpan dengan standar enkripsi AES-256 tingkat tinggi dan token SIAPkerja tidak pernah disimpan di server publik.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <footer className="border-t border-surface-200 bg-white/80 py-8 px-4 text-center text-xs text-surface-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary-900">GenMagang</span>
            <span>— Asisten AI Andalan Anak Magang Indonesia</span>
          </div>
          <div className="flex items-center gap-6 font-medium">
            <Link href="/monev" className="hover:text-primary-600 transition-colors">
              GenMonev (Kemnaker)
            </Link>
            <Link href="/notulen" className="hover:text-primary-600 transition-colors">
              GenNotulis (Rapat)
            </Link>
            <a
              href="https://github.com/kkevinsm/GenMagang"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-600 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
