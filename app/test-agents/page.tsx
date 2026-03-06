"use client";
import { useState, useRef, useEffect } from "react";

type DomainKey = "gym" | "income" | "career" | "project" | "accountability" | "orchestrator";

interface DomainConfig {
  icon: string;
  color: string;
  label: string;
}

interface LogEntry {
  msg: string;
  type: "info" | "success" | "error" | "warn" | "start" | "wait";
  time: string;
}

interface AgentResponse {
  success?: boolean;
  domain?: string;
  planId?: string;
  message?: string;
  requiresContext?: boolean;
  [key: string]: unknown;
}

interface SamplePrompt {
  domain: DomainKey;
  text: string;
}

const DOMAINS: Record<DomainKey, DomainConfig> = {
  gym: { icon: "⚡", color: "#00ff88", label: "Gym Agent" },
  income: { icon: "💸", color: "#ffd700", label: "Income Agent" },
  career: { icon: "🎯", color: "#00bfff", label: "Career Agent" },
  project: { icon: "🛠️", color: "#ff6b35", label: "Project Agent" },
  accountability: { icon: "🔔", color: "#bf5fff", label: "Accountability Agent" },
  orchestrator: { icon: "🧠", color: "#ff3366", label: "Orchestrator" },
};

const SAMPLE_PROMPTS: SamplePrompt[] = [
  { domain: "orchestrator", text: "I want to earn 1 lakh in the next 30 days" },
  { domain: "gym", text: "I want to lose belly fat and build muscle" },
  { domain: "income", text: "I'm a graphic designer, help me get freelance clients" },
  { domain: "career", text: "I want to switch from frontend dev to product manager" },
  { domain: "project", text: "I want to build a SaaS tool for freelancers to track invoices and clients with a dashboard, auth, and Stripe payments" },
  { domain: "accountability", text: "Check my progress for today" },
];

const CONTEXT_MAP: Record<DomainKey, Record<string, unknown>> = {
  gym: { weight: 75, height: 175, experience: "Intermediate" },
  income: { profession: "Graphic Designer", skills: ["Figma", "Illustrator", "Branding"] },
  career: { currentRole: "Frontend Developer", targetRole: "Product Manager", yearsOfExperience: 3 },
  project: { techStack: "Next.js", experience: "Intermediate", hoursPerDay: 4 },
  accountability: {},
  orchestrator: {},
};

const ENDPOINT_MAP: Record<DomainKey, string> = {
  orchestrator: "/api/agents/orchestrator",
  gym: "/api/agents/gym",
  income: "/api/agents/income",
  career: "/api/agents/career",
  project: "/api/agents/project",
  accountability: "/api/agents/accountability",
};

export default function AgentTestPage() {
  const [activeAgent, setActiveAgent] = useState<DomainKey>("orchestrator");
  const [prompt, setPrompt] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [elapsed, setElapsed] = useState<string>("0.0");
  const userId = "699dcea62f527ae04ef24336";

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  useEffect(() => {
    if (loading) {
      const start = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(((Date.now() - start) / 1000).toFixed(1));
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [loading]);

  const addLog = (msg: string, type: LogEntry["type"] = "info") => {
    setLogs(prev => [...prev, { msg, type, time: new Date().toLocaleTimeString() }]);
  };

  const getContext = () => CONTEXT_MAP[activeAgent];
  const getEndpoint = () => ENDPOINT_MAP[activeAgent];

  const runAgent = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse(null);
    setError(null);
    setLogs([]);
    setElapsed("0.0");

    addLog(`🚀 Firing ${DOMAINS[activeAgent].label}...`, "start");
    addLog(`📡 POST ${getEndpoint()}`, "info");
    addLog(`👤 User: ${userId}`, "info");
    addLog(`💬 Goal: "${prompt}"`, "info");

    const context = getContext();
    if (Object.keys(context).length > 0) {
      addLog(`📋 Context: ${JSON.stringify(context)}`, "info");
    }
    addLog(`⏳ Waiting for agent response...`, "wait");

    try {
      const body = {
        userId,
        userGoal: prompt,
        goal: prompt,
        feedback: prompt,
        context,
        ...context,
      };

      const res = await fetch(getEndpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data: AgentResponse = await res.json();

      if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);

      addLog(`✅ Agent responded in ${elapsed}s`, "success");

      // If orchestrator response, dig into agentResult
      const finalResult = data.agentResult ? (data.agentResult as any) : data;

      addLog(`📦 Domain: ${finalResult.domain ?? data.domain ?? activeAgent}`, "success");

      if (finalResult.planId || finalResult.projectId) {
        addLog(`🗄️ Saved to DB — ID: ${finalResult.planId || finalResult.projectId}`, "success");
      } else if (finalResult.isMarkdownPlan) {
        addLog(`📝 Plan generated (Markdown fallback)`, "warn");
      }

      if (data.requiresContext || finalResult.requiresContext) {
        addLog(`❓ Agent needs more info from user`, "warn");
      }

      setResponse(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`❌ Error: ${msg}`, "error");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const setQuickPrompt = (sample: SamplePrompt) => {
    setActiveAgent(sample.domain);
    setPrompt(sample.text);
  };

  const activeColor = DOMAINS[activeAgent].color;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080c10",
      color: "#e0e6ed",
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@400;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 2px; }

        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .agent-btn {
          background: transparent;
          border: 1px solid #1e2830;
          color: #8b949e;
          padding: 8px 14px;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          font-weight: 500;
          transition: all 0.15s;
          letter-spacing: 0.05em;
          white-space: nowrap;
          text-align: left;
          width: 100%;
        }
        .agent-btn:hover { background: rgba(255,255,255,0.04); color:#e0e6ed; border-color:#30363d; }

        .prompt-input {
          background: #0d1117;
          border: 1px solid #21262d;
          color: #e0e6ed;
          font-family: inherit;
          font-size: 13px;
          padding: 14px 16px;
          width: 100%;
          outline: none;
          resize: none;
          line-height: 1.6;
          transition: border-color 0.2s;
        }
        .prompt-input::placeholder { color: #3d444d; }

        .log-line {
          font-size: 11px;
          padding: 2px 0;
          animation: fadeUp 0.2s ease;
          line-height: 1.5;
        }
        .sample-btn {
          background: rgba(255,255,255,0.02);
          border: 1px solid #1e2830;
          color: #6e7681;
          font-family: inherit;
          font-size: 11px;
          padding: 7px 12px;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
          line-height: 1.4;
          width: 100%;
        }
        .sample-btn:hover { background: rgba(255,255,255,0.05); color:#c9d1d9; border-color:#30363d; }
      `}</style>

      {/* Scanline overlay */}
      <div style={{
        position: "fixed", inset: 0,
        background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px)",
        pointerEvents: "none", zIndex: 100,
      }} />

      {/* ── HEADER ── */}
      <div style={{
        borderBottom: "1px solid #161b22",
        padding: "14px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#0d1117",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: "#00ff88", boxShadow: "0 0 8px #00ff88",
            animation: "blink 2s infinite",
          }} />
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: "0.05em" }}>
            AGENT <span style={{ color: "#00ff88" }}>COMMAND CENTER</span>
          </span>
          <span style={{ color: "#3d444d", fontSize: 11 }}>// multi-agent orchestration test</span>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#3d444d" }}>
          <span>USER: <span style={{ color: "#8b949e" }}>{userId}</span></span>
          <span>ENV: <span style={{ color: "#ffd700" }}>DEVELOPMENT</span></span>
          {loading && (
            <span style={{ color: "#00ff88" }}>
              <span style={{ display: "inline-block", animation: "spin 1s linear infinite" }}>⟳</span>
              {" "}{elapsed}s
            </span>
          )}
        </div>
      </div>

      {/* ── BODY GRID ── */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", height: "calc(100vh - 53px)" }}>

        {/* LEFT SIDEBAR */}
        <div style={{
          borderRight: "1px solid #161b22",
          background: "#0a0e13",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Agent selector */}
          <div style={{ padding: 16, borderBottom: "1px solid #161b22" }}>
            <div style={{ fontSize: 10, color: "#3d444d", letterSpacing: "0.15em", marginBottom: 10, textTransform: "uppercase" }}>
              Select Agent
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {(Object.entries(DOMAINS) as [DomainKey, DomainConfig][]).map(([key, d]) => (
                <button
                  key={key}
                  className="agent-btn"
                  onClick={() => setActiveAgent(key)}
                  style={{
                    color: activeAgent === key ? d.color : "#8b949e",
                    borderColor: activeAgent === key ? d.color : "#1e2830",
                    background: activeAgent === key ? "rgba(0,0,0,0.5)" : "transparent",
                    boxShadow: activeAgent === key ? `0 0 12px ${d.color}33` : "none",
                  }}
                >
                  <span style={{ marginRight: 8 }}>{d.icon}</span>
                  {d.label.toUpperCase()}
                  {activeAgent === key && <span style={{ float: "right", color: d.color }}>◀</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Sample prompts */}
          <div style={{ padding: 16, flex: 1, overflow: "auto" }}>
            <div style={{ fontSize: 10, color: "#3d444d", letterSpacing: "0.15em", marginBottom: 10, textTransform: "uppercase" }}>
              Quick Test Prompts
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {SAMPLE_PROMPTS.map((s, i) => (
                <button key={i} className="sample-btn" onClick={() => setQuickPrompt(s)}>
                  <span style={{ color: DOMAINS[s.domain].color, marginRight: 6 }}>{DOMAINS[s.domain].icon}</span>
                  {s.text.length > 55 ? s.text.slice(0, 55) + "…" : s.text}
                </button>
              ))}
            </div>
          </div>

          {/* Context preview */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid #161b22" }}>
            <div style={{ fontSize: 10, color: "#3d444d", letterSpacing: "0.15em", marginBottom: 8, textTransform: "uppercase" }}>
              Auto-Context Injected
            </div>
            <pre style={{ fontSize: 10, color: "#4b5563", margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
              {JSON.stringify(getContext(), null, 2) || "{}"}
            </pre>
          </div>
        </div>

        {/* MAIN PANEL */}
        <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Input area */}
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #161b22", background: "#0d1117" }}>
            <div style={{
              fontSize: 10, color: activeColor,
              letterSpacing: "0.15em", marginBottom: 10,
              textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span>{DOMAINS[activeAgent].icon}</span>
              {DOMAINS[activeAgent].label} — Input
              <span style={{ color: "#3d444d" }}>// POST {getEndpoint()}</span>
            </div>

            <div style={{ display: "flex" }}>
              <textarea
                className="prompt-input"
                rows={3}
                placeholder={`Enter your goal for the ${DOMAINS[activeAgent].label}...`}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && e.metaKey) runAgent(); }}
                style={{ borderColor: prompt ? activeColor + "66" : "#21262d" }}
              />
              <button
                onClick={runAgent}
                disabled={loading || !prompt.trim()}
                style={{
                  background: loading || !prompt.trim() ? "#1e2830" : activeColor,
                  border: "none",
                  color: loading || !prompt.trim() ? "#3d444d" : "#080c10",
                  fontFamily: "inherit",
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: "0.1em",
                  padding: "14px 28px",
                  cursor: loading || !prompt.trim() ? "not-allowed" : "pointer",
                  textTransform: "uppercase",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
              >
                {loading
                  ? <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⟳</span>
                  : "▶ RUN"
                }
              </button>
            </div>
            <div style={{ fontSize: 10, color: "#3d444d", marginTop: 6 }}>
              ⌘ + Enter to run • Context auto-injected based on selected agent
            </div>
          </div>

          {/* Output — two columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", flex: 1, overflow: "hidden" }}>

            {/* LOGS PANEL */}
            <div style={{ borderRight: "1px solid #161b22", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{
                padding: "10px 16px", borderBottom: "1px solid #161b22",
                fontSize: 10, color: "#3d444d", letterSpacing: "0.15em", textTransform: "uppercase",
                display: "flex", justifyContent: "space-between",
              }}>
                <span>⬡ Agent Logs</span>
                {logs.length > 0 && (
                  <button onClick={() => setLogs([])} style={{
                    background: "none", border: "none", color: "#3d444d",
                    cursor: "pointer", fontSize: 10, fontFamily: "inherit",
                  }}>
                    clear
                  </button>
                )}
              </div>
              <div style={{ flex: 1, overflow: "auto", padding: "12px 16px" }}>
                {logs.length === 0 ? (
                  <div style={{ color: "#3d444d", fontSize: 11 }}>
                    Waiting for run...<span style={{ animation: "blink 1s infinite", display: "inline-block" }}>_</span>
                  </div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="log-line" style={{
                      color: log.type === "error" ? "#ff7b72"
                        : log.type === "success" ? "#3fb950"
                          : log.type === "warn" ? "#ffd700"
                            : log.type === "start" ? activeColor
                              : "#8b949e",
                    }}>
                      <span style={{ color: "#3d444d", marginRight: 8 }}>{log.time}</span>
                      {log.msg}
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>

            {/* RESPONSE PANEL */}
            <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{
                padding: "10px 16px", borderBottom: "1px solid #161b22",
                fontSize: 10, color: "#3d444d", letterSpacing: "0.15em", textTransform: "uppercase",
                display: "flex", justifyContent: "space-between",
              }}>
                <span>⬡ Agent Response</span>
                {response && (
                  <span style={{ color: "#3fb950" }}>
                    ✓ {response.success ? "SUCCESS" : "PARTIAL"} · {elapsed}s
                  </span>
                )}
              </div>

              <div style={{ flex: 1, overflow: "auto", padding: "12px 16px" }}>
                {!response && !error && (
                  <div style={{ color: "#3d444d", fontSize: 11 }}>
                    Response will appear here...<span style={{ animation: "blink 1s infinite", display: "inline-block" }}>_</span>
                  </div>
                )}

                {error && (
                  <div style={{
                    background: "rgba(255,123,114,0.08)", border: "1px solid rgba(255,123,114,0.2)",
                    padding: 12, color: "#ff7b72", fontSize: 12, animation: "fadeUp 0.3s ease",
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>⚠ ERROR</div>
                    {error}
                  </div>
                )}

                {response && (
                  <div style={{ animation: "fadeUp 0.3s ease" }}>
                    {/* Summary cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8, marginBottom: 16 }}>
                      {(response.planId || (response.agentResult as any)?.planId || (response.agentResult as any)?.projectId) && (
                        <div style={{ background: "rgba(63,185,80,0.08)", border: "1px solid rgba(63,185,80,0.2)", padding: "8px 10px" }}>
                          <div style={{ fontSize: 9, color: "#3fb950", letterSpacing: "0.1em", marginBottom: 2 }}>PLAN SAVED</div>
                          <div style={{ fontSize: 10, color: "#8b949e", wordBreak: "break-all" }}>
                            {response.planId || (response.agentResult as any)?.planId || (response.agentResult as any)?.projectId}
                          </div>
                        </div>
                      )}
                      {(response.domain || (response.agentResult as any)?.domain) && (
                        <div style={{ background: "rgba(0,191,255,0.06)", border: "1px solid rgba(0,191,255,0.15)", padding: "8px 10px" }}>
                          <div style={{ fontSize: 9, color: "#00bfff", letterSpacing: "0.1em", marginBottom: 2 }}>DOMAIN</div>
                          <div style={{ fontSize: 11, color: "#e0e6ed", textTransform: "uppercase" }}>
                            {response.domain || (response.agentResult as any)?.domain}
                          </div>
                        </div>
                      )}
                      {(response.success !== undefined || (response.agentResult as any)?.success !== undefined) && (
                        <div style={{
                          background: (response.success || (response.agentResult as any)?.success) ? "rgba(63,185,80,0.06)" : "rgba(255,123,114,0.06)",
                          border: `1px solid ${(response.success || (response.agentResult as any)?.success) ? "rgba(63,185,80,0.2)" : "rgba(255,123,114,0.2)"}`,
                          padding: "8px 10px",
                        }}>
                          <div style={{ fontSize: 9, color: (response.success || (response.agentResult as any)?.success) ? "#3fb950" : "#ff7b72", letterSpacing: "0.1em", marginBottom: 2 }}>STATUS</div>
                          <div style={{ fontSize: 11, color: "#e0e6ed" }}>
                            {(response.success || (response.agentResult as any)?.success) ? "✓ SUCCESS" : "✗ FAILED"}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Message or Markdown Plan */}
                    {(((response.agentResult as any)?.message || response.message) || (response.agentResult as any)?.isMarkdownPlan) && (
                      <div style={{
                        background: "rgba(255,255,255,0.02)", border: "1px solid #1e2830",
                        padding: "10px 12px", marginBottom: 12, fontSize: 12,
                        color: "#c9d1d9", lineHeight: 1.6,
                      }}>
                        {(response.agentResult as any)?.message || response.message}
                      </div>
                    )}

                    {/* Raw JSON */}
                    <div style={{ fontSize: 10, color: "#3d444d", letterSpacing: "0.1em", marginBottom: 6 }}>RAW JSON RESPONSE</div>
                    <pre style={{
                      fontSize: 11, margin: 0, lineHeight: 1.6,
                      whiteSpace: "pre-wrap", wordBreak: "break-word", color: "#8b949e",
                    }}>
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}