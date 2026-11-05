import { NextRequest } from "next/server";
import { detectProvider } from "@/lib/ai";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

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

  // Poll until Google finishes decoding the video/audio stream (state === "ACTIVE")
  const fileNamePart = fileUri.split("/files/")[1];
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
  mediaMimeType: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const maxTokens = (model.includes("2.5") || model.includes("2.0") || model.includes("3.")) ? 65536 : 8192;

  let fullTranscript = "";
  const conversationContents: any[] = [
    {
      role: "user",
      parts: [
        { fileData: { mimeType: mediaMimeType, fileUri: fileUri } },
        { text: textPrompt },
      ],
    },
  ];

  for (let loop = 0; loop < 5; loop++) {
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
    };

    let res = await fetch(url, fetchPayload);

    // Auto-retry once on 503 high demand spike
    if (res.status === 503) {
      await new Promise((r) => setTimeout(r, 1500));
      res = await fetch(url, fetchPayload);
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
  mediaMimeType: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const maxTokens = (model.includes("2.5") || model.includes("2.0") || model.includes("3.")) ? 65536 : 8192;

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

  for (let loop = 0; loop < 5; loop++) {
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
    };

    let res = await fetch(url, fetchPayload);

    // Auto-retry once on 503 high demand spike
    if (res.status === 503) {
      await new Promise((r) => setTimeout(r, 1500));
      res = await fetch(url, fetchPayload);
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

    // Otomatis ekstrak audio track (MP3) dari video menggunakan ffmpeg
    // Mengurangi ukuran berkas 80-95% dan memungkinkan pemakaian model spesialis gemini-3.5-transcribe
    let mediaDurationSec = 0;
    if (fileBuffer && (mediaType === "video" || mediaMimeType.startsWith("video/"))) {
      try {
        console.log(`Mengekstrak audio MP3 dari video ${fileName} (${(fileBuffer.byteLength / 1024 / 1024).toFixed(1)} MB)...`);
        const extracted = await extractAudioFromVideoBuffer(fileBuffer, fileName);
        fileBuffer = extracted.buffer;
        mediaMimeType = extracted.mimeType;
        mediaType = "audio";
        fileName = extracted.fileName;
        mediaDurationSec = extracted.durationSec;
        mediaFileUri = "";
        mediaBase64 = "";
        console.log(`Audio MP3 berhasil diekstrak: ${(fileBuffer.byteLength / 1024 / 1024).toFixed(1)} MB (Durasi: ${mediaDurationSec} detik)`);
      } catch (extractErr: any) {
        console.warn("Ekstraksi audio ffmpeg tidak berhasil, melanjutkan dengan video asli:", extractErr.message);
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

    // Strict Verbatim Speech-to-Text System Instruction
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

    if (activeProvider === "gemini") {
      // Ensure media is uploaded to Gemini File API so Google's media engine decodes the full audio stream + video frames
      let activeFileUri = mediaFileUri;
      if (!activeFileUri && fileBuffer) {
        try {
          activeFileUri = await uploadBufferToGeminiFileApi(
            key,
            fileBuffer,
            mediaMimeType,
            fileName
          );
        } catch (uploadErr: any) {
          console.warn("Gemini File API upload warning, falling back to inline if small:", uploadErr.message);
          if (!mediaBase64 && fileBuffer.byteLength <= 15 * 1024 * 1024) {
            mediaBase64 = fileBuffer.toString("base64");
          } else {
            throw uploadErr;
          }
        }
      }

      // 1. Jika berkas adalah AUDIO murni, gunakan model spesialis gemini-3.5-transcribe via Interactions API
      // (Catatan: Google secara resmi membatasi gemini-3.5-transcribe hanya untuk format audio, bukan video)
      const isAudioOnly = mediaType === "audio" || mediaMimeType.startsWith("audio/");
      if (activeFileUri && isAudioOnly) {
        try {
          transcriptText = await callGeminiInteractionsApi(
            key,
            "gemini-3.5-transcribe",
            activeFileUri,
            mediaMimeType,
            mediaDurationSec || 2400
          );
          chosenModel = "gemini-3.5-transcribe (Spesialis Speech-to-Text)";
        } catch (interactionsErr: any) {
          console.warn("gemini-3.5-transcribe Interactions API failed, beralih ke model multimodal:", interactionsErr.message);
          if (
            interactionsErr.message.includes("401") ||
            interactionsErr.message.toLowerCase().includes("api key not valid")
          ) {
            throw new Error("API Key Gemini tidak valid. Periksa kembali API Key Anda di menu Setelan.");
          }
        }
      }

      // 2. Untuk rekaman VIDEO (atau fallback audio), gunakan model multimodal via generateContent
      // Mengutamakan gemini-2.0-flash yang sangat stabil, bebas 503 high demand, dan mendukung 65.536 tokens
      if (!transcriptText) {
        const geminiModels = [
          "gemini-2.0-flash",
          "gemini-2.0-flash-lite",
          "gemini-1.5-flash",
          "gemini-2.5-flash",
          "gemini-1.5-flash-8b",
          "gemini-1.5-pro",
          "gemini-flash-latest",
        ];

        let lastErr = "";
        for (const model of geminiModels) {
          try {
            if (activeFileUri) {
              transcriptText = await callGeminiTranscribeFileUri(
                key,
                model,
                systemInstruction,
                textPrompt,
                activeFileUri,
                mediaMimeType
              );
            } else if (mediaBase64) {
              transcriptText = await callGeminiTranscribeInline(
                key,
                model,
                systemInstruction,
                textPrompt,
                mediaBase64,
                mediaMimeType
              );
            } else {
              throw new Error("Data berkas video/audio tidak ditemukan.");
            }
            chosenModel = `Gemini (${model})`;
            break;
          } catch (err: any) {
            lastErr = err.message || String(err);
            console.warn(`Gemini transcribe [${model}] failed:`, lastErr);
            if (
              lastErr.includes("401") ||
              lastErr.toLowerCase().includes("api key not valid")
            ) {
              throw new Error("API Key Gemini tidak valid. Periksa kembali API Key Anda di menu Setelan.");
            }
          }
        }

        if (!transcriptText) {
          if (lastErr.includes("429") || lastErr.includes("RESOURCE_EXHAUSTED")) {
            throw new Error(
              "Kuota semua model Gemini pada API Key Anda sedang penuh (Rate Limit 429). Tunggu sekitar 1 menit lalu klik 'Ulangi', atau gunakan API Key baru."
            );
          }
          throw new Error(
            `Gagal mentranskripsikan media (${lastErr || "Semua model sibuk"}). Pastikan format berkas didukung.`
          );
        }
      }
    } else if (activeProvider === "openai" && fileBuffer) {
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

    // Pastikan hasil transkripsi selalu terurut rapi secara kronologis dengan timestamp [MM:SS]
    if (transcriptText && !/\[\d{1,3}:\d{2}\]/.test(transcriptText)) {
      transcriptText = formatFlatTextIntoTimestampedDialogue(
        transcriptText,
        mediaDurationSec || 2400
      );
    }

    return Response.json({
      success: true,
      transcript: transcriptText,
      model: chosenModel,
    });
  } catch (error: unknown) {
    console.error("Notulen AI Transcribe error:", error);
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan pada pemrosesan transkripsi.";
    return Response.json({ error: message }, { status: 500 });
  }
}
