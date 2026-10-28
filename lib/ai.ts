export type AIProvider = "auto" | "openai" | "anthropic" | "xai" | "gemini";

export interface AIProviderConfig {
  id: "openai" | "anthropic" | "xai" | "gemini";
  name: string;
  badge: string;
  color: string;
  icon: string;
  keyPrefix: string;
  keyPlaceholder: string;
  keyHelpUrl: string;
  defaultModels: string[];
}

export const AI_PROVIDERS: Record<string, AIProviderConfig> = {
  openai: {
    id: "openai",
    name: "OpenAI ChatGPT",
    badge: "ChatGPT",
    color: "emerald",
    icon: "mdi-robot",
    keyPrefix: "sk-",
    keyPlaceholder: "sk-proj-... atau sk-...",
    keyHelpUrl: "https://platform.openai.com/api-keys",
    defaultModels: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic Claude",
    badge: "Claude",
    color: "amber",
    icon: "mdi-brain",
    keyPrefix: "sk-ant-",
    keyPlaceholder: "sk-ant-api03-...",
    keyHelpUrl: "https://console.anthropic.com/settings/keys",
    defaultModels: [
      "claude-3-5-sonnet-20241022",
      "claude-3-5-sonnet-latest",
      "claude-3-5-haiku-20241022",
      "claude-3-5-haiku-latest",
      "claude-3-haiku-20240307",
    ],
  },
  xai: {
    id: "xai",
    name: "xAI Grok",
    badge: "Grok",
    color: "purple",
    icon: "mdi-flash",
    keyPrefix: "xai-",
    keyPlaceholder: "xai-...",
    keyHelpUrl: "https://console.x.ai/",
    defaultModels: ["grok-2-latest", "grok-2", "grok-beta"],
  },
  gemini: {
    id: "gemini",
    name: "Google Gemini",
    badge: "Gemini",
    color: "blue",
    icon: "mdi-google",
    keyPrefix: "AIza",
    keyPlaceholder: "AIzaSy...",
    keyHelpUrl: "https://aistudio.google.com/app/apikey",
    defaultModels: [
      "gemini-1.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash-8b",
      "gemini-2.0-flash-lite",
      "gemini-flash-latest",
      "gemini-3.5-flash-lite",
      "gemini-3.8-flash",
      "gemini-3.7-flash",
    ],
  },
};

export function detectProvider(apiKey: string, explicitProvider?: string): "openai" | "anthropic" | "xai" | "gemini" {
  if (explicitProvider && explicitProvider !== "auto" && AI_PROVIDERS[explicitProvider]) {
    return explicitProvider as "openai" | "anthropic" | "xai" | "gemini";
  }

  const cleanKey = (apiKey || "").trim();
  if (cleanKey.startsWith("sk-ant-")) return "anthropic";
  if (cleanKey.startsWith("xai-")) return "xai";
  if (cleanKey.startsWith("sk-")) return "openai";
  return "gemini";
}

async function callOpenAICompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  systemInstruction: string,
  userPrompt: string,
  timeoutMs = 18000,
  useJsonFormat = true
): Promise<{ text?: string; error?: string; status?: number }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const bodyPayload: any = {
      model,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    };

    if (useJsonFormat) {
      bodyPayload.response_format = { type: "json_object" };
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(bodyPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await res.json().catch(() => null);

    if (res.ok && data) {
      const text = data?.choices?.[0]?.message?.content;
      if (text) return { text };
    }

    const errMsg = data?.error?.message || `HTTP ${res.status}`;
    return { error: errMsg, status: res.status };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return { error: err?.message || "Timeout", status: 500 };
  }
}

async function callAnthropic(
  apiKey: string,
  model: string,
  systemInstruction: string,
  userPrompt: string,
  timeoutMs = 18000
): Promise<{ text?: string; error?: string; status?: number }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system: systemInstruction,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await res.json().catch(() => null);

    if (res.ok && data) {
      const text = data?.content?.[0]?.text;
      if (text) return { text };
    }

    const errMsg = data?.error?.message || `HTTP ${res.status}`;
    return { error: errMsg, status: res.status };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return { error: err?.message || "Timeout", status: 500 };
  }
}

async function callGemini(
  apiKey: string,
  model: string,
  systemInstruction: string,
  userPrompt: string,
  timeoutMs = 10000
): Promise<{ text?: string; error?: string; status?: number }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: [
          {
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await res.json().catch(() => null);

    if (res.ok && data) {
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return { text };
    }

    const errMsg = data?.error?.message || `HTTP ${res.status}`;
    return { error: errMsg, status: res.status };
  } catch (err: any) {
    clearTimeout(timeoutId);
    return { error: err?.message || "Timeout", status: 500 };
  }
}

export async function generateWithAI({
  apiKey,
  provider,
  systemInstruction,
  userPrompt,
  preferredModel,
}: {
  apiKey: string;
  provider?: string;
  systemInstruction: string;
  userPrompt: string;
  preferredModel?: string;
}): Promise<{
  text: string;
  model: string;
  provider: "openai" | "anthropic" | "xai" | "gemini";
}> {
  const activeProvider = detectProvider(apiKey, provider);
  const providerMeta = AI_PROVIDERS[activeProvider];

  const candidateModels = preferredModel
    ? [preferredModel, ...providerMeta.defaultModels.filter((m) => m !== preferredModel)]
    : [...providerMeta.defaultModels];

  let chosenText: string | null = null;
  let chosenModel: string | null = null;
  let lastError = "";

  for (const model of candidateModels) {
    let result: { text?: string; error?: string; status?: number };

    if (activeProvider === "openai") {
      result = await callOpenAICompatible(
        "https://api.openai.com/v1/chat/completions",
        apiKey,
        model,
        systemInstruction,
        userPrompt,
        18000,
        true
      );
    } else if (activeProvider === "xai") {
      result = await callOpenAICompatible(
        "https://api.x.ai/v1/chat/completions",
        apiKey,
        model,
        systemInstruction,
        userPrompt,
        18000,
        false
      );
    } else if (activeProvider === "anthropic") {
      result = await callAnthropic(apiKey, model, systemInstruction, userPrompt, 18000);
    } else {
      result = await callGemini(apiKey, model, systemInstruction, userPrompt, 14000);
    }

    if (result.text) {
      chosenText = result.text;
      chosenModel = model;
      break;
    }

    if (result.error) {
      lastError = `[${model}]: ${result.error}`;
      if (
        result.status === 401 ||
        (result.status === 400 && result.error.toLowerCase().includes("api key not valid"))
      ) {
        throw new Error(`API Key untuk ${providerMeta.name} tidak valid. Periksa kembali API Key Anda.`);
      }
    }
  }

  if (!chosenText || !chosenModel) {
    const isQuotaError =
      lastError.includes("Quota") ||
      lastError.includes("RESOURCE_EXHAUSTED") ||
      lastError.includes("429");

    if (isQuotaError) {
      throw new Error(
        `Limit (kuota harian) pada API Key ${providerMeta.name} Anda telah habis (Rate Limit Exceeded). Buat API Key baru di ${providerMeta.keyHelpUrl}`
      );
    }

    throw new Error(
      `Gagal menghasilkan laporan AI (${lastError || "Semua model sibuk"}). Coba lagi beberapa saat lagi.`
    );
  }

  // Clean markdown json if wrapped
  let cleaned = chosenText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  return {
    text: cleaned,
    model: chosenModel,
    provider: activeProvider,
  };
}
