"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function GenMagangLanding() {
  const [activeTab, setActiveTab] = useState<"monev" | "notulen">("monev");

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#FBFBFA] text-surface-900 font-sans selection:bg-primary-500 selection:text-white">
      
      {/* =========================================================================
          BACKGROUND CONCENTRIC ORBITAL RINGS (Centered Mathematically)
          ========================================================================= */}
      <div 
        className="pointer-events-none absolute left-1/2 -top-16 -translate-x-1/2 w-[1200px] h-[1200px] flex items-center justify-center -z-10 overflow-hidden"
        aria-hidden="true"
      >
        {/* Subtle radial center ambient glow */}
        <div className="absolute w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-emerald-100/60 via-primary-100/40 to-transparent blur-3xl opacity-70" />
        
        {/* Outer Orbit Ring 4 (Dashed) */}
        <div className="absolute w-[1100px] h-[1100px] rounded-full border border-dashed border-primary-500/10" />
        
        {/* Orbit Ring 3 */}
        <div className="absolute w-[880px] h-[880px] rounded-full border border-primary-500/15" />
        
        {/* Orbit Ring 2 (Dashed Emerald) */}
        <div className="absolute w-[660px] h-[660px] rounded-full border border-dashed border-emerald-500/20" />
        
        {/* Inner Orbit Ring 1 */}
        <div className="absolute w-[440px] h-[440px] rounded-full border border-primary-500/25" />
      </div>

      {/* =========================================================================
          FLOATING TOP LIQUID GLASS NAVBAR PILL
          ========================================================================= */}
      <header className="sticky top-5 z-50 px-4 w-full max-w-4xl mx-auto">
        <nav className="liquid-glass-pill rounded-full px-5 py-2.5 flex items-center justify-between shadow-lg border border-white/80">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                <path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[1.12rem] tracking-tight leading-none text-primary-900">
                Gen<span className="text-emerald-600">Magang</span>
              </span>
              <span className="text-[0.6rem] text-surface-500 font-semibold tracking-wide">ALL-IN-ONE SUITE</span>
            </div>
          </Link>

          {/* Center Links / Sub-Badge */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/80 text-emerald-800 border border-emerald-200/60 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Platform Asisten Magang #1
            </span>
          </div>

          {/* Right Action Option Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/monev"
              className="text-xs font-bold px-3.5 py-1.5 rounded-full text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 transition-colors flex items-center gap-1.5"
            >
              <span>🤖</span>
              <span>GenMonev</span>
            </Link>
            <Link
              href="/notulen"
              className="text-xs font-bold px-4 py-1.5 rounded-full text-white bg-primary-600 hover:bg-primary-700 shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <span>📝</span>
              <span>GenNotulis</span>
              <span>→</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* =========================================================================
          HERO SECTION (Centered Content Framing)
          ========================================================================= */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-12 md:pt-16 pb-20 text-center">
        
        {/* Floating Badges (Visible on medium/large screens) */}
        <div className="hidden md:flex absolute top-12 -left-16 liquid-glass-badge rounded-2xl p-3 items-center gap-3 animate-float-slow shadow-md border border-white/90">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg shadow-inner">
            🤖
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-surface-900">Monev Kemnaker</div>
            <div className="text-[0.7rem] text-surface-500">Min. 100 Karakter Lolos</div>
          </div>
        </div>

        <div className="hidden md:flex absolute top-12 -right-16 liquid-glass-badge rounded-2xl p-3 items-center gap-3 animate-float-alt shadow-md border border-white/90">
          <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-lg shadow-inner">
            🎙️
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-surface-900">Notulensi Rapat</div>
            <div className="text-[0.7rem] text-surface-500">Audio / Video ke Notulen</div>
          </div>
        </div>

        {/* Top Trust & Rating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-emerald-200/80 shadow-sm mb-6 text-xs font-semibold text-surface-700">
          <span className="flex text-amber-500 text-xs tracking-wider">★★★★★</span>
          <span className="font-bold text-primary-900">4.9/5 Rating</span>
          <span className="text-surface-300">•</span>
          <span>Dipercaya 1,500+ Mahasiswa & Peserta Magang di Indonesia</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-surface-900 leading-[1.12]">
          Platform AI All-in-One untuk{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-primary-600 inline-block">
            Anak Magang
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-surface-600 max-w-2xl mx-auto leading-relaxed">
          Selesaikan 2 beban terbesar anak magang dalam hitungan detik: pengisian laporan <strong>Monev harian MagangHub Kemnaker</strong> dan perumusan <strong>notulensi rapat korporat resmi</strong> dengan bantuan AI Gemini.
        </p>

        {/* =========================================================================
            THE 2 MAIN ACTION BUTTONS (Hero Core Options)
            ========================================================================= */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch justify-center gap-4 max-w-xl mx-auto">
          
          {/* Button 1: Mobogen (Monev) */}
          <Link
            href="/monev"
            className="flex-1 group bg-white/90 hover:bg-white p-4 rounded-2xl flex items-center gap-3.5 border-2 border-emerald-500/30 hover:border-emerald-500 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-primary-600 text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform shrink-0">
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

          {/* Button 2: Notugen (Notulensi) */}
          <Link
            href="/notulen"
            className="flex-1 group bg-white/90 hover:bg-white p-4 rounded-2xl flex items-center gap-3.5 border-2 border-primary-500/30 hover:border-primary-600 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform shrink-0">
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
            INTERACTIVE DUAL-SUITE SHOWCASE CARD (Inspired by CryptoCalc reference)
            ========================================================================= */}
        <section className="mt-12 w-full text-left">
          <div className="bg-white/95 rounded-3xl p-5 sm:p-7 shadow-xl border border-surface-200/80">
            
            {/* Top Switcher Tabs */}
            <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-surface-200 gap-3">
              <div className="flex items-center gap-2 p-1 bg-surface-100 rounded-xl w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("monev")}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "monev"
                      ? "bg-white text-emerald-800 shadow-sm"
                      : "text-surface-600 hover:text-surface-900"
                  }`}
                >
                  <span>🤖</span>
                  <span>Simulasi GenMonev</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("notulen")}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === "notulen"
                      ? "bg-white text-primary-800 shadow-sm"
                      : "text-surface-600 hover:text-surface-900"
                  }`}
                >
                  <span>📝</span>
                  <span>Simulasi GenNotulis</span>
                </button>
              </div>

              <Link
                href={activeTab === "monev" ? "/monev" : "/notulen"}
                className="text-xs font-bold text-primary-700 hover:text-primary-900 flex items-center gap-1 transition-colors"
              >
                <span>Buka Modul {activeTab === "monev" ? "GenMonev" : "GenNotulis"} Lengkap</span>
                <span>→</span>
              </Link>
            </div>

            {/* Showcase Tab 1: GenMonev Simulation */}
            {activeTab === "monev" && (
              <div className="pt-5 space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-900">1. Uraian Aktivitas (Otomatis &gt; 100 Karakter)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      184 / 100 Karakter (Lolos Validasi ✓)
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-surface-700 leading-relaxed font-mono bg-white p-3 rounded-lg border border-emerald-100">
                    Hari ini melaksanakan analisis kebutuhan fungsional modul pembayaran, menghadiri sesi koordinasi berkala bersama tim pengembang, serta melakukan pengujian verifikasi data transaksi pada lingkungan staging guna memastikan kelancaran integrasi sistem.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-surface-800">2. Pembelajaran</span>
                      <span className="text-[10px] font-bold text-emerald-700">142 Karakter ✓</span>
                    </div>
                    <p className="text-xs text-surface-600 line-clamp-2">
                      Memahami alur verifikasi payload token OAuth2 dan pentingnya kepatuhan SLA dalam penanganan tiket temuan uji fungsional perbankan.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-surface-800">3. Kendala &amp; Solusi</span>
                      <span className="text-[10px] font-bold text-emerald-700">118 Karakter ✓</span>
                    </div>
                    <p className="text-xs text-surface-600 line-clamp-2">
                      Menemukan keterlambatan respon server pada modul staging yang berhasil diatasi melalui penyesuaian parameter query bersama tim mentor.
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-surface-500">
                    💡 Terintegrasi langsung dengan login SIAPkerja Kemnaker ID untuk auto-submit harian.
                  </span>
                  <Link
                    href="/monev"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    <span>Generate Laporan Monev Anda Sekarang</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Showcase Tab 2: GenNotulis Simulation */}
            {activeTab === "notulen" && (
              <div className="pt-5 space-y-4">
                <div className="p-4 rounded-xl bg-primary-50/50 border border-primary-200/60 space-y-3">
                  <div className="flex items-center justify-between border-b border-primary-200/50 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-primary-600 text-white">BNI Standard</span>
                      <span className="text-xs font-bold text-primary-900">NOTULEN KOORDINASI TEKNIS &amp; RILIS PROYEK</span>
                    </div>
                    <span className="text-xs text-primary-700 font-medium">Rabu, 21 Oktober 2026</span>
                  </div>

                  <div className="space-y-2 text-xs text-surface-700">
                    <div>
                      <strong className="text-surface-900 block mb-1">Keputusan Utama:</strong>
                      <ul className="list-disc list-inside space-y-1 text-surface-600 pl-1">
                        <li>Uji fungsional (UAT) modul transaksi disetujui untuk dilaksanakan bersama unit kerja.</li>
                        <li>Freeze code dijadwalkan mulai Jumat pukul 18.00 WIB guna persiapan migrasi.</li>
                      </ul>
                    </div>

                    <div className="pt-1">
                      <strong className="text-surface-900 block mb-1">Tindak Lanjut / Action Items:</strong>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-primary-100">
                          <input type="checkbox" checked readOnly className="accent-primary-600" />
                          <span className="text-xs text-surface-800">Tim Dev: Tuntaskan integrasi API (28 Okt)</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-primary-100">
                          <input type="checkbox" readOnly className="accent-primary-600" />
                          <span className="text-xs text-surface-800">Tim QA: Verifikasi kestabilan staging (30 Okt)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-surface-500">
                    🎙️ Mendukung transkrip teks, rekam suara via mikrofon langsung, dan upload rekaman video Zoom/Teams.
                  </span>
                  <Link
                    href="/notulen"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md transition-colors"
                  >
                    <span>Buka Arsip &amp; Generator Notulen</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* =========================================================================
            FEATURE HIGHLIGHTS (3 Value Pillars)
            ========================================================================= */}
        <section className="mt-16 text-center">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-2">
            Dirancang Khusus Anak Magang
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900">
            Kenapa Harus GenMagang?
          </h2>
          <p className="mt-2 text-sm text-surface-600 max-w-lg mx-auto">
            Dua produk yang mengatasi rutinitas paling menguras waktu selama masa magang Anda.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8 text-left">
            <div className="p-6 rounded-2xl bg-white border border-surface-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-4">
                ⏱️
              </div>
              <h3 className="text-base font-bold text-surface-900 mb-1.5">Hemat 1-2 Jam Tiap Hari</h3>
              <p className="text-xs text-surface-600 leading-relaxed">
                Tidak perlu lagi memeras otak merangkai kata demi memenuhi batas minimal 100 karakter Monev, atau begadang mengetik ulang hasil rapat seharian.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-surface-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl mb-4">
                🏛️
              </div>
              <h3 className="text-base font-bold text-surface-900 mb-1.5">Standar Formal Korporat</h3>
              <p className="text-xs text-surface-600 leading-relaxed">
                Setiap laporan dan notulensi diformulasikan dengan bahasa formal profesional standar instansi BUMN dan kementerian pemerintah.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-surface-200/80 shadow-sm hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-4">
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

      {/* Footer */}
      <footer className="border-t border-surface-200/60 bg-white/60 py-6 text-center text-xs text-surface-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
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
