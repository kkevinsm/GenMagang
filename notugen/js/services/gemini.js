/**
 * notugen — Gemini Multimodal AI Service with Auto-Fallback Resilience
 */

export async function callGeminiApi(apiKey, model, rawNotes, customTitle, category, mediaAttachment, onProgress) {
  // Model resilience strategy: If primary model hits 429 (rate/quota) or 503 (server busy), try fallback model
  const candidateModels = [model];
  if (model === 'gemini-2.5-flash') {
    candidateModels.push('gemini-1.5-flash');
  } else if (model === 'gemini-1.5-flash') {
    candidateModels.push('gemini-2.5-flash');
  } else {
    candidateModels.push('gemini-2.5-flash', 'gemini-1.5-flash');
  }

  let lastError = null;

  for (let i = 0; i < candidateModels.length; i++) {
    const currentModel = candidateModels[i];
    if (i > 0 && typeof onProgress === 'function') {
      onProgress(`Server sibuk atau limit kuota, beralih ke model cadangan stabil: ${currentModel}...`);
    }

    try {
      const result = await executeSingleGeminiRequest(apiKey, currentModel, rawNotes, customTitle, category, mediaAttachment);
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`Model ${currentModel} error:`, err);
      // If error is 429, 503, or 500, attempt next available model
      if (i < candidateModels.length - 1) {
        await new Promise(r => setTimeout(r, 800));
        continue;
      }
    }
  }

  throw lastError;
}

export async function executeSingleGeminiRequest(apiKey, model, rawNotes, customTitle, category, mediaAttachment) {
  let mediaInstruction = '';
  if (mediaAttachment) {
    if (mediaAttachment.type === 'video') {
      mediaInstruction = 'File video rekaman meeting daring terlampir. Tonton dan dengarkan video secara cermat untuk mengekstrak notulen meeting resmi secara menyeluruh.';
    } else {
      mediaInstruction = 'File rekaman audio / voice note percakapan rapat terlampir. Dengarkan seluruh percakapan secara cermat untuk mengekstrak notulen meeting resmi secara menyeluruh.';
    }
  }

  const prompt = `
Anda adalah asisten korporat profesional yang ahli dalam menyusun Notulen Meeting resmi berstandar eksekutif untuk berbagai jenis perusahaan, BUMN, instansi, swasta, startup, maupun organisasi profesional.
${mediaInstruction}
${rawNotes ? 'Catatan tambahan / transkrip rapat:\n---\n' + rawNotes + '\n---' : ''}

SUSUN DOKUMEN NOTULEN RESMI DENGAN STRUKTUR JSON KETAT SEBAGAI BERIKUT:
{
  "category": "${category || 'FSCM'}",
  "title": "${customTitle ? customTitle : 'Judul meeting profesional berpoin (misal: a. ... \\n b. ...)'}",
  "date": "Hari, Tanggal (misal: Rabu, 21 Oktober 2026)",
  "time": "Jam meeting (misal: 14.00 - Selesai WIB)",
  "location": "Tempat meeting (misal: R. Meeting Lt. 12 & Ms. Teams)",
  "leader": "Pimpinan meeting (jika tidak tertera tulis jabatan relevan)",
  "attendees": "Daftar nama atau peran peserta meeting",
  "agendas": [
    "Daftar agenda 1...",
    "Daftar agenda 2..."
  ],
  "decisions": [
    {
      "topic": "Topik Keputusan Resmi (misal: Keputusan Teknis Proyek):",
      "bullets": [
        "Poin keputusan 1 secara rinci...",
        "Poin keputusan 2..."
      ]
    }
  ],
  "memos": [
    {
      "header": "1. Pembahasan Topik Bahasan Mendalam",
      "speakers": [
        {
          "label": "Tinjauan / Pernyataan (Nama Pembicara):",
          "items": [
            "Detail poin diskusi teknis 1...",
            "Detail poin diskusi teknis 2..."
          ]
        }
      ]
    }
  ],
  "summary": [
    "Ringkasan eksekutif poin 1...",
    "Ringkasan eksekutif poin 2..."
  ],
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

  const parts = [];
  if (mediaAttachment && mediaAttachment.base64 && mediaAttachment.mimeType) {
    parts.push({
      inlineData: {
        mimeType: mediaAttachment.mimeType,
        data: mediaAttachment.base64
      }
    });
  }
  parts.push({ text: prompt });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    throw new Error(`Gemini API Error [${res.status}]: ${errText}`);
  }

  const data = await res.json();
  const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    throw new Error('Respon Gemini tidak memiliki konten teks.');
  }

  let cleaned = candidateText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  return JSON.parse(cleaned);
}

export function generateLocalCorporateNotulen(rawNotes, customTitle, category, mediaAttachment) {
  const today = 'Rabu, 21 Oktober 2026';
  let defaultTitle = 'Notulen Pembahasan Teknis & Koordinasi Proyek';
  let agendaTopic = 'Evaluasi progres dan koordinasi teknis';

  if (mediaAttachment) {
    if (mediaAttachment.type === 'video') {
      defaultTitle = customTitle || 'Notulen Rekaman Video Online Meeting (Teams / Zoom)';
      agendaTopic = 'Penyelarasan rekaman video rapat daring';
    } else {
      defaultTitle = customTitle || 'Notulen Rekaman Suara & Voice Note Rapat';
      agendaTopic = 'Penyelarasan poin rekaman audio rapat';
    }
  } else if (rawNotes) {
    const lines = rawNotes.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines[0]) defaultTitle = lines[0];
  }

  const title = customTitle || defaultTitle;

  return {
    category: category || 'FSCM',
    title: title,
    date: today,
    time: '14.00 - Selesai WIB',
    location: mediaAttachment ? (mediaAttachment.type === 'video' ? 'Ms. Teams / Zoom Video Meeting' : 'Ruang Rapat & Voice Recording') : 'Ruang Rapat Utama & Ms. Teams',
    leader: 'Project Coordinator / Lead Architect',
    attendees: 'Tim Pengembang, Tim QA, Tim Bisnis, PMO, dan Stakeholders Terkait',
    agendas: [
      `1. ${agendaTopic} dan penanganan prioritas implementasi.`,
      '2. Penyelarasan timeline rilis dan mitigasi dependensi antar tim.',
      '3. Penetapan action items dan komitmen target penyelesaian.'
    ],
    decisions: [
      {
        topic: `Keputusan Utama Terkait ${title.split('\n')[0]}:`,
        bullets: [
          mediaAttachment ? `Rekaman ${mediaAttachment.type === 'video' ? 'video' : 'audio'} telah dianalisis; seluruh kesepakatan target rilis disetujui bersama.` : 'Seluruh tim menyepakati target penyelesaian milestone sesuai jadwal yang ditetapkan.',
          'Uji fungsional (UAT) bersama unit kerja dijadwalkan segera setelah verifikasi lingkungan stabil.'
        ]
      }
    ],
    memos: [
      {
        header: '1. Poin Diskusi & Catatan Stakeholder',
        speakers: [
          {
            label: 'Catatan Tim Pengembang & Tim Penguji:',
            items: [
              'Verifikasi performa modul utama menunjukkan peningkatan efisiensi yang memadai.',
              'Dependensi konfigurasi database sedang dituntaskan sebelum fase joint test.'
            ]
          }
        ]
      }
    ],
    summary: [
      'Hasil koordinasi menyepakati prioritas penyelesaian isu pada komponen utama sebelum memasuki periode freeze.',
      'Seluruh tim unit kerja bertanggung jawab menyelesaikan action items sesuai tenggat yang telah ditetapkan.'
    ],
    actionItems: [
      {
        team: 'Tim Pengembang (WDL)',
        tasks: [
          { text: `Menuntaskan perbaikan dan pengujian internal untuk ${title.split('\n')[0]}.`, due: '28 Okt 2026' }
        ]
      },
      {
        team: 'Tim QA / Tester (TSA)',
        tasks: [
          { text: 'Menyiapkan skenario joint testing dan memantau stabilitas environment.', due: '30 Okt 2026' }
        ]
      },
      {
        team: 'Tim Bisnis (WDC)',
        tasks: [
          { text: 'Validasi dokumen kriteria penerimaan pengguna bersama tim operasional.', due: '02 Nov 2026' }
        ]
      }
    ]
  };
}
