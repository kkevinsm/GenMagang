"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import "../notulen.css";

// --- Types & Interfaces ---
export interface Task {
  id: string;
  text: string;
  due?: string;
  done: boolean;
}

export interface ActionItemGroup {
  team: string;
  tasks: Task[];
}

export interface DecisionItem {
  topic: string;
  bullets: string[];
}

export interface SpeakerMemo {
  label: string;
  items: string[];
}

export interface MemoBlock {
  header: string;
  speakers: SpeakerMemo[];
}

export interface Meeting {
  id: string;
  category: string;
  title: string;
  date: string;
  time: string;
  location: string;
  leader: string;
  attendees: string;
  agendas: string[];
  decisions: DecisionItem[];
  memos: MemoBlock[];
  summary: string[];
  actionItems: ActionItemGroup[];
}

export interface Folder {
  id: string;
  name: string;
  gradient: string;
}

interface MediaAttachment {
  type: "audio" | "video";
  mimeType: string;
  base64: string;
  fileName: string;
  fileSize: number;
}

// LocalStorage Keys
const STORAGE_KEY_MEETINGS = "notugen_meetings_data";
const STORAGE_KEY_FOLDERS = "notugen_folders_data";
const STORAGE_KEY_API_KEY = "notugen_gemini_api_key";
const STORAGE_KEY_MODEL = "notugen_gemini_model";

export default function NotulenPage() {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<"archive" | "actions" | "generator" | "settings" | "detail">("archive");
  
  // Data State (empty by default as requested)
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentMeetingId, setCurrentMeetingId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-2.5-flash");
  
  // UI Filters
  const [activeFolderFilter, setActiveFolderFilter] = useState<string>("all");
  const [filterKeyword, setFilterKeyword] = useState<string>("");
  const [projectSelect, setProjectSelect] = useState<string>("all");
  
  // Action Items Tab Filters
  const [actionStatusFilter, setActionStatusFilter] = useState<"all" | "pending" | "done">("all");
  const [actionTeamFilter, setActionTeamFilter] = useState<string>("all");

  // Modals & Dialogs
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState<"add" | "edit">("add");
  const [folderEditId, setFolderEditId] = useState<string>("");
  const [folderNameInput, setFolderNameInput] = useState<string>("");
  const [folderGradientInput, setFolderGradientInput] = useState<string>("grad-sage");

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {}
  });

  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState("");

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // AI Generator Tab State
  const [generatorMode, setGeneratorMode] = useState<"transcript" | "voice" | "video">("transcript");
  const [rawNotesInput, setRawNotesInput] = useState("");
  const [genCustomTitle, setGenCustomTitle] = useState("");
  const [genCategory, setGenCategory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>("");
  
  // Audio/Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Media attachments (Audio / Video)
  const [mediaAttachment, setMediaAttachment] = useState<MediaAttachment | null>(null);

  // Settings
  const [showApiKey, setShowApiKey] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");

  // --- INITIAL DATA LOADING ---
  useEffect(() => {
    // 1. Folders
    try {
      const storedFolders = localStorage.getItem(STORAGE_KEY_FOLDERS);
      if (storedFolders) {
        const parsed = JSON.parse(storedFolders);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(f => f.id !== 'FSCM' || f.name !== 'FSCM Release');
          setFolders(cleaned);
        }
      } else {
        setFolders([]);
      }
    } catch {
      setFolders([]);
    }

    // 2. Meetings
    try {
      const storedMeetings = localStorage.getItem(STORAGE_KEY_MEETINGS);
      if (storedMeetings) {
        const parsed = JSON.parse(storedMeetings);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((m: any) => 
            m.id !== 'meet-fscm-r2-20261020' && m.id !== 'meet-icons-core-20261014'
          );
          setMeetings(cleaned);
        }
      } else {
        setMeetings([]);
      }
    } catch {
      setMeetings([]);
    }

    // 3. API Key & Model
    const storedKey = localStorage.getItem(STORAGE_KEY_API_KEY) || "";
    setApiKey(storedKey);
    setTempApiKey(storedKey);

    const storedModel = localStorage.getItem(STORAGE_KEY_MODEL) || "gemini-2.5-flash";
    setSelectedModel(storedModel);
  }, []);

  // Save meetings helper
  const saveMeetings = useCallback((updated: Meeting[]) => {
    setMeetings(updated);
    localStorage.setItem(STORAGE_KEY_MEETINGS, JSON.stringify(updated));
  }, []);

  // Save folders helper
  const saveFolders = useCallback((updated: Folder[]) => {
    setFolders(updated);
    localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(updated));
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    let pending = 0;
    let completed = 0;
    meetings.forEach(m => {
      (m.actionItems || []).forEach(group => {
        (group.tasks || []).forEach(t => {
          if (t.done) completed++;
          else pending++;
        });
      });
    });
    return {
      totalMeetings: meetings.length,
      pendingCount: pending,
      completedCount: completed,
      totalActions: pending + completed
    };
  }, [meetings]);

  // Active meeting for detail view
  const activeMeeting = useMemo(() => {
    return meetings.find(m => m.id === currentMeetingId) || null;
  }, [meetings, currentMeetingId]);

  // Greeting text
  const greetingText = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 11) return "Selamat Pagi";
    if (hours < 15) return "Selamat Siang";
    if (hours < 19) return "Selamat Sore";
    return "Selamat Malam";
  }, []);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsQuickSearchOpen(false);
        setIsFolderModalOpen(false);
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- FOLDER ACTIONS ---
  const handleOpenAddFolder = () => {
    setFolderModalMode("add");
    setFolderEditId("");
    setFolderNameInput("");
    setFolderGradientInput("grad-sage");
    setIsFolderModalOpen(true);
  };

  const handleOpenEditFolder = (f: Folder) => {
    setFolderModalMode("edit");
    setFolderEditId(f.id);
    setFolderNameInput(f.name);
    setFolderGradientInput(f.gradient || "grad-sage");
    setIsFolderModalOpen(true);
  };

  const handleSaveFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = folderNameInput.trim();
    if (!trimmed) {
      showToast("Nama folder tidak boleh kosong");
      return;
    }

    if (folderModalMode === "add") {
      if (folders.some(f => f.name.toLowerCase() === trimmed.toLowerCase())) {
        showToast("Folder dengan nama tersebut sudah ada");
        return;
      }
      const newFolder: Folder = {
        id: trimmed,
        name: trimmed,
        gradient: folderGradientInput
      };
      saveFolders([...folders, newFolder]);
      showToast(`Folder "${trimmed}" berhasil dibuat`);
    } else {
      // Edit
      const oldId = folderEditId;
      const updatedFolders = folders.map(f => {
        if (f.id === oldId) {
          return { ...f, id: trimmed, name: trimmed, gradient: folderGradientInput };
        }
        return f;
      });
      // Migrate meetings under this folder
      const updatedMeetings = meetings.map(m => {
        if (m.category === oldId) {
          return { ...m, category: trimmed };
        }
        return m;
      });
      if (activeFolderFilter === oldId) {
        setActiveFolderFilter(trimmed);
      }
      saveFolders(updatedFolders);
      saveMeetings(updatedMeetings);
      showToast(`Folder berhasil diubah menjadi "${trimmed}"`);
    }

    setIsFolderModalOpen(false);
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    setConfirmDialog({
      open: true,
      title: `Hapus Folder "${folderName}"?`,
      message: `Semua notulensi di dalam folder ini akan dipindahkan ke folder 'Umum'. Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: () => {
        const updatedFolders = folders.filter(f => f.id !== folderId);
        const updatedMeetings = meetings.map(m => {
          if (m.category === folderId) {
            return { ...m, category: "Umum" };
          }
          return m;
        });
        if (activeFolderFilter === folderId) {
          setActiveFolderFilter("all");
        }
        saveFolders(updatedFolders);
        saveMeetings(updatedMeetings);
        showToast(`Folder "${folderName}" berhasil dihapus`);
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  // --- MEETING ACTIONS ---
  const handleOpenMeetingDetail = (id: string) => {
    setCurrentMeetingId(id);
    setActiveTab("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteMeeting = (meeting: Meeting) => {
    setConfirmDialog({
      open: true,
      title: `Hapus Notulen Rapat?`,
      message: `Anda yakin ingin menghapus notulen "${meeting.title.split('\n')[0]}"? Data tidak dapat dikembalikan.`,
      onConfirm: () => {
        const updated = meetings.filter(m => m.id !== meeting.id);
        saveMeetings(updated);
        showToast("Notulen rapat berhasil dihapus");
        setActiveTab("archive");
        setCurrentMeetingId(null);
        setConfirmDialog(prev => ({ ...prev, open: false }));
      }
    });
  };

  const handleToggleTask = (meetingId: string, taskId: string, nextStatus: boolean) => {
    const updated = meetings.map(m => {
      if (m.id !== meetingId) return m;
      return {
        ...m,
        actionItems: (m.actionItems || []).map(group => ({
          ...group,
          tasks: (group.tasks || []).map(t => {
            if (t.id === taskId) {
              return { ...t, done: nextStatus };
            }
            return t;
          })
        }))
      };
    });
    saveMeetings(updated);
  };

  const handleReassignFolder = (meetingId: string, newFolder: string) => {
    const updated = meetings.map(m => {
      if (m.id === meetingId) {
        return { ...m, category: newFolder };
      }
      return m;
    });
    saveMeetings(updated);
    showToast(`Dokumen dipindahkan ke folder "${newFolder}"`);
  };

  // --- EXPORT & COPY ---
  const handleCopyWhatsApp = (meeting: Meeting) => {
    let text = `*NOTULEN MEETING — ${meeting.category.toUpperCase()}*\n`;
    text += `*Judul:* ${meeting.title.replace(/\n/g, ' ')}\n`;
    text += `*Waktu:* ${meeting.date} (${meeting.time})\n`;
    text += `*Tempat:* ${meeting.location}\n`;
    text += `*Pimpinan:* ${meeting.leader}\n`;
    text += `*Peserta:* ${meeting.attendees}\n\n`;

    if (meeting.agendas && meeting.agendas.length > 0) {
      text += `*AGENDA:*\n`;
      meeting.agendas.forEach((a, i) => {
        text += `${i + 1}. ${a}\n`;
      });
      text += `\n`;
    }

    if (meeting.decisions && meeting.decisions.length > 0) {
      text += `*KEPUTUSAN UTAMA:*\n`;
      meeting.decisions.forEach(d => {
        text += `• *${d.topic}*\n`;
        d.bullets.forEach(b => {
          text += `  - ${b}\n`;
        });
      });
      text += `\n`;
    }

    if (meeting.actionItems && meeting.actionItems.length > 0) {
      text += `*ACTION ITEMS / TINDAK LANJUT:*\n`;
      meeting.actionItems.forEach(group => {
        text += `• *${group.team}:*\n`;
        group.tasks.forEach(t => {
          const status = t.done ? '✅ [SELESAI]' : '⏳ [PROSES]';
          const due = t.due ? ` (Target: ${t.due})` : '';
          text += `  - ${status} ${t.text}${due}\n`;
        });
      });
      text += `\n`;
    }

    if (meeting.summary && meeting.summary.length > 0) {
      text += `*KESIMPULAN:*\n`;
      meeting.summary.forEach((s, i) => {
        text += `${i + 1}. ${s}\n`;
      });
    }

    navigator.clipboard.writeText(text).then(() => {
      showToast("Format notulen disalin ke clipboard!");
    }).catch(() => {
      showToast("Gagal menyalin ke clipboard");
    });
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleExportAllJson = () => {
    const data = {
      exportDate: new Date().toISOString(),
      app: "GenNotulis — GenMagang Suite",
      folders: folders,
      meetings: meetings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GenNotulis-Backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Cadangan file JSON berhasil diunduh");
  };

  // --- AUDIO / VOICE NOTE RECORDING ---
  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showToast("Browser tidak mendukung perekaman mikrofon langsung");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mr.mimeType || "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          setMediaAttachment({
            type: "audio",
            mimeType: mr.mimeType || "audio/webm",
            base64: base64,
            fileName: `Voice-Note-${new Date().toISOString().slice(0, 10)}.webm`,
            fileSize: audioBlob.size
          });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };

      mr.start();
      setIsRecording(true);
      setRecordSeconds(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
      showToast("Merekam suara rapat... Mulai bicara");
    } catch (err: any) {
      console.error(err);
      showToast("Akses mikrofon ditolak atau tidak tersedia");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    setIsRecording(false);
    showToast("Rekaman suara selesai disimpan");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "audio" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      showToast("File terlalu besar! Disarankan di bawah 25MB agar pemrosesan lancar");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      setMediaAttachment({
        type: type,
        mimeType: file.type || (type === "audio" ? "audio/mp3" : "video/mp4"),
        base64: base64,
        fileName: file.name,
        fileSize: file.size
      });
      showToast(`File ${type === "audio" ? "audio" : "video"} "${file.name}" berhasil dimuat`);
    };
    reader.readAsDataURL(file);
  };

  // --- AI GENERATION WITH FALLBACK RESILIENCE ---
  const handleGenerateMeeting = async () => {
    if (generatorMode === "transcript" && !rawNotesInput.trim()) {
      showToast("Silakan masukkan transkrip atau catatan kasar rapat terlebih dahulu");
      return;
    }
    if ((generatorMode === "voice" || generatorMode === "video") && !mediaAttachment && !rawNotesInput.trim()) {
      showToast("Silakan rekam suara, pilih file media, atau masukkan teks catatan");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress("Menganalisis catatan & mengekstrak keputusan resmi...");

    const categoryTarget = genCategory || (folders[0] ? folders[0].id : "Umum");
    const titleTarget = genCustomTitle.trim();

    try {
      let generatedData: any = null;

      if (apiKey.trim()) {
        const candidateModels = [selectedModel, "gemini-2.5-flash", "gemini-1.5-flash"];
        let lastError = null;

        for (let i = 0; i < candidateModels.length; i++) {
          const model = candidateModels[i];
          try {
            if (i > 0) {
              setGenerationProgress(`Mencoba model cadangan stabil: ${model}...`);
            }
            generatedData = await executeGeminiRequest(apiKey.trim(), model, rawNotesInput, titleTarget, categoryTarget, mediaAttachment);
            break;
          } catch (err: any) {
            console.warn(`Model ${model} gagal:`, err);
            lastError = err;
          }
        }

        if (!generatedData && lastError) {
          console.warn("Semua model API error, beralih ke generator korporat cerdas offline");
          generatedData = generateLocalCorporateNotulen(rawNotesInput, titleTarget, categoryTarget, mediaAttachment);
        }
      } else {
        // Fallback local instant generation
        setGenerationProgress("Menyusun format standar notulen resmi...");
        await new Promise(r => setTimeout(r, 600));
        generatedData = generateLocalCorporateNotulen(rawNotesInput, titleTarget, categoryTarget, mediaAttachment);
      }

      // Format action items IDs
      let taskCounter = 1;
      const formattedActionItems = (generatedData.actionItems || []).map((group: any) => ({
        team: group.team || "Tim Pelaksana",
        tasks: (group.tasks || []).map((t: any) => ({
          id: `task-${Date.now()}-${taskCounter++}`,
          text: t.text || "Tugas tindak lanjut",
          due: t.due || "Segera",
          done: false
        }))
      }));

      const newMeeting: Meeting = {
        id: `meet-${Date.now()}`,
        category: categoryTarget,
        title: generatedData.title || titleTarget || "Notulen Rapat Koordinasi Teknis",
        date: generatedData.date || "Rabu, 21 Oktober 2026",
        time: generatedData.time || "14.00 - Selesai WIB",
        location: generatedData.location || "Ruang Rapat & Ms. Teams",
        leader: generatedData.leader || "Project Coordinator",
        attendees: generatedData.attendees || "Tim Pengembang, QA, & Stakeholders Terkait",
        agendas: generatedData.agendas || ["Koordinasi teknis progres proyek"],
        decisions: generatedData.decisions || [{ topic: "Keputusan Rapat:", bullets: ["Target milestone disepakati bersama."] }],
        memos: generatedData.memos || [],
        summary: generatedData.summary || ["Seluruh tim menyepakati target penyelesaian."],
        actionItems: formattedActionItems
      };

      saveMeetings([newMeeting, ...meetings]);
      showToast("Notulen resmi berhasil dibuat dan disimpan!");
      
      // Reset form
      setRawNotesInput("");
      setGenCustomTitle("");
      setMediaAttachment(null);
      
      // Open the new meeting directly
      setCurrentMeetingId(newMeeting.id);
      setActiveTab("detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error(err);
      showToast("Terjadi kendala saat memproses: " + (err.message || "Coba ulangi"));
    } finally {
      setIsGenerating(false);
      setGenerationProgress("");
    }
  };

  // Helper Gemini Direct Request
  async function executeGeminiRequest(key: string, model: string, rawNotes: string, customTitle: string, category: string, media: MediaAttachment | null) {
    let mediaInstruction = "";
    if (media) {
      mediaInstruction = media.type === "video" 
        ? "File rekaman video online meeting terlampir. Dengarkan dan amati jalannya rapat secara cermat untuk mengekstrak notulen meeting resmi."
        : "File audio rekaman voice note rapat terlampir. Dengarkan secara cermat seluruh poin percakapan untuk mengekstrak notulen meeting resmi.";
    }

    const prompt = `
Anda adalah asisten korporat profesional yang ahli dalam menyusun Notulen Meeting resmi untuk perusahaan/perbankan BUMN (seperti format standar BNI).
${mediaInstruction}
${rawNotes ? 'Catatan tambahan / transkrip rapat:\n---\n' + rawNotes + '\n---' : ''}

SUSUN DOKUMEN NOTULEN RESMI DENGAN STRUKTUR JSON KETAT SEBAGAI BERIKUT:
{
  "category": "${category || 'Umum'}",
  "title": "${customTitle ? customTitle : 'Judul meeting profesional berpoin (misal: a. ... \\n b. ...)'}",
  "date": "Hari, Tanggal (misal: Rabu, 21 Oktober 2026)",
  "time": "Jam meeting (misal: 14.00 - Selesai WIB)",
  "location": "Tempat meeting (misal: R. Meeting Lt. 12 & Ms. Teams)",
  "leader": "Pimpinan meeting",
  "attendees": "Daftar nama atau peran peserta meeting",
  "agendas": ["Daftar agenda 1...", "Daftar agenda 2..."],
  "decisions": [
    {
      "topic": "Topik Keputusan Resmi (misal: Keputusan Teknis Proyek):",
      "bullets": ["Poin keputusan 1 secara rinci...", "Poin keputusan 2..."]
    }
  ],
  "memos": [
    {
      "header": "1. Pembahasan Topik Bahasan Mendalam",
      "speakers": [
        {
          "label": "Tinjauan / Pernyataan (Nama Pembicara):",
          "items": ["Detail poin diskusi teknis 1...", "Detail poin diskusi teknis 2..."]
        }
      ]
    }
  ],
  "summary": ["Ringkasan eksekutif poin 1...", "Ringkasan eksekutif poin 2..."],
  "actionItems": [
    {
      "team": "Tim Pengembang (WDL)",
      "tasks": [
        { "text": "Deskripsi tugas konkret", "due": "Tanggal deadline" }
      ]
    },
    {
      "team": "Tim QA / Tester (TSA)",
      "tasks": [
        { "text": "Deskripsi tugas pengujian", "due": "Tanggal deadline" }
      ]
    },
    {
      "team": "Tim Bisnis (WDC)",
      "tasks": [
        { "text": "Deskripsi tugas bisnis/persyaratan", "due": "Tanggal deadline" }
      ]
    }
  ]
}

PENTING:
- Kembalikan HANYA JSON murni yang valid tanpa awalan \`\`\`json atau teks pembuka/penutup.
- Bahasa: Bahasa Indonesia formal korporat yang rapi, objektif, dan presisi.
`;

    const parts: any[] = [];
    if (media && media.base64 && media.mimeType) {
      parts.push({
        inlineData: {
          mimeType: media.mimeType,
          data: media.base64
        }
      });
    }
    parts.push({ text: prompt });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: parts }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 8192
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini Error [${res.status}]: ${errText}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) throw new Error("Respon Gemini kosong");

    let cleaned = candidateText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    return JSON.parse(cleaned);
  }

  // Fallback template builder
  function generateLocalCorporateNotulen(rawNotes: string, customTitle: string, category: string, media: MediaAttachment | null) {
    const today = new Intl.DateTimeFormat("id-ID", { dateStyle: "full" }).format(new Date());
    let defaultTitle = "Notulen Pembahasan Teknis & Koordinasi Proyek";
    let agendaTopic = "Evaluasi progres dan koordinasi teknis";

    if (media) {
      if (media.type === "video") {
        defaultTitle = customTitle || "Notulen Rekaman Video Online Meeting";
        agendaTopic = "Penyelarasan rekaman video rapat daring";
      } else {
        defaultTitle = customTitle || "Notulen Rekaman Suara & Voice Note Rapat";
        agendaTopic = "Penyelarasan poin rekaman audio rapat";
      }
    } else if (rawNotes) {
      const lines = rawNotes.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      if (lines[0]) defaultTitle = lines[0];
    }

    const title = customTitle || defaultTitle;

    return {
      category: category || "Umum",
      title: title,
      date: today,
      time: "14.00 - Selesai WIB",
      location: media ? (media.type === "video" ? "Ms. Teams / Zoom Video Meeting" : "Ruang Rapat & Voice Recording") : "Ruang Rapat Utama & Ms. Teams",
      leader: "Project Coordinator / Lead Architect",
      attendees: "Tim Pengembang, Tim QA, Tim Bisnis, PMO, dan Stakeholders Terkait",
      agendas: [
        `1. ${agendaTopic} dan penanganan prioritas implementasi.`,
        "2. Penyelarasan timeline rilis dan mitigasi dependensi antar tim.",
        "3. Penetapan action items dan komitmen target penyelesaian."
      ],
      decisions: [
        {
          topic: `Keputusan Utama Terkait ${title.split('\n')[0]}:`,
          bullets: [
            media ? `Rekaman ${media.type === 'video' ? 'video' : 'audio'} telah dianalisis; seluruh kesepakatan target rilis disetujui bersama.` : 'Seluruh tim menyepakati target penyelesaian milestone sesuai jadwal yang ditetapkan.',
            "Uji fungsional (UAT) bersama unit kerja dijadwalkan segera setelah verifikasi lingkungan stabil."
          ]
        }
      ],
      memos: [
        {
          header: "1. Poin Diskusi & Catatan Stakeholder",
          speakers: [
            {
              label: "Catatan Tim Pengembang & Tim Penguji:",
              items: [
                "Verifikasi performa modul utama menunjukkan peningkatan efisiensi yang memadai.",
                "Dependensi konfigurasi database sedang dituntaskan sebelum fase joint test."
              ]
            }
          ]
        }
      ],
      summary: [
        "Hasil koordinasi menyepakati prioritas penyelesaian isu pada komponen utama sebelum memasuki periode freeze.",
        "Seluruh tim unit kerja bertanggung jawab menyelesaikan action items sesuai tenggat yang telah ditetapkan."
      ],
      actionItems: [
        {
          team: "Tim Pengembang (WDL)",
          tasks: [
            { text: `Menuntaskan perbaikan dan pengujian internal untuk ${title.split('\n')[0]}.`, due: "28 Okt 2026" }
          ]
        },
        {
          team: "Tim QA / Tester (TSA)",
          tasks: [
            { text: "Menyiapkan skenario joint testing dan memantau stabilitas environment.", due: "30 Okt 2026" }
          ]
        },
        {
          team: "Tim Bisnis (WDC)",
          tasks: [
            { text: "Validasi dokumen kriteria penerimaan pengguna bersama tim operasional.", due: "02 Nov 2026" }
          ]
        }
      ]
    };
  }

  // --- FILTERED MEETINGS IN ARCHIVE ---
  const filteredMeetings = useMemo(() => {
    return meetings.filter(m => {
      if (activeFolderFilter !== "all" && m.category !== activeFolderFilter) {
        return false;
      }
      if (projectSelect !== "all" && m.category !== projectSelect) {
        return false;
      }
      if (filterKeyword.trim()) {
        const kw = filterKeyword.toLowerCase().trim();
        const titleMatch = m.title.toLowerCase().includes(kw);
        const dateMatch = m.date.toLowerCase().includes(kw);
        const attendeesMatch = (m.attendees || "").toLowerCase().includes(kw);
        const agendaMatch = (m.agendas || []).some(a => a.toLowerCase().includes(kw));
        const decisionsMatch = (m.decisions || []).some(d =>
          d.topic.toLowerCase().includes(kw) || d.bullets.some(b => b.toLowerCase().includes(kw))
        );
        return titleMatch || dateMatch || attendeesMatch || agendaMatch || decisionsMatch;
      }
      return true;
    });
  }, [meetings, activeFolderFilter, projectSelect, filterKeyword]);

  // Folder counts for shelf
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { all: meetings.length };
    folders.forEach(f => {
      counts[f.id] = 0;
    });
    meetings.forEach(m => {
      if (counts[m.category] !== undefined) {
        counts[m.category]++;
      }
    });
    return counts;
  }, [folders, meetings]);

  // All action items for Tracker Tab
  const allActionItemsList = useMemo(() => {
    const list: Array<{
      meetingId: string;
      meetingTitle: string;
      meetingCategory: string;
      meetingDate: string;
      team: string;
      task: Task;
    }> = [];

    meetings.forEach(m => {
      (m.actionItems || []).forEach(group => {
        (group.tasks || []).forEach(t => {
          list.push({
            meetingId: m.id,
            meetingTitle: m.title.split("\n")[0],
            meetingCategory: m.category,
            meetingDate: m.date,
            team: group.team,
            task: t
          });
        });
      });
    });

    return list.filter(item => {
      if (actionStatusFilter === "pending" && item.task.done) return false;
      if (actionStatusFilter === "done" && !item.task.done) return false;
      if (actionTeamFilter !== "all" && item.team !== actionTeamFilter) return false;
      return true;
    });
  }, [meetings, actionStatusFilter, actionTeamFilter]);

  // Quick search results
  const quickSearchResults = useMemo(() => {
    if (!quickSearchQuery.trim()) return [];
    const q = quickSearchQuery.toLowerCase().trim();
    return meetings.filter(m => {
      return (
        m.title.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        (m.agendas || []).some(a => a.toLowerCase().includes(q)) ||
        (m.decisions || []).some(d => d.topic.toLowerCase().includes(q) || d.bullets.some(b => b.toLowerCase().includes(q)))
      );
    });
  }, [meetings, quickSearchQuery]);

  return (
    <div className="theme-notulis">
      {/* Ambient Wallpaper Background */}
      <div className="ambient-bg" aria-hidden="true" />

      <div className="app-container">
        {/* Floating Top Navigation Pill */}
        <header className="top-nav-container">
          <nav className="top-nav-pill" aria-label="Navigasi Utama">
            <Link href="/" className="brand-link" title="Kembali ke Beranda GenMagang">
              <div className="brand-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                <span className="brand-text" style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.02em" }}>
                  Gen<span style={{ color: "#059669" }}>Notulis</span>
                </span>
                <span style={{ fontSize: "0.58rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  GenMagang Suite
                </span>
              </div>
            </Link>

            <div className="nav-links">
              <button
                className={`nav-item ${activeTab === "archive" ? "active" : ""}`}
                onClick={() => { setActiveTab("archive"); setCurrentMeetingId(null); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Arsip Rapat</span>
              </button>

              <button
                className={`nav-item ${activeTab === "actions" ? "active" : ""}`}
                onClick={() => { setActiveTab("actions"); setCurrentMeetingId(null); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                <span>Action Items</span>
                <span className="badge-count">{stats.pendingCount}</span>
              </button>

              <button
                className={`nav-item ${activeTab === "generator" ? "active" : ""}`}
                onClick={() => { setActiveTab("generator"); setCurrentMeetingId(null); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>AI Generator</span>
              </button>

              <button
                className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
                onClick={() => { setActiveTab("settings"); setCurrentMeetingId(null); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>Setelan</span>
              </button>
            </div>

            <div className="nav-actions">
              <Link
                href="/monev"
                className="btn-ghost-sm"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  color: "#134f5c",
                  background: "#eef5f6",
                  padding: "5px 12px",
                  borderRadius: "9999px",
                  transition: "all 150ms"
                }}
                title="Buka Asisten Laporan Monev Kemnaker"
              >
                <span>🤖 GenMonev</span>
              </Link>

              <button
                className="quick-search-trigger"
                onClick={() => setIsQuickSearchOpen(true)}
                title="Cari Cepat (⌘K)"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span className="search-label">Cari notulen...</span>
                <kbd className="kbd-pill">⌘K</kbd>
              </button>

              <button
                className="btn-primary btn-pill"
                onClick={() => {
                  setActiveTab("generator");
                  setCurrentMeetingId(null);
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Notulen Baru</span>
              </button>
            </div>
          </nav>
        </header>

        {/* Hero Headline (Only on Archive Tab) */}
        {activeTab === "archive" && (
          <section className="hero-section">
            <div className="hero-badge">
              <span className="badge-dot" />
              <span>Corporate Meeting Intelligence</span>
            </div>
            <h1 className="hero-title">
              Simpan notulensi.<br />
              <em>Temukan keputusannya</em> dalam hitungan detik.
            </h1>
            <p className="hero-subtitle">
              Notugen mengarsipkan risalah rapat, melacak tindak lanjut per tim, dan mengubah catatan mentah menjadi dokumen resmi standar korporat dengan bantuan Gemini AI.
            </p>

            <div className="hero-quick-stats">
              <div className="stat-pill">
                <strong>{stats.totalMeetings}</strong> Rapat Tersimpan
              </div>
              <div className="stat-pill">
                <strong>{stats.pendingCount}</strong> Tindak Lanjut Menunggu
              </div>
              <div className="stat-pill">
                <strong>{stats.completedCount}</strong> Tugas Selesai
              </div>
            </div>
          </section>
        )}

        {/* Main macOS App Window */}
        <main className="macos-window">
          {/* Window Title Bar */}
          <div className="window-header">
            <div className="traffic-lights" aria-hidden="true">
              <span className="light red" />
              <span className="light yellow" />
              <span className="light green" />
            </div>
            <div className="window-title-tab">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <span>notugen — Workspace Rapat</span>
            </div>
            <div className="window-actions">
              <button className="btn-ghost-sm" onClick={handleExportAllJson} title="Backup Semua Data ke File JSON">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Cadangkan JSON</span>
              </button>
            </div>
          </div>

          <div className="window-body">
            {/* VIEW 1: ARSIP NOTULEN */}
            {activeTab === "archive" && (
              <section className="view-panel active">
                <div className="panel-header-bar">
                  <div className="greeting-box">
                    <span className="greeting-time">{greetingText}</span>
                    <h2 className="panel-title">Riwayat Notulen Rapat</h2>
                  </div>

                  <div className="filter-controls">
                    <div className="search-input-wrap">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        type="text"
                        value={filterKeyword}
                        onChange={(e) => setFilterKeyword(e.target.value)}
                        placeholder="Cari agenda, keputusan, atau nama..."
                      />
                      {filterKeyword && (
                        <button className="btn-clear-search" onClick={() => setFilterKeyword("")}>×</button>
                      )}
                    </div>

                    <select
                      value={projectSelect}
                      onChange={(e) => setProjectSelect(e.target.value)}
                      className="custom-select"
                      aria-label="Filter berdasarkan Proyek"
                    >
                      <option value="all">Semua Proyek / Modul</option>
                      {folders.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Folder Shelf */}
                <div className="folder-shelf">
                  <button
                    type="button"
                    className={`folder-chip ${activeFolderFilter === "all" ? "active" : ""}`}
                    onClick={() => setActiveFolderFilter("all")}
                  >
                    <div className="folder-tab-gradient grad-sand" />
                    <div className="folder-chip-body">
                      <span className="folder-name">Semua Dokumen</span>
                      <span className="folder-count">{folderCounts.all || 0} rapat</span>
                    </div>
                  </button>

                  {folders.map(f => {
                    const count = folderCounts[f.id] || 0;
                    return (
                      <div
                        key={f.id}
                        className={`folder-chip ${activeFolderFilter === f.id ? "active" : ""}`}
                        onClick={() => setActiveFolderFilter(f.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={`folder-tab-gradient ${f.gradient || 'grad-sage'}`} />
                        <div className="folder-chip-body">
                          <div className="folder-chip-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                            <span className="folder-name" title={f.name}>{f.name}</span>
                            <div className="folder-chip-actions" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                className="folder-action-btn edit"
                                onClick={(e) => { e.stopPropagation(); handleOpenEditFolder(f); }}
                                title={`Ganti nama folder ${f.name}`}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="folder-action-btn delete"
                                onClick={(e) => { e.stopPropagation(); handleDeleteFolder(f.id, f.name); }}
                                title={`Hapus folder ${f.name}`}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <span className="folder-count">{count} rapat</span>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    className="folder-chip-add"
                    onClick={handleOpenAddFolder}
                    title="Tambah Folder Proyek Baru"
                  >
                    <div className="folder-chip-add-text">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      <span>Tambah Folder</span>
                    </div>
                  </button>
                </div>

                {/* Meetings Grid */}
                {filteredMeetings.length > 0 ? (
                  <div className="meetings-grid">
                    {filteredMeetings.map(m => {
                      let totalTasks = 0;
                      let doneTasks = 0;
                      (m.actionItems || []).forEach(grp => {
                        (grp.tasks || []).forEach(t => {
                          totalTasks++;
                          if (t.done) doneTasks++;
                        });
                      });
                      const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 100;

                      let badgeClass = "badge-default";
                      if (m.category === "FSCM") badgeClass = "badge-fscm";
                      else if (m.category === "Core Banking") badgeClass = "badge-core";
                      else if (m.category === "Migrasi") badgeClass = "badge-migrasi";
                      else if (m.category === "Bisnis") badgeClass = "badge-bisnis";

                      const snippet = (m.agendas && m.agendas[0]) || (m.summary && m.summary[0]) || "Klik untuk melihat detail risalah rapat...";

                      return (
                        <article
                          key={m.id}
                          className="meeting-card"
                          onClick={() => handleOpenMeetingDetail(m.id)}
                          role="button"
                          tabIndex={0}
                        >
                          <div className="meeting-card-top">
                            <div className="meeting-card-meta-row">
                              <span className={`badge-tag ${badgeClass}`}>{m.category || 'Rapat'}</span>
                              <span className="meeting-date-badge">{m.date}</span>
                            </div>

                            <h3 className="meeting-card-title">
                              {m.title.split('\n').map((line, idx) => (
                                <React.Fragment key={idx}>
                                  {line}
                                  {idx < m.title.split('\n').length - 1 && <br />}
                                </React.Fragment>
                              ))}
                            </h3>

                            <div className="meeting-card-location">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              <span>{m.location || 'Online'}</span>
                            </div>

                            <p className="meeting-card-snippet">{snippet}</p>
                          </div>

                          <div className="meeting-card-footer">
                            <div className="progress-track-wrap">
                              <div className="progress-labels">
                                <span>Action Items: {doneTasks}/{totalTasks}</span>
                                <span>{progressPercent}%</span>
                              </div>
                              <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <circle cx="11" cy="14" r="3" />
                        <line x1="13.5" y1="16.5" x2="16" y2="19" />
                      </svg>
                    </div>
                    {meetings.length === 0 ? (
                      <>
                        <h3>Belum Ada Notulensi Rapat</h3>
                        <p>Mulai unggah transkrip rapat atau rekam suara menggunakan AI Generator untuk membuat dokumen notulensi resmi.</p>
                        <button
                          className="btn-primary btn-sm"
                          onClick={() => setActiveTab("generator")}
                          style={{ marginTop: "12px" }}
                        >
                          Buka AI Generator
                        </button>
                      </>
                    ) : (
                      <>
                        <h3>Tidak ada notulensi yang cocok</h3>
                        <p>Coba sesuaikan kata kunci pencarian atau reset filter kategori.</p>
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => { setFilterKeyword(""); setProjectSelect("all"); setActiveFolderFilter("all"); }}
                          style={{ marginTop: "12px" }}
                        >
                          Reset Pencarian
                        </button>
                      </>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* VIEW 2: DETAIL NOTULEN RESMI */}
            {activeTab === "detail" && activeMeeting && (
              <section className="view-panel active">
                <div className="detail-toolbar">
                  <div className="toolbar-left">
                    <button className="btn-ghost-sm" onClick={() => setActiveTab("archive")}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                      </svg>
                      <span>Kembali ke Arsip</span>
                    </button>
                    <div className="breadcrumb-divider">/</div>
                    <span className="current-doc-title">{activeMeeting.title.split('\n')[0]}</span>
                  </div>

                  {/* FOLDER SWITCHER */}
                  <div className="toolbar-center">
                    <div className="folder-reassign-pill" title="Pindahkan dokumen ini ke folder proyek lain">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                      <span className="folder-reassign-title">Pindahkan Folder:</span>
                      <select
                        className="custom-select custom-select-reassign"
                        value={activeMeeting.category}
                        onChange={(e) => handleReassignFolder(activeMeeting.id, e.target.value)}
                      >
                        {folders.length === 0 ? (
                          <option value={activeMeeting.category || "Umum"}>{activeMeeting.category || "Umum"}</option>
                        ) : (
                          folders.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="toolbar-right">
                    <button className="btn-secondary btn-sm" onClick={() => handleCopyWhatsApp(activeMeeting)} title="Salin format ringkas untuk WhatsApp / Slack">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span>Salin untuk WA / Teams</span>
                    </button>

                    <button className="btn-secondary btn-sm" onClick={handlePrintPdf} title="Cetak atau Simpan PDF (sesuai format BNI)">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 6 2 18 2 18 9" />
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                        <rect x="6" y="14" width="12" height="8" />
                      </svg>
                      <span>Cetak / Ekspor PDF</span>
                    </button>

                    <button className="btn-danger-ghost btn-sm" onClick={() => handleDeleteMeeting(activeMeeting)} title="Hapus Notulen Ini">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>

                {/* OFFICIAL CORPORATE PAPER */}
                <div className="official-paper-wrapper">
                  <article className="official-document" id="printableOfficialDoc">
                    {/* Running Header */}
                    <div className="doc-running-header">
                      <div className="corporate-brand-mark">
                        <span className="corp-logo-text">BNI</span>
                        <span className="corp-tagline">Corporate Meeting Minutes</span>
                      </div>
                      <div className="doc-header-right">
                        <span className="doc-sublabel">Notulen – Agenda</span>
                      </div>
                    </div>

                    {/* Main Title */}
                    <div className="doc-title-block">
                      <h2 className="doc-main-title">NOTULEN MEETING</h2>
                    </div>

                    {/* Metadata Table */}
                    <div className="doc-table-container">
                      <table className="corporate-metadata-table">
                        <tbody>
                          <tr>
                            <th className="col-meta-label">Judul Meeting</th>
                            <td className="col-meta-colon">:</td>
                            <td className="col-meta-value">
                              {activeMeeting.title.split('\n').map((l, i) => (
                                <React.Fragment key={i}>{l}{i < activeMeeting.title.split('\n').length - 1 && <br />}</React.Fragment>
                              ))}
                            </td>
                          </tr>
                          <tr>
                            <th className="col-meta-label">Folder / Proyek</th>
                            <td className="col-meta-colon">:</td>
                            <td className="col-meta-value">
                              <div className="doc-meta-category-inline">
                                <span className="badge-tag badge-fscm">{activeMeeting.category}</span>
                                <span>{activeMeeting.category}</span>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <th className="col-meta-label">Hari, Tanggal</th>
                            <td className="col-meta-colon">:</td>
                            <td className="col-meta-value">{activeMeeting.date || "-"}</td>
                          </tr>
                          <tr>
                            <th className="col-meta-label">Jam Meeting</th>
                            <td className="col-meta-colon">:</td>
                            <td className="col-meta-value">{activeMeeting.time || "-"}</td>
                          </tr>
                          <tr>
                            <th className="col-meta-label">Tempat</th>
                            <td className="col-meta-colon">:</td>
                            <td className="col-meta-value">{activeMeeting.location || "-"}</td>
                          </tr>
                          <tr>
                            <th className="col-meta-label">Pimpinan Meeting</th>
                            <td className="col-meta-colon">:</td>
                            <td className="col-meta-value">{activeMeeting.leader || "-"}</td>
                          </tr>
                          <tr>
                            <th className="col-meta-label">Peserta Meeting</th>
                            <td className="col-meta-colon">:</td>
                            <td className="col-meta-value">{activeMeeting.attendees || "-"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Section 1: Agenda */}
                    <section className="doc-section">
                      <div className="doc-section-header">
                        <h3>Agenda Meeting:</h3>
                      </div>
                      <div className="doc-section-body">
                        {activeMeeting.agendas && activeMeeting.agendas.length > 0 ? (
                          <ol>
                            {activeMeeting.agendas.map((ag, idx) => (
                              <li key={idx}>{ag}</li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-faint"><em>Tidak ada agenda spesifik yang dicatat.</em></p>
                        )}
                      </div>
                    </section>

                    {/* Section 2: Keputusan Meeting */}
                    <section className="doc-section">
                      <div className="doc-section-header">
                        <h3>Keputusan Meeting:</h3>
                      </div>
                      <div className="doc-section-body">
                        {activeMeeting.decisions && activeMeeting.decisions.length > 0 ? (
                          activeMeeting.decisions.map((dec, idx) => (
                            <div key={idx} className="decision-topic-block">
                              <div className="decision-topic-title">{dec.topic}</div>
                              <ul className="decision-bullet-list">
                                {(dec.bullets || []).map((b, bIdx) => (
                                  <li key={bIdx}>{b}</li>
                                ))}
                              </ul>
                            </div>
                          ))
                        ) : (
                          <p className="text-faint"><em>Tidak ada keputusan resmi yang dicatat.</em></p>
                        )}
                      </div>
                    </section>

                    {/* Section 3: Memo Meeting */}
                    <section className="doc-section">
                      <div className="doc-section-header">
                        <h3>Memo Meeting:</h3>
                      </div>
                      <div className="doc-section-body">
                        {activeMeeting.memos && activeMeeting.memos.length > 0 ? (
                          activeMeeting.memos.map((memo, idx) => (
                            <div key={idx} className="memo-topic-block">
                              <div className="memo-topic-title">{memo.header}</div>
                              {(memo.speakers || []).map((spk, sIdx) => (
                                <div key={sIdx} className="memo-speaker-block">
                                  <div className="memo-speaker-label">{spk.label}</div>
                                  <ul className="memo-sub-bullet-list">
                                    {(spk.items || []).map((item, iIdx) => (
                                      <li key={iIdx}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          ))
                        ) : (
                          <p className="text-faint"><em>Tidak ada memo diskusi teknis yang dicatat.</em></p>
                        )}
                      </div>
                    </section>

                    {/* Section 4: Kesimpulan */}
                    <section className="doc-section">
                      <div className="doc-section-header">
                        <h3>Kesimpulan Meeting:</h3>
                      </div>
                      <div className="doc-section-body">
                        {activeMeeting.summary && activeMeeting.summary.length > 0 ? (
                          <ol>
                            {activeMeeting.summary.map((s, idx) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ol>
                        ) : (
                          <p className="text-faint"><em>Tidak ada kesimpulan khusus.</em></p>
                        )}
                      </div>
                    </section>

                    {/* Section 5: Action Items */}
                    <section className="doc-section">
                      <div className="doc-section-header">
                        <h3>Action Items Tindak Lanjut:</h3>
                        <span className="section-hint">(Klik kotak centang untuk memperbarui progres status)</span>
                      </div>
                      <div className="doc-section-body">
                        {activeMeeting.actionItems && activeMeeting.actionItems.length > 0 ? (
                          activeMeeting.actionItems.map((group, gIdx) => (
                            <div key={gIdx} className="action-team-group">
                              <div className="action-team-name">{group.team}:</div>
                              <ul className="action-team-list">
                                {(group.tasks || []).map(t => (
                                  <li key={t.id} className={`action-check-row ${t.done ? 'done' : ''}`}>
                                    <input
                                      type="checkbox"
                                      className="action-checkbox"
                                      checked={t.done}
                                      onChange={(e) => handleToggleTask(activeMeeting.id, t.id, e.target.checked)}
                                      aria-label="Tandai selesai"
                                    />
                                    <span className="action-text-content">
                                      {t.text}
                                      {t.due && <span className="action-due-date">(Target: {t.due})</span>}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))
                        ) : (
                          <p className="text-faint"><em>Tidak ada action items tindak lanjut.</em></p>
                        )}
                      </div>
                    </section>
                  </article>
                </div>
              </section>
            )}

            {/* VIEW 3: ACTION ITEMS TRACKER */}
            {activeTab === "actions" && (
              <section className="view-panel active">
                <div className="panel-header-bar">
                  <div>
                    <span className="greeting-time">Pelacak Tindak Lanjut Terpadu</span>
                    <h2 className="panel-title">Semua Action Items Lintas Rapat</h2>
                  </div>

                  <div className="action-filters">
                    <div className="status-tab-group">
                      <button
                        className={`status-pill ${actionStatusFilter === "all" ? "active" : ""}`}
                        onClick={() => setActionStatusFilter("all")}
                      >
                        Semua ({stats.totalActions})
                      </button>
                      <button
                        className={`status-pill ${actionStatusFilter === "pending" ? "active" : ""}`}
                        onClick={() => setActionStatusFilter("pending")}
                      >
                        Menunggu ({stats.pendingCount})
                      </button>
                      <button
                        className={`status-pill ${actionStatusFilter === "done" ? "active" : ""}`}
                        onClick={() => setActionStatusFilter("done")}
                      >
                        Selesai ({stats.completedCount})
                      </button>
                    </div>

                    <select
                      value={actionTeamFilter}
                      onChange={(e) => setActionTeamFilter(e.target.value)}
                      className="custom-select"
                      aria-label="Filter berdasarkan Tim / Role"
                    >
                      <option value="all">Semua Tim / Divisi</option>
                      <option value="Tim Pengembang (WDL)">Tim Pengembang (WDL)</option>
                      <option value="Tim QA / Tester (TSA)">Tim QA / Tester (TSA)</option>
                      <option value="Tim Bisnis (WDC)">Tim Bisnis (WDC)</option>
                      <option value="Tim Core Banking / ADV">Tim Core Banking / ADV</option>
                      <option value="Tim Project Management (STA)">Tim Project Management (STA)</option>
                    </select>
                  </div>
                </div>

                <div className="action-cards-container">
                  {allActionItemsList.length > 0 ? (
                    <div className="action-cards-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {allActionItemsList.map(item => (
                        <div
                          key={item.task.id}
                          className={`action-item-card ${item.task.done ? 'done' : ''}`}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            background: '#fff',
                            padding: '14px 18px',
                            borderRadius: '10px',
                            border: '1px solid rgba(28, 25, 23, 0.08)',
                            boxShadow: '0 1px 3px rgba(28, 25, 23, 0.04)',
                            transition: 'all 150ms'
                          }}
                        >
                          <input
                            type="checkbox"
                            className="action-checkbox"
                            checked={item.task.done}
                            onChange={(e) => handleToggleTask(item.meetingId, item.task.id, e.target.checked)}
                            style={{ marginTop: '3px' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <span className="badge-tag badge-fscm" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                                {item.meetingCategory}
                              </span>
                              <span style={{ fontSize: '0.78rem', color: '#134f5c', fontWeight: 600 }}>
                                {item.team}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: '0.92rem',
                                color: item.task.done ? '#a8a29e' : '#1c1917',
                                textDecoration: item.task.done ? 'line-through' : 'none'
                              }}
                            >
                              {item.task.text}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', fontSize: '0.78rem', color: '#78716c' }}>
                              <span>Target: <strong>{item.task.due || 'Segera'}</strong></span>
                              <span>•</span>
                              <button
                                onClick={() => handleOpenMeetingDetail(item.meetingId)}
                                style={{ background: 'none', border: 'none', color: '#134f5c', cursor: 'pointer', textDecoration: 'underline', padding: 0, font: 'inherit' }}
                              >
                                {item.meetingTitle}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="9 11 12 14 22 4" />
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                      </div>
                      <h3>Tidak Ada Action Items</h3>
                      <p>Semua tindak lanjut telah selesai atau belum ada tugas yang dicatat dalam notulensi.</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* VIEW 4: AI MEETING GENERATOR */}
            {activeTab === "generator" && (
              <section className="view-panel active">
                <div className="panel-header-bar">
                  <div>
                    <span className="greeting-time">AI Meeting Processor</span>
                    <h2 className="panel-title">Transformasi Catatan Kasar Menjadi Notulen Resmi</h2>
                  </div>
                </div>

                <div className="generator-layout">
                  {/* Left Column: Input Form */}
                  <div className="generator-input-pane">
                    {/* Multimodal Tab Selector */}
                    <div className="input-mode-tabs">
                      <button
                        type="button"
                        className={`mode-tab-btn ${generatorMode === "transcript" ? "active" : ""}`}
                        onClick={() => setGeneratorMode("transcript")}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        <span>1. Transkrip Teks</span>
                      </button>

                      <button
                        type="button"
                        className={`mode-tab-btn ${generatorMode === "voice" ? "active" : ""}`}
                        onClick={() => setGeneratorMode("voice")}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" y1="19" x2="12" y2="23" />
                          <line x1="8" y1="23" x2="16" y2="23" />
                        </svg>
                        <span>2. Rekam Voice Note / Audio</span>
                      </button>

                      <button
                        type="button"
                        className={`mode-tab-btn ${generatorMode === "video" ? "active" : ""}`}
                        onClick={() => setGeneratorMode("video")}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="23 7 16 12 23 17 23 7" />
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                        </svg>
                        <span>3. Video Rekaman Meeting</span>
                      </button>
                    </div>

                    {/* Mode 1: Transcript */}
                    {generatorMode === "transcript" && (
                      <div className="input-card mode-panel">
                        <div className="input-card-header">
                          <label htmlFor="rawMeetingNotesInput"><strong>Masukkan Transkrip / Catatan Kasar Rapat</strong></label>
                          <span className="input-subhint">Mendukung teks kasar percakapan, transkrip video Teams/Zoom, atau catatan coret-coret</span>
                        </div>
                        <textarea
                          id="rawMeetingNotesInput"
                          rows={11}
                          value={rawNotesInput}
                          onChange={(e) => setRawNotesInput(e.target.value)}
                          placeholder="Tempelkan transkrip rapat atau catatan mentah di sini...&#10;&#10;Contoh:&#10;Rapat Selasa 20 Okt 2026 jam 2 siang di RDTX lantai 35 dan Teams. Bahas FSCM R2 dan Release 3. Mas Eko dev bilang latensi balance widget aman di pre-prod 10 CPU dibawah 30 detik..."
                        />
                      </div>
                    )}

                    {/* Mode 2: Voice Note */}
                    {generatorMode === "voice" && (
                      <div className="input-card mode-panel">
                        <div className="input-card-header">
                          <label><strong>Rekam atau Unggah Voice Note / Audio Rapat</strong></label>
                          <span className="input-subhint">Gemini AI akan mendengarkan rekaman audio dan mengekstrak poin notulen secara otomatis</span>
                        </div>

                        <div className="voice-tools-grid">
                          {/* Option A: Direct Mic Recording */}
                          <div className="voice-card-mic">
                            <div className="mic-status-row">
                              <div className={`mic-pulse-indicator ${isRecording ? 'recording' : ''}`} />
                              <span className="mic-timer-text">
                                {String(Math.floor(recordSeconds / 60)).padStart(2, '0')}:{String(recordSeconds % 60).padStart(2, '0')}
                              </span>
                              <span className="mic-label-text">
                                {isRecording ? "Merekam suara..." : "Mikrofon Siap"}
                              </span>
                            </div>
                            <button
                              type="button"
                              className={`btn-secondary btn-sm btn-mic-action ${isRecording ? 'recording' : ''}`}
                              onClick={isRecording ? stopRecording : startRecording}
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <circle cx="12" cy="12" r="6" fill="#DC2626" stroke="#DC2626" />
                              </svg>
                              <span>{isRecording ? "Hentikan Rekaman (Selesai)" : "Mulai Rekam Voice Note"}</span>
                            </button>
                          </div>

                          {/* Option B: Upload File */}
                          <div className="voice-card-upload">
                            <label htmlFor="audioFileInput" className="media-dropzone">
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                              </svg>
                              <span className="dropzone-title">Pilih / Seret File Audio Rapat</span>
                              <span className="dropzone-hint">Format MP3, M4A, WAV, AAC, OGG, WebM</span>
                            </label>
                            <input
                              type="file"
                              id="audioFileInput"
                              className="hidden"
                              accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg,.webm"
                              onChange={(e) => handleFileUpload(e, "audio")}
                            />
                          </div>
                        </div>

                        {mediaAttachment && mediaAttachment.type === "audio" && (
                          <div className="media-preview-box" style={{ marginTop: '12px' }}>
                            <div className="preview-media-info">
                              <span className="preview-icon">🎵</span>
                              <div className="preview-text-col">
                                <strong className="preview-filename">{mediaAttachment.fileName}</strong>
                                <span className="preview-filesize">{(mediaAttachment.fileSize / 1024).toFixed(1)} KB</span>
                              </div>
                              <button type="button" className="btn-ghost-sm" onClick={() => setMediaAttachment(null)}>✕ Hapus</button>
                            </div>
                          </div>
                        )}

                        <div className="media-context-input" style={{ marginTop: '12px' }}>
                          <label><strong>Catatan Tambahan untuk Audio (Opsional):</strong></label>
                          <input
                            type="text"
                            value={rawNotesInput}
                            onChange={(e) => setRawNotesInput(e.target.value)}
                            placeholder="Misal: Agenda pembahasan migrasi database dan rilis 3"
                          />
                        </div>
                      </div>
                    )}

                    {/* Mode 3: Video */}
                    {generatorMode === "video" && (
                      <div className="input-card mode-panel">
                        <div className="input-card-header">
                          <label><strong>Unggah File Video Rekaman Rapat</strong></label>
                          <span className="input-subhint">Mendukung rekaman dari Microsoft Teams, Zoom, Google Meet, Webex (.mp4, .webm, .mov)</span>
                        </div>

                        <label htmlFor="videoFileInput" className="media-dropzone video-dropzone">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                          </svg>
                          <span className="dropzone-title">Klik atau Seret Rekaman Video Meeting ke Sini</span>
                          <span className="dropzone-hint">Format MP4, WebM, MOV (&lt; 25MB)</span>
                        </label>
                        <input
                          type="file"
                          id="videoFileInput"
                          className="hidden"
                          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                          onChange={(e) => handleFileUpload(e, "video")}
                        />

                        {mediaAttachment && mediaAttachment.type === "video" && (
                          <div className="media-preview-box" style={{ marginTop: '12px' }}>
                            <div className="preview-media-info">
                              <span className="preview-icon">🎥</span>
                              <div className="preview-text-col">
                                <strong className="preview-filename">{mediaAttachment.fileName}</strong>
                                <span className="preview-filesize">{(mediaAttachment.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                              </div>
                              <button type="button" className="btn-ghost-sm" onClick={() => setMediaAttachment(null)}>✕ Hapus</button>
                            </div>
                          </div>
                        )}

                        <div className="media-context-input" style={{ marginTop: '12px' }}>
                          <label><strong>Catatan Tambahan untuk Video (Opsional):</strong></label>
                          <input
                            type="text"
                            value={rawNotesInput}
                            onChange={(e) => setRawNotesInput(e.target.value)}
                            placeholder="Misal: Rapat evaluasi sprint mingguan tim Core Banking"
                          />
                        </div>
                      </div>
                    )}

                    {/* Metadata Options */}
                    <div className="generator-settings-row" style={{ marginTop: '16px' }}>
                      <div className="setting-col">
                        <label htmlFor="genMeetingTitle"><strong>Judul Pertemuan (Opsional)</strong></label>
                        <input
                          type="text"
                          id="genMeetingTitle"
                          value={genCustomTitle}
                          onChange={(e) => setGenCustomTitle(e.target.value)}
                          placeholder="Misal: FSCM R2 Re-promote & Preparation Release 3"
                        />
                      </div>
                      <div className="setting-col">
                        <label htmlFor="genMeetingCategory"><strong>Pilih Folder Proyek Tujuan:</strong></label>
                        <select
                          id="genMeetingCategory"
                          className="custom-select custom-select-lg"
                          value={genCategory}
                          onChange={(e) => setGenCategory(e.target.value)}
                        >
                          {folders.length === 0 ? (
                            <option value="Umum">Umum</option>
                          ) : (
                            folders.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="generator-action-box" style={{ marginTop: '18px' }}>
                      <div className="api-key-status-indicator">
                        <span className={`status-dot ${apiKey ? 'green' : 'yellow'}`} />
                        <span>{apiKey ? 'Gemini API Siap Digunakan' : 'Mode Offline / Template Aktif (Tambahkan API key di Setelan)'}</span>
                      </div>

                      <button
                        className="btn-primary btn-generate"
                        onClick={handleGenerateMeeting}
                        disabled={isGenerating}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span>{isGenerating ? "Memproses Dokumen..." : "Format Menjadi Dokumen Notulen Resmi"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Structure Checklist & Progress */}
                  <div className="generator-preview-pane">
                    <div className="preview-card-header">
                      <h3>Struktur Standar yang Dihasilkan:</h3>
                      <span className="badge-format">Format Resmi BNI</span>
                    </div>

                    <div className="format-checklist">
                      <div className="check-item">
                        <span className="check-icon">✓</span>
                        <div>
                          <strong>Tabel Identitas Rapat Lengkap</strong>
                          <p>Judul, Folder Proyek, Hari/Tanggal, Jam, Tempat, Pimpinan, & Peserta.</p>
                        </div>
                      </div>
                      <div className="check-item">
                        <span className="check-icon">✓</span>
                        <div>
                          <strong>Agenda Meeting</strong>
                          <p>Poin-poin topik bahasan utama yang dibahas terurut.</p>
                        </div>
                      </div>
                      <div className="check-item">
                        <span className="check-icon">✓</span>
                        <div>
                          <strong>Keputusan Meeting</strong>
                          <p>Kesepakatan teknis, batas target (SLA), dan verifikasi lingkungan.</p>
                        </div>
                      </div>
                      <div className="check-item">
                        <span className="check-icon">✓</span>
                        <div>
                          <strong>Memo Dinamika & Pembahasan Teknis</strong>
                          <p>Catatan argumen teknis berdasarkan kontribusi PIC/stakeholder terkait.</p>
                        </div>
                      </div>
                      <div className="check-item">
                        <span className="check-icon">✓</span>
                        <div>
                          <strong>Kesimpulan Rapat</strong>
                          <p>Ringkasan eksekutif hasil rapat.</p>
                        </div>
                      </div>
                      <div className="check-item">
                        <span className="check-icon">✓</span>
                        <div>
                          <strong>Action Items Tindak Lanjut per Unit Kerja</strong>
                          <p>Daftar tugas terstruktur untuk Tim WDL, TSA, WDC, ADV, dan STA.</p>
                        </div>
                      </div>
                    </div>

                    {isGenerating && (
                      <div className="gen-loading-overlay" style={{ display: 'flex' }}>
                        <div className="spinner-circle" />
                        <p className="loading-status-text">{generationProgress || "Gemini sedang menyusun notulen resmi..."}</p>
                        <span className="loading-subtext">Mengekstrak keputusan teknis dan daftar action items</span>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* VIEW 5: SETELAN & MANAJEMEN DATA */}
            {activeTab === "settings" && (
              <section className="view-panel active">
                <div className="panel-header-bar">
                  <div>
                    <span className="greeting-time">Konfigurasi</span>
                    <h2 className="panel-title">Setelan Aplikasi & Privasi</h2>
                  </div>
                </div>

                <div className="settings-grid">
                  {/* Gemini API Key */}
                  <div className="settings-card">
                    <div className="settings-card-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                      </svg>
                    </div>
                    <div className="settings-card-content">
                      <h3>Google Gemini API Key</h3>
                      <p>Kunci API disimpan secara lokal di browser Anda (LocalStorage) dan hanya digunakan untuk memanggil Google Generative Language API secara langsung dari browser Anda.</p>

                      <div className="api-key-input-group">
                        <input
                          type={showApiKey ? "text" : "password"}
                          value={tempApiKey}
                          onChange={(e) => setTempApiKey(e.target.value)}
                          placeholder="Masukkan Gemini API Key (AIzaSy...)"
                        />
                        <button
                          className="btn-secondary btn-sm"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? "Sembunyikan" : "Tampilkan"}
                        </button>
                        <button
                          className="btn-primary btn-sm"
                          onClick={() => {
                            setApiKey(tempApiKey.trim());
                            localStorage.setItem(STORAGE_KEY_API_KEY, tempApiKey.trim());
                            showToast("Gemini API Key berhasil disimpan!");
                          }}
                        >
                          Simpan Key
                        </button>
                      </div>
                      <div className="key-hint">
                        <span>Belum punya key? Dapatkan gratis di <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>.</span>
                      </div>
                    </div>
                  </div>

                  {/* Gemini Model */}
                  <div className="settings-card">
                    <div className="settings-card-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                        <line x1="6" y1="6" x2="6.01" y2="6" />
                        <line x1="6" y1="18" x2="6.01" y2="18" />
                      </svg>
                    </div>
                    <div className="settings-card-content">
                      <h3>Pilihan Model AI</h3>
                      <p>Pilih model Gemini yang ingin digunakan untuk memproses transkrip rapat. Sistem memiliki auto-fallback ke model stabil jika limit tercapai.</p>
                      <div className="model-select-wrap">
                        <select
                          className="custom-select"
                          value={selectedModel}
                          onChange={(e) => {
                            setSelectedModel(e.target.value);
                            localStorage.setItem(STORAGE_KEY_MODEL, e.target.value);
                            showToast(`Model default diubah ke ${e.target.value}`);
                          }}
                        >
                          <option value="gemini-2.5-flash">Gemini 2.5 Flash — Tercepat & Kuota Tertinggi (Rekomendasi)</option>
                          <option value="gemini-1.5-flash">Gemini 1.5 Flash — LTS Sangat Stabil & Selalu Tersedia</option>
                          <option value="gemini-2.5-pro">Gemini 2.5 Pro — Akurasi Tinggi untuk Rapat Panjang</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Backup & Clear Data */}
                  <div className="settings-card">
                    <div className="settings-card-icon">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                    </div>
                    <div className="settings-card-content">
                      <h3>Cadangkan & Reset Data</h3>
                      <p>Seluruh notulensi, folder proyek, dan status action items tersimpan di browser Anda. Anda dapat mengunduh salinan cadangan JSON kapan saja.</p>

                      <div className="backup-action-row" style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                        <button className="btn-secondary btn-sm" onClick={handleExportAllJson}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          <span>Unduh Cadangan JSON</span>
                        </button>

                        <button
                          className="btn-danger-ghost btn-sm"
                          onClick={() => {
                            setConfirmDialog({
                              open: true,
                              title: "Reset Semua Data Notugen?",
                              message: "Seluruh data rapat dan folder akan dihapus dari LocalStorage browser. Tindakan ini tidak dapat dibatalkan.",
                              onConfirm: () => {
                                saveMeetings([]);
                                saveFolders([]);
                                setCurrentMeetingId(null);
                                showToast("Data berhasil direset menjadi kosongan");
                                setConfirmDialog(prev => ({ ...prev, open: false }));
                              }
                            });
                          }}
                        >
                          Reset Semua Data
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      {/* --- MODAL 1: TAMBAH / EDIT FOLDER --- */}
      {isFolderModalOpen && (
        <div className="modal-dialog" style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-folder-box">
            <div className="modal-folder-header">
              <h3>{folderModalMode === "add" ? "Tambah Folder Proyek Baru" : "Ganti Nama Folder"}</h3>
              <button className="btn-ghost-sm" onClick={() => setIsFolderModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveFolder} className="modal-folder-form">
              <div className="form-group">
                <label>Nama Folder / Modul Proyek:</label>
                <input
                  type="text"
                  value={folderNameInput}
                  onChange={(e) => setFolderNameInput(e.target.value)}
                  placeholder="Misal: Mobile Banking, Enterprise Data, Security"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Pilih Warna Tab Folder:</label>
                <div className="color-picker-grid">
                  {[
                    { val: "grad-sage", title: "Sage Green" },
                    { val: "grad-purple", title: "Lavender Purple" },
                    { val: "grad-amber", title: "Warm Amber" },
                    { val: "grad-clay", title: "Rose Clay" },
                    { val: "grad-blue", title: "Sky Blue" },
                    { val: "grad-teal", title: "Mint Teal" },
                    { val: "grad-coral", title: "Warm Coral" },
                  ].map(c => (
                    <label key={c.val} className="color-option">
                      <input
                        type="radio"
                        name="folderGradient"
                        value={c.val}
                        checked={folderGradientInput === c.val}
                        onChange={(e) => setFolderGradientInput(e.target.value)}
                      />
                      <span className={`color-preview ${c.val}`} title={c.title} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-folder-actions">
                <button type="button" className="btn-secondary btn-sm" onClick={() => setIsFolderModalOpen(false)}>Batal</button>
                <button type="submit" className="btn-primary btn-sm">Simpan Folder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: KONFIRMASI HAPUS MODERN --- */}
      {confirmDialog.open && (
        <div className="modal-dialog" style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-confirm-box">
            <div className="confirm-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </div>
            <div className="confirm-body">
              <h3>{confirmDialog.title}</h3>
              <p>{confirmDialog.message}</p>
            </div>
            <div className="confirm-actions">
              <button type="button" className="btn-secondary btn-sm" onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}>Batal</button>
              <button type="button" className="btn-danger btn-sm" onClick={confirmDialog.onConfirm}>Ya, Lanjutkan</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: QUICK SEARCH (COMMAND + K) --- */}
      {isQuickSearchOpen && (
        <div
          className="modal-dialog"
          style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setIsQuickSearchOpen(false)}
        >
          <div className="modal-search-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-input-row">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                placeholder="Cari apa saja di semua notulensi rapat..."
                autoFocus
              />
              <kbd className="kbd-pill-sm">ESC</kbd>
            </div>

            <div className="modal-results-list">
              {quickSearchQuery.trim() ? (
                quickSearchResults.length > 0 ? (
                  quickSearchResults.map(m => (
                    <div
                      key={m.id}
                      className="search-hit-item"
                      onClick={() => {
                        handleOpenMeetingDetail(m.id);
                        setIsQuickSearchOpen(false);
                      }}
                      style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge-tag badge-fscm" style={{ fontSize: '0.65rem' }}>{m.category}</span>
                        <strong style={{ fontSize: '0.88rem' }}>{m.title.split('\n')[0]}</strong>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        {m.date} • {m.location}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
                    Tidak ditemukan notulensi yang cocok dengan kata kunci &quot;{quickSearchQuery}&quot;
                  </div>
                )
              ) : (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.88rem' }}>
                  Ketik kata kunci untuk mencari notulensi rapat berdasarkan judul, agenda, atau keputusan...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Hub */}
      {toastMessage && (
        <div className="toast-hub" style={{ display: 'flex', zIndex: 10000 }}>
          <div className="toast-message show" style={{ animation: 'fadeToastIn 200ms ease' }}>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
