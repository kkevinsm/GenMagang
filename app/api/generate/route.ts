import { NextRequest } from "next/server";
import { generateWithAI, detectProvider, AI_PROVIDERS } from "@/lib/ai";

const SYSTEM_INSTRUCTION_HADIR = `Kamu adalah asisten pelaporan harian Monitoring dan Evaluasi (Monev) untuk peserta program Magang Merdeka dari Kementerian Ketenagakerjaan Republik Indonesia (Kemnaker) melalui platform MagangHub bernama GenMonev (bagian dari ekosistem GenMagang).

TUGAS UTAMA:
Mengubah catatan aktivitas harian mentah/singkat dari user menjadi 3 bagian laporan resmi yang siap disalin atau dikirim langsung ke sistem Monev Kemnaker:

1. **Uraian Aktivitas**: Deskripsi detail, terstruktur, dan konkret mengenai kegiatan kerja, tugas teknis, dan pekerjaan yang diselesaikan hari ini. 

2. **Pembelajaran yang Diperoleh**: Refleksi tentang wawasan, keterampilan, dan pengetahuan baru yang didapatkan dari aktivitas hari ini. Hubungkan dengan pengembangan kompetensi profesional.

3. **Kendala yang Dialami**: Hambatan, tantangan, atau kesulitan yang dihadapi selama menjalankan aktivitas. Jika tidak ada kendala besar, tetap tuliskan tantangan kecil atau area yang perlu ditingkatkan.

ATURAN WAJIB:
- Setiap bagian HARUS mengandung MINIMAL 100 karakter (ini adalah persyaratan wajib sistem Monev Kemnaker).
- Usahakan setiap bagian berisi 120-200 karakter agar terlihat alami dan tidak terlalu panjang.
- Gunakan bahasa Indonesia formal dan profesional (baku), sesuai standar penulisan laporan instansi pemerintah.
- JANGAN menggunakan bullet points, numbering, atau format markdown apa pun. Tulis sebagai paragraf narasi yang mengalir.
- JANGAN menyertakan label/judul seperti "Uraian Aktivitas:" di awal. Langsung tulis isinya saja.
- JANGAN mengarang aktivitas yang tidak disebutkan user.
- Tulislah dengan gaya bahasa profesional khas laporan magang/instansi pemerintah.
- Pastikan setiap bagian berdiri sendiri sebagai satu paragraf utuh.

FORMAT OUTPUT (JSON):
{
  "uraian_aktivitas": "...",
  "pembelajaran": "...",
  "kendala": "..."
}

Hanya kembalikan JSON valid, tanpa blok kode, tanpa backtick, tanpa penjelasan tambahan.`;

const SYSTEM_INSTRUCTION_IZIN = `Kamu adalah asisten pelaporan harian Monitoring dan Evaluasi (Monev) untuk peserta program Magang Merdeka dari Kementerian Ketenagakerjaan Republik Indonesia (Kemnaker) melalui platform MagangHub bernama GenMonev (bagian dari ekosistem GenMagang).

TUGAS UTAMA:
User memilih status kehadiran "Tidak Hadir Dengan Keterangan" (Izin / Sakit / Keperluan Resmi).
Berdasarkan catatan/alasan singkat yang diberikan user, buatkan narasi resmi, sopan, dan profesional untuk bagian:
**Alasan Tidak Hadir**

ATURAN WAJIB:
- Panjang teks HARUS mengandung MINIMAL 100 karakter (ini adalah persyaratan wajib sistem Monev Kemnaker).
- Usahakan panjang teks antara 120-180 karakter agar jelas, sopan, dan formal.
- Gunakan bahasa Indonesia formal dan baku, menyampaikan permohonan izin atau keterangan kondisi dengan santun serta berkomitmen menyelesaikan kewajiban tugas bila memungkinkan.
- JANGAN menggunakan bullet points, numbering, atau format markdown apa pun. Tulis sebagai satu paragraf narasi mengalir.
- JANGAN menyertakan label atau judul seperti "Alasan Tidak Hadir:" di awal.

FORMAT OUTPUT (JSON):
{
  "alasan_tidak_hadir": "..."
}

Hanya kembalikan JSON valid, tanpa blok kode, tanpa backtick, tanpa penjelasan tambahan.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aktivitas, status, customApiKey, provider } = body;

    const isIzin = status === "Tidak Hadir Dengan Keterangan";

    if (!aktivitas || aktivitas.trim().length === 0) {
      return Response.json(
        {
          error: isIzin
            ? "Catatan / alasan izin tidak boleh kosong."
            : "Catatan aktivitas harian tidak boleh kosong.",
        },
        { status: 400 }
      );
    }

    // Determine API key: prefer custom key from client, fallback to env
    const apiKey = (customApiKey || "").trim() || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          error:
            "API Key belum dikonfigurasi. Masukkan API Key Anda (Gemini, ChatGPT, Claude, atau Grok) pada tombol API Key di atas.",
        },
        { status: 401 }
      );
    }

    const systemInstruction = isIzin
      ? SYSTEM_INSTRUCTION_IZIN
      : SYSTEM_INSTRUCTION_HADIR;

    const userPrompt = isIzin
      ? `Status Kehadiran: Tidak Hadir Dengan Keterangan\nCatatan Singkat User:\n${aktivitas}\n\nBuatkan narasi formal Alasan Tidak Hadir (minimal 100 karakter) sesuai standar Monev Kemnaker.`
      : `Status Kehadiran: Hadir\nCatatan Aktivitas Harian:\n${aktivitas}\n\nBuatkan 3 bagian laporan Monev harian (Uraian Aktivitas, Pembelajaran, Kendala masing-masing minimal 100 karakter).`;

    const preferredModel = process.env.GEMINI_MODEL;

    const aiResponse = await generateWithAI({
      apiKey,
      provider,
      systemInstruction,
      userPrompt,
      preferredModel,
    });

    const parsed = JSON.parse(aiResponse.text);

    if (isIzin) {
      return Response.json({
        alasan_tidak_hadir: parsed.alasan_tidak_hadir || "",
        model: `${AI_PROVIDERS[aiResponse.provider]?.badge || aiResponse.provider}: ${aiResponse.model}`,
      });
    }

    return Response.json({
      uraian_aktivitas: parsed.uraian_aktivitas || "",
      pembelajaran: parsed.pembelajaran || "",
      kendala: parsed.kendala || "",
      model: `${AI_PROVIDERS[aiResponse.provider]?.badge || aiResponse.provider}: ${aiResponse.model}`,
    });
  } catch (error: unknown) {
    console.error("Generate API error:", error);
    const message =
      error instanceof SyntaxError
        ? "Gagal mem-parsing format respons AI. Silakan coba lagi."
        : error instanceof Error
        ? error.message
        : "Terjadi kesalahan pada pemrosesan AI.";
    return Response.json({ error: message }, { status: 500 });
  }
}
