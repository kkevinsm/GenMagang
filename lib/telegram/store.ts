import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { UserAccount } from "./types";

const DATA_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "telegram_users.json");
const KV_KEY_PREFIX = "user:";

interface KVNamespaceLike {
  get<T = unknown>(key: string, type: "json"): Promise<T | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; cursor?: string }): Promise<{
    keys: { name: string }[];
    list_complete: boolean;
    cursor?: string;
  }>;
}

async function getKV(): Promise<KVNamespaceLike | null> {
  try {
    const ctx = await getCloudflareContext({ async: true });
    const env = ctx?.env as Record<string, unknown> | undefined;
    const kv = env?.TELEGRAM_USERS as KVNamespaceLike | undefined;
    if (kv && typeof kv.get === "function") {
      return kv;
    }
  } catch {
    // Fallback ke file lokal saat berjalan di Node.js dev server (`next dev`)
  }
  return null;
}

// In-memory cache for local file fallback
const memoryStore = new Map<number, UserAccount>();
let isLoaded = false;

function getSecretKey(): Buffer {
  const secret =
    process.env.TELEGRAM_ENCRYPTION_SECRET ||
    process.env.TELEGRAM_BOT_TOKEN ||
    process.env.GEMINI_API_KEY ||
    "mobogen-telegram-bot-default-secret-salt-2026";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypt sensitive string (e.g. Kemnaker password) using AES-256-GCM
 */
export function encryptData(text: string): string {
  if (!text) return "";
  try {
    const key = getSecretKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch (err) {
    console.error("[Store] Encryption error:", err);
    return text;
  }
}

/**
 * Decrypt sensitive string
 */
export function decryptData(cipherText: string): string {
  if (!cipherText) return "";
  try {
    const parts = cipherText.split(":");
    if (parts.length !== 3) return cipherText;

    const [ivHex, tagHex, encryptedHex] = parts;
    const key = getSecretKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(tagHex, "hex");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("[Store] Decryption error:", err);
    return "";
  }
}

function loadFromFile() {
  if (isLoaded) return;
  try {
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, "utf8");
      const users: Record<string, UserAccount> = JSON.parse(data);
      for (const [chatIdStr, user] of Object.entries(users)) {
        memoryStore.set(Number(chatIdStr), user);
      }
    }
  } catch (err) {
    console.error("[Store] Failed to load Telegram user store:", err);
  } finally {
    isLoaded = true;
  }
}

function persistToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const obj: Record<string, UserAccount> = {};
    for (const [chatId, user] of memoryStore.entries()) {
      obj[String(chatId)] = user;
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(obj, null, 2), "utf8");
  } catch (err) {
    console.error("[Store] Failed to persist Telegram user store:", err);
  }
}

function createDefaultUser(chatId: number): UserAccount {
  return {
    chatId,
    step: "idle",
    reminderEnabled: true,
    createdAt: new Date().toISOString(),
  };
}

export async function getUser(chatId: number): Promise<UserAccount> {
  const kv = await getKV();
  if (kv) {
    const existing = await kv.get<UserAccount>(`${KV_KEY_PREFIX}${chatId}`, "json");
    return existing ? { ...existing } : createDefaultUser(chatId);
  }

  loadFromFile();
  const existing = memoryStore.get(chatId);
  return existing ? { ...existing } : createDefaultUser(chatId);
}

export async function saveUser(user: UserAccount): Promise<void> {
  user.updatedAt = new Date().toISOString();
  const kv = await getKV();
  if (kv) {
    await kv.put(`${KV_KEY_PREFIX}${user.chatId}`, JSON.stringify(user));
    return;
  }

  loadFromFile();
  memoryStore.set(user.chatId, { ...user });
  persistToFile();
}

export async function deleteUser(chatId: number): Promise<boolean> {
  const kv = await getKV();
  if (kv) {
    const existing = await kv.get<UserAccount>(`${KV_KEY_PREFIX}${chatId}`, "json");
    if (!existing) return false;
    await kv.delete(`${KV_KEY_PREFIX}${chatId}`);
    return true;
  }

  loadFromFile();
  const deleted = memoryStore.delete(chatId);
  if (deleted) {
    persistToFile();
  }
  return deleted;
}

export async function getAllUsers(): Promise<UserAccount[]> {
  const kv = await getKV();
  if (kv) {
    const users: UserAccount[] = [];
    let cursor: string | undefined;
    do {
      const list = await kv.list({ prefix: KV_KEY_PREFIX, cursor });
      const fetched = await Promise.all(
        list.keys.map((k) => kv.get<UserAccount>(k.name, "json"))
      );
      for (const user of fetched) {
        if (user) users.push(user);
      }
      cursor = list.list_complete ? undefined : list.cursor;
    } while (cursor);
    return users;
  }

  loadFromFile();
  return Array.from(memoryStore.values());
}
