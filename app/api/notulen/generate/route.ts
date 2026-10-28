import { NextRequest } from "next/server";
import { generateWithAI, AI_PROVIDERS } from "@/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawNotes, title, category, mediaInstruction, apiKey, provider } = body;

    const key = (apiKey || "").trim() || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!key) {
      return Response.json(
        { error: "API Key belum dikonfigurasi. Masukkan API Key Anda di menu Setelan (Gemini, ChatGPT, Claude, atau Grok)." },
        { status: 401 }
      );
    }

    const systemInstruction = `Anda adalah asisten profesional yang ahli dalam menyusun Notulen Meeting resmi untuk segala jenis perusahaan atau industri tempat magang (korporasi swasta, startup teknologi, agensi kreatif, perbankan, BUMN, hingga instansi publik).
Bahasa: Bahasa Indonesia formal korporat yang rapi, objektif, dan presisi.
Keluarkan output HANYA dalam format JSON valid sesuai skema yang diminta, tanpa markdown, tanpa teks pembuka/penutup.`;

    const userPrompt = `
${mediaInstruction ? mediaInstruction + "\n\n" : ""}
${rawNotes ? 'Catatan tambahan / transkrip rapat:\n---\n' + rawNotes + '\n---\n' : ''}

SUSUN DOKUMEN NOTULEN RESMI DENGAN STRUKTUR JSON KETAT SEBAGAI BERIKUT:
{
  "category": "${category || 'Umum'}",
  "title": "${title ? title : 'Judul meeting profesional berpoin (misal: a. ... \\n b. ...)'}",
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

    const aiResponse = await generateWithAI({
      apiKey: key,
      provider,
      systemInstruction,
      userPrompt,
    });

    const parsed = JSON.parse(aiResponse.text);

    return Response.json({
      success: true,
      data: parsed,
      model: `${AI_PROVIDERS[aiResponse.provider]?.badge || aiResponse.provider}: ${aiResponse.model}`,
      provider: aiResponse.provider,
    });
  } catch (error: unknown) {
    console.error("Notulen AI Generate error:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan pada pemrosesan AI.";
    return Response.json({ error: message }, { status: 500 });
  }
}
