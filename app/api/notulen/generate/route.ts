import { NextRequest } from "next/server";
import { generateWithAI, AI_PROVIDERS, detectProvider } from "@/lib/ai";

export const maxDuration = 120;

// Build the notulen JSON schema prompt
function buildNotulenPrompt(
  rawNotes: string,
  title: string,
  category: string,
  mediaContext: string
): string {
  return `${mediaContext ? mediaContext + "\n\n" : ""}${
    rawNotes
      ? "Catatan tambahan / transkrip rapat:\n---\n" + rawNotes + "\n---\n\n"
      : ""
  }SUSUN DOKUMEN NOTULEN RESMI DENGAN STRUKTUR JSON KETAT SEBAGAI BERIKUT:
{
  "category": "${category || "Umum"}",
  "title": "${title ? title : "Judul meeting profesional berpoin (misal: a. ... \\n b. ...)"}",
  "date": "Hari, Tanggal (misal: Rabu, 21 Oktober 2026)",
  "time": "Jam meeting (misal: 14.00 - Selesai WIB)",
  "location": "Tempat meeting (misal: R. Meeting Utama / Google Meet / Teams)",
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
      "team": "Tim Pengembang / IT",
      "tasks": [
        { "text": "Deskripsi tugas konkret", "due": "Tanggal deadline" }
      ]
    },
    {
      "team": "Tim Pengujian / QA",
      "tasks": [
        { "text": "Deskripsi tugas pengujian", "due": "Tanggal deadline" }
      ]
    },
    {
      "team": "Tim Bisnis & Operasional",
      "tasks": [
        { "text": "Deskripsi tugas bisnis/persyaratan", "due": "Tanggal deadline" }
      ]
    }
  ]
}`;
}

// Clean markdown code blocks from AI response
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned;
}

// Call Gemini with inline base64 media (files ≤ 20MB)
async function callGeminiWithInlineMedia(
  apiKey: string,
  model: string,
  systemInstruction: string,
  textPrompt: string,
  mediaBase64: string,
  mediaMimeType: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [
        {
          parts: [
            { inlineData: { mimeType: mediaMimeType, data: mediaBase64 } },
            { text: textPrompt },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini inline media error [${res.status}]: ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Respon Gemini kosong untuk media inline.");
  return cleanJsonResponse(text);
}

// Call Gemini with File API URI (files > 20MB, already uploaded)
async function callGeminiWithFileUri(
  apiKey: string,
  model: string,
  systemInstruction: string,
  textPrompt: string,
  fileUri: string,
  mediaMimeType: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [
        {
          parts: [
            { fileData: { mimeType: mediaMimeType, fileUri: fileUri } },
            { text: textPrompt },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini File API error [${res.status}]: ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Respon Gemini kosong untuk file URI.");
  return cleanJsonResponse(text);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      rawNotes,
      title,
      category,
      apiKey,
      provider,
      // Media options (mutually exclusive):
      mediaBase64,       // inline base64 for small files (≤ 20MB)
      mediaMimeType,     // required when using mediaBase64 or fileUri
      mediaFileUri,      // Gemini File API URI for large files (> 20MB)
      mediaType,         // "audio" | "video"
    } = body;

    const key =
      (apiKey || "").trim() ||
      process.env.GEMINI_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.ANTHROPIC_API_KEY;

    if (!key) {
      return Response.json(
        {
          error:
            "API Key belum dikonfigurasi. Masukkan API Key Anda di menu Setelan.",
        },
        { status: 401 }
      );
    }

    const hasMedia = !!(mediaBase64 || mediaFileUri);
    const activeProvider = detectProvider(key, provider);

    const systemInstruction = `Anda adalah asisten profesional yang ahli dalam menyusun Notulen Meeting resmi untuk segala jenis perusahaan atau industri (korporasi swasta, startup teknologi, agensi kreatif, perbankan, BUMN, hingga instansi publik).
${
  hasMedia
    ? mediaType === "video"
      ? "File rekaman VIDEO online meeting terlampir. Dengarkan dan amati seluruh jalannya rapat secara seksama — transkripsi percakapan, identifikasi peserta, keputusan, dan tindak lanjut yang disebut."
      : "File rekaman AUDIO / voice note rapat terlampir. Dengarkan secara cermat seluruh percakapan — transkripsi, identifikasi pembicara, keputusan, dan action items yang disebutkan."
    : ""
}
Bahasa: Bahasa Indonesia formal korporat yang rapi, objektif, dan presisi.
Keluarkan output HANYA dalam format JSON valid sesuai skema yang diminta, tanpa markdown, tanpa teks pembuka/penutup.`;

    const mediaContext = hasMedia
      ? mediaType === "video"
        ? "INSTRUKSI: Transkripsi dan analisis rekaman video meeting di atas untuk menyusun notulen resmi berikut:"
        : "INSTRUKSI: Transkripsi dan analisis rekaman audio/voice note rapat di atas untuk menyusun notulen resmi berikut:"
      : "";

    const userPrompt = buildNotulenPrompt(
      rawNotes || "",
      title || "",
      category || "Umum",
      mediaContext
    );

    let responseText: string | null = null;
    let chosenModel: string | null = null;

    // --- Gemini with media (inline or File API) ---
    if (hasMedia && activeProvider === "gemini") {
      const geminiModels = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-preview-05-20",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
      ];

      for (const model of geminiModels) {
        try {
          if (mediaFileUri) {
            // Large file: use File API URI
            responseText = await callGeminiWithFileUri(
              key,
              model,
              systemInstruction,
              userPrompt,
              mediaFileUri,
              mediaMimeType
            );
          } else {
            // Small file: inline base64
            responseText = await callGeminiWithInlineMedia(
              key,
              model,
              systemInstruction,
              userPrompt,
              mediaBase64,
              mediaMimeType
            );
          }
          chosenModel = model;
          break;
        } catch (err: any) {
          console.warn(`Gemini media [${model}] failed:`, err.message);
          // If quota or auth error, don't try next model
          if (
            err.message.includes("401") ||
            err.message.includes("API key not valid")
          ) {
            throw new Error(
              "API Key Gemini tidak valid. Periksa kembali di menu Setelan."
            );
          }
          if (err.message.includes("429") || err.message.includes("RESOURCE_EXHAUSTED")) {
            throw new Error(
              "Kuota harian Gemini API habis. Coba buat API Key baru di aistudio.google.com."
            );
          }
        }
      }

      if (!responseText) {
        throw new Error(
          "Semua model Gemini gagal memproses media. Pastikan format file didukung (MP3, WAV, OGG, MP4, WebM, MOV)."
        );
      }
    } else {
      // --- Text-only fallback for non-Gemini or no media ---
      const aiResponse = await generateWithAI({
        apiKey: key,
        provider,
        systemInstruction,
        userPrompt,
      });
      responseText = aiResponse.text;
      chosenModel = `${AI_PROVIDERS[aiResponse.provider]?.badge || aiResponse.provider}: ${aiResponse.model}`;
    }

    const parsed = JSON.parse(responseText!);

    return Response.json({
      success: true,
      data: parsed,
      model: chosenModel || "Gemini",
    });
  } catch (error: unknown) {
    console.error("Notulen AI Generate error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan pada pemrosesan AI.";
    return Response.json({ error: message }, { status: 500 });
  }
}
