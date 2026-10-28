"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function GenMagangLanding() {
  const [activeTab, setActiveTab] = useState<"monev" | "notulen">("monev");

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-surface-900 font-sans selection:bg-slate-900 selection:text-white">
      
      {/* =========================================================================
          WAYPILOT CANVAS & ULTRA-SMOOTH AMBIENT ATMOSPHERE
          Soft Lavender on Left + Warm Lemon Yellow on Right + Crisp Dot Grid Pattern
          ========================================================================= */}
      {/* Ambient Glows Layer (Behind dots) */}
      <div className="ambient-glow-lavender" aria-hidden="true" />
      <div className="ambient-glow-yellow" aria-hidden="true" />
      <div className="ambient-glow-center" aria-hidden="true" />

      {/* Prominent Dot Grid Canvas & Orbital Track Arch (On top of glows) */}
      <div className="waypilot-canvas" aria-hidden="true" />
      <div className="orbital-track-arch" aria-hidden="true" />

      {/* =========================================================================
          NAVIGATION BAR (Fixed Floating Pill - Always visible when scrolled)
          ========================================================================= */}
      <header className="fixed top-5 left-0 right-0 z-50 px-4 w-full max-w-5xl mx-auto pointer-events-none">
        <nav className="liquid-glass-pill rounded-full px-5 py-2.5 flex items-center justify-between shadow-lg border border-white/85 pointer-events-auto">
          
          {/* Left: Brand Logo & Status Tag */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <i className="mdi mdi-school text-xl" />
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
                <i className="mdi mdi-check-decagram text-emerald-500 text-sm" />
                Platform Asisten Magang #1
              </span>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/monev"
              className="text-xs font-bold px-4 py-2 rounded-full text-slate-800 bg-white/75 hover:bg-white border border-slate-200/70 shadow-sm hover:shadow-md transition-all flex items-center gap-1.5"
            >
              <i className="mdi mdi-calendar-check-outline text-emerald-600 text-sm" />
              <span>GenMonev</span>
            </Link>

            <Link
              href="/notulen"
              className="text-xs font-bold px-4 py-2 rounded-full text-white bg-slate-900 hover:bg-black shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 group"
            >
              <i className="mdi mdi-file-document-edit-outline text-sm" />
              <span>GenNotulis</span>
              <i className="mdi mdi-arrow-right text-xs group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </nav>
      </header>

      {/* =========================================================================
          HERO SECTION (Padding adjusted for fixed floating navbar)
          ========================================================================= */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 pt-24 sm:pt-28 md:pt-32 pb-20 text-center">
        
        {/* Hero Title (H1) - With Inline Squircle MDI Icon */}
        <h1 className="tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.08] mb-6">
          <span className="font-extrabold text-5xl sm:text-6xl md:text-7xl block">
            AI Agents F
            <span className="inline-flex items-center justify-center align-middle mx-1 w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-950 text-white shadow-md border border-white/20 -translate-y-1">
              <i className="mdi mdi-lightning-bolt text-blue-400 text-xl sm:text-2xl" />
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

        {/* Dual Action Buttons - Both with right arrow (→) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
          <Link
            href="/monev"
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
          >
            <i className="mdi mdi-calendar-clock-outline text-emerald-600 text-base" />
            <span>Buka GenMonev Kemnaker</span>
            <i className="mdi mdi-arrow-right text-xs group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/notulen"
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-slate-900 hover:bg-black text-white font-bold text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
          >
            <i className="mdi mdi-notebook-edit-outline text-base" />
            <span>Buka GenNotulis Rapat</span>
            <i className="mdi mdi-arrow-right text-xs group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* =========================================================================
            CORE INTERACTIVE SIMULATOR (Semi-Glassmorphic Frosted Card)
            Refined transparency so ambient glows & dots gently shimmer through
            ========================================================================= */}
        <div id="simulator" className="max-w-3xl mx-auto text-left scroll-mt-28">
          <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/85 shadow-2xl relative">
            
            {/* Top Bar: Module Switcher Tabs & Direct Link */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/50 pb-5">
              <div className="flex items-center gap-2 bg-slate-200/40 backdrop-blur-md p-1.5 rounded-2xl w-fit border border-white/60">
                <button
                  type="button"
                  onClick={() => setActiveTab("monev")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "monev"
                      ? "bg-white/90 text-slate-900 shadow-xs border border-white/80"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <i className={`mdi mdi-robot-outline text-sm ${activeTab === "monev" ? "text-emerald-600" : "text-slate-400"}`} />
                  <span>Simulasi GenMonev</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("notulen")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === "notulen"
                      ? "bg-white/90 text-slate-900 shadow-xs border border-white/80"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <i className={`mdi mdi-file-document-edit-outline text-sm ${activeTab === "notulen" ? "text-blue-600" : "text-slate-400"}`} />
                  <span>Simulasi GenNotulis</span>
                </button>
              </div>

              {/* Direct Module Link (Right Arrow) */}
              <div>
                {activeTab === "monev" ? (
                  <Link
                    href="/monev"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Buka Modul GenMonev Lengkap</span>
                    <i className="mdi mdi-arrow-right text-xs" />
                  </Link>
                ) : (
                  <Link
                    href="/notulen"
                    className="text-xs font-bold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Buka Modul GenNotulis Lengkap</span>
                    <i className="mdi mdi-arrow-right text-xs" />
                  </Link>
                )}
              </div>
            </div>

            {/* TAB 1: OUTPUT PRATINJAU GENMONEV */}
            {activeTab === "monev" && (
              <div className="pt-5 space-y-4 animate-fade-in">
                
                {/* 1. Uraian Aktivitas (Semi-Glassmorphic) */}
                <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                      <i className="mdi mdi-clipboard-text-outline text-emerald-600 text-sm" />
                      1. URAIAN AKTIVITAS
                    </span>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <i className="mdi mdi-check-circle text-emerald-600 text-xs" />
                      <span>184 / 100 Karakter (Lolos Validasi ✓)</span>
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                    Melaksanakan verifikasi dan pengujian fungsional modul otentikasi pengguna pada environment staging, menyusun dokumentasi integrasi API, serta berkoordinasi bersama tim mentor teknis terkait standarisasi arsitektur data.
                  </p>
                </div>

                {/* 2 & 3. Sub-Output Dual Column (Semi-Glassmorphic) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 2. Pembelajaran */}
                  <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-2xs">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <i className="mdi mdi-lightbulb-on-outline text-amber-500 text-sm" />
                        2. Pembelajaran yang Didapat
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <i className="mdi mdi-check text-emerald-600 text-xs" />
                        142 Karakter
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Memahami implementasi OAuth2.0 dan manajemen session token yang aman, serta tata cara penanganan edge case saat terjadi request timeout pada API.
                    </p>
                  </div>

                  {/* 3. Kendala & Solusi */}
                  <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-2xs">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <i className="mdi mdi-wrench-clock-outline text-blue-600 text-sm" />
                        3. Kendala &amp; Solusi Praktis
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50/90 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <i className="mdi mdi-check text-emerald-600 text-xs" />
                        118 Karakter
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Menemukan keterlambatan respon server pada modul staging yang berhasil diatasi melalui penyesuaian parameter query bersama tim mentor.
                    </p>
                  </div>
                </div>

                {/* Bottom Bar Simulator */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/50 mt-3">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <i className="mdi mdi-shield-lock-outline text-emerald-600 text-sm" />
                    Terintegrasi langsung dengan login SIAPkerja Kemnaker ID untuk auto-submit harian.
                  </span>
                  <Link
                    href="/monev"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all shrink-0"
                  >
                    <i className="mdi mdi-auto-fix text-xs" />
                    <span>Generate Laporan Monev Sekarang</span>
                    <i className="mdi mdi-arrow-right text-xs" />
                  </Link>
                </div>
              </div>
            )}

            {/* TAB 2: OUTPUT PRATINJAU GENNOTULIS */}
            {activeTab === "notulen" && (
              <div className="pt-5 space-y-4 animate-fade-in">
                <div className="p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                      <i className="mdi mdi-account-group text-blue-600 text-sm" />
                      NOTULEN RAPAT KORPORAT RESMI (STANDAR BNI)
                    </span>
                    <span className="text-[11px] font-bold text-blue-800 bg-blue-50/90 border border-blue-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <i className="mdi mdi-file-check-outline text-blue-600 text-xs" />
                      <span>Dokumen Siap Cetak &amp; PDF ✓</span>
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-xs text-slate-800">
                    <div className="p-2.5 bg-white/60 rounded-xl border border-white/70 flex items-start gap-2">
                      <i className="mdi mdi-bookmark-outline text-slate-400 text-sm mt-0.5 shrink-0" />
                      <div>
                        <strong>Topik Bahasan:</strong> Sinkronisasi API Payment Gateway &amp; Timeline UAT Staging
                      </div>
                    </div>

                    <div>
                      <strong className="text-slate-900 flex items-center gap-1.5 font-bold mb-1">
                        <i className="mdi mdi-gavel text-amber-600 text-sm" />
                        Keputusan Utama:
                      </strong>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                        <li>Uji fungsional (UAT) modul transaksi disetujui untuk dilaksanakan bersama unit kerja terkait.</li>
                        <li>Freeze code dijadwalkan mulai Jumat pukul 18.00 WIB guna persiapan migrasi database staging.</li>
                      </ul>
                    </div>

                    <div className="pt-1">
                      <strong className="text-slate-900 flex items-center gap-1.5 font-bold mb-1.5">
                        <i className="mdi mdi-checkbox-marked-circle-outline text-blue-600 text-sm" />
                        Tindak Lanjut / Action Items:
                      </strong>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 p-2 bg-white/75 rounded-xl border border-white/80 text-xs text-slate-800">
                          <i className="mdi mdi-checkbox-marked text-blue-600 text-sm" />
                          <span>Tim Dev: Tuntaskan integrasi API (28 Okt)</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white/75 rounded-xl border border-white/80 text-xs text-slate-800">
                          <i className="mdi mdi-checkbox-blank-outline text-slate-400 text-sm" />
                          <span>Tim QA: Verifikasi kestabilan staging (30 Okt)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200/50 mt-3">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <i className="mdi mdi-microphone-outline text-blue-600 text-sm" />
                    Mendukung transkrip teks, rekam suara via mikrofon langsung, dan upload rekaman video Zoom/Teams.
                  </span>
                  <Link
                    href="/notulen"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all shrink-0"
                  >
                    <i className="mdi mdi-notebook-edit-outline text-xs" />
                    <span>Buka Generator Notulen Sekarang</span>
                    <i className="mdi mdi-arrow-right text-xs" />
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* =========================================================================
            VALUE PROPOSITION SECTION (3 Minimalist Cards with MDI Icons)
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
            <div className="p-6 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/90 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center text-xl mb-4 shadow-xs">
                <i className="mdi mdi-timer-sand-complete text-2xl text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Hemat 1-2 Jam Tiap Hari</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tidak perlu lagi memeras otak merangkai kata demi memenuhi batas minimal 100 karakter Monev, atau begadang mengetik ulang hasil rapat.
              </p>
            </div>

            {/* Card 2: Standar Formal Korporat */}
            <div className="p-6 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/90 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-xl mb-4 shadow-xs">
                <i className="mdi mdi-domain text-2xl text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Standar Formal Korporat</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Setiap laporan dan notulensi diformulasikan dengan tata bahasa formal profesional standar instansi BUMN dan kementerian pemerintah.
              </p>
            </div>

            {/* Card 3: Aman & Terenkripsi Client-Side */}
            <div className="p-6 rounded-3xl bg-white/75 backdrop-blur-xl border border-white/90 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center text-xl mb-4 shadow-xs">
                <i className="mdi mdi-shield-key-outline text-2xl text-amber-600" />
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
          MINIMALIST CLEAN FOOTER WITH MDI ICONS
          ========================================================================= */}
      <footer className="relative z-10 border-t border-slate-200/70 bg-white/70 backdrop-blur-md py-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span><strong>GenMagang</strong> — Asisten AI Andalan Anak Magang Indonesia</span>
          <div className="flex items-center gap-4 text-blue-700 font-semibold">
            <Link href="/monev" className="hover:underline flex items-center gap-1">
              <i className="mdi mdi-calendar-check-outline text-xs" />
              <span>GenMonev (Kemnaker)</span>
            </Link>
            <Link href="/notulen" className="hover:underline flex items-center gap-1">
              <i className="mdi mdi-file-document-edit-outline text-xs" />
              <span>GenNotulis (Rapat)</span>
            </Link>
            <a href="https://github.com/kkevinsm/GenMagang" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              <i className="mdi mdi-github text-xs" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
