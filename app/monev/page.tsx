"use client";

import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Status =
  | "Hadir"
  | "Tidak Hadir Dengan Keterangan"
  | "Tidak Hadir Tanpa Keterangan";

interface GeneratedReport {
  uraian_aktivitas?: string;
  pembelajaran?: string;
  kendala?: string;
  alasan_tidak_hadir?: string;
  model?: string;
}

interface KemnakerUser {
  id?: string | number;
  name?: string;
  email?: string;
  phone?: string;
  nik?: string;
  [key: string]: unknown;
}

const STATUS_MAP: Record<Status, "PRESENT" | "ON_LEAVE" | "ABSENT"> = {
  Hadir: "PRESENT",
  "Tidak Hadir Dengan Keterangan": "ON_LEAVE",
  "Tidak Hadir Tanpa Keterangan": "ABSENT",
};

// ─── Quick Activity Presets ──────────────────────────────────────────────────
const QUICK_PRESETS = [
  {
    icon: "🚀",
    label: "Frontend Dev",
    text: `- Mengerjakan slicing UI komponen dashboard dan navigasi responsif
- Integrasi API endpoint verifikasi data dan penanganan state error
- Memperbaiki bug styling pada tampilan layar mobile dan tablet
- Melakukan code review dan pull request bersama mentor pembimbing`,
  },
  {
    icon: "⚙️",
    label: "Backend & API",
    text: `- Merancang endpoint REST API baru untuk modul otorisasi pengguna
- Melakukan optimasi query database PostgreSQL pada tabel transaksi
- Menulis unit testing untuk service layer guna memastikan stabilitas
- Diskusi arsitektur dan penyesuaian payload bersama tim pengembang`,
  },
  {
    icon: "🧪",
    label: "QA & Testing",
    text: `- Menjalankan skenario regression testing pada fitur rilis terbaru
- Mencatat dan mendokumentasikan temuan bug pada issue tracker proyek
- Verifikasi hasil perbaikan bug di lingkungan staging bersama developer
- Menyusun test case checklist untuk validasi kelayakan deployment`,
  },
  {
    icon: "🎨",
    label: "UI/UX Design",
    text: `- Melakukan eksplorasi wireframe dan high-fidelity prototype di Figma
- Mengaudit kepatuhan design system dan konsistensi warna komponen
- Mengikuti sesi evaluasi desain bersama lead designer dan product owner
- Menyiapkan asset export dan dokumentasi handoff untuk tim engineer`,
  },
  {
    icon: "🤝",
    label: "Daily Standup",
    text: `- Mengikuti daily standup meeting tim untuk menyampaikan progress tugas
- Koordinasi teknis dengan mentor terkait kendala integrasi dependensi
- Membantu rekan tim dalam penyelesaian error konfigurasi environment
- Merangkum catatan tindak lanjut dan target penyelesaian sprint hari ini`,
  },
];

// ─── Helper Functions ────────────────────────────────────────────────────────
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return true;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload.exp === "number") {
      return payload.exp * 1000 < Date.now();
    }
    return false;
  } catch {
    return false;
  }
}

function getWibDateString(): string {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset(); // in minutes
  // WIB is UTC+7 (420 minutes)
  const wibTime = new Date(d.getTime() + (420 + tzOffset) * 60000);
  return wibTime.toISOString().split("T")[0];
}

// ─── Helper Components ───────────────────────────────────────────────────────
function CharBadge({ count, min = 100 }: { count: number; min?: number }) {
  const isValid = count >= min;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all duration-300 ${
        isValid
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : "bg-amber-50 text-amber-700 border border-amber-200"
      }`}
    >
      <i
        className={`mdi ${
          isValid
            ? "mdi-check-circle text-xs font-bold text-emerald-600"
            : "mdi-alert-circle-outline text-xs text-amber-600"
        }`}
      />
      <span>
        {count}/{min} {isValid ? "✓ Lolos" : "Kurang"}
      </span>
    </span>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!text}
      title={`Salin ${label}`}
      className="p-1.5 rounded-lg transition-all duration-200 hover:bg-surface-100 disabled:opacity-30 disabled:cursor-not-allowed group cursor-pointer"
    >
      <i
        className={`mdi ${
          copied
            ? "mdi-check text-emerald-600 animate-bounce-in"
            : "mdi-content-copy text-surface-400 group-hover:text-surface-700"
        } text-base transition-colors`}
      />
    </button>
  );
}

function ReportSection({
  title,
  icon,
  content,
  onEdit,
  colorClass,
  placeholder,
}: {
  title: string;
  icon: React.ReactNode;
  content: string;
  onEdit: (val: string) => void;
  colorClass: string;
  placeholder?: string;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/90 shadow-2xs transition-all hover:border-slate-300">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-xl ${colorClass}`}>{icon}</span>
          <h3 className="text-xs sm:text-sm font-bold text-slate-800">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <CharBadge count={content.length} />
          <CopyButton text={content} label={title} />
        </div>
      </div>
      <textarea
        value={content}
        onChange={(e) => onEdit(e.target.value)}
        rows={4}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200/80 bg-white/70 text-xs sm:text-sm text-slate-800 leading-relaxed resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 focus:bg-white hover:border-slate-300 placeholder:text-slate-400 font-sans shadow-inner"
        placeholder={placeholder || `${title} akan muncul di sini setelah di-generate...`}
      />
      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-0.5">
        <span>Ketentuan Kemnaker: Minimal 100 karakter</span>
        <span className={content.length >= 100 ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
          {content.length >= 100 ? "✓ Memenuhi syarat" : `Sisa ${100 - content.length} karakter`}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function GenMonevDashboard() {
  const [status, setStatus] = useState<Status>("Hadir");
  const [aktivitas, setAktivitas] = useState("");
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [copyAllDone, setCopyAllDone] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // ─── Kemnaker Auth & Submit State ───
  const [kemnakerToken, setKemnakerToken] = useState("");
  const [kemnakerUser, setKemnakerUser] = useState<KemnakerUser | null>(null);
  const [showKemnakerModal, setShowKemnakerModal] = useState(false);
  const [kemnakerUsername, setKemnakerUsername] = useState("");
  const [kemnakerPassword, setKemnakerPassword] = useState("");
  const [showKemnakerPassword, setShowKemnakerPassword] = useState(false);
  const [kemnakerLoginLoading, setKemnakerLoginLoading] = useState(false);
  const [kemnakerLoginError, setKemnakerLoginError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ ok: boolean; msg: string } | null>(null);

  // Load saved data from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem("monev_api_key");
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setApiKeyInput(savedApiKey);
    }

    try {
      const savedToken = localStorage.getItem("kemnaker_monev_token");
      if (savedToken) {
        if (isTokenExpired(savedToken)) {
          localStorage.removeItem("kemnaker_monev_token");
          localStorage.removeItem("kemnaker_monev_user");
        } else {
          setKemnakerToken(savedToken);
          const savedUser = localStorage.getItem("kemnaker_monev_user");
          if (savedUser) {
            setKemnakerUser(JSON.parse(savedUser));
          }
        }
      }
    } catch {
      // ignore JSON parse errors
    }
  }, []);

  // Reset report and validation when status changes
  const handleStatusChange = (newStatus: Status) => {
    setStatus(newStatus);
    setReport(null);
    setError("");
    setSubmitResult(null);
  };

  // Live clock (WIB)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Jakarta",
        })
      );
      setCurrentDate(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "Asia/Jakarta",
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem("monev_api_key", apiKeyInput.trim());
      setApiKey(apiKeyInput.trim());
    } else {
      localStorage.removeItem("monev_api_key");
      setApiKey("");
    }
    setShowApiKeyModal(false);
  };

  const handleKemnakerLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!kemnakerUsername.trim() || !kemnakerPassword) {
      setKemnakerLoginError("Email / No. HP / NIK dan password wajib diisi.");
      return;
    }

    setKemnakerLoginLoading(true);
    setKemnakerLoginError("");

    try {
      const res = await fetch("/api/kemnaker/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: kemnakerUsername.trim(),
          password: kemnakerPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.access_token) {
        throw new Error(data?.error || `Login gagal (HTTP ${res.status}).`);
      }

      setKemnakerToken(data.access_token);
      setKemnakerUser(data.user || null);
      localStorage.setItem("kemnaker_monev_token", data.access_token);
      if (data.user) {
        localStorage.setItem("kemnaker_monev_user", JSON.stringify(data.user));
      }

      setKemnakerPassword("");
      setShowKemnakerModal(false);
      setSubmitResult(null);
    } catch (err: unknown) {
      setKemnakerLoginError(err instanceof Error ? err.message : "Login gagal.");
    } finally {
      setKemnakerLoginLoading(false);
    }
  };

  const handleKemnakerLogout = () => {
    setKemnakerToken("");
    setKemnakerUser(null);
    localStorage.removeItem("kemnaker_monev_token");
    localStorage.removeItem("kemnaker_monev_user");
    setSubmitResult(null);
  };

  const handleGenerate = useCallback(async () => {
    if (!aktivitas.trim()) return;

    setLoading(true);
    setError("");
    setSubmitResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          aktivitas: aktivitas.trim(),
          customApiKey: apiKey || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menghasilkan laporan.");
      }

      setReport(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [aktivitas, status, apiKey]);

  const handleSubmitToMonev = async () => {
    if (!kemnakerToken) {
      setKemnakerLoginError("");
      setShowKemnakerModal(true);
      return;
    }

    if (!isConfirmed) {
      setSubmitResult({
        ok: false,
        msg: "Harap centang pernyataan peninjauan isian laporan terlebih dahulu sebelum mengirim.",
      });
      return;
    }

    const kemnakerStatus = STATUS_MAP[status];

    // Validation for Hadir
    if (kemnakerStatus === "PRESENT") {
      if (!report) {
        setSubmitResult({
          ok: false,
          msg: "Generate laporan terlebih dahulu sebelum mengirim ke Monev.",
        });
        return;
      }
      const shortFields: string[] = [];
      if ((report.uraian_aktivitas || "").trim().length < 100) {
        shortFields.push("Uraian Aktivitas");
      }
      if ((report.pembelajaran || "").trim().length < 100) {
        shortFields.push("Pembelajaran yang Diperoleh");
      }
      if ((report.kendala || "").trim().length < 100) {
        shortFields.push("Kendala yang Dialami");
      }

      if (shortFields.length > 0) {
        setSubmitResult({
          ok: false,
          msg: `Sistem Monev mensyaratkan minimal 100 karakter untuk: ${shortFields.join(
            ", "
          )}. Perpanjang isian Anda lalu coba kirim kembali.`,
        });
        return;
      }
    }

    // Validation for Tidak Hadir Dengan Keterangan
    if (kemnakerStatus === "ON_LEAVE") {
      const reason = (report?.alasan_tidak_hadir || aktivitas).trim();
      if (reason.length < 100) {
        setSubmitResult({
          ok: false,
          msg: "Sistem Monev mensyaratkan minimal 100 karakter untuk Alasan Tidak Hadir. Silakan lengkapi alasan Anda.",
        });
        return;
      }
    }

    setSubmitLoading(true);
    setSubmitResult(null);

    const wibDate = getWibDateString();

    try {
      const payloadData: {
        date: string;
        status: "PRESENT" | "ON_LEAVE" | "ABSENT";
        activity_log?: string;
        lesson_learned?: string;
        obstacles?: string;
        leave_reason?: string;
        participant_id?: string | number;
      } = {
        date: wibDate,
        status: kemnakerStatus,
        participant_id: kemnakerUser?.id,
      };

      if (kemnakerStatus === "PRESENT" && report) {
        payloadData.activity_log = report.uraian_aktivitas || "";
        payloadData.lesson_learned = report.pembelajaran || "";
        payloadData.obstacles = report.kendala || "";
      } else if (kemnakerStatus === "ON_LEAVE") {
        const leaveText = (report?.alasan_tidak_hadir || aktivitas).trim();
        payloadData.leave_reason = leaveText;
        payloadData.activity_log = leaveText;
      }

      const res = await fetch("/api/kemnaker/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: kemnakerToken,
          payload: payloadData,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 401) {
        handleKemnakerLogout();
        throw new Error(
          data?.error || "Sesi Monev telah berakhir atau token kedaluwarsa. Silakan login ulang."
        );
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Pengiriman gagal (HTTP ${res.status}).`);
      }

      setSubmitResult({
        ok: true,
        msg: `Laporan kehadiran "${status}" berhasil tercatat di Monev Kemnaker untuk tanggal ${wibDate}.`,
      });
    } catch (err: unknown) {
      setSubmitResult({
        ok: false,
        msg: err instanceof Error ? err.message : "Pengiriman absensi gagal.",
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCopyAll = async () => {
    if (!report) return;
    let fullText = "";
    if (status === "Hadir") {
      fullText = `Uraian Aktivitas:
${report.uraian_aktivitas || ""}

Pembelajaran yang Diperoleh:
${
        report.pembelajaran || ""
      }

Kendala yang Dialami:
${report.kendala || ""}`;
    } else if (status === "Tidak Hadir Dengan Keterangan") {
      fullText = `Alasan Tidak Hadir:
${report.alasan_tidak_hadir || ""}`;
    }
    if (!fullText) return;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopyAllDone(true);
      setTimeout(() => setCopyAllDone(false), 2500);
    } catch {
      /* fallback silently */
    }
  };

  const handleApplyPreset = (presetText: string) => {
    setAktivitas(presetText);
    setError("");
  };

  const statusOptions: { key: Status; label: string; badgeColor: string; activeClass: string }[] = [
    {
      key: "Hadir",
      label: "Hadir",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      activeClass: "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-200",
    },
    {
      key: "Tidak Hadir Dengan Keterangan",
      label: "Tidak Hadir Dengan Keterangan",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      activeClass: "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-200",
    },
    {
      key: "Tidak Hadir Tanpa Keterangan",
      label: "Tidak Hadir Tanpa Keterangan",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
      activeClass: "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-200",
    },
  ];

  const allValid =
    status === "Hadir"
      ? Boolean(
          report &&
            (report.uraian_aktivitas || "").length >= 100 &&
            (report.pembelajaran || "").length >= 100 &&
            (report.kendala || "").length >= 100
        )
      : status === "Tidak Hadir Dengan Keterangan"
      ? Boolean(report && (report.alasan_tidak_hadir || "").length >= 100)
      : true;

  const wibToday = getWibDateString();

  return (
    <div className="relative min-h-screen flex flex-col text-surface-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* Ambient Atmosphere & Dot Grid Canvas matching GenMagang */}
      <div className="ambient-glow-lavender" aria-hidden="true" />
      <div className="ambient-glow-yellow" aria-hidden="true" />
      <div className="ambient-glow-center" aria-hidden="true" />
      <div className="waypilot-canvas" aria-hidden="true" />

      {/* ─── Fixed Floating Navbar (Pill Capsule) ─────────────────────────── */}
      <header className="fixed top-5 left-0 right-0 z-50 px-4 w-full max-w-6xl mx-auto pointer-events-none">
        <nav className="liquid-glass-pill rounded-full px-5 py-2.5 flex items-center justify-between shadow-lg border border-white/85 pointer-events-auto">
          
          {/* Logo & Breadcrumb Navigation */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/25 hover:scale-105 transition-transform"
              title="Kembali ke Beranda GenMagang"
            >
              <i className="mdi mdi-school text-lg" />
            </Link>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5 leading-none">
                <Link
                  href="/"
                  className="font-extrabold text-[1.05rem] tracking-tight text-slate-900 hover:text-blue-600 transition-colors"
                >
                  Gen<span className="text-blue-600">Magang</span>
                </Link>
                <span className="text-slate-300 font-bold">/</span>
                <span className="font-extrabold text-[1.05rem] tracking-tight text-emerald-700">
                  GenMonev
                </span>
              </div>
              <span className="text-[0.6rem] text-slate-400 font-bold tracking-wider uppercase">
                MagangHub Kemnaker Auto-Formulator
              </span>
            </div>

            {/* Badge Tag */}
            <div className="hidden lg:flex items-center ml-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-[11px] font-semibold shadow-2xs">
                <i className="mdi mdi-check-decagram text-emerald-500 text-xs" />
                Min. 100 Karakter Lolos Validasi
              </span>
            </div>
          </div>

          {/* Right Header Statuses & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Switch to Notulis */}
            <Link
              href="/notulen"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 bg-white/75 hover:bg-white border border-slate-200/70 shadow-2xs transition-all"
            >
              <i className="mdi mdi-file-document-edit-outline text-blue-600 text-sm" />
              <span>Buka GenNotulis</span>
              <i className="mdi mdi-arrow-right text-xs" />
            </Link>

            {/* Kemnaker Auth Status */}
            {kemnakerToken ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="max-w-[110px] truncate">{kemnakerUser?.name || "Kemnaker"}</span>
              </div>
            ) : null}

            {/* API Key Modal Button */}
            <button
              type="button"
              onClick={() => setShowApiKeyModal(true)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer shadow-2xs ${
                apiKey
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <i className="mdi mdi-key-variant text-sm" />
              <span className="hidden md:inline">{apiKey ? "API Key Aktif" : "API Key"}</span>
            </button>

            {/* WIB Clock */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/70 text-xs font-mono text-slate-700 border border-slate-200/70 shadow-2xs">
              <i className="mdi mdi-clock-outline text-slate-400" />
              <span>{currentTime || "16:00:00"} WIB</span>
            </div>
          </div>
        </nav>
      </header>

      {/* ─── Main Content Layout (Offset for fixed floating navbar) ─────── */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-12 flex flex-col justify-start">
        
        {/* Sub-Header Notice Bar */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-3xl liquid-glass-card border border-white/85 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <i className="mdi mdi-shield-check-outline text-lg" />
            </div>
            <div>
              <p className="text-xs font-bold text-surface-900">
                Format Pelaporan Resmi Kemnaker RI &middot; {currentDate}
              </p>
              <p className="text-[11px] text-surface-500">
                Semua isian otomatis diformulasikan di atas 100 karakter dengan bahasa formal korporat siap lolos audit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-[11px] font-mono text-surface-400 bg-surface-100 px-2.5 py-1 rounded-lg">
              Portal: monev.maganghub.kemnaker.go.id
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ═════════════════════════════════════════════════════════════════
              LEFT COLUMN: Form Input & Options (5 cols)
              ═════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* 1. Status Kehadiran Card */}
            <div className="liquid-glass-card rounded-3xl border border-white/85 shadow-xl p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-primary-800 flex items-center gap-1.5">
                  <i className="mdi mdi-checkbox-marked-circle-outline text-emerald-600 text-sm" />
                  Status Kehadiran Hari Ini
                </label>
                <span className="text-[10px] text-surface-400 font-mono">Status Aktual</span>
              </div>

              {/* Status Radio Options */}
              <div className="space-y-2">
                {statusOptions.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleStatusChange(opt.key)}
                    className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold border-2 transition-all duration-200 cursor-pointer flex items-center justify-between text-left ${
                      status === opt.key
                        ? opt.activeClass
                        : "bg-white border-surface-200 text-surface-700 hover:border-surface-300 hover:bg-surface-50"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {status === opt.key ? (
                      <i className="mdi mdi-check text-base shrink-0 font-bold" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-surface-300 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Catatan Aktivitas / Alasan Input Card */}
            {status === "Hadir" ? (
              <div className="liquid-glass-card rounded-3xl border border-white/85 shadow-xl p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label
                      htmlFor="aktivitas-input"
                      className="block text-xs font-bold uppercase tracking-wider text-primary-800"
                    >
                      Poin Catatan Harian
                    </label>
                    <p className="text-[11px] text-surface-500 mt-0.5">
                      Tulis poin kegiatan singkat atau pilih contoh preset di bawah.
                    </p>
                  </div>
                  {aktivitas && (
                    <button
                      type="button"
                      onClick={() => setAktivitas("")}
                      className="text-[11px] text-surface-400 hover:text-red-500 transition-colors"
                    >
                      Bersihkan
                    </button>
                  )}
                </div>

                {/* Quick Preset Chips */}
                <div>
                  <div className="text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <span>💡 Contoh Cepat (Klik untuk Isi):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => handleApplyPreset(preset.text)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-surface-200 text-surface-600 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <span>{preset.icon}</span>
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea */}
                <textarea
                  id="aktivitas-input"
                  value={aktivitas}
                  onChange={(e) => setAktivitas(e.target.value)}
                  rows={8}
                  placeholder={`- briefing proyek sistem transaksi
- membuat komponen UI responsive
- diskusi dengan mentor tentang validasi data
- tidak ada kesulitan berarti hari ini`}
                  className="w-full px-3.5 py-3 rounded-xl border border-surface-200 text-xs sm:text-sm text-surface-800 bg-surface-50/50 placeholder:text-surface-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 focus:bg-white hover:border-surface-300 transition-all leading-relaxed font-sans"
                />

                <div className="flex items-center justify-between text-[11px] text-surface-400 pt-0.5">
                  <span>{aktivitas.length} karakter diinput</span>
                  <span>Tekan tombol di bawah untuk menyusun narasi formal</span>
                </div>
              </div>
            ) : status === "Tidak Hadir Dengan Keterangan" ? (
              <div className="bg-white rounded-2xl border border-surface-200/80 shadow-sm p-5 space-y-3">
                <label
                  htmlFor="izin-input"
                  className="block text-xs font-bold uppercase tracking-wider text-amber-700"
                >
                  Catatan Alasan Izin / Sakit
                </label>
                <p className="text-[11px] text-surface-500">
                  Tuliskan alasan izin/sakit secara singkat. AI akan menyusun narasi santun formal minimal 100 karakter.
                </p>
                <textarea
                  id="izin-input"
                  value={aktivitas}
                  onChange={(e) => setAktivitas(e.target.value)}
                  rows={6}
                  placeholder="Contoh: Mengalami demam dan flu, sudah berkonsultasi ke dokter dan beristirahat sesuai instruksi..."
                  className="w-full px-3.5 py-3 rounded-xl border border-surface-200 text-xs sm:text-sm text-surface-800 bg-white placeholder:text-surface-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 leading-relaxed font-sans"
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-rose-200/80 shadow-sm p-5 space-y-2">
                <div className="flex items-center gap-2 text-rose-600 text-xs font-bold uppercase tracking-wider">
                  <i className="mdi mdi-information-outline text-base shrink-0" />
                  Status Tanpa Keterangan
                </div>
                <p className="text-xs text-surface-600 leading-relaxed">
                  Status <strong>Tidak Hadir Tanpa Keterangan</strong> tidak mensyaratkan penulisan uraian laporan harian pada sistem Kemnaker. Anda dapat langsung mencentang konfirmasi peninjauan dan mengirim status ke server Monev.
                </p>
              </div>
            )}

            {/* 3. Generate Action Button */}
            {status !== "Tidak Hadir Tanpa Keterangan" && (
              <button
                id="generate-button"
                type="button"
                onClick={handleGenerate}
                disabled={loading || !aktivitas.trim()}
                className={`w-full px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-surface-200 text-surface-400 cursor-wait"
                    : !aktivitas.trim()
                    ? "bg-surface-100 text-surface-400 cursor-not-allowed border border-surface-200"
                    : status === "Tidak Hadir Dengan Keterangan"
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-200 hover:shadow-xl hover:shadow-amber-300 hover:-translate-y-0.5 active:translate-y-0"
                    : "bg-gradient-to-r from-emerald-600 via-teal-600 to-primary-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0"
                }`}
              >
                {loading ? (
                  <>
                    <i className="mdi mdi-loading mdi-spin text-lg shrink-0" />
                    <span>AI Sedang Menyusun Laporan Formal...</span>
                  </>
                ) : (
                  <>
                    <i className="mdi mdi-auto-fix text-lg shrink-0" />
                    <span>
                      {status === "Tidak Hadir Dengan Keterangan"
                        ? "Generate Narasi Izin Resmi"
                        : "Generate Laporan Monev (Min. 100 Karakter)"}
                    </span>
                  </>
                )}
              </button>
            )}

            {/* Error Message Alert */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <i className="mdi mdi-alert-circle text-base text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Terjadi Kesalahan</p>
                  <p className="mt-0.5 text-red-600">{error}</p>
                </div>
              </div>
            )}

          </div>

          {/* ═════════════════════════════════════════════════════════════════
              RIGHT COLUMN: Preview & Auto-Sync Kemnaker (7 cols)
              ═════════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* 1. Preview Card */}
            <div className="liquid-glass-card rounded-3xl border border-white/85 shadow-xl overflow-hidden flex flex-col min-h-[460px]">
              
              {/* Preview Card Header */}
              <div className="px-5 py-4 border-b border-slate-100/80 flex items-center justify-between bg-white/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <i className="mdi mdi-file-document-check-outline text-lg" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-surface-900">
                      Preview Laporan Monev
                    </h2>
                    <p className="text-[11px] text-surface-500">
                      Standar Kemnaker RI &middot; 3 Bagian Wajib
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {allValid && report && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                      ✓ SIAP KIRIM
                    </span>
                  )}
                  {report && (
                    <button
                      type="button"
                      onClick={handleCopyAll}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-surface-700 border border-surface-200 hover:bg-surface-50 transition-all cursor-pointer shadow-xs"
                    >
                      {copyAllDone ? (
                        <>
                          <i className="mdi mdi-check text-emerald-600 text-sm" />
                          <span className="text-emerald-700">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <i className="mdi mdi-content-copy text-sm" />
                          <span>Salin Semua</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Preview Card Body */}
              <div className="flex-1 p-5 flex flex-col justify-between">
                
                {status === "Tidak Hadir Tanpa Keterangan" ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <i className="mdi mdi-alert-circle-outline text-3xl" />
                    </div>
                    <div>
                      <p className="text-surface-800 text-sm font-bold">
                        Status: Tidak Hadir Tanpa Keterangan
                      </p>
                      <p className="text-surface-500 text-xs mt-1 max-w-sm mx-auto">
                        Sesuai sistem Monev Kemnaker, status ini tidak memerlukan isian laporan harian. Silakan langsung verifikasi dan kirim pada panel di bawah.
                      </p>
                    </div>
                  </div>
                ) : loading ? (
                  /* Loading Shimmer State */
                  <div className="space-y-5 py-4">
                    <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-800">
                      <i className="mdi mdi-loading mdi-spin text-base text-emerald-600" />
                      <span>Sedang memproses catatan Anda dengan AI Gemini...</span>
                    </div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 w-40 bg-surface-100 rounded-md animate-pulse" />
                        <div className="h-20 bg-surface-100 rounded-xl animate-pulse" />
                      </div>
                    ))}
                  </div>
                ) : report ? (
                  /* Report Generated Successfully */
                  status === "Tidak Hadir Dengan Keterangan" ? (
                    <div className="space-y-4">
                      <ReportSection
                        title="Alasan Tidak Hadir"
                        colorClass="bg-amber-50 text-amber-600"
                        icon={<i className="mdi mdi-alert-circle-outline text-base" />}
                        content={report.alasan_tidak_hadir || ""}
                        onEdit={(val) => setReport({ ...report, alasan_tidak_hadir: val })}
                        placeholder="Alasan tidak hadir minimal 100 karakter..."
                      />
                      {report.model && (
                        <div className="flex items-center justify-end gap-1.5 pt-2">
                          <span className="text-[10px] text-surface-400">Model AI:</span>
                          <span className="px-2 py-0.5 rounded-full bg-surface-100 text-[10px] text-surface-600 font-mono">
                            {report.model}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ReportSection
                        title="1. Uraian Aktivitas"
                        colorClass="bg-blue-50 text-blue-600"
                        icon={<i className="mdi mdi-notebook-edit-outline text-base" />}
                        content={report.uraian_aktivitas || ""}
                        onEdit={(val) => setReport({ ...report, uraian_aktivitas: val })}
                      />
                      <ReportSection
                        title="2. Pembelajaran yang Diperoleh"
                        colorClass="bg-emerald-50 text-emerald-600"
                        icon={<i className="mdi mdi-book-open-variant-outline text-base" />}
                        content={report.pembelajaran || ""}
                        onEdit={(val) => setReport({ ...report, pembelajaran: val })}
                      />
                      <ReportSection
                        title="3. Kendala yang Dialami & Solusi"
                        colorClass="bg-amber-50 text-amber-600"
                        icon={<i className="mdi mdi-alert-outline text-base" />}
                        content={report.kendala || ""}
                        onEdit={(val) => setReport({ ...report, kendala: val })}
                      />

                      {report.model && (
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                          <span className="text-[10px] text-surface-400">Diformulasikan oleh:</span>
                          <span className="px-2 py-0.5 rounded-full bg-surface-100 text-[10px] text-surface-600 font-mono">
                            {report.model}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  /* Rich Interactive Guide & Empty State Showcase */
                  <div className="flex flex-col justify-center h-full py-6 space-y-5">
                    <div className="text-center space-y-2">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
                        📄
                      </div>
                      <h3 className="text-base font-bold text-surface-800">
                        Format Standar Laporan Monev Kemnaker
                      </h3>
                      <p className="text-xs text-surface-500 max-w-md mx-auto">
                        Sistem MagangHub Kemnaker mewajibkan pengisian 3 kategori laporan harian dengan ketentuan minimal 100 karakter per kategori.
                      </p>
                    </div>

                    {/* 3 Criteria Explanation Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/80">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center">
                            1
                          </span>
                          <span className="text-xs font-bold text-surface-800">Aktivitas</span>
                        </div>
                        <p className="text-[11px] text-surface-500 leading-snug">
                          Uraian tugas fungsional, proyek, dan implementasi yang dikerjakan.
                        </p>
                        <span className="text-[10px] font-semibold text-emerald-700 mt-2 block">
                          ≥ 100 Karakter
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/80">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[10px] flex items-center justify-center">
                            2
                          </span>
                          <span className="text-xs font-bold text-surface-800">Pembelajaran</span>
                        </div>
                        <p className="text-[11px] text-surface-500 leading-snug">
                          Ilmu teknis, tools, atau soft skill baru yang dipelajari hari ini.
                        </p>
                        <span className="text-[10px] font-semibold text-emerald-700 mt-2 block">
                          ≥ 100 Karakter
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-200/80">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-700 font-bold text-[10px] flex items-center justify-center">
                            3
                          </span>
                          <span className="text-xs font-bold text-surface-800">Kendala</span>
                        </div>
                        <p className="text-[11px] text-surface-500 leading-snug">
                          Tantangan yang dihadapi dan cara penyelesaian bersama tim/mentor.
                        </p>
                        <span className="text-[10px] font-semibold text-emerald-700 mt-2 block">
                          ≥ 100 Karakter
                        </span>
                      </div>
                    </div>

                    {/* Pre-fill CTA for quick preview */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                      <div className="text-xs text-emerald-900">
                        <strong>Ingin coba langsung?</strong> Klik contoh preset di samping kiri untuk menguji coba generator AI.
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(QUICK_PRESETS[0].text)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                      >
                        Isi Contoh Frontend Dev
                      </button>
                    </div>

                  </div>
                )}

              </div>
            </div>

            {/* 2. Kirim Otomatis ke Monev Card (Kemnaker Portal Sync) */}
            <div className="liquid-glass-card rounded-3xl border border-white/85 shadow-xl p-5 sm:p-6 space-y-4">
              
              {/* Header section */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center shrink-0 border border-accent-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-surface-800">
                      Kirim Otomatis ke Monev Kemnaker
                    </h2>
                    <p className="text-[11px] text-surface-500">
                      Sinkronisasi presensi &amp; laporan ke portal monev.maganghub.kemnaker.go.id
                    </p>
                  </div>
                </div>

                {/* Account badge */}
                <div className="shrink-0">
                  {kemnakerToken ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        TERHUBUNG
                      </span>
                      <button
                        type="button"
                        onClick={handleKemnakerLogout}
                        title="Keluar dari akun Kemnaker"
                        className="text-xs text-surface-400 hover:text-red-500 hover:underline transition-colors cursor-pointer"
                      >
                        Keluar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowKemnakerModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-surface-100 text-surface-700 hover:bg-surface-200 border border-surface-200 transition-colors cursor-pointer"
                    >
                      <i className="mdi mdi-login text-sm" />
                      <span>Hubungkan Akun</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status & Information Box */}
              <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/70 space-y-2.5 text-xs shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-surface-500 flex items-center gap-1.5">
                    <i className="mdi mdi-calendar-today text-surface-400" />
                    Tanggal Absensi:
                  </span>
                  <span className="font-semibold text-surface-800 font-mono">
                    {wibToday}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-surface-500 flex items-center gap-1.5">
                    <i className="mdi mdi-account-check-outline text-surface-400" />
                    Status Presensi:
                  </span>
                  <span className="font-semibold text-surface-800">
                    {status} {kemnakerUser?.name ? `(${kemnakerUser.name})` : ""}
                  </span>
                </div>

                <div className="flex items-start justify-between text-[11px] text-surface-400 pt-2 border-t border-surface-200/60">
                  <span className="flex items-center gap-1">
                    <i className="mdi mdi-clock-outline text-surface-400" />
                    Waktu Server: {currentTime} WIB (GMT+7)
                  </span>
                  <span>{currentDate}</span>
                </div>
              </div>

              {/* Confirmation Checkbox */}
              <div>
                <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-surface-50 cursor-pointer select-none transition-colors border border-transparent hover:border-surface-200">
                  <input
                    type="checkbox"
                    checked={isConfirmed}
                    onChange={(e) => setIsConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                  />
                  <span className="text-xs text-surface-700 leading-relaxed">
                    Saya menyatakan telah meninjau dan memastikan isian laporan ini sudah benar sesuai kegiatan magang hari ini
                  </span>
                </label>
              </div>

              {/* Validation warning if fields under 100 chars */}
              {report && !allValid && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                  <i className="mdi mdi-alert text-base text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    <strong>Perhatian:</strong> Sistem Monev mensyaratkan setiap isian minimal 100 karakter. Lengkapi catatan pada kotak di atas sebelum mengirim.
                  </p>
                </div>
              )}

              {/* Submit result feedback */}
              {submitResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    submitResult.ok
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                >
                  {submitResult.ok ? (
                    <i className="mdi mdi-check-circle text-base text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <i className="mdi mdi-close-circle text-base text-red-500 shrink-0 mt-0.5" />
                  )}
                  <p className="leading-relaxed">{submitResult.msg}</p>
                </div>
              )}

              {/* Action Button */}
              <div>
                <button
                  type="button"
                  onClick={handleSubmitToMonev}
                  disabled={
                    submitLoading ||
                    (Boolean(kemnakerToken) &&
                      (!isConfirmed || (status !== "Tidak Hadir Tanpa Keterangan" && !report)))
                  }
                  className={`w-full px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center cursor-pointer ${
                    !kemnakerToken
                      ? "bg-surface-900 hover:bg-black text-white shadow-md"
                      : submitLoading
                      ? "bg-surface-200 text-surface-400 cursor-wait"
                      : !isConfirmed || (status !== "Tidak Hadir Tanpa Keterangan" && !report)
                      ? "bg-surface-100 text-surface-400 cursor-not-allowed border border-surface-200"
                      : "bg-gradient-to-r from-accent-600 to-primary-700 hover:from-accent-700 hover:to-primary-800 text-white shadow-lg shadow-accent-200"
                  }`}
                >
                  {submitLoading ? (
                    <span className="flex items-center gap-2">
                      <i className="mdi mdi-loading mdi-spin text-base" />
                      <span>Mengirimkan Laporan ke Monev Kemnaker...</span>
                    </span>
                  ) : !kemnakerToken ? (
                    <span className="flex items-center gap-2">
                      <i className="mdi mdi-login text-base" />
                      <span>Hubungkan Akun Kemnaker untuk Mengirim</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <i className="mdi mdi-send text-base" />
                      <span>Kirim Laporan ke Monev Kemnaker Sekarang</span>
                    </span>
                  )}
                </button>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* ─── Minimalist Floating Footer ─────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-200/50 bg-white/40 backdrop-blur-md py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
              <i className="mdi mdi-school" />
            </div>
            <span className="font-semibold text-slate-700">GenMonev</span>
            <span className="text-slate-300">&middot;</span>
            <span className="text-slate-400">Bagian dari ekosistem GenMagang</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Beranda</Link>
            <Link href="/notulen" className="hover:text-emerald-700 transition-colors">GenNotulis</Link>
            <a
              href="https://monev.maganghub.kemnaker.go.id"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-700 transition-colors inline-flex items-center gap-0.5"
            >
              <span>Portal Kemnaker</span>
              <i className="mdi mdi-arrow-top-right text-xs" />
            </a>
          </div>
        </div>
      </footer>

      {/* ─── API Key Modal ──────────────────────────────────────────────── */}
      {showApiKeyModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowApiKeyModal(false);
          }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-surface-200 p-6 animate-scale-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100">
                  <i className="mdi mdi-key-variant text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-surface-800">
                    Custom Gemini API Key
                  </h3>
                  <p className="text-xs text-surface-400">
                    Opsional &middot; Disimpan secara lokal di browser
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="p-1 rounded-lg hover:bg-surface-100 transition-colors text-surface-400 cursor-pointer"
              >
                <i className="mdi mdi-close text-xl text-surface-400" />
              </button>
            </div>

            <p className="text-xs text-surface-500 mb-4 leading-relaxed">
              Secara default GenMonev menggunakan API Key server internal. Jika kuota server sedang padat, Anda dapat memasukkan Gemini API Key pribadi dari Google AI Studio.
            </p>

            <div className="space-y-3">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 bg-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 font-mono"
              />
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-accent-600 hover:text-accent-700 transition-colors"
              >
                <i className="mdi mdi-open-in-new text-xs" />
                Dapatkan API Key di Google AI Studio
              </a>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold hover:bg-primary-700 transition-colors cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Kemnaker Login Modal ───────────────────────────────────────── */}
      {showKemnakerModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget && !kemnakerLoginLoading) {
              setShowKemnakerModal(false);
            }
          }}
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-surface-200 p-6 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center border border-accent-100">
                  <i className="mdi mdi-account-lock-outline text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-surface-800">
                    Masuk Akun Kemnaker
                  </h3>
                  <p className="text-xs text-surface-400">
                    SIAPkerja ID &middot; MagangHub
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowKemnakerModal(false)}
                disabled={kemnakerLoginLoading}
                className="p-1 rounded-lg hover:bg-surface-100 transition-colors text-surface-400 cursor-pointer disabled:opacity-30"
              >
                <i className="mdi mdi-close text-xl text-surface-400" />
              </button>
            </div>

            <p className="text-xs text-surface-500 mb-4 leading-relaxed">
              Login menggunakan akun SIAPkerja untuk memungkinkan GenMonev mengirim presensi dan laporan langsung ke portal Monev Kemnaker.
            </p>

            <form onSubmit={handleKemnakerLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Email / Nomor HP / NIK
                </label>
                <input
                  type="text"
                  value={kemnakerUsername}
                  onChange={(e) => setKemnakerUsername(e.target.value)}
                  placeholder="contoh@email.com atau 0812xxxxxxxx"
                  disabled={kemnakerLoginLoading}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 bg-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <input
                    type={showKemnakerPassword ? "text" : "password"}
                    value={kemnakerPassword}
                    onChange={(e) => setKemnakerPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={kemnakerLoginLoading}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-sm text-surface-800 bg-white placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-400/40 focus:border-primary-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKemnakerPassword(!showKemnakerPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 cursor-pointer"
                  >
                    <i className={`mdi ${showKemnakerPassword ? "mdi-eye-off-outline" : "mdi-eye-outline"} text-base`} />
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-50 border border-surface-200/70 text-[11px] text-surface-500 flex items-start gap-2">
                <i className="mdi mdi-shield-check-outline text-base text-accent-500 shrink-0 mt-0.5" />
                <span>
                  Kredensial Anda aman dan hanya diproses langsung untuk mendapatkan sesi otorisasi ke server Kemnaker.
                </span>
              </div>

              {kemnakerLoginError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <i className="mdi mdi-alert-circle text-base text-red-500 shrink-0 mt-0.5" />
                  <p>{kemnakerLoginError}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKemnakerModal(false)}
                  disabled={kemnakerLoginLoading}
                  className="flex-1 py-2.5 rounded-xl border border-surface-200 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={kemnakerLoginLoading || !kemnakerUsername.trim() || !kemnakerPassword}
                  className="flex-1 py-2.5 rounded-xl bg-accent-600 text-white text-sm font-bold hover:bg-accent-700 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {kemnakerLoginLoading ? (
                    <>
                      <i className="mdi mdi-loading mdi-spin text-base" />
                      Menghubungkan...
                    </>
                  ) : (
                    "Masuk & Hubungkan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
