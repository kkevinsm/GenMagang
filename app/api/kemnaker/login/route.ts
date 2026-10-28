import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Endpoint login Kemnaker.
 * Meneruskan request ke backend proxy mandiri (api.genmagang.web.id / api.mobogen.online)
 * yang menjalankan alur OAuth2 langsung ke SSO Kemnaker tanpa pihak ketiga.
 */

const PRIMARY_PROXY_BASE = process.env.KEMNAKER_PROXY_BASE_URL || "https://api.genmagang.web.id";
const FALLBACK_PROXY_BASE = "https://api.mobogen.online";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !username.trim() || !password) {
      return Response.json(
        { error: "Email / No. HP / NIK dan password wajib diisi." },
        { status: 400 }
      );
    }

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip");

    const upstreamHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    };

    if (clientIp) {
      upstreamHeaders["X-Forwarded-For"] = clientIp;
    }

    const payloadStr = JSON.stringify({
      username: username.trim(),
      password,
    });

    let upstreamRes: Response | null = null;
    let data: any = null;

    try {
      upstreamRes = await fetch(`${PRIMARY_PROXY_BASE}/api/kemnaker/login`, {
        method: "POST",
        headers: upstreamHeaders,
        body: payloadStr,
      });
      data = await upstreamRes.json().catch(() => null);
    } catch (primaryErr) {
      console.warn("Primary proxy unreachable, trying fallback proxy...", primaryErr);
      if (PRIMARY_PROXY_BASE !== FALLBACK_PROXY_BASE) {
        try {
          upstreamRes = await fetch(`${FALLBACK_PROXY_BASE}/api/kemnaker/login`, {
            method: "POST",
            headers: upstreamHeaders,
            body: payloadStr,
          });
          data = await upstreamRes.json().catch(() => null);
        } catch (fallbackErr) {
          console.error("Fallback proxy also failed:", fallbackErr);
        }
      }
    }

    if (!upstreamRes || !upstreamRes.ok || !data) {
      const errorMessage =
        data?.error || `Login gagal ke server Kemnaker (HTTP ${upstreamRes?.status || "ERR"}).`;
      return Response.json({ error: errorMessage }, { status: upstreamRes?.status || 401 });
    }

    if (!data.access_token) {
      return Response.json(
        { error: data.error || "Token otentikasi tidak ditemukan dari server." },
        { status: 401 }
      );
    }

    return Response.json({
      access_token: data.access_token,
      user: data.user || null,
    });
  } catch (error: unknown) {
    console.error("Kemnaker login error:", error);
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan saat menghubungi server Kemnaker.";
    return Response.json({ error: message }, { status: 500 });
  }
}
