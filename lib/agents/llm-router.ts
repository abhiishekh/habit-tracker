// lib/agents/llm-router.ts
// ─────────────────────────────────────────────────────────────
// PRIMARY  : Groq Llama 3.3 70B  (14 400 req/day free)
// FALLBACK : Gemini 2.0 Flash   (15 RPM free / cheap paid)
// ─────────────────────────────────────────────────────────────

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Models ────────────────────────────────────────────────────
const gemini = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY!,
  model: "gemini-2.0-flash",
  temperature: 0.7,
});

const groq = new ChatOpenAI({
  apiKey: process.env.GROQ_API_KEY,
  configuration: {
    baseURL: "https://api.groq.com/openai/v1",
  },
  modelName: "llama-3.3-70b-versatile",
  temperature: 0.7,
});

// ── Rate-limit tracker ────────────────────────────────────────
let groqFailStreak = 0;

function is429(err: unknown): boolean {
  if (!err) return false;
  const e = err as any;
  return (
    e?.status === 429 ||
    e?.code === 429 ||
    String(e?.message).includes("429") ||
    String(e?.message).toLowerCase().includes("quota") ||
    String(e?.message).toLowerCase().includes("too many requests") ||
    String(e?.message).toLowerCase().includes("rate limit")
  );
}

// ── Main export ───────────────────────────────────────────────
/**
 * Binds tools to Groq and invokes the model.
 * On 429 → waits 4 s → retries with Gemini.
 * On any other Groq error → throws immediately.
 */
export async function invokeWithFallback(
  tools: any[],
  messages: any[]
): Promise<any> {

  // Skip Groq straight away if it has been failing repeatedly
  if (groqFailStreak >= 3) {
    console.warn(`[LLM-Router] Groq in cool-down (${groqFailStreak} fails). Using Gemini directly.`);
    return invokeGemini(tools, messages);
  }

  // ── Try Groq (PRIMARY) ──────────────────────────────────
  try {
    const response = await groq.bindTools(tools).invoke(messages);
    groqFailStreak = 0;
    console.log("[LLM-Router] ✅ Groq responded");
    return response;

  } catch (err) {
    if (is429(err)) {
      groqFailStreak++;
      console.warn(`[LLM-Router] ⚠️  Groq 429 (streak: ${groqFailStreak}). Waiting 4 s → Gemini…`);

      // Reset streak after 5 min so Groq gets another chance later
      setTimeout(() => { groqFailStreak = 0; }, 5 * 60 * 1000);

      await sleep(4000);
      return invokeGemini(tools, messages);
    }

    // Non-429 Groq error — try Gemini as fallback
    console.error("[LLM-Router] ❌ Groq non-429 error:", err);
    console.warn("[LLM-Router] Attempting Gemini fallback…");
    return invokeGemini(tools, messages);
  }
}

// ── Gemini helper (FALLBACK) ──────────────────────────────────
async function invokeGemini(tools: any[], messages: any[]): Promise<any> {
  try {
    const response = await gemini.bindTools(tools).invoke(messages);
    console.log("[LLM-Router] ✅ Gemini fallback responded");
    return response;
  } catch (geminiErr) {
    console.error("[LLM-Router] ❌ Gemini also failed:", geminiErr);
    throw geminiErr;
  }
}