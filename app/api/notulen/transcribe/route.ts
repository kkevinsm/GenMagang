import { NextRequest } from "next/server";
import { detectProvider, resolveGeminiModels } from "@/lib/ai";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import {
  CHUNK_SEC,
  formatClock,
  shiftTimestamps,
  splitAudioIntoChunks,
  type AudioChunk,
} from "@/lib/notulen-audio";

export const maxDuration = 300;

// Otomatis ekstrak audio track dari video menjadi MP3 ringan menggunakan ffmpeg
// Menghemat ukuran berkas 80-95% dan membuat gemini-3.5-transcribe bekerja dengan sempurna
async function extractAudioFromVideoBuffer(
  videoBuffer: Buffer,
  originalFileName: string
): Promise<{ buffer: Buffer; mimeType: string; fileName: string; durationSec: number }> {
  const tempDir = os.tmpdir();
  const ext = path.extname(originalFileName) || ".mp4";
  const inputPath = path.join(tempDir, `vid_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`);
  const outputPath = path.join(tempDir, `aud_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`);

  try {
    await fs.promises.writeFile(inputPath, videoBuffer);

    await new Promise<void>((resolve, reject) => {
      execFile(
        "ffmpeg",
        ["-y", "-i", inputPath, "-vn", "-acodec", "libmp3lame", "-q:a", "4", outputPath],
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });

    let durationSec = 0;
    try {
      const durOut = await new Promise<string>((resolve) => {
        execFile(
          "ffprobe",
          ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", outputPath],
          (_err, stdout) => {
            resolve(stdout || "");
          }
        );
      });
      durationSec = parseFloat(durOut.trim()) || 0;
    } catch {
      durationSec = 0;
    }

    const mp3Buffer = await fs.promises.readFile(outputPath);
    const mp3Name = originalFileName.replace(/\.[^/.]+$/, "") + ".mp3";
    return {
      buffer: mp3Buffer,
      mimeType: "audio/mp3",
      fileName: mp3Name,
      durationSec,
    };
  } finally {
    fs.promises.unlink(inputPath).catch(() => {});
    fs.promises.unlink(outputPath).catch(() => {});
  }
}

// Upload media buffer to Gemini File API (server-to-server, zero CORS issues)
// This ensures Google's media processor properly decodes the full audio track + video frames.
async function uploadBufferToGeminiFileApi(
  apiKey: string,
  buffer: Buffer,
  mimeType: string,
  displayName: string
): Promise<string> {
  const initUrl =
    "https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=resumable";

  const initRes = await fetch(initUrl, {
    method: "POST",
    headers: {
      "X-Goog-API-Key": apiKey,
      "X-Goog-Upload-Protocol": "resumable",
      "X-Goog-Upload-Command": "start",
      "X-Goog-Upload-Header-Content-Length": String(buffer.byteLength),
      "X-Goog-Upload-Header-Content-Type": mimeType,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      file: { display_name: displayName },
    }),
  });

  if (!initRes.ok) {
    const errText = await initRes.text();
    throw new Error(`Gagal inisialisasi Gemini File API [${initRes.status}]: ${errText}`);
  }

  const uploadUrl = initRes.headers.get("X-Goog-Upload-URL");
  if (!uploadUrl) {
    throw new Error("Upload URL tidak diterima dari Gemini File API.");
  }

  // Upload the binary bytes
  const uploadRes = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": String(buffer.byteLength),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
      "Content-Type": mimeType,
    },
    body: new Uint8Array(buffer),
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Gagal mengunggah media ke Gemini [${uploadRes.status}]: ${errText}`);
  }

  const uploadData = await uploadRes.json();
  const fileUri: string = uploadData?.file?.uri;
  if (!fileUri) {
    throw new Error("File URI tidak ditemukan setelah unggah ke Gemini.");
  }

  if (uploadData?.file?.state === "ACTIVE") {
    return fileUri;
  }

  // Poll until Google finishes decoding the video/audio stream (state === "ACTIVE")
  const rawFileName = uploadData?.file?.name || fileUri;
  const fileNamePart = rawFileName.includes("/files/")
    ? rawFileName.split("/files/")[1]
    : rawFileName.replace(/^files\//, "");
  const pollUrl = `https://generativelanguage.googleapis.com/v1beta/files/${fileNamePart}?key=${apiKey}`;

  for (let i = 0; i < 60; i++) {
    const pollRes = await fetch(pollUrl);
    if (pollRes.ok) {
      const pollData = await pollRes.json();
      if (pollData?.state === "ACTIVE") {
        return fileUri;
      }
      if (pollData?.state === "FAILED") {
        throw new Error("Gemini gagal mendekode berkas video/audio ini. Pastikan berkas tidak rusak.");
      }
    }
    await new Promise((r) => setTimeout(r, 2000));
  }

  throw new Error("Waktu habis menunggu Gemini memproses berkas video/audio.");
}

// Format granular word annotations into clean [MM:SS] speaker dialogue
function formatAnnotationsToTimestamps(annotations: any[]): string {
  if (!annotations || annotations.length === 0) return "";

  const speakerMap = new Map<string, string>();
  let speakerCounter = 1;

  const turns: { timestamp: string; speaker: string; words: string[] }[] = [];
  let currentSpeakerKey = "";
  let currentWords: string[] = [];
  let currentBlockStartSec = 0;
  let lastEndSec = 0;

  for (const ann of annotations) {
    const rawSpeaker = ann.speaker || "spk:0";
    if (!speakerMap.has(rawSpeaker)) {
      speakerMap.set(rawSpeaker, `Pembicara ${speakerCounter++}`);
    }

    const startSec =
      typeof ann.start_offset === "number"
        ? ann.start_offset
        : parseFloat(String(ann.start_offset || "0").replace("s", ""));
    const endSec =
      typeof ann.end_offset === "number"
        ? ann.end_offset
        : parseFloat(String(ann.end_offset || "0").replace("s", ""));

    const word = String(ann.text || "").trim();
    if (!word) continue;

    const isNewSpeaker = rawSpeaker !== currentSpeakerKey;
    const isLongPause = lastEndSec > 0 && startSec - lastEndSec > 2.0;
    const isBlockTooLong =
      currentWords.length >= 22 && /[.?!]$/.test(currentWords[currentWords.length - 1]);

    if (currentWords.length > 0 && (isNewSpeaker || isLongPause || isBlockTooLong)) {
      const mm = String(Math.floor(currentBlockStartSec / 60)).padStart(2, "0");
      const ss = String(Math.floor(currentBlockStartSec % 60)).padStart(2, "0");
      turns.push({
        timestamp: `[${mm}:${ss}]`,
        speaker: speakerMap.get(currentSpeakerKey) || "Pembicara 1",
        words: [...currentWords],
      });
      currentWords = [];
    }

    if (currentWords.length === 0) {
      currentBlockStartSec = startSec;
      currentSpeakerKey = rawSpeaker;
    }

    currentWords.push(word);
    lastEndSec = endSec || startSec;
  }

  if (currentWords.length > 0) {
    const mm = String(Math.floor(currentBlockStartSec / 60)).padStart(2, "0");
    const ss = String(Math.floor(currentBlockStartSec % 60)).padStart(2, "0");
    turns.push({
      timestamp: `[${mm}:${ss}]`,
      speaker: speakerMap.get(currentSpeakerKey) || "Pembicara 1",
      words: currentWords,
    });
  }

  return turns.map((t) => `${t.timestamp} ${t.speaker}: "${t.words.join(" ")}"`).join("\n\n");
}

// Mengurutkan dan memformat teks transkrip datar menjadi percakapan berurutan waktu [MM:SS]
function formatFlatTextIntoTimestampedDialogue(text: string, estimatedDurationSeconds = 2400): string {
  const clean = text.trim();
  if (!clean) return "";

  // Jika teks sudah memiliki timestamp [MM:SS], pertahankan format aslinya
  if (/\[\d{1,3}:\d{2}\]/.test(clean)) {
    return clean;
  }

  const sentences = clean.match(/[^.!?\n]+[.!?]+|\s*[^.!?\n]+$/g) || [clean];
  const turns: { speaker: string; text: string }[] = [];
  let currentWords: string[] = [];
  let currentSpeakerId = 1;

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;

    // Deteksi kata penanda giliran bicara alami dalam rapat
    const isTurnCue = /^(oke|oh iya|heeh|cukup|makasih|terima kasih|udah|cuman|ya|iya|selamat|halo|siang|pagi|sore|malam)/i.test(trimmed);

    if (isTurnCue && currentWords.length >= 6) {
      turns.push({
        speaker: `Pembicara ${currentSpeakerId}`,
        text: currentWords.join(" "),
      });
      currentWords = [];
      currentSpeakerId = currentSpeakerId === 1 ? 2 : 1;
    }

    currentWords.push(trimmed);

    // Potong per blok 18-25 kata agar enak dibaca per menit percakapan
    if (currentWords.join(" ").split(/\s+/).length >= 20) {
      turns.push({
        speaker: `Pembicara ${currentSpeakerId}`,
        text: currentWords.join(" "),
      });
      currentWords = [];
      currentSpeakerId = currentSpeakerId === 1 ? 2 : 1;
    }
  }

  if (currentWords.length > 0) {
    turns.push({
      speaker: `Pembicara ${currentSpeakerId}`,
      text: currentWords.join(" "),
    });
  }

  if (turns.length === 0) return clean;

  const totalTurns = turns.length;
  const duration = Math.max(60, estimatedDurationSeconds);

  return turns
    .map((turn, idx) => {
      const turnSec = Math.floor((idx / Math.max(1, totalTurns - 1)) * duration);
      const mm = String(Math.floor(turnSec / 60)).padStart(2, "0");
      const ss = String(turnSec % 60).padStart(2, "0");
      return `[${mm}:${ss}] ${turn.speaker}: "${turn.text}"`;
    })
    .join("\n\n");
}

// Call Gemini 3.5 Transcribe via Google's dedicated Interactions API
async function callGeminiInteractionsApi(
  apiKey: string,
  model: string,
  fileUri: string,
  mediaMimeType: string,
  totalDurationSec = 2400
): Promise<string> {
  const url = "https://generativelanguage.googleapis.com/v1beta/interactions";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      input: [
        {
          type: "audio",
          uri: fileUri,
          mime_type: mediaMimeType.startsWith("video/") ? "audio/mp4" : mediaMimeType,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini Interactions API [${res.status}]: ${errText}`);
  }

  const data = await res.json();

  // 1. Cek apakah ada data word annotations dengan timestamp
  const allAnnotations: any[] = [];
  if (Array.isArray(data?.steps)) {
    for (const step of data.steps) {
      if (Array.isArray(step?.content)) {
        for (const c of step.content) {
          if (Array.isArray(c?.annotations)) {
            for (const a of c.annotations) {
              if (a?.start_offset || a?.type === "word_info") {
                allAnnotations.push(a);
              }
            }
          }
        }
      }
    }
  }

  if (allAnnotations.length > 0) {
    const formattedFromAnnotations = formatAnnotationsToTimestamps(allAnnotations);
    if (formattedFromAnnotations.trim()) {
      return formattedFromAnnotations;
    }
  }

  // 2. Ekstrak flat text
  let extractedText = "";
  if (Array.isArray(data?.steps)) {
    for (const step of data.steps) {
      if (Array.isArray(step?.content)) {
        for (const c of step.content) {
          if (c?.text) extractedText += c.text + "\n";
        }
      } else if (typeof step?.text === "string") {
        extractedText += step.text + "\n";
      }
    }
  } else if (typeof data?.output_text === "string") {
    extractedText = data.output_text;
  } else if (typeof data?.text === "string") {
    extractedText = data.text;
  } else if (typeof data?.transcript === "string") {
    extractedText = data.transcript;
  }

  extractedText = extractedText.trim();
  if (!extractedText) {
    throw new Error("Respon teks transkripsi dari gemini-3.5-transcribe kosong.");
  }

  // 3. Urutkan berdasarkan waktu/menit [MM:SS]
  return formatFlatTextIntoTimestampedDialogue(extractedText, totalDurationSec);
}

// Call Gemini with File API URI for verbatim transcription (supports up to 65,536 tokens & auto-continuation)
async function callGeminiTranscribeFileUri(
  apiKey: string,
  model: string,
  systemInstruction: string,
  textPrompt: string,
  fileUri: string,
  mediaMimeType: string,
  maxLoops = 2
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const maxTokens = 8192;

  let fullTranscript = "";
  const conversationContents: any[] = [
    {
      parts: [
        {
          file_data: {
            mime_type: mediaMimeType,
            file_uri: fileUri,
          },
        },
        { text: textPrompt },
      ],
    },
  ];

  for (let loop = 0; loop < maxLoops; loop++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90_000);
    const fetchPayload = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: conversationContents,
        generationConfig: {
          temperature: 0.0,
          topP: 0.95,
          maxOutputTokens: maxTokens,
        },
      }),
      signal: controller.signal,
    };

    let res: Response;
    try {
      res = await fetch(url, fetchPayload);
    } finally {
      clearTimeout(timeoutId);
    }
    if (!res.ok) {
      const errText = await res.text();
      // If 65536 token limit is rejected on a specific tier, fallback to 8192
      if (maxTokens > 8192 && (errText.includes("maxOutputTokens") || errText.includes("range"))) {
        const retryRes = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: conversationContents,
            generationConfig: {
              temperature: 0.0,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          }),
        });
        if (!retryRes.ok) {
          const retryErr = await retryRes.text();
          throw new Error(`Gemini File API Transcribe Error [${retryRes.status}]: ${retryErr}`);
        }
        const retryData = await retryRes.json();
        const candidate = retryData?.candidates?.[0];
        const chunk = (candidate?.content?.parts || []).map((p: any) => p?.text || "").join("").trim();
        fullTranscript += (fullTranscript ? "\n" : "") + chunk;
        if (candidate?.finishReason !== "MAX_TOKENS" || !chunk) break;

        conversationContents.push({ role: "model", parts: [{ text: chunk }] });
        conversationContents.push({
          role: "user",
          parts: [{ text: `Lanjutkan transkripsi kata demi kata (verbatim) persis dari kalimat terakhir: "${chunk.slice(-120)}" sampai menit paling akhir dari video rapat.` }],
        });
        continue;
      }
      throw new Error(`Gemini File API Transcribe Error [${res.status}]: ${errText}`);
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const textChunk = parts.map((p: any) => p?.text || "").join("").trim();

    if (!textChunk) {
      if (fullTranscript) break;
      throw new Error("Respon transkripsi dari Gemini kosong.");
    }

    fullTranscript += (fullTranscript ? "\n" : "") + textChunk;

    // Jika selesai secara normal (bukan terpotong batas token), selesai!
    if (candidate?.finishReason !== "MAX_TOKENS") {
      break;
    }

    // Jika terpotong di MAX_TOKENS, lanjutkan dari potongan terakhir!
    const lastSnippet = textChunk.slice(-120).trim();
    conversationContents.push({
      role: "model",
      parts: [{ text: textChunk }],
    });
    conversationContents.push({
      role: "user",
      parts: [
        {
          text: `Lanjutkan transkripsi kata demi kata (verbatim) persis mulai setelah kalimat: "${lastSnippet}" hingga bagian paling akhir rekaman video rapat. Teruskan dengan format [MM:SS] Pembicara: "..." tanpa mengulang kalimat yang sudah ditulis.`,
        },
      ],
    });
  }

  return fullTranscript;
}

// Call Gemini with inline base64 (fallback for small audio files)
async function callGeminiTranscribeInline(
  apiKey: string,
  model: string,
  systemInstruction: string,
  textPrompt: string,
  mediaBase64: string,
  mediaMimeType: string,
  maxLoops = 2
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const maxTokens = 8192;

  let fullTranscript = "";
  const conversationContents: any[] = [
    {
      role: "user",
      parts: [
        { inlineData: { mimeType: mediaMimeType, data: mediaBase64 } },
        { text: textPrompt },
      ],
    },
  ];

  for (let loop = 0; loop < maxLoops; loop++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90_000);
    const fetchPayload = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: conversationContents,
        generationConfig: {
          temperature: 0.0,
          topP: 0.95,
          maxOutputTokens: maxTokens,
        },
      }),
      signal: controller.signal,
    };

    let res: Response;
    try {
      res = await fetch(url, fetchPayload);
    } finally {
      clearTimeout(timeoutId);
    }
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini Inline Transcribe Error [${res.status}]: ${errText}`);
    }

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    const textChunk = parts.map((p: any) => p?.text || "").join("").trim();

    if (!textChunk) {
      if (fullTranscript) break;
      throw new Error("Respon transkripsi dari Gemini kosong.");
    }

    fullTranscript += (fullTranscript ? "\n" : "") + textChunk;

    if (candidate?.finishReason !== "MAX_TOKENS") {
      break;
    }

    const lastSnippet = textChunk.slice(-120).trim();
    conversationContents.push({
      role: "model",
      parts: [{ text: textChunk }],
    });
    conversationContents.push({
      role: "user",
      parts: [
        {
          text: `Lanjutkan transkripsi audio kata demi kata persis mulai setelah kalimat: "${lastSnippet}" hingga detik terakhir rekaman.`,
        },
      ],
    });
  }

  return fullTranscript;
}

// Call OpenAI Whisper API (verbose_json with segment timestamps)
async function callOpenAIWhisper(
  apiKey: string,
  buffer: Buffer,
  mediaMimeType: string,
  fileName = "meeting-recording.mp4"
): Promise<string> {
  const blob = new Blob([new Uint8Array(buffer)], { type: mediaMimeType || "audio/webm" });
  const formData = new FormData();
  formData.append("file", blob, fileName);
  formData.append("model", "whisper-1");
  formData.append("response_format", "verbose_json");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI Whisper Error [${res.status}]: ${errText}`);
  }

  const data = await res.json();
  if (Array.isArray(data?.segments) && data.segments.length > 0) {
    return data.segments
      .map((seg: any) => {
        const sec = Math.floor(seg.start || 0);
        const mm = String(Math.floor(sec / 60)).padStart(2, "0");
        const ss = String(sec % 60).padStart(2, "0");
        return `[${mm}:${ss}] ${(seg.text || "").trim()}`;
      })
      .join("\n");
  }

  const text = (data?.text || "").trim();
  if (!text) throw new Error("Hasil transkripsi Whisper kosong.");
  return text;
}

const AUTH_MESSAGE = "API Key Gemini tidak valid. Periksa kembali API Key Anda di menu Setelan.";

/** Error yang tidak boleh di-retry (mis. API key salah). */
class FatalTranscribeError extends Error {}

interface MediaSource {
  fileUri: string;
  base64: string;
  mimeType: string;
}

interface FailoverState {
  models: string[];
  /** Model yang terbukti tidak bisa dipakai (404 / kuota free tier 0): dilewati untuk sisa request. */
  dead: Set<string>;
  /** Model yang terakhir sukses: dicoba lebih dulu pada potongan berikutnya. */
  preferred: string | null;
  used: Set<string>;
  specialistDead: boolean;
}

interface TranscribeOptions {
  systemInstruction: string;
  textPrompt: string;
  durationSec: number;
  maxLoops?: number;
  label: string;
}

interface ProgressUpdate {
  percent: number;
  message: string;
  partialTranscript?: string;
}

/** Ronde percobaan ulang atas seluruh model: tanpa jeda, lalu jeda 8 dtk, lalu 20 dtk. */
const RETRY_ROUND_DELAYS_MS = [0, 8_000, 20_000];

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function errorStatus(message: string): number | null {
  const m = message.match(/\[(\d{3})\]/);
  return m ? parseInt(m[1], 10) : null;
}

function isAuthFailure(message: string): boolean {
  return errorStatus(message) === 401 || /api key not valid/i.test(message);
}

function shortError(message: string): string {
  const status = errorStatus(message);
  const text = message.match(/"message":\s*"([^"]{0,140})/)?.[1] ?? message.slice(0, 140);
  return `${status ?? "?"} ${text}`;
}

function failureMessage(lastErr: string): string {
  if (lastErr.includes("429") || lastErr.includes("RESOURCE_EXHAUSTED")) {
    return "Kuota semua model Gemini pada API Key Anda sedang penuh (Rate Limit 429). Tunggu sekitar 1 menit lalu klik 'Ulangi', atau gunakan API Key baru.";
  }
  return `Gagal mentranskripsikan media (${shortError(lastErr)}). Model Gemini sedang sibuk atau tidak tersedia, coba lagi beberapa menit lagi.`;
}

function liveModels(state: FailoverState): string[] {
  const alive = state.models.filter((m) => !state.dead.has(m));
  if (state.preferred && alive.includes(state.preferred)) {
    return [state.preferred, ...alive.filter((m) => m !== state.preferred)];
  }
  return alive;
}

/**
 * Transkripsi satu sumber media langsung menggunakan keluarga model Gemini Flash
 * secara berurutan, lalu ulangi ronde dengan jeda bila terjadi 503/429 sementara.
 */
async function transcribeSource(
  key: string,
  state: FailoverState,
  source: MediaSource,
  opts: TranscribeOptions
): Promise<string> {
  let lastErr = "";
  let empties = 0;

  for (let round = 0; round < RETRY_ROUND_DELAYS_MS.length; round++) {
    const candidates = liveModels(state);
    if (candidates.length === 0) break;

    if (round > 0) {
      console.warn(
        `[${opts.label}] semua model gagal sementara, ronde ${round + 1}/${RETRY_ROUND_DELAYS_MS.length} dalam ${RETRY_ROUND_DELAYS_MS[round] / 1000} dtk`
      );
      await new Promise<void>((resolve) => setTimeout(resolve, RETRY_ROUND_DELAYS_MS[round]));
    }

    for (const model of candidates) {
      try {
        const loops = opts.maxLoops ?? 2;
        const text = source.fileUri
          ? await callGeminiTranscribeFileUri(
              key,
              model,
              opts.systemInstruction,
              opts.textPrompt,
              source.fileUri,
              source.mimeType,
              loops
            )
          : await callGeminiTranscribeInline(
              key,
              model,
              opts.systemInstruction,
              opts.textPrompt,
              source.base64,
              source.mimeType,
              loops
            );
        state.preferred = model;
        state.used.add(model);
        return text;
      } catch (err: unknown) {
        const msg = errMsg(err);
        lastErr = msg;
        if (isAuthFailure(msg)) throw new FatalTranscribeError(AUTH_MESSAGE);

        const status = errorStatus(msg);
        console.warn(`[${opts.label}] ${model} gagal: ${shortError(msg)}`);

        if (msg.includes("Respon transkripsi dari Gemini kosong")) {
          // Dua model berbeda sama-sama kosong: anggap potongan ini memang tanpa ucapan.
          empties++;
          if (empties >= 2) return "";
        } else if (status === 404 || status === 400 || (status === 429 && /limit:\s*0/.test(msg))) {
          state.dead.add(model);
        }
      }
    }
  }

  throw new Error(lastErr || "Semua model Gemini tidak tersedia.");
}

async function uploadChunk(key: string, chunk: AudioChunk, displayName: string): Promise<MediaSource> {
  const mimeType = "audio/mp3";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const fileUri = await uploadBufferToGeminiFileApi(key, chunk.buffer, mimeType, displayName);
      return { fileUri, base64: "", mimeType };
    } catch (err: unknown) {
      const msg = errMsg(err);
      if (isAuthFailure(msg)) throw new FatalTranscribeError(AUTH_MESSAGE);
      console.warn(`Upload ${displayName} gagal (percobaan ${attempt + 1}/2): ${shortError(msg)}`);
    }
  }
  // Potongan 10 menit hanya beberapa MB, aman dikirim inline sebagai cadangan.
  return { fileUri: "", base64: chunk.buffer.toString("base64"), mimeType };
}

/** Transkripsi tiap potongan secara berurutan; potongan yang gagal ditandai, bukan menggagalkan semuanya. */
async function transcribeChunked(
  key: string,
  state: FailoverState,
  chunks: AudioChunk[],
  systemInstruction: string,
  textPrompt: string,
  baseName: string,
  onProgress?: (update: ProgressUpdate) => void
): Promise<{ text: string; warning: string }> {
  const parts: string[] = [];
  const failedRanges: string[] = [];
  let lastFailure = "";
  let priorTail = "";

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const range = `${formatClock(chunk.startSec)}-${formatClock(chunk.startSec + chunk.durationSec)}`;
    const label = `bagian ${i + 1}/${chunks.length} (${range})`;
    const startPct = Math.round(38 + (i / chunks.length) * 56);
    console.log(`Mentranskripsi ${label} dengan Gemini Flash...`);
    onProgress?.({
      percent: startPct,
      message: `Mentranskripsi Bagian ${i + 1}/${chunks.length} (menit ${range}) dengan Gemini Flash...`,
      ...(parts.length > 0 ? { partialTranscript: parts.join("\n\n") } : {}),
    });

    try {
      const source = await uploadChunk(key, chunk, `${baseName}-part${i + 1}.mp3`);
      const chunkPrompt =
        `${textPrompt}\n\n` +
        `Ini adalah BAGIAN ${i + 1} dari ${chunks.length} dari satu rekaman rapat panjang (menit ${range} pada rekaman asli). ` +
        `Timestamp [MM:SS] HARUS dihitung dari awal bagian ini (00:00 = awal bagian ini).` +
        (priorTail
          ? `\n\nCuplikan akhir bagian sebelumnya, HANYA untuk menjaga konsistensi nama pembicara. JANGAN ditulis ulang:\n${priorTail}`
          : "");

      let text = await transcribeSource(key, state, source, {
        systemInstruction,
        textPrompt: chunkPrompt,
        durationSec: chunk.durationSec,
        maxLoops: 1,
        label,
      });

      if (!text.trim()) {
        console.log(`${label}: tidak ada ucapan terdeteksi.`);
        continue;
      }
      if (!/\[\d{1,3}:\d{2}\]/.test(text)) {
        text = formatFlatTextIntoTimestampedDialogue(text, chunk.durationSec);
      }
      text = shiftTimestamps(text, chunk.startSec);
      parts.push(text);
      priorTail = text.slice(-400);

      const donePct = Math.round(38 + ((i + 1) / chunks.length) * 56);
      console.log(`Selesai ${label} (${donePct}%)`);
      onProgress?.({
        percent: donePct,
        message:
          i + 1 < chunks.length
            ? `Bagian ${i + 1}/${chunks.length} selesai • Lanjut Bagian ${i + 2}/${chunks.length}...`
            : `Seluruh ${chunks.length} bagian selesai ditranskripsi! Menyusun hasil akhir...`,
        partialTranscript: parts.join("\n\n"),
      });
    } catch (err: unknown) {
      if (err instanceof FatalTranscribeError) throw err;
      lastFailure = errMsg(err);
      failedRanges.push(range);
      console.error(`${label} GAGAL: ${shortError(lastFailure)}`);
      parts.push(
        `[${formatClock(chunk.startSec)}] (BAGIAN ${range} GAGAL DITRANSKRIPSI: ${shortError(lastFailure)}. Coba transkripsi ulang.)`
      );
    }
  }

  if (failedRanges.length === chunks.length) {
    throw new Error(failureMessage(lastFailure));
  }

  return {
    text: parts.join("\n\n"),
    warning: failedRanges.length
      ? `Transkrip belum lengkap: bagian menit ${failedRanges.join(", ")} gagal diproses karena model Gemini sibuk. Klik "Ulangi" untuk mencoba lagi.`
      : "",
  };
}

export async function POST(request: NextRequest) {
  try {
    let apiKeyInput = "";
    let providerInput = "";
    let mediaMimeType = "video/mp4";
    let mediaType = "video";
    let fileName = "recording.mp4";
    let contextNotes = "";
    let mediaFileUri = "";
    let fileBuffer: Buffer | null = null;
    let mediaBase64 = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      apiKeyInput = (formData.get("apiKey") as string) || "";
      providerInput = (formData.get("provider") as string) || "";
      mediaMimeType = (formData.get("mediaMimeType") as string) || "video/mp4";
      mediaType = (formData.get("mediaType") as string) || "video";
      fileName = (formData.get("fileName") as string) || "recording.mp4";
      contextNotes = (formData.get("contextNotes") as string) || "";
      mediaFileUri = (formData.get("mediaFileUri") as string) || "";

      const uploadedFile = formData.get("file") as File | null;
      if (uploadedFile) {
        const arrayBuf = await uploadedFile.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuf);
        mediaMimeType = uploadedFile.type || mediaMimeType;
        fileName = uploadedFile.name || fileName;
      }
    } else {
      const body = await request.json();
      apiKeyInput = body.apiKey || "";
      providerInput = body.provider || "";
      mediaMimeType = body.mediaMimeType || "video/mp4";
      mediaType = body.mediaType || "video";
      fileName = body.fileName || "recording.mp4";
      contextNotes = body.contextNotes || "";
      mediaFileUri = body.mediaFileUri || "";
      mediaBase64 = body.mediaBase64 || "";
      if (mediaBase64) {
        fileBuffer = Buffer.from(mediaBase64, "base64");
      }
    }

    const key =
      apiKeyInput.trim() ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.ANTHROPIC_API_KEY ||
      "";

    if (!key) {
      return Response.json(
        {
          error:
            "API Key belum dikonfigurasi. Silakan masukkan API Key Gemini atau OpenAI di menu Setelan terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    const activeProvider = detectProvider(key, providerInput);
    const streamRequested = request.headers.get("x-stream-progress") === "1";

    const executeTranscription = async (
      onProgress?: (update: ProgressUpdate) => void
    ): Promise<{
      success: true;
      transcript: string;
      model: string;
      warning?: string;
    }> => {
      let mediaDurationSec = 0;
      let audioChunks: AudioChunk[] | null = null;

      if (fileBuffer && activeProvider === "gemini") {
        try {
          const mb = (fileBuffer.byteLength / 1024 / 1024).toFixed(1);
          console.log(`Memecah audio ${fileName} (${mb} MB) per ${CHUNK_SEC / 60} menit...`);
          onProgress?.({
            percent: 30,
            message: `Mengekstrak & mengompresi audio dari ${fileName} (${mb} MB)...`,
          });
          const split = await splitAudioIntoChunks(fileBuffer, fileName);
          audioChunks = split.chunks;
          mediaDurationSec = split.totalDurationSec;
          mediaType = "audio";
          mediaMimeType = "audio/mp3";
          mediaFileUri = "";
          mediaBase64 = "";
          fileBuffer = null;
          console.log(
            `Audio siap: ${audioChunks.length} potongan, total ${formatClock(mediaDurationSec)} (${Math.round(mediaDurationSec)} detik)`
          );
        } catch (splitErr: unknown) {
          console.warn(
            "ffmpeg tidak tersedia atau gagal, memproses berkas apa adanya (satu permintaan):",
            errMsg(splitErr)
          );
        }
      } else if (fileBuffer && (mediaType === "video" || mediaMimeType.startsWith("video/"))) {
        try {
          const extracted = await extractAudioFromVideoBuffer(fileBuffer, fileName);
          fileBuffer = extracted.buffer;
          mediaMimeType = extracted.mimeType;
          mediaType = "audio";
          fileName = extracted.fileName;
          mediaDurationSec = extracted.durationSec;
          mediaFileUri = "";
          mediaBase64 = "";
        } catch (extractErr: unknown) {
          console.warn("Ekstraksi audio ffmpeg tidak berhasil, melanjutkan dengan video asli:", errMsg(extractErr));
        }
      }

      const systemInstruction = `Anda adalah mesin Speech-to-Text (STT) & Transkripsi Verbatim profesional dengan tingkat akurasi sangat tinggi.
Tugas Anda adalah mendengarkan secara teliti jalur suara (audio track) dari rekaman ${
        mediaType === "video" ? "video" : "audio"
      } yang dilampirkan dari detik pertama hingga detik terakhir, kemudian menuliskan TRANSKRIP KATA DEMI KATA (VERBATIM) persis seperti yang diucapkan di dalam rekaman tersebut.

ATURAN WAJIB TRANSKRIPSI (HARUS DIIKUTI 100%):
1. KATA DEMI KATA (VERBATIM): Tuliskan setiap kalimat, kata, sapaan, istilah, dan angka PERSIS seperti yang diucapkan oleh pembicara di dalam rekaman.
2. DILARANG MERANGKUM ATAU MENGARANG: JANGAN menyimpulkan, JANGAN memparafrase, dan JANGAN membuat kalimat/topik fiktif yang tidak diucapkan di dalam video/audio! Hasil harus 100% sesuai dengan ucapan asli di video/audio.
3. DETAIL & LENGKAP DARI AWAL SAMPAI AKHIR: Transkripsikan seluruh ucapan dari awal rekaman hingga selesai tanpa ada kalimat yang dilewati.
4. FORMAT BARIS & TIMESTAMP:
   Gunakan format berikut di setiap pergantian kalimat atau segmen waktu:
   [MM:SS] Pembicara (atau Nama jika disebutkan): "Kalimat persis yang diucapkan..."
5. TEKS VISUAL DI LAYAR (KHUSUS VIDEO): Jika ada teks penting yang tampil di layar video dan relevan dengan ucapan, Anda boleh menambahkannya secara singkat dengan label [Teks di Layar: ...], tetapi prioritas utama adalah seluruh kata-kata yang diucapkan secara lisan.
6. Bahasa mengikuti bahasa yang diucapkan di dalam rekaman (Bahasa Indonesia maupun istilah bahasa asing yang diucapkan).`;

      const textPrompt = `Transkripsikan seluruh kata-kata yang diucapkan di dalam rekaman ${
        mediaType === "video" ? "video" : "audio"
      } terlampir secara VERBATIM (kata demi kata persis sesuai ucapan asli di rekaman) lengkap dengan timestamp [MM:SS] SECARA PENUH DARI AWAL (00:00) HINGGA MENIT PALING AKHIR REKAMAN SELESAI (jangan berhenti di tengah rekaman, lanjutkan terus sampai selesai).
${contextNotes ? `\nKonteks tambahan (opsional): ${contextNotes}\n` : ""}
Jangan merangkum dan jangan menambahkan teks pembuka/penutup di luar isi transkrip.`;

      let transcriptText = "";
      let chosenModel = "";
      let warning = "";

      if (activeProvider === "gemini") {
        const state: FailoverState = {
          models: await resolveGeminiModels(key),
          dead: new Set<string>(),
          preferred: null,
          used: new Set<string>(),
          specialistDead: true,
        };

        if (audioChunks) {
          const baseName = fileName.replace(/\.[^/.]+$/, "") || "rekaman";
          const result = await transcribeChunked(
            key,
            state,
            audioChunks,
            systemInstruction,
            textPrompt,
            baseName,
            onProgress
          );
          transcriptText = result.text;
          warning = result.warning;
        } else {
          const source: MediaSource = {
            fileUri: mediaFileUri,
            base64: mediaBase64,
            mimeType: mediaMimeType,
          };
          if (!source.fileUri && fileBuffer) {
            try {
              onProgress?.({
                percent: 45,
                message: "Mengunggah berkas media ke Gemini Flash...",
              });
              source.fileUri = await uploadBufferToGeminiFileApi(key, fileBuffer, mediaMimeType, fileName);
            } catch (uploadErr: unknown) {
              const msg = errMsg(uploadErr);
              if (isAuthFailure(msg)) throw new FatalTranscribeError(AUTH_MESSAGE);
              console.warn("Gemini File API upload warning, falling back to inline if small:", msg);
              if (!source.base64 && fileBuffer.byteLength <= 15 * 1024 * 1024) {
                source.base64 = fileBuffer.toString("base64");
              } else {
                throw uploadErr;
              }
            }
          }
          if (!source.fileUri && !source.base64) {
            throw new Error("Data berkas video/audio tidak ditemukan.");
          }

          onProgress?.({
            percent: 65,
            message: "Gemini Flash sedang mentranskripsikan rekaman...",
          });
          try {
            transcriptText = await transcribeSource(key, state, source, {
              systemInstruction,
              textPrompt,
              durationSec: mediaDurationSec,
              label: "berkas",
            });
          } catch (err: unknown) {
            if (err instanceof FatalTranscribeError) throw err;
            throw new Error(failureMessage(errMsg(err)));
          }
        }

        chosenModel = `Gemini (${[...state.used].join(", ") || "tidak diketahui"})`;
      } else if (activeProvider === "openai" && fileBuffer) {
        onProgress?.({
          percent: 60,
          message: "Mentranskripsikan audio dengan OpenAI Whisper...",
        });
        transcriptText = await callOpenAIWhisper(
          key,
          fileBuffer,
          mediaMimeType,
          fileName
        );
        chosenModel = "OpenAI Whisper-1";
      } else {
        throw new Error(
          "Untuk transkripsi berkas video/audio, gunakan API Key Google Gemini (AIza...) atau OpenAI (sk-...) di menu Setelan."
        );
      }

      if (transcriptText && !/\[\d{1,3}:\d{2}\]/.test(transcriptText)) {
        transcriptText = formatFlatTextIntoTimestampedDialogue(
          transcriptText,
          mediaDurationSec || 2400
        );
      }

      return {
        success: true,
        transcript: transcriptText,
        model: chosenModel,
        ...(warning ? { warning } : {}),
      };
    };

    if (streamRequested) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          const send = (payload: Record<string, unknown>) => {
            controller.enqueue(encoder.encode(JSON.stringify(payload) + "\n"));
          };
          try {
            const finalResult = await executeTranscription((update) => {
              send({ type: "progress", ...update });
            });
            send({ type: "result", ...finalResult });
          } catch (err: unknown) {
            console.error("Notulen AI Transcribe stream error:", err);
            send({
              type: "error",
              error: err instanceof Error ? err.message : "Terjadi kesalahan pada pemrosesan transkripsi.",
            });
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-Accel-Buffering": "no",
        },
      });
    }

    const result = await executeTranscription();
    return Response.json(result);
  } catch (error: unknown) {
    console.error("Notulen AI Transcribe error:", error);
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan pada pemrosesan transkripsi.";
    return Response.json({ error: message }, { status: 500 });
  }
}
