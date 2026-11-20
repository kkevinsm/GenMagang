import { Mp3Encoder } from "@breezystack/lamejs";

export interface ClientAudioChunk {
  blob: Blob;
  startSec: number;
  durationSec: number;
}

export interface ClientSplitResult {
  chunks: ClientAudioChunk[];
  totalDurationSec: number;
}

const TARGET_SAMPLE_RATE = 16000;
const MP3_KBPS = 32;
/** 10 menit @ 32 kbps = ~2,4 MB (aman di bawah batas 4,5 MB Vercel Serverless). */
export const CLIENT_CHUNK_SEC = 10 * 60;
const SINGLE_CHUNK_MAX_SEC = 12 * 60;

function mixDownAndResampleTo16k(buffer: AudioBuffer): Float32Array {
  const length = buffer.length;
  const numChannels = buffer.numberOfChannels;
  const mono = new Float32Array(length);

  for (let ch = 0; ch < numChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      mono[i] += data[i] / numChannels;
    }
  }

  if (buffer.sampleRate === TARGET_SAMPLE_RATE) {
    return mono;
  }

  const ratio = buffer.sampleRate / TARGET_SAMPLE_RATE;
  const outLength = Math.max(1, Math.floor(length / ratio));
  const resampled = new Float32Array(outLength);

  for (let i = 0; i < outLength; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(length, Math.floor((i + 1) * ratio));
    if (end <= start) {
      resampled[i] = mono[start] ?? 0;
    } else {
      let sum = 0;
      for (let j = start; j < end; j++) {
        sum += mono[j];
      }
      resampled[i] = sum / (end - start);
    }
  }
  return resampled;
}

function encodeSamplesToMp3Blob(samples: Float32Array, startSample: number, endSample: number): Blob {
  const encoder = new Mp3Encoder(1, TARGET_SAMPLE_RATE, MP3_KBPS);
  const blockSize = 1152 * 20;
  const int16Block = new Int16Array(blockSize);
  const mp3Parts: Uint8Array<ArrayBuffer>[] = [];

  for (let pos = startSample; pos < endSample; pos += blockSize) {
    const count = Math.min(blockSize, endSample - pos);
    for (let i = 0; i < count; i++) {
      const s = Math.max(-1, Math.min(1, samples[pos + i]));
      int16Block[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const slice = count === blockSize ? int16Block : int16Block.subarray(0, count);
    const encoded = encoder.encodeBuffer(slice);
    if (encoded.length > 0) {
      mp3Parts.push(new Uint8Array(encoded));
    }
  }

  const flushed = encoder.flush();
  if (flushed.length > 0) {
    mp3Parts.push(new Uint8Array(flushed));
  }

  return new Blob(mp3Parts, { type: "audio/mp3" });
}

export async function encodeMonoSamplesToMp3Chunks(
  samples: Float32Array,
  sampleRate: number,
  chunkSec = CLIENT_CHUNK_SEC,
  onProgress?: (percent: number, message: string) => void
): Promise<ClientSplitResult> {
  const totalDurationSec = samples.length / sampleRate;
  const effectiveChunkSec = totalDurationSec <= SINGLE_CHUNK_MAX_SEC ? Math.ceil(totalDurationSec) + 1 : chunkSec;
  const samplesPerChunk = Math.max(sampleRate, Math.floor(effectiveChunkSec * sampleRate));
  const totalChunks = Math.max(1, Math.ceil(samples.length / samplesPerChunk));
  const chunks: ClientAudioChunk[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const startSample = i * samplesPerChunk;
    const endSample = Math.min(samples.length, (i + 1) * samplesPerChunk);
    const startSec = startSample / sampleRate;
    const durationSec = (endSample - startSample) / sampleRate;

    onProgress?.(
      Math.round(10 + ((i + 0.5) / totalChunks) * 15),
      `Mengompresi audio bagian ${i + 1}/${totalChunks} di browser...`
    );

    // Beri napas ke event loop browser agar UI tidak freeze saat encoding
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    const blob = encodeSamplesToMp3Blob(samples, startSample, endSample);
    chunks.push({ blob, startSec, durationSec });
  }

  return { chunks, totalDurationSec };
}

/**
 * Mengekstrak jalur audio dari video/audio langsung di browser (Web Audio API)
 * dan memecahnya menjadi potongan MP3 <= ~2,4 MB agar lolos batas 4,5 MB Vercel.
 */
export async function extractAudioChunksInBrowser(
  file: File,
  onProgress?: (percent: number, message: string) => void
): Promise<ClientSplitResult> {
  let AudioCtx: typeof AudioContext | undefined = window.AudioContext;
  if (!AudioCtx && "webkitAudioContext" in window) {
    const candidate = window.webkitAudioContext;
    if (typeof candidate === "function") {
      AudioCtx = candidate as typeof AudioContext;
    }
  }
  if (!AudioCtx) {
    throw new Error("Browser tidak mendukung Web Audio API untuk ekstraksi audio.");
  }

  onProgress?.(5, `Membaca berkas media (${(file.size / 1024 / 1024).toFixed(1)} MB) di browser...`);
  const arrayBuffer = await file.arrayBuffer();

  let ctx: AudioContext;
  try {
    ctx = new AudioCtx({ sampleRate: TARGET_SAMPLE_RATE });
  } catch {
    ctx = new AudioCtx();
  }

  try {
    onProgress?.(10, "Mengekstrak jalur audio dari video di browser...");
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    const mono16k = mixDownAndResampleTo16k(audioBuffer);
    return await encodeMonoSamplesToMp3Chunks(mono16k, TARGET_SAMPLE_RATE, CLIENT_CHUNK_SEC, onProgress);
  } finally {
    await ctx.close().catch(() => {});
  }
}
