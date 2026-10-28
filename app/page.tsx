"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function GenMagangLanding() {
  const [activeTab, setActiveTab] = useState<"monev" | "notulen" | "actions" | "archive">("monev");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-surface-900 font-sans selection:bg-slate-900 selection:text-white">
      
      {/* =========================================================================
          WAYPILOT CANVAS & AMBIENT ATMOSPHERE
          Dot grid pattern with ethereal lavender (top-left) & warm lemon (top-right) glows
          ========================================================================= */}
      <div className="waypilot-canvas" aria-hidden="true" />
      <div className="ambient-glow-lavender" aria-hidden="true" />
      <div className="ambient-glow-yellow" aria-hidden="true" />
      <div className="orbital-track-arch" aria-hidden="true" />

      {/* =========================================================================
          HEADER / NAVBAR (Sleek Dark Floating Pill Inspired by WayPilot Screenshot 1)
          ========================================================================= */}
      <header className="sticky top-5 z-50 px-4 w-full max-w-xl mx-auto">
        <nav className="glass-dark-nav rounded-2xl px-5 py-3 flex items-center justify-between shadow-2xl">
          
          {/* Left: WayPilot-style Squircle Logo Icon */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 flex items-center justify-center text-white shadow-md border border-white/20 group-hover:scale-105 transition-transform">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <span className="font-extrabold text-[1.1rem] tracking-tight text-white">
              Gen<span className="text-blue-400">Magang</span>
            </span>
          </Link>

          {/* Center: Desktop Navigation Links */}
          <div className="hidden sm:flex items-center gap-5 text-xs font-semibold text-slate-300">
            <Link href="/monev" className="hover:text-white transition-colors">
              GenMonev
            </Link>
            <Link href="/notulen" className="hover:text-white transition-colors">
              GenNotulis
            </Link>
            <a href="#simulator" className="hover:text-white transition-colors">
              Simulasi
            </a>
            <a href="#security" className="hover:text-white transition-colors">
              Keamanan
            </a>
          </div>

          {/* Right: Hamburger / Action Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex flex-col items-center justify-center gap-1 text-white transition-colors sm:hidden"
              aria-label="Toggle menu"
            >
              <span className="w-4 h-0.5 bg-white rounded-full" />
              <span className="w-4 h-0.5 bg-white rounded-full" />
            </button>

            <Link
              href="/monev"
              className="hidden sm:inline-flex text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
            >
              Mulai ↗
            </Link>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mt-2 glass-dark-nav rounded-2xl p-4 flex flex-col gap-2.5 text-xs font-bold text-slate-200 sm:hidden animate-scale-in">
            <Link href="/monev" className="p-2 rounded-lg hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>
              🤖 GenMonev (Kemnaker MagangHub)
            </Link>
            <Link href="/notulen" className="p-2 rounded-lg hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>
              📝 GenNotulis (Notulen Rapat Korporat)
            </Link>
            <a href="#simulator" className="p-2 rounded-lg hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>
              ⚡ Live Simulator
            </a>
            <a href="#security" className="p-2 rounded-lg hover:bg-white/10" onClick={() => setMobileMenuOpen(false)}>
              🔒 Keamanan &amp; Privasi Data
            </a>
          </div>
        )}
      </header>

      {/* =========================================================================
          HERO SECTION (Matching WayPilot Screenshot 1)
          ========================================================================= */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-12 md:pt-16 pb-20 text-center">
        
        {/* Top Floating Badge: Backed by / Integrasi Terpercaya */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-sm mb-7 hover:shadow transition-shadow">
          <span className="text-slate-500 font-medium">Didukung oleh</span>
          <span className="inline-flex items-center gap-1 font-bold text-slate-900">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center">✦</span>
            Gemini 1.5 Pro
          </span>
          <span className="text-slate-300">|</span>
          <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Kemnaker SIAPkerja
          </span>
        </div>

        {/* Hero Title (H1) - Iconic WayPilot Headline with Inline Squircle & Italic Serif */}
        <h1 className="tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.08] mb-6">
          <span className="font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-[78px] text-slate-900 block">
            AI Agents F
            <span className="inline-flex items-center justify-center align-middle mx-1 w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-slate-950 text-white shadow-lg border border-white/20 -translate-y-1">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </span>
            r
          </span>
          <span className="font-bold text-5xl sm:text-6xl md:text-7xl lg:text-[78px] text-slate-900 block mt-1">
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
        <p className="text-base sm:text-lg text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed mb-8">
          Formulasi laporan <strong>Monev harian MagangHub Kemnaker</strong> otomatis &amp; perumusan <strong>notulensi rapat korporat resmi</strong> dengan AI Gemini dalam hitungan detik.
        </p>

        {/* Dual Action Buttons (Matching WayPilot: See the Agents & Book Demo ↗) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
          <Link
            href="/monev"
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200/90 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
          >
            <span>Buka GenMonev</span>
          </Link>
          <Link
            href="/notulen"
            className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#0b0f17] hover:bg-black text-white font-semibold text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
          >
            <span>Buka GenNotulis</span>
            <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-xs">↗</span>
          </Link>
        </div>

        {/* =========================================================================
            FLOATING CARDS & APP SQUIRCLE FAN (Matching WayPilot Screenshot 1)
            ========================================================================= */}
        <div className="relative max-w-4xl mx-auto my-8">
          
          {/* Left Tilted Ghost Card: 100% Lolos Validasi */}
          <div className="absolute -left-6 sm:left-2 -top-10 z-10 hidden md:block transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <div className="w-52 p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-lg text-left">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kemnaker Validasi</div>
              <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                100% Lolos 100 Karakter
              </div>
              <div className="mt-2 text-[11px] text-slate-500 leading-snug">
                Auto-submit tanpa khawatir kena tolak mentor.
              </div>
            </div>
          </div>

          {/* Right Tilted Ghost Card: Format Standar Resmi */}
          <div className="absolute -right-6 sm:right-2 -top-10 z-10 hidden md:block transform rotate-6 hover:rotate-0 transition-transform duration-300">
            <div className="w-52 p-4 rounded-2xl bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-lg text-left">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Standar BUMN / BNI</div>
              <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Notulen Siap Cetak PDF
              </div>
              <div className="mt-2 text-[11px] text-slate-500 leading-snug">
                Agenda, keputusan &amp; PIC tindak lanjut rapi.
              </div>
            </div>
          </div>

          {/* Center Fan of 5 Floating Integration Squircles (Directly from WayPilot Screenshot 1) */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 pt-4 pb-2">
            
            {/* Squircle 1: Kemnaker */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center text-xl hover:-translate-y-1 transition-transform group" title="Kemnaker SIAPkerja">
              <span className="group-hover:scale-110 transition-transform">🏢</span>
            </div>

            {/* Squircle 2: Gemini AI */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center text-xl hover:-translate-y-1 transition-transform group" title="Google Gemini 1.5 Pro">
              <span className="group-hover:scale-110 transition-transform">✦</span>
            </div>

            {/* Squircle 3: Central Highlighted App (GenMagang Core) */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white shadow-lg border border-white/40 flex items-center justify-center text-2xl -translate-y-1 hover:-translate-y-2 transition-transform" title="GenMagang Engine">
              <span>⚡</span>
            </div>

            {/* Squircle 4: MS Teams / Zoom */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center text-xl hover:-translate-y-1 transition-transform group" title="Zoom & MS Teams">
              <span className="group-hover:scale-110 transition-transform">🎙️</span>
            </div>

            {/* Squircle 5: PDF / Docs */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center text-xl hover:-translate-y-1 transition-transform group" title="Google Docs & PDF">
              <span className="group-hover:scale-110 transition-transform">📄</span>
            </div>

          </div>
        </div>

        {/* =========================================================================
            INTERACTIVE AGENT SHOWCASE CARD (Matching WayPilot Screenshot 2)
            Two-panel layout: Left interactive preview session + Right dark analytics card
            ========================================================================= */}
        <section id="simulator" className="mt-20 scroll-mt-24 text-left">
          
          <div className="glass-panel-card rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            
            {/* Top Bar inside Card: Title + Module Tab Switchers */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/70 pb-5">
              
              {/* Left Title */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-950 text-white flex items-center justify-center text-sm font-bold shadow-xs">
                  ⚡
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Meet your AI Magang Assistant
                </h3>
              </div>

              {/* Right Horizontal Tab Pills */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/60 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("monev")}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === "monev"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/70 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>GenMonev Kemnaker</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("notulen")}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === "notulen"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/70 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>GenNotulis Rapat</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("actions")}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === "actions"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/70 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Action Items</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("archive")}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === "archive"
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/70 font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>Audit / Log</span>
                </button>
              </div>

            </div>

            {/* Split Screen Body: Left Interactive Session & Right Dark Analytics Box */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-stretch">
              
              {/* LEFT PANEL: Interactive Activity & AI Report Output (Col 7) */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                
                {/* Agent Header Profile */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        GM
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">GenMonev AI Engine</div>
                      <div className="text-xs text-slate-500">Kemnaker MagangHub Formulator • Indonesia</div>
                    </div>
                  </div>

                  {/* Top Right Mini Utility Icons (Matching WayPilot Call & Video Icons) */}
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:text-slate-800 transition-colors" title="Simulasi Voice Note">
                      🎙️
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center hover:text-slate-800 transition-colors" title="Export PDF">
                      📄
                    </div>
                  </div>
                </div>

                {/* Status Pill Badge (Matching Transcript - Carlos Hernández • $580 USD) */}
                <div className="w-fit">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs">
                    <span>⚡ Formulasi Laporan Hari Ke-42</span>
                    <span>•</span>
                    <span>184 Karakter (Lolos Validasi ✓)</span>
                  </span>
                </div>

                {/* Structured Output Cards */}
                <div className="space-y-3">
                  
                  {/* Item 1: Uraian Aktivitas */}
                  <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/70 text-xs">
                    <div className="font-bold text-slate-900 uppercase tracking-wide text-[10px] text-slate-400 mb-1">
                      1. Uraian Aktivitas (184 Karakter)
                    </div>
                    <p className="text-slate-800 leading-relaxed">
                      Melaksanakan verifikasi dan pengujian fungsional modul otentikasi pengguna pada environment staging, menyusun dokumentasi integrasi API, serta berkoordinasi bersama tim mentor teknis.
                    </p>
                  </div>

                  {/* Dual Grid: Pembelajaran & Kendala */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70 text-xs">
                      <div className="font-bold text-[10px] text-slate-400 uppercase mb-1">
                        2. Pembelajaran (142 Karakter)
                      </div>
                      <p className="text-slate-700 leading-relaxed text-[11px]">
                        Memahami implementasi OAuth2.0 dan manajemen session token yang aman pada API arsitektur.
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70 text-xs">
                      <div className="font-bold text-[10px] text-slate-400 uppercase mb-1">
                        3. Kendala &amp; Solusi (118 Karakter)
                      </div>
                      <p className="text-slate-700 leading-relaxed text-[11px]">
                        Mengatasi latency respon server pada staging melalui penyesuaian parameter query bersama mentor.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Bottom Action in Left Panel */}
                <div className="pt-2">
                  <Link
                    href="/monev"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all"
                  >
                    <span>Generate Laporan Monev Anda Sekarang</span>
                    <span>→</span>
                  </Link>
                </div>

              </div>

              {/* RIGHT PANEL: Dark Metrics & Call History Box (Col 5, Matching WayPilot Screenshot 2) */}
              <div className="lg:col-span-5 bg-[#0B0F17] text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                
                {/* Header Row */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <div className="font-extrabold text-sm tracking-tight text-white">Call History &amp; Logs</div>
                    <div className="text-[11px] text-slate-400">Latest automated interactions</div>
                  </div>
                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    <span>🔄 Repeat</span>
                  </button>
                </div>

                {/* Star / Dot Matrix Performance Visualizer (Directly from WayPilot Screenshot 2) */}
                <div className="my-5 p-4 rounded-xl bg-white/[0.04] border border-white/10">
                  
                  {/* Columns of Colored Star Dots */}
                  <div className="grid grid-cols-4 gap-2 mb-4 h-20 items-end justify-items-center">
                    
                    {/* Col 1: Agreement Rate (White/Slate Stars) */}
                    <div className="flex flex-col gap-1 items-center">
                      <span className="dot-star bg-slate-200" />
                      <span className="dot-star bg-slate-300" />
                      <span className="dot-star bg-slate-400" />
                      <span className="dot-star bg-slate-500" />
                    </div>

                    {/* Col 2: Promises Kept (Amber Stars) */}
                    <div className="flex flex-col gap-1 items-center">
                      <span className="dot-star bg-amber-400" />
                      <span className="dot-star bg-amber-400" />
                      <span className="dot-star bg-amber-500" />
                      <span className="dot-star bg-amber-600" />
                      <span className="dot-star bg-amber-600" />
                    </div>

                    {/* Col 3: Satisfaction (Red/Rose Stars) */}
                    <div className="flex flex-col gap-1 items-center">
                      <span className="dot-star bg-rose-400" />
                      <span className="dot-star bg-rose-500" />
                      <span className="dot-star bg-rose-600" />
                    </div>

                    {/* Col 4: Completion (Emerald Stars) */}
                    <div className="flex flex-col gap-1 items-center">
                      <span className="dot-star bg-emerald-400" />
                      <span className="dot-star bg-emerald-400" />
                      <span className="dot-star bg-emerald-500" />
                      <span className="dot-star bg-emerald-500" />
                      <span className="dot-star bg-emerald-600" />
                    </div>

                  </div>

                  {/* Legend Labels */}
                  <div className="flex items-center justify-between text-[10px] text-slate-300 font-medium">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" /> Validasi Karakter
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Standar BUMN
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Auto-Sync
                    </span>
                  </div>

                </div>

                {/* Recent Items with Status Pills (Matching Carlos Hernandez, Luisa Martinez, Roberto Gomez) */}
                <div className="space-y-2.5 text-xs">
                  
                  {/* Row 1 */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                    <div>
                      <div className="font-bold text-white text-[11px]">Monev Hari Ke-42</div>
                      <div className="text-[10px] text-slate-400">184 Karakter • Auto-submit</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      Successful ✓
                    </span>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                    <div>
                      <div className="font-bold text-white text-[11px]">Notulen Sprint Release 3</div>
                      <div className="text-[10px] text-slate-400">4 Action Items • Standar BNI</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      Successful ✓
                    </span>
                  </div>

                  {/* Row 3 */}
                  <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                    <div>
                      <div className="font-bold text-white text-[11px]">Monev Hari Ke-41</div>
                      <div className="text-[10px] text-slate-400">Sinkronisasi SIAPkerja ID</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                      Follow-Up ⚙
                    </span>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =========================================================================
            SECURITY AND COMPLIANCE SECTION (Matching WayPilot Screenshot 3)
            Headline with inline squircle + Frosted prompt card + Inline prose paragraph
            ========================================================================= */}
        <section id="security" className="mt-28 scroll-mt-24 text-center">
          
          {/* Section Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight text-center mb-8">
            Security And{" "}
            <span className="inline-flex items-center justify-center align-middle mx-1 w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-950 text-white shadow-md border border-white/20 -translate-y-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>{" "}
            Compliance,{" "}
            <span
              className="italic font-serif font-normal text-slate-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Built In
            </span>
          </h2>

          {/* Frosted Prompt / Status Card in Center (Matching WayPilot Screenshot 3) */}
          <div className="glass-panel-card rounded-3xl p-5 sm:p-6 max-w-xl mx-auto mb-10 text-left shadow-xl">
            
            {/* Top Row: Left SOC 2 status + Right Powered by GPT / Gemini */}
            <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100 mb-3">
              <span className="flex items-center gap-1.5 font-bold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                AES-256 Client Storage • Zero Leak
              </span>
              <span className="flex items-center gap-1 font-semibold text-blue-600">
                <span>✦</span> Powered by Gemini 1.5 Pro
              </span>
            </div>

            {/* Input Placeholder Prompt */}
            <div className="py-4 text-slate-400 font-sans text-xs sm:text-sm">
              <span className="text-blue-600 font-bold mr-1">|</span>
              Tanyakan sesuatu, paste catatan rapat, atau minta generate ringkasan...
            </div>

            {/* Bottom Toolbar */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>🧮</span>
                  <span>Hitung Karakter</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Bicara</span>
                <div className="w-7 h-7 rounded-full bg-slate-950 text-white flex items-center justify-center text-xs shadow-xs">
                  ●
                </div>
              </div>
            </div>

          </div>

          {/* Highlighted Rich Prose Paragraph with Inline Badges (Directly from WayPilot Screenshot 3) */}
          <p className="text-base sm:text-xl md:text-2xl text-slate-800 font-medium max-w-3xl mx-auto leading-relaxed text-center px-4">
            <strong className="text-slate-950">GenMagang</strong>{" "}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold align-middle">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              SIAPkerja
            </span>{" "}
            dirancang khusus untuk standar instansi kementerian &amp; korporat BUMN.{" "}
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-900 text-white text-xs align-middle">
              🔒
            </span>{" "}
            Keamanan data dan privasi kredensial bukan sekadar fitur tambahan — mereka adalah fondasi inti{" "}
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs align-middle">
              ⚡
            </span>{" "}
            di mana seluruh otomatisasi laporan magang{" "}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-900 text-white text-xs align-middle">
              🛡️ Terenkripsi
            </span>{" "}
            berjalan tanpa pernah bocor ke server pihak ketiga.
          </p>

        </section>

        {/* =========================================================================
            CALL TO ACTION SECTION (Matching WayPilot Screenshot 4)
            "Ready to give your team Superpowers?"
            ========================================================================= */}
        <section className="mt-28 text-center">
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight text-center mb-4 leading-tight">
            Siap Menjadikan Masa Magangmu<br />
            <span
              className="italic font-serif font-normal text-slate-900"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Super{" "}
            </span>
            <span className="inline-flex items-center justify-center align-middle mx-1 w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-950 text-white shadow-md border border-white/20 -translate-y-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </span>
            <span
              className="italic font-serif font-normal text-slate-900 ml-1"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              powers?
            </span>
          </h2>

          <p className="text-base text-slate-600 max-w-lg mx-auto mb-8 leading-relaxed">
            Selesaikan seluruh laporan Monev Kemnaker dan notulensi rapat korporat Anda hari ini dengan presisi tingkat tinggi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/monev"
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200/90 shadow-sm hover:shadow transition-all"
            >
              Buka GenMonev
            </Link>
            <Link
              href="/notulen"
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#0b0f17] hover:bg-black text-white font-semibold text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
            >
              <span>Buka GenNotulis</span>
              <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-xs">↗</span>
            </Link>
          </div>

        </section>

      </main>

      {/* =========================================================================
          DARK FOOTER (Matching WayPilot Screenshot 4)
          Deep dark background (#0B0F17) with 4-column link layout & social squircles
          ========================================================================= */}
      <footer className="relative z-10 bg-[#0B0F17] text-slate-300 rounded-t-[36px] sm:rounded-t-[48px] pt-16 pb-12 px-6 sm:px-12 border-t border-white/10 mt-16">
        
        <div className="max-w-6xl mx-auto">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-white/10 text-xs">
            
            {/* Column 1: Company */}
            <div>
              <div className="font-extrabold text-white uppercase tracking-wider mb-3 text-[11px]">
                Produk
              </div>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/monev" className="hover:text-white transition-colors">GenMonev (Kemnaker)</Link></li>
                <li><Link href="/notulen" className="hover:text-white transition-colors">GenNotulis (Rapat)</Link></li>
                <li><a href="#simulator" className="hover:text-white transition-colors">Live Simulator</a></li>
                <li><a href="#security" className="hover:text-white transition-colors">Keamanan Data</a></li>
              </ul>
            </div>

            {/* Column 2: About us */}
            <div>
              <div className="font-extrabold text-white uppercase tracking-wider mb-3 text-[11px]">
                Bantuan
              </div>
              <ul className="space-y-2 text-slate-400">
                <li><a href="https://maganghub.kemnaker.go.id" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Panduan MagangHub</a></li>
                <li><Link href="/monev" className="hover:text-white transition-colors">Validasi 100 Karakter</Link></li>
                <li><Link href="/notulen" className="hover:text-white transition-colors">Format Notulen BNI</Link></li>
                <li><a href="https://github.com/kkevinsm/GenMagang" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Dokumentasi GitHub</a></li>
              </ul>
            </div>

            {/* Column 3: Service */}
            <div>
              <div className="font-extrabold text-white uppercase tracking-wider mb-3 text-[11px]">
                Layanan
              </div>
              <ul className="space-y-2 text-slate-400">
                <li><span className="text-slate-400">Otomatisasi Laporan</span></li>
                <li><span className="text-slate-400">Transkrip Audio Voice Note</span></li>
                <li><span className="text-slate-400">Ekspor Presisi PDF</span></li>
                <li><span className="text-slate-400">Gemini 1.5 Pro AI</span></li>
              </ul>
            </div>

            {/* Column 4: Follow us with 4 White Squircles */}
            <div>
              <div className="font-extrabold text-white uppercase tracking-wider mb-3 text-[11px]">
                Ikuti Kami
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com/kkevinsm/GenMagang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white text-slate-900 flex items-center justify-center font-bold hover:scale-105 transition-transform shadow-xs"
                  title="GitHub"
                >
                  🐙
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white text-slate-900 flex items-center justify-center font-bold hover:scale-105 transition-transform shadow-xs"
                  title="Website"
                >
                  🔗
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white text-slate-900 flex items-center justify-center font-bold hover:scale-105 transition-transform shadow-xs"
                  title="Twitter / X"
                >
                  𝕏
                </a>
                <a
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white text-slate-900 flex items-center justify-center font-bold hover:scale-105 transition-transform shadow-xs"
                  title="LinkedIn"
                >
                  in
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Copyright & Brand Note */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <span>© 2026 <strong>GenMagang</strong> — Asisten AI Andalan Anak Magang Indonesia.</span>
            <span>All rights reserved. Powered by Google Gemini.</span>
          </div>

        </div>

      </footer>

    </div>
  );
}
