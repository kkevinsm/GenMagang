"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function GenMagangLanding() {
  const [activeTab, setActiveTab] = useState<"monev" | "notulen">("monev");

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-surface-900 font-sans selection:bg-slate-900 selection:text-white">
      
      {/* =========================================================================
          WAYPILOT MINIMALIST CANVAS & AMBIENT ATMOSPHERE
          Crisp dot grid with subtle, ethereal lavender & warm lemon pastel glows
          ========================================================================= */}
      <div className="waypilot-canvas" aria-hidden="true" />
      <div className="ambient-glow-lavender" aria-hidden="true" />
      <div className="ambient-glow-yellow" aria-hidden="true" />

      {/* =========================================================================
          NAVIGATION BAR (Bentuk Lama - Pills Capsule)
          Floating pill with brand logo, status badge, and direct action buttons
          ========================================================================= */}
      <header className="sticky top-5 z-50 px-4 w-full max-w-5xl mx-auto">
        <nav className="liquid-glass-pill rounded-full px-5 py-2.5 flex items-center justify-between shadow-lg border border-white/85">
          
          {/* Left: Brand Logo & Status Tag */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="font-extrabold text-[1.15rem] tracking-tight leading-none text-slate-900">
                  Gen<span className="text-blue-600">Magang</span>
                </span>
                <span className="text-[0.6rem] text-slate-400 font-bold tracking-wider uppercase">ALL-IN-ONE SUITE</span>
              </div>
            </Link>

            {/* Status Badge Tag */}
            <div className="hidden md:flex items-center ml-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-emerald-800 border border-emerald-200/70 text-xs font-semibold shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Platform Asisten Magang #1
              </span>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/monev"
              className="text-xs font-bold px-4 py-2 rounded-full text-slate-800 bg-white/75 hover:bg-white border border-slate-200/70 shadow-xs hover:shadow transition-all flex items-center gap-1.5"
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
              className="text-xs font-bold px-4 py-2 rounded-full text-white bg-slate-900 hover:bg-black shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 group"
            >
              <span>GenNotulis</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* =========================================================================
          HERO SECTION (Super Minimalist, Focused & Modern)
          ========================================================================= */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 pt-12 md:pt-16 pb-20 text-center">
        
        {/* Top Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-slate-200/80 text-xs font-semibold text-slate-700 shadow-2xs mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          <span className="font-bold text-slate-900">Didukung oleh Gemini 1.5 Pro</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-800 font-bold">Kemnaker SIAPkerja</span>
        </div>

        {/* Hero Title (H1) - New Design Typography with Inline Squircle & Italic Serif */}
        <h1 className="tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.08] mb-6">
          <span className="font-extrabold text-5xl sm:text-6xl md:text-7xl block">
            AI Agents F
            <span className="inline-flex items-center justify-center align-middle mx-1 w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-950 text-white shadow-md border border-white/20 -translate-y-1">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </span>
            r
          </span>
          <span className="font-bold text-5xl sm:text-6xl md:text-7xl block mt-1">
            Aktivitas{" "}
            <span
              className="italic font-serif font-normal text-slate-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Magang
            </span>
          </span>
        </h1>

        {/* Hero Subheadline */}
        <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed mb-8">
          Selesaikan 2 beban terbesar anak magang dalam hitungan detik: pengisian laporan <strong>Monev harian MagangHub Kemnaker</strong> dan perumusan <strong>notulensi rapat korporat resmi</strong>.
        </p>

        {/* Dual Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
          <Link
            href="/monev"
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200/90 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
          >
            <span>Buka GenMonev Kemnaker</span>
            <span>→</span>
          </Link>
          <Link
            href="/notulen"
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
          >
            <span>Buka GenNotulis Rapat</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>

        {/* =========================================================================
            CORE INTERACTIVE SIMULATOR (Pristine Frosted Glass Showcase)
            ========================================================================= */}
        <div id="simulator" className="max-w-3xl mx-auto text-left scroll-mt-24">
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/95 shadow-2xl relative">
            
            {/* Top Bar: Module Switcher Tabs & Direct Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/70 pb-5">
              <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl w-fit border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => setActiveTab("monev")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "monev"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900"
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
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>📝</span>
                  <span>Simulasi GenNotulis</span>
                </button>
              </div>

              {/* Direct Module Link */}
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
                <div className="p-4 rounded-2xl bg-white/95 border border-slate-200/80 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      1. URAIAN AKTIVITAS
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span>●</span>
                      <span>184 / 100 Karakter (Lolos Validasi ✓)</span>
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                    Melaksanakan verifikasi dan pengujian fungsional modul otentikasi pengguna pada environment staging, menyusun dokumentasi integrasi API, serta berkoordinasi bersama tim mentor teknis terkait standarisasi arsitektur data.
                  </p>
                </div>

                {/* 2 & 3. Sub-Output Dual Column */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 2. Pembelajaran */}
                  <div className="p-4 rounded-2xl bg-white/95 border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-extrabold text-slate-900">
                        2. Pembelajaran yang Didapat
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                        142 Karakter ✓
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Memahami implementasi OAuth2.0 dan manajemen session token yang aman, serta tata cara penanganan edge case saat terjadi request timeout pada API.
                    </p>
                  </div>

                  {/* 3. Kendala & Solusi */}
                  <div className="p-4 rounded-2xl bg-white/95 border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-extrabold text-slate-900">
                        3. Kendala &amp; Solusi Praktis
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                        118 Karakter ✓
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Menemukan keterlambatan respon server pada modul staging yang berhasil diatasi melalui penyesuaian parameter query bersama tim mentor.
                    </p>
                  </div>
                </div>

                {/* Bottom Bar Simulator */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/60 mt-3">
                  <span className="text-xs text-slate-500">
                    🔒 Terintegrasi langsung dengan login SIAPkerja Kemnaker ID untuk auto-submit harian.
                  </span>
                  <Link
                    href="/monev"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all shrink-0"
                  >
                    <span>Generate Laporan Monev Sekarang</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            )}

            {/* TAB 2: OUTPUT PRATINJAU GENNOTULIS */}
            {activeTab === "notulen" && (
              <div className="pt-5 space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-white/95 border border-slate-200/80 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      NOTULEN RAPAT KORPORAT RESMI (STANDAR BNI)
                    </span>
                    <span className="text-[11px] font-bold text-blue-800 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full">
                      Dokumen Siap Cetak &amp; PDF ✓
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-xs text-slate-800">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                      <strong>Topik Bahasan:</strong> Sinkronisasi API Payment Gateway &amp; Timeline UAT Staging
                    </div>

                    <div>
                      <strong className="text-slate-900 block font-bold mb-1">Keputusan Utama:</strong>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                        <li>Uji fungsional (UAT) modul transaksi disetujui untuk dilaksanakan bersama unit kerja terkait.</li>
                        <li>Freeze code dijadwalkan mulai Jumat pukul 18.00 WIB guna persiapan migrasi database staging.</li>
                      </ul>
                    </div>

                    <div className="pt-1">
                      <strong className="text-slate-900 block font-bold mb-1.5">Tindak Lanjut / Action Items:</strong>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-800">
                          <input type="checkbox" defaultChecked readOnly className="accent-blue-600 rounded" />
                          <span>Tim Dev: Tuntaskan integrasi API (28 Okt)</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-800">
                          <input type="checkbox" readOnly className="accent-blue-600 rounded" />
                          <span>Tim QA: Verifikasi kestabilan staging (30 Okt)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/60 mt-3">
                  <span className="text-xs text-slate-500">
                    🎙️ Mendukung transkrip teks, rekam suara via mikrofon langsung, dan upload rekaman video Zoom/Teams.
                  </span>
                  <Link
                    href="/notulen"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all shrink-0"
                  >
                    <span>Buka Generator Notulen Sekarang</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* =========================================================================
            VALUE PROPOSITION SECTION (3 Minimalist Cards)
            ========================================================================= */}
        <section className="mt-20 text-center">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-widest block mb-2 px-3 py-1 rounded-full bg-white/80 border border-slate-200/70 w-fit mx-auto shadow-2xs">
            DIRANCANG KHUSUS ANAK MAGANG
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kenapa Harus GenMagang?
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Dua modul kecerdasan buatan yang mengotomatisasi rutinitas paling menguras waktu selama masa magang Anda.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8 text-left">
            {/* Card 1: Hemat 1-2 Jam */}
            <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/95 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xl mb-4 shadow-xs">
                ⏱️
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Hemat 1-2 Jam Tiap Hari</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tidak perlu lagi memeras otak merangkai kata demi memenuhi batas minimal 100 karakter Monev, atau begadang mengetik ulang hasil rapat.
              </p>
            </div>

            {/* Card 2: Standar Formal Korporat */}
            <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/95 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-xl mb-4 shadow-xs">
                🏛️
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Standar Formal Korporat</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Setiap laporan dan notulensi diformulasikan dengan tata bahasa formal profesional standar instansi BUMN dan kementerian pemerintah.
              </p>
            </div>

            {/* Card 3: Aman & Terenkripsi Client-Side */}
            <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-white/95 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-xl mb-4 shadow-xs">
                🔒
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Aman &amp; Client-Side</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kredensial disimpan dengan standar enkripsi AES-256 lokal di browser Anda. Token SIAPkerja tidak pernah disimpan di server publik.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* =========================================================================
          MINIMALIST CLEAN FOOTER
          ========================================================================= */}
      <footer className="relative z-10 border-t border-slate-200/70 bg-white/70 backdrop-blur-md py-6 text-center text-xs text-slate-500">
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
