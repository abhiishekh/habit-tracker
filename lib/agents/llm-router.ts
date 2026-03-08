// lib/agents/llm-router.ts
// ─────────────────────────────────────────────────────────────
// PRIMARY  : Gemini 2.0 Flash  (15 RPM free / cheap paid)
// FALLBACK : Groq Llama 3.3 70B (14 400 req/day free)
// ─────────────────────────────────────────────────────────────

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Models ────────────────────────────────────────────────────
const gemini = new ChatGoogleGenerativeAI({
  apiKey     : process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  model      : "gemini-2.0-flash",
  temperature: 0.7,
});

const groq = new ChatOpenAI({
  apiKey     : process.env.GROQ_API_KEY!,
  model      : "llama-3.3-70b-versatile",
  temperature: 0.7,
});

// ── Rate-limit tracker ────────────────────────────────────────
let geminiFailStreak = 0;

function is429(err: unknown): boolean {
  if (!err) return false;
  const e = err as any;
  return (
    e?.status === 429                          ||
    e?.code   === 429                          ||
    String(e?.message).includes("429")         ||
    String(e?.message).toLowerCase().includes("quota")             ||
    String(e?.message).toLowerCase().includes("too many requests") ||
    String(e?.message).toLowerCase().includes("rate limit")
  );
}

// ── Main export ───────────────────────────────────────────────
/**
 * Binds tools to Gemini and invokes the model.
 * On 429 → waits 4 s → retries with Groq.
 * On any other Gemini error → throws immediately.
 */
export async function invokeWithFallback(
  tools   : any[],
  messages: any[]
): Promise<any> {

  // Skip Gemini straight away if it has been failing repeatedly
  if (geminiFailStreak >= 3) {
    console.warn(`[LLM-Router] Gemini in cool-down (${geminiFailStreak} fails). Using Groq directly.`);
    return invokeGroq(tools, messages);
  }

  // ── Try Gemini ───────────────────────────────────────────
  try {
    const response = await gemini.bindTools(tools).invoke(messages);
    geminiFailStreak = 0; 
    console.log("[LLM-Router] ✅ Gemini responded");
    return response;

  } catch (err) {
    if (is429(err)) {
      geminiFailStreak++;
      console.warn(`[LLM-Router] ⚠️  Gemini 429 (streak: ${geminiFailStreak}). Waiting 4 s → Groq…`);

      // Reset streak after 5 min so Gemini gets another chance later
      setTimeout(() => { geminiFailStreak = 0; }, 5 * 60 * 1000);

      await sleep(4000);
      return invokeGroq(tools, messages);
    }

    // Non-429 Gemini error — re-throw so callers can handle it
    console.error("[LLM-Router] ❌ Gemini non-429 error:", err);
    throw err;
  }
}

// ── Groq helper ───────────────────────────────────────────────
async function invokeGroq(tools: any[], messages: any[]): Promise<any> {
  try {
    const response = await groq.bindTools(tools).invoke(messages);
    console.log("[LLM-Router] ✅ Groq fallback responded");
    return response;
  } catch (groqErr) {
    console.error("[LLM-Router] ❌ Groq also failed:", groqErr);
    throw groqErr;
  }
}