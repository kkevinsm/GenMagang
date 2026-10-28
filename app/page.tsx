"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function GenMagangLanding() {
  const [activeTab, setActiveTab] = useState<"monev" | "notulen">("monev");

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-surface-900 font-sans selection:bg-blue-600 selection:text-white">
      
      {/* =========================================================================
          BACKGROUND ATMOSPHERE: NATURAL BLUE SKY & WILDFLOWER MEADOW
          (Directly inspired by the Maxon reference: crisp blue sky and vibrant green hills)
          ========================================================================= */}
      <div className="bg-landscape-canvas" aria-hidden="true">
        <div className="bg-landscape-overlay" />
      </div>

      {/* =========================================================================
          4.1. NAVIGATION BAR (Clean, Airy Glass Header Inspired by Maxon Reference)
          ========================================================================= */}
      <header className="sticky top-4 z-50 px-4 sm:px-8 w-full max-w-6xl mx-auto">
        <nav className="liquid-glass-pill rounded-full px-5 sm:px-6 py-2.5 flex items-center justify-between shadow-lg border border-white/85">
          
          {/* Left: Brand Logo & Platform Tag */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[1.15rem] tracking-tight leading-none text-surface-900">
                  Gen<span className="text-blue-600">Magang</span>
                </span>
                <span className="text-[0.6rem] text-surface-500 font-bold tracking-wider uppercase">ALL-IN-ONE SUITE</span>
              </div>
            </Link>

            {/* Status Badge Tag */}
            <div className="hidden lg:flex items-center ml-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/75 text-emerald-800 border border-emerald-200/60 text-xs font-semibold shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Platform Asisten Magang #1
              </span>
            </div>
          </div>

          {/* Center: Navigation Links (Matching Maxon reference layout) */}
          <div className="hidden md:flex items-center gap-6 text-xs font-bold text-surface-700">
            <a href="#simulator" className="hover:text-blue-600 transition-colors">Pratinjau</a>
            <Link href="/monev" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <span>GenMonev</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">Kemnaker</span>
            </Link>
            <Link href="/notulen" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <span>GenNotulis</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-bold">Rapat</span>
            </Link>
            <a href="#keunggulan" className="hover:text-blue-600 transition-colors">Keunggulan</a>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/monev"
              className="hidden sm:inline-flex text-xs font-bold px-3.5 py-1.5 rounded-full text-surface-800 bg-white/70 hover:bg-white border border-white/90 shadow-xs hover:shadow transition-all items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>GenMonev</span>
            </Link>

            <Link
              href="/notulen"
              className="text-xs font-bold px-4 py-1.5 rounded-full text-white bg-surface-900 hover:bg-black shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 group"
            >
              <span>GenNotulis</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* =========================================================================
          HERO SECTION & CONTENT CONTAINER
          ========================================================================= */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 pt-10 md:pt-14 pb-24 text-center">
        
        {/* Floating Tag Atas (Styled exactly like the Maxon top pill) */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 backdrop-blur-md border border-blue-400/25 text-blue-900 text-xs font-mono font-medium tracking-wider uppercase shadow-xs mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-[0.72rem] text-blue-900 font-bold">
            AI AGENTS UNTUK ANAK MAGANG — ON AUTOPILOT
          </span>
        </div>

        {/* 4.2. H1 Title - Upright Bold Serif Line 1 + Italic Bold Serif Line 2 (Matching Maxon reference) */}
        <h1 className="tracking-tight text-surface-900 max-w-4xl mx-auto leading-[1.06] mb-5">
          <span
            className="font-serif font-bold text-5xl sm:text-6xl md:text-7xl lg:text-[76px] text-surface-900 block"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Platform AI All-in-One untuk
          </span>
          <span
            className="font-serif italic font-bold text-5xl sm:text-6xl md:text-7xl lg:text-[76px] text-blue-600 block mt-1"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Anak Magang.
          </span>
        </h1>

        {/* 4.2. Subheadline */}
        <p className="text-base sm:text-lg text-surface-700 font-medium max-w-2xl mx-auto leading-relaxed mb-7">
          Selesaikan 2 beban terbesar anak magang dalam hitungan detik: pengisian laporan <strong>Monev harian MagangHub Kemnaker</strong> dan perumusan <strong>notulensi rapat korporat resmi</strong> dengan bantuan AI Gemini.
        </p>

        {/* =========================================================================
            FLOATING BADGES (Desktop Gutters - ZERO overlap with center cards)
            Placed in wide margins with clear spacing to match the Maxon reference aesthetic
            ========================================================================= */}
        {/* Left Badge 1: 🔒 Non-custodial */}
        <div className="fixed left-6 2xl:left-14 top-[280px] z-20 hidden xl:flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/75 backdrop-blur-xl border border-white/90 shadow-md text-xs font-semibold text-surface-800 animate-float-slow select-none pointer-events-none">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Non-custodial / Aman &amp; Terenkripsi</span>
        </div>

        {/* Left Badge 2: ⚡ Lolos Validasi */}
        <div className="fixed left-8 2xl:left-16 top-[460px] z-20 hidden xl:flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/75 backdrop-blur-xl border border-emerald-200/90 shadow-md text-xs font-semibold text-emerald-900 animate-float-alt select-none pointer-events-none">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span>Lolos Validasi 100 Karakter</span>
        </div>

        {/* Right Badge: ⏱ Selesai dalam 3 Detik */}
        <div className="fixed right-6 2xl:right-14 top-[320px] z-20 hidden xl:flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/75 backdrop-blur-xl border border-white/90 shadow-md text-xs font-semibold text-surface-800 animate-float-slow select-none pointer-events-none">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Selesai dalam 3 Detik</span>
        </div>

        {/* =========================================================================
            4.3. DUAL ACTION CARDS (KARTU AKSES CEPAT)
            Sleek Frosted Glass Cards directly linking to GenMonev and GenNotulis
            ========================================================================= */}
        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 max-w-xl mx-auto mb-7">
          
          {/* Card Left: Buka GenMonev */}
          <Link
            href="/monev"
            className="flex-1 group bg-white/85 hover:bg-white backdrop-blur-xl p-4 rounded-2xl flex items-center gap-3.5 border border-emerald-500/20 hover:border-emerald-500/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
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

          {/* Card Right: Buka GenNotulis */}
          <Link
            href="/notulen"
            className="flex-1 group bg-white/85 hover:bg-white backdrop-blur-xl p-4 rounded-2xl flex items-center gap-3.5 border border-blue-500/20 hover:border-blue-600/50 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform shrink-0">
              📝
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="text-base font-extrabold text-surface-900 group-hover:text-blue-700 transition-colors">
                Buka GenNotulis
              </div>
              <div className="text-xs text-surface-500 truncate">
                Notulen Rapat &amp; Action Items
              </div>
            </div>
            <div className="text-blue-600 font-bold text-xl group-hover:translate-x-1 transition-transform pr-1">
              →
            </div>
          </Link>

        </div>

        {/* =========================================================================
            4.5. INTERACTIVE SIMULATOR MODULE (Pristine White Floating Glass Card)
            ========================================================================= */}
        <div id="simulator" className="max-w-3xl mx-auto scroll-mt-24">
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 text-left transition-all border border-white shadow-2xl relative">
            
            {/* Top Bar: Module Switcher Tabs & Live Direct Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200/70 pb-5">
              <div className="flex items-center gap-2 bg-surface-100/90 p-1.5 rounded-2xl w-fit border border-surface-200/50">
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

              {/* Direct Link */}
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
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Buka Modul GenNotulis Lengkap</span>
                    <span>→</span>
                  </Link>
                )}
              </div>
            </div>

            {/* TAB 1: OUTPUT PRATINJAU GENMONEV */}
            {activeTab === "monev" && (
              <div className="pt-5 space-y-4 animate-fade-in">
                
                {/* 1. Uraian Aktivitas */}
                <div className="p-4 rounded-2xl bg-white/95 border border-surface-200/80 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-surface-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      1. URAIAN AKTIVITAS
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span>●</span>
                      <span>184 / 100 Karakter (Lolos Validasi ✓)</span>
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-surface-800 leading-relaxed font-sans">
                    Melaksanakan verifikasi dan pengujian fungsional modul otentikasi pengguna pada environment staging, menyusun dokumentasi integrasi API, serta berkoordinasi bersama tim mentor teknis terkait standarisasi arsitektur data.
                  </p>
                </div>

                {/* 2 & 3. Sub-Output Dual Column */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 2. Pembelajaran */}
                  <div className="p-4 rounded-2xl bg-white/95 border border-surface-200/80 shadow-xs">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-extrabold text-surface-900">
                        2. Pembelajaran yang Didapat
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                        142 Karakter ✓
                      </span>
                    </div>
                    <p className="text-xs text-surface-700 leading-relaxed">
                      Memahami implementasi OAuth2.0 dan manajemen session token yang aman, serta tata cara penanganan edge case saat terjadi request timeout pada API.
                    </p>
                  </div>

                  {/* 3. Kendala & Solusi */}
                  <div className="p-4 rounded-2xl bg-white/95 border border-surface-200/80 shadow-xs">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-extrabold text-surface-900">
                        3. Kendala &amp; Solusi Praktis
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                        118 Karakter ✓
                      </span>
                    </div>
                    <p className="text-xs text-surface-700 leading-relaxed">
                      Menemukan keterlambatan respon server pada modul staging yang berhasil diatasi melalui penyesuaian parameter query bersama tim mentor.
                    </p>
                  </div>
                </div>

                {/* Bottom Bar Simulator */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-surface-200/60 mt-3">
                  <span className="text-xs text-surface-500">
                    🔒 Terintegrasi langsung dengan login SIAPkerja Kemnaker ID untuk auto-submit harian.
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

            {/* TAB 2: OUTPUT PRATINJAU GENNOTULIS */}
            {activeTab === "notulen" && (
              <div className="pt-5 space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-white/95 border border-surface-200/80 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-surface-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      NOTULEN RAPAT KORPORAT RESMI (STANDAR BNI)
                    </span>
                    <span className="text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
                      Dokumen Siap Cetak &amp; PDF ✓
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-xs text-surface-800">
                    <div className="p-2.5 bg-surface-50 rounded-xl border border-surface-200/60">
                      <strong>Topik Bahasan:</strong> Sinkronisasi API Payment Gateway &amp; Timeline UAT Staging
                    </div>

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
                          <input type="checkbox" defaultChecked readOnly className="accent-blue-600 rounded" />
                          <span>Tim Dev: Tuntaskan integrasi API (28 Okt)</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-surface-200/80 text-xs text-surface-800">
                          <input type="checkbox" readOnly className="accent-blue-600 rounded" />
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
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all shrink-0"
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
            DUAL MAIN ACTION BUTTONS (DIRECTLY INSPIRED BY THE MAXON REFERENCE SCREENSHOT)
            [ Build an Agent ] -> [ Buka GenMonev Kemnaker ] (Dark Solid Pill #0f172a)
            [ Watch 2-min demo ] -> [ Buka GenNotulis Rapat ] (Vibrant Blue Pill #2563eb)
            ========================================================================= */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/monev"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0f172a] hover:bg-black text-white font-bold text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Buka GenMonev Kemnaker</span>
            <span>→</span>
          </Link>
          <Link
            href="/notulen"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="text-xs">▶</span>
            <span>Buka GenNotulis Rapat</span>
          </Link>
        </div>

        {/* =========================================================================
            4.6. VALUE PROPOSITION SECTION ("Kenapa Harus GenMagang?")
            ========================================================================= */}
        <section id="keunggulan" className="mt-24 text-center scroll-mt-24">
          <span className="text-xs font-bold text-blue-900 uppercase tracking-widest block mb-2 px-3 py-1 rounded-full bg-white/80 border border-blue-200/70 w-fit mx-auto shadow-xs">
            DIRANCANG KHUSUS ANAK MAGANG
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
            Kenapa Harus GenMagang?
          </h2>
          <p className="mt-2 text-sm text-surface-600 max-w-lg mx-auto leading-relaxed">
            Dua modul kecerdasan buatan yang mengotomatisasi rutinitas paling menguras waktu selama masa magang Anda.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8 text-left">
            {/* Card 1: Hemat 1-2 Jam */}
            <div className="p-7 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/95 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-2xl mb-4 shadow-xs">
                ⏱️
              </div>
              <h3 className="text-base font-bold text-surface-900 mb-1.5">Hemat 1-2 Jam Tiap Hari</h3>
              <p className="text-xs text-surface-600 leading-relaxed">
                Tidak perlu lagi memeras otak merangkai kata demi memenuhi batas minimal 100 karakter Monev, atau begadang mengetik ulang hasil rapat seharian.
              </p>
            </div>

            {/* Card 2: Standar Formal Korporat */}
            <div className="p-7 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/95 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-2xl mb-4 shadow-xs">
                🏛️
              </div>
              <h3 className="text-base font-bold text-surface-900 mb-1.5">Standar Formal Korporat</h3>
              <p className="text-xs text-surface-600 leading-relaxed">
                Setiap laporan dan notulensi diformulasikan dengan bahasa formal profesional standar instansi BUMN dan kementerian pemerintah.
              </p>
            </div>

            {/* Card 3: Aman & Terenkripsi */}
            <div className="p-7 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/95 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
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
      <footer className="relative z-10 border-t border-white/60 bg-white/75 backdrop-blur-md py-6 text-center text-xs text-surface-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span><strong>GenMagang</strong> — Asisten AI Andalan Anak Magang Indonesia</span>
          <div className="flex items-center gap-4 text-blue-700 font-semibold">
            <Link href="/monev" className="hover:underline">GenMonev (Kemnaker)</Link>
            <Link href="/notulen" className="hover:underline">GenNotulis (Rapat)</Link>
            <a href="https://github.com/kkevinsm/GenMagang" target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
