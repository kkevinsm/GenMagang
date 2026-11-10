import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export interface AudioChunk {
  buffer: Buffer;
  startSec: number;
  durationSec: number;
}

export interface SplitResult {
  chunks: AudioChunk[];
  totalDurationSec: number;
}

/** Panjang tiap potongan untuk rekaman panjang. ~19k token audio per potongan di Gemini. */
export const CHUNK_SEC = 10 * 60;
/** Media sependek ini tidak dipecah: cukup satu potongan. */
const SINGLE_CHUNK_MAX_SEC = 15 * 60;

function run(cmd: string, args: string[]): Promise<string> {
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  execFile(cmd, args, { maxBuffer: 16 * 1024 * 1024 }, (err, stdout, stderr) => {
    if (err) {
      reject(new Error(`${cmd} gagal: ${String(stderr).slice(-300) || err.message}`));
    } else {
      resolve(String(stdout));
    }
  });
  return promise;
}

/**
 * Ekstrak jalur audio dari video/audio apa pun menjadi potongan MP3.
 * Media <= 15 menit menghasilkan tepat satu potongan.
 * Membutuhkan ffmpeg + ffprobe di PATH (tidak tersedia di Cloudflare Workers / Vercel).
 */
export async function splitAudioIntoChunks(
  input: Buffer,
  originalFileName: string,
  chunkSec = CHUNK_SEC
): Promise<SplitResult> {
  const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "notulen-"));
  try {
    const inputPath = path.join(dir, `input${path.extname(originalFileName) || ".bin"}`);
    await fs.promises.writeFile(inputPath, input);

    const probe = await run("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      inputPath,
    ]);
    const totalDurationSec = parseFloat(probe.trim());
    if (!Number.isFinite(totalDurationSec) || totalDurationSec <= 0) {
      throw new Error("Durasi media tidak terbaca oleh ffprobe.");
    }

    const segmentSec =
      totalDurationSec <= SINGLE_CHUNK_MAX_SEC ? Math.ceil(totalDurationSec) + 1 : chunkSec;

    await run("ffmpeg", [
      "-y", "-v", "error",
      "-i", inputPath,
      "-vn",
      "-ac", "1",
      "-ar", "16000",
      "-acodec", "libmp3lame", "-b:a", "32k",
      "-f", "segment",
      "-segment_time", String(segmentSec),
      "-reset_timestamps", "1",
      path.join(dir, "chunk_%03d.mp3"),
    ]);

    const names = (await fs.promises.readdir(dir))
      .filter((n) => /^chunk_\d+\.mp3$/.test(n))
      .sort();
    if (names.length === 0) {
      throw new Error("ffmpeg tidak menghasilkan potongan audio.");
    }

    const chunks: AudioChunk[] = [];
    for (let i = 0; i < names.length; i++) {
      const startSec = i * segmentSec;
      chunks.push({
        buffer: await fs.promises.readFile(path.join(dir, names[i])),
        startSec,
        durationSec: Math.min(segmentSec, totalDurationSec - startSec),
      });
    }
    return { chunks, totalDurationSec };
  } finally {
    await fs.promises.rm(dir, { recursive: true, force: true });
  }
}

/** Geser setiap penanda [MM:SS] sebesar offsetSec (untuk menggabungkan potongan). */
export function shiftTimestamps(text: string, offsetSec: number): string {
  const offset = Math.round(offsetSec);
  if (!offset) return text;
  return text.replace(/\[(\d{1,3}):(\d{2})\]/g, (_m, mm: string, ss: string) => {
    const total = parseInt(mm, 10) * 60 + parseInt(ss, 10) + offset;
    const outMm = String(Math.floor(total / 60)).padStart(2, "0");
    const outSs = String(total % 60).padStart(2, "0");
    return `[${outMm}:${outSs}]`;
  });
}

export function formatClock(sec: number): string {
  const total = Math.max(0, Math.round(sec));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
