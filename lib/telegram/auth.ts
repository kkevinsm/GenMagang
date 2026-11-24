import crypto from "node:crypto";

export interface VerifiedTelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface VerifiedInitData {
  chatId: number;
  user: VerifiedTelegramUser;
  authDate: number;
}

/**
 * Constant-time string comparison using SHA-256 digests so length differences do not leak.
 */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const digestA = crypto.createHash("sha256").update(a, "utf8").digest();
  const digestB = crypto.createHash("sha256").update(b, "utf8").digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

/**
 * Verify Telegram Mini App `initData` signature per Telegram WebApp specification:
 * secret_key = HMAC_SHA256("WebAppData", bot_token)
 * hash = HMAC_SHA256(secret_key, data_check_string)
 */
export function verifyTelegramWebAppInitData(
  initData: string,
  botToken: string | undefined,
  maxAgeSeconds = 86400
): VerifiedInitData | null {
  if (!initData || !botToken) return null;

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    const authDateStr = params.get("auth_date");
    const userJson = params.get("user");

    if (!hash || !authDateStr || !userJson) return null;

    const authDate = Number(authDateStr);
    if (!Number.isFinite(authDate) || authDate <= 0) return null;

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (nowSeconds - authDate > maxAgeSeconds || authDate - nowSeconds > 300) {
      return null;
    }

    const pairs: string[] = [];
    for (const [key, value] of params.entries()) {
      if (key !== "hash") {
        pairs.push(`${key}=${value}`);
      }
    }
    pairs.sort();
    const dataCheckString = pairs.join("\n");

    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken, "utf8")
      .digest();

    const expectedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString, "utf8")
      .digest("hex");

    if (!timingSafeStringEqual(expectedHash, hash.toLowerCase())) {
      return null;
    }

    const user = JSON.parse(userJson) as VerifiedTelegramUser;
    if (!user || !Number.isFinite(Number(user.id)) || Number(user.id) <= 0) {
      return null;
    }

    return {
      chatId: Number(user.id),
      user,
      authDate,
    };
  } catch {
    return null;
  }
}
