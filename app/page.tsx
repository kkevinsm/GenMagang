"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function GenMagangLanding() {
  const [activeTab, setActiveTab] = useState<"monev" | "notulen">("monev");

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#FBFBFA] text-surface-900 font-sans selection:bg-primary-500 selection:text-white">
      
      {/* =========================================================================
          BACKGROUND ATMOSPHERE: NATURAL LANDSCAPE & GLASS OVERLAY (Sec 1 & 2)
          ========================================================================= */}
      <div className="bg-landscape-canvas" aria-hidden="true">
        <div className="bg-landscape-overlay" />
      </div>

      {/* Ambient Depth Motifs (Orbital Rings Layer behind Hero) */}
      <div 
        className="pointer-events-none absolute left-1/2 top-[380px] sm:top-[410px] md:top-[440px] -translate-x-1/2 -translate-y-1/2 w-[2200px] h-[2200px] flex items-center justify-center z-0 select-none opacity-35"
        aria-hidden="true"
      >
        <div className="absolute w-[680px] h-[680px] rounded-full bg-gradient-to-tr from-emerald-200/50 via-teal-100/30 to-transparent blur-3xl opacity-60" />
        <div className="absolute w-[520px] h-[520px] rounded-full orbit-ring-solid" />
        <div className="absolute w-[880px] h-[880px] rounded-full orbit-ring-emerald" />
        <div className="absolute w-[1300px] h-[1300px] rounded-full orbit-ring-solid" />
        <div className="absolute w-[1760px] h-[1760px] rounded-full orbit-ring-dashed" />
      </div>

      {/* =========================================================================
          4.1. NAVIGATION BAR (HEADER - Floating Island Pill)
          ========================================================================= */}
      <header className="sticky top-5 z-50 px-4 w-full max-w-5xl mx-auto">
        <nav className="liquid-glass-pill rounded-full px-5 py-2.5 flex items-center justify-between shadow-lg border border-white/85">
          
          {/* Komponen Kiri: Brand Logo & Status Badge */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[1.12rem] tracking-tight leading-none text-surface-900">
                  Gen<span className="text-emerald-600">Magang</span>
                </span>
                <span className="text-[0.6rem] text-surface-500 font-bold tracking-wider uppercase">ALL-IN-ONE SUITE</span>
              </div>
            </Link>

            {/* Status Badge Tag */}
            <div className="hidden md:flex items-center ml-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/85 text-emerald-800 border border-emerald-200/60 text-xs font-semibold shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Platform Asisten Magang #1
              </span>
            </div>
          </div>

          {/* Komponen Kanan: Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Button GenMonev (ikon kalender/laporan, tombol border kaca halus) */}
            <Link
              href="/monev"
              className="text-xs font-bold px-3.5 py-1.5 rounded-full text-surface-800 bg-white/75 hover:bg-white border border-white/90 shadow-xs hover:shadow transition-all flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>GenMonev</span>
            </Link>

            {/* Button GenNotulis (solid dark pill kontras tinggi) */}
            <Link
              href="/notulen"
              className="text-xs font-bold px-4 py-1.5 rounded-full text-white bg-surface-900 hover:bg-black shadow-sm hover:shadow transition-all flex items-center gap-1.5 group"
            >
              <span>GenNotulis</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* =========================================================================
          HERO CONTENT CONTAINER
          ========================================================================= */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 pt-12 md:pt-16 pb-24 text-center">
        
        {/* 4.2. Hero Floating Badge Atas */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-md border border-white/80 text-surface-700 text-xs font-semibold shadow-xs mb-5">
          <span className="text-emerald-600">✨</span>
          <span>Ekosistem Produktivitas Magang Terpadu</span>
        </div>

        {/* 4.2. Judul Utama (H1) - Serif & Sans-serif Hybrid Typography */}
        <h1 className="tracking-tight leading-[1.14] text-surface-900 max-w-4xl mx-auto">
          <span className="font-serif-hero italic font-normal text-4xl sm:text-5xl md:text-6xl text-surface-900 block sm:inline">
            Platform AI All-in-One untuk{" "}
          </span>
          <span className="font-sans font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-primary-600 inline-block">
            Anak Magang
          </span>
        </h1>

        {/* 4.2. Subheadline */}
        <p className="mt-5 text-base sm:text-lg text-surface-600 max-w-2xl mx-auto leading-relaxed">
          Selesaikan 2 beban terbesar anak magang dalam hitungan detik: pengisian laporan <strong>Monev harian MagangHub Kemnaker</strong> dan perumusan <strong>notulensi rapat korporat resmi</strong> dengan bantuan AI Gemini.
        </p>

        {/* =========================================================================
            4.3. DUAL ACTION CARDS (KARTU AKSES CEPAT)
            ========================================================================= */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch justify-center gap-4 max-w-xl mx-auto">
          
          {/* Kartu Kiri: Buka GenMonev */}
          <Link
            href="/monev"
            className="flex-1 group bg-white/88 hover:bg-white backdrop-blur-md p-4 rounded-2xl flex items-center gap-3.5 border border-emerald-500/25 hover:border-emerald-500/60 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform shrink-0">
              🤖
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="text-base font-extrabold text-surface-900 group-hover:text-emerald-700 transition-colors">
                Buka GenMonev
              </div>
              <div className="text-xs text-surface-500 truncate">
                Laporan MagangHub &amp; Absensi
              </div>
            </div>
            <div className="text-emerald-600 font-bold text-xl group-hover:translate-x-1 transition-transform pr-1">
              →
            </div>
          </Link>

          {/* Kartu Kanan: Buka GenNotulis */}
          <Link
            href="/notulen"
            className="flex-1 group bg-white/88 hover:bg-white backdrop-blur-md p-4 rounded-2xl flex items-center gap-3.5 border border-primary-500/25 hover:border-primary-600/60 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 via-primary-700 to-primary-900 text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform shrink-0">
              📝
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="text-base font-extrabold text-surface-900 group-hover:text-primary-700 transition-colors">
                Buka GenNotulis
              </div>
              <div className="text-xs text-surface-500 truncate">
                Notulen Rapat &amp; Action Items
              </div>
            </div>
            <div className="text-primary-600 font-bold text-xl group-hover:translate-x-1 transition-transform pr-1">
              →
            </div>
          </Link>

        </div>

        {/* =========================================================================
            4.4. FLOATING STATUS BADGES & 4.5. INTERACTIVE SIMULATOR MODULE
            ========================================================================= */}
        <div className="relative mt-12 max-w-3xl mx-auto">
          
          {/* 4.4. Floating Badges (Desktop Only - Left Badges) */}
          <div className="absolute -left-12 top-10 z-20 hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-lg text-xs font-semibold text-surface-800 animate-float-slow select-none">
            <span>🔒</span>
            <span>Non-custodial / Aman &amp; Terenkripsi</span>
          </div>

          <div className="absolute -left-10 bottom-12 z-20 hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-emerald-200/80 shadow-lg text-xs font-semibold text-emerald-800 animate-float-alt select-none">
            <span className="text-emerald-500">⚡</span>
            <span>Lolos Validasi 100 Karakter</span>
          </div>

          {/* 4.4. Floating Badge (Desktop Only - Right Badge) */}
          <div className="absolute -right-10 top-16 z-20 hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/80 shadow-lg text-xs font-semibold text-surface-800 animate-float-slow select-none">
            <span>⏱</span>
            <span>Selesai dalam 3 Detik</span>
          </div>

          {/* 4.5. Simulator Card Container */}
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 text-left transition-all border border-white/85 shadow-2xl">
            
            {/* Top Bar: Module Switcher Tabs & Live Direct Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200/70 pb-5">
              <div className="flex items-center gap-2 bg-surface-100/90 p-1 rounded-2xl w-fit border border-surface-200/50">
                <button
                  type="button"
                  onClick={() => setActiveTab("monev")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "monev"
                      ? "bg-white text-surface-900 shadow-sm border border-surface-200/60"
                      : "text-surface-600 hover:text-surface-900"
                  }`}
                >
                  <span>🤖</span>
                  <span>Simulasi GenMonev</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("notulen")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "notulen"
                      ? "bg-white text-surface-900 shadow-sm border border-surface-200/60"
                      : "text-surface-600 hover:text-surface-900"
                  }`}
                >
                  <span>📝</span>
                  <span>Simulasi GenNotulis</span>
                </button>
              </div>

              {/* Top-Right Interactive Link */}
              <div>
                {activeTab === "monev" ? (
                  <Link
                    href="/monev"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Buka Modul GenMonev Lengkap</span>
                    <span>→</span>
                  </Link>
                ) : (
                  <Link
                    href="/notulen"
                    className="text-xs font-bold text-primary-700 hover:text-primary-800 inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Buka Modul GenNotulis Lengkap</span>
                    <span>→</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Card Body: Simulator Output Previews */}
            {activeTab === "monev" && (
              <div className="pt-5 space-y-4">
                {/* Bagian 1: Uraian Aktivitas (dengan counter kapsul hijau) */}
                <div className="p-4 rounded-2xl bg-white/80 border border-emerald-500/20 shadow-xs space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-surface-900 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      1. Uraian Aktivitas
                    </span>
                    <span className="text-[0.7rem] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      184 / 100 Karakter (Lolos Validasi ✓)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-surface-800 leading-relaxed font-sans">
                    Melaksanakan verifikasi dan pengujian fungsional modul otentikasi pengguna pada environment staging, menyusun dokumentasi integrasi API, serta berkoordinasi bersama tim mentor teknis terkait standarisasi arsitektur data.
                  </p>
                </div>

                {/* Bagian 2 & 3: Pembelajaran & Kendala Solusi (2 Kolom Berdampingan) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  <div className="p-3.5 rounded-2xl bg-white/75 border border-surface-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-surface-900">2. Pembelajaran yang Didapat</span>
                      <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50">142 Karakter ✓</span>
                    </div>
                    <p className="text-xs text-surface-600 line-clamp-3 leading-relaxed">
                      Memahami implementasi OAuth2.0 dan manajemen session token yang aman, serta tata cara penanganan edge case saat terjadi request timeout pada API.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/75 border border-surface-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-surface-900">3. Kendala &amp; Solusi Praktis</span>
                      <span className="text-[0.68rem] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50">118 Karakter ✓</span>
                    </div>
                    <p className="text-xs text-surface-600 line-clamp-3 leading-relaxed">
                      Menemukan keterlambatan respon server pada modul staging yang berhasil diatasi melalui penyesuaian parameter query bersama tim mentor.
                    </p>
                  </div>
                </div>

                {/* Bottom Bar: Action & Integration */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-surface-200/60 mt-3">
                  <span className="text-xs text-surface-500">
                    💡 Terintegrasi langsung dengan login SIAPkerja Kemnaker ID untuk auto-submit harian.
                  </span>
                  <Link
                    href="/monev"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all shrink-0"
                  >
                    <span>Generate Laporan Monev Anda Sekarang</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "notulen" && (
              <div className="pt-5 space-y-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-white/80 border border-primary-500/20 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between border-b border-surface-200/70 pb-2.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[0.68rem] font-extrabold px-2 py-0.5 rounded-full bg-primary-700 text-white tracking-wide">Format Resmi BNI</span>
                      <span className="text-xs font-bold text-surface-900">NOTULEN KOORDINASI TEKNIS &amp; RILIS PROYEK</span>
                    </div>
                    <span className="text-[0.72rem] text-surface-500 font-medium">Rabu, 21 Oktober 2026</span>
                  </div>

                  <div className="space-y-3 text-xs text-surface-700">
                    <div>
                      <strong className="text-surface-900 block font-bold mb-1">Keputusan Utama:</strong>
                      <ul className="list-disc list-inside space-y-1 text-surface-600 pl-1">
                        <li>Uji fungsional (UAT) modul transaksi disetujui untuk dilaksanakan bersama unit kerja terkait.</li>
                        <li>Freeze code dijadwalkan mulai Jumat pukul 18.00 WIB guna persiapan migrasi database staging.</li>
                      </ul>
                    </div>

                    <div className="pt-1">
                      <strong className="text-surface-900 block font-bold mb-1.5">Tindak Lanjut / Action Items:</strong>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-surface-200/80 text-xs text-surface-800">
                          <input type="checkbox" defaultChecked readOnly className="accent-primary-600 rounded" />
                          <span>Tim Dev: Tuntaskan integrasi API (28 Okt)</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-surface-200/80 text-xs text-surface-800">
                          <input type="checkbox" readOnly className="accent-primary-600 rounded" />
                          <span>Tim QA: Verifikasi kestabilan staging (30 Okt)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-surface-200/60 mt-3">
                  <span className="text-xs text-surface-500">
                    🎙️ Mendukung transkrip teks, rekam suara via mikrofon langsung, dan upload rekaman video Zoom/Teams.
                  </span>
                  <Link
                    href="/notulen"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all shrink-0"
                  >
                    <span>Buka Arsip &amp; Generator Notulen</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* =========================================================================
            4.6. VALUE PROPOSITION SECTION ("Kenapa Harus GenMagang?")
            ========================================================================= */}
        <section className="mt-20 text-center">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-2 px-3 py-1 rounded-full bg-white/80 border border-emerald-200/70 w-fit mx-auto shadow-xs">
            DIRANCANG KHUSUS ANAK MAGANG
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
            Kenapa Harus GenMagang?
          </h2>
          <p className="mt-2 text-sm text-surface-600 max-w-lg mx-auto leading-relaxed">
            Dua produk yang mengatasi rutinitas paling menguras waktu selama masa magang Anda.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8 text-left">
            {/* Card 1: Hemat 1-2 Jam */}
            <div className="p-7 rounded-3xl bg-white/80 backdrop-blur-md border border-white/85 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-2xl mb-4 shadow-xs">
                ⏱️
              </div>
              <h3 className="text-base font-bold text-surface-900 mb-1.5">Hemat 1-2 Jam Tiap Hari</h3>
              <p className="text-xs text-surface-600 leading-relaxed">
                Tidak perlu lagi memeras otak merangkai kata demi memenuhi batas minimal 100 karakter Monev, atau begadang mengetik ulang hasil rapat seharian.
              </p>
            </div>

            {/* Card 2: Standar Formal Korporat */}
            <div className="p-7 rounded-3xl bg-white/80 backdrop-blur-md border border-white/85 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 border border-primary-100 flex items-center justify-center text-2xl mb-4 shadow-xs">
                🏛️
              </div>
              <h3 className="text-base font-bold text-surface-900 mb-1.5">Standar Formal Korporat</h3>
              <p className="text-xs text-surface-600 leading-relaxed">
                Setiap laporan dan notulensi diformulasikan dengan bahasa formal profesional standar instansi BUMN dan kementerian pemerintah.
              </p>
            </div>

            {/* Card 3: Aman & Terenkripsi */}
            <div className="p-7 rounded-3xl bg-white/80 backdrop-blur-md border border-white/85 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-2xl mb-4 shadow-xs">
                🔒
              </div>
              <h3 className="text-base font-bold text-surface-900 mb-1.5">Aman &amp; Terenkripsi</h3>
              <p className="text-xs text-surface-600 leading-relaxed">
                Kredensial disimpan dengan standar enkripsi AES-256 tingkat tinggi dan token SIAPkerja tidak pernah disimpan di server publik.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* =========================================================================
          4.7. FOOTER
          ========================================================================= */}
      <footer className="relative z-10 border-t border-white/60 bg-white/65 backdrop-blur-md py-6 text-center text-xs text-surface-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span><strong>GenMagang</strong> — Asisten AI Andalan Anak Magang Indonesia</span>
          <div className="flex items-center gap-4 text-primary-700 font-semibold">
            <Link href="/monev" className="hover:underline">GenMonev (Kemnaker)</Link>
            <Link href="/notulen" className="hover:underline">GenNotulis (Rapat)</Link>
            <a href="https://github.com/kkevinsm/GenMagang" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
