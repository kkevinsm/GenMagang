import { NextRequest } from "next/server";

// Gemini File API: upload media via resumable upload
// This proxies the upload to avoid CORS issues if needed,
// but for large files the frontend uploads directly to Gemini File API.
// This endpoint handles the initial "start resumable upload" metadata step.

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, mimeType, fileName, fileSizeBytes } = body;

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
        "X-Goog-Upload-Header-Content-Length": String(fileSizeBytes),
        "X-Goog-Upload-Header-Content-Type": mimeType,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: { display_name: fileName },
      }),
    });

    if (!initRes.ok) {
      const errText = await initRes.text();
      return Response.json(
        { error: `Gagal menginisialisasi upload: ${errText}` },
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

