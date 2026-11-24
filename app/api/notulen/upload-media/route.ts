import { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

// Gemini File API: upload media via resumable upload
// This proxies the upload to avoid CORS issues if needed,
// but for large files the frontend uploads directly to Gemini File API.
// This endpoint handles the initial "start resumable upload" metadata step.

export const maxDuration = 60;
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024; // 2GB Gemini File API limit

export async function POST(request: NextRequest) {
  try {
    const rl = checkRateLimit(request, "notulen-upload-media", 15, 60_000);
    if (!rl.allowed) {
      return Response.json(
        { error: "Terlalu banyak permintaan upload. Silakan tunggu sebentar." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }

    const body = await request.json();
    const { apiKey, mimeType, fileName, fileSizeBytes } = body;

    if (
      typeof mimeType !== "string" ||
      (!mimeType.startsWith("audio/") && !mimeType.startsWith("video/"))
    ) {
      return Response.json(
        { error: "Tipe file tidak didukung. Hanya file audio atau video yang diizinkan." },
        { status: 400 }
      );
    }

    const sizeNum = Number(fileSizeBytes);
    if (!Number.isFinite(sizeNum) || sizeNum <= 0 || sizeNum > MAX_UPLOAD_BYTES) {
      return Response.json(
        { error: "Ukuran file tidak valid atau melebihi batas maksimal 2GB." },
        { status: 400 }
      );
    }

    const safeFileName =
      typeof fileName === "string" && fileName.trim()
        ? fileName.trim().slice(0, 120)
        : "meeting-media";

    const key = (apiKey || "").trim() || process.env.GEMINI_API_KEY || "";
    if (!key) {
      return Response.json(
        { error: "API Key Gemini diperlukan untuk upload file media." },
        { status: 401 }
      );
    }

    // Initiate a resumable upload session with Gemini File API
    const initUrl =
      "https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=resumable";

    const initRes = await fetch(initUrl, {
      method: "POST",
      headers: {
        "X-Goog-API-Key": key,
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(sizeNum),
        "X-Goog-Upload-Header-Content-Type": mimeType,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: { display_name: safeFileName },
      }),
    });

    if (!initRes.ok) {
      const errText = await initRes.text();
      console.error(`Gemini upload init failed [${initRes.status}]:`, errText);
      return Response.json(
        { error: `Gagal menginisialisasi sesi upload media (HTTP ${initRes.status}).` },
        { status: initRes.status }
      );
    }

    // The upload URL is returned in the X-Goog-Upload-URL header
    const uploadUrl = initRes.headers.get("X-Goog-Upload-URL");
    if (!uploadUrl) {
      return Response.json(
        { error: "Upload URL tidak tersedia dari Gemini File API." },
        { status: 500 }
      );
    }

    return Response.json({ uploadUrl });
  } catch (error: unknown) {
    console.error("Upload media init error:", error);
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan.";
    return Response.json({ error: message }, { status: 500 });
  }
}

