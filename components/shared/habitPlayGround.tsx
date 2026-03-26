"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";
import { Sun, Moon, Flame, Shield, Zap, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Data ────────────────────────────────────────────────────────────────────

const STAGES = [
  { name: "Seed", xp: 0, next: 40, sub: "Stage 1 of 7" },
  { name: "Sprout", xp: 40, next: 100, sub: "Stage 2 of 7" },
  { name: "Sapling", xp: 100, next: 180, sub: "Stage 3 of 7" },
  { name: "Young Tree", xp: 180, next: 290, sub: "Stage 4 of 7" },
  { name: "Full Tree", xp: 290, next: 420, sub: "Stage 5 of 7" },
  { name: "Ancient", xp: 420, next: 570, sub: "Stage 6 of 7" },
  { name: "Glowing", xp: 570, next: 570, sub: "Stage 7 — Legendary" },
];

const TODO_SETS = [
  [
    { t: "Log your morning energy level", xp: 8 },
    { t: "Complete today's AI-generated habit tasks", xp: 12 },
    { t: "Mark your workout done in the app", xp: 10 },
    { t: "Review your streak before bed", xp: 8 },
    { t: "Set tomorrow's todo reminder", xp: 7 },
  ],
  [
    { t: "Check your XP and level progress", xp: 8 },
    { t: "Log 2h of focused coding session", xp: 15 },
    { t: "Update your financial habit tracker", xp: 10 },
    { t: "Earn your first streak shield", xp: 12 },
    { t: "Share your tree growth with a friend", xp: 6 },
  ],
  [
    { t: "Break a challenge into 3 micro-todos", xp: 10 },
    { t: "Complete your evening reflection", xp: 8 },
    { t: "Hit 7-day streak milestone", xp: 15 },
    { t: "Log gym session intensity & reps", xp: 10 },
    { t: "Review last week's habit heatmap", xp: 9 },
  ],
  [
    { t: "Start a new 30-day coding challenge", xp: 12 },
    { t: "Check in via WhatsApp bot reminder", xp: 7 },
    { t: "Add a custom habit to your garden", xp: 10 },
    { t: "Log today's mindset score (1–10)", xp: 8 },
    { t: "Complete all todos for +25 bonus XP", xp: 11 },
  ],
  [
    { t: "Plant a new habit tree", xp: 12 },
    { t: "Unlock the Ancient Tree badge", xp: 15 },
    { t: "Log your freelance earnings this week", xp: 10 },
    { t: "Set a 90-day reset goal", xp: 10 },
    { t: "Review your full habit impact graph", xp: 9 },
  ],
];

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStage(xp: number): number {
  let s = 0;
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (xp >= STAGES[i].xp) { s = i; break; }
  }
  return s;
}

function playSound(type: "done" | "level" | "allset" | "miss" | "restart") {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    if (type === "done") {
      o.frequency.setValueAtTime(523, ctx.currentTime);
      o.frequency.setValueAtTime(659, ctx.currentTime + 0.08);
      o.frequency.setValueAtTime(784, ctx.currentTime + 0.16);
      g.gain.setValueAtTime(0.2, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      o.start(); o.stop(ctx.currentTime + 0.5);
    } else if (type === "level") {
      o.frequency.setValueAtTime(392, ctx.currentTime);
      o.frequency.setValueAtTime(523, ctx.currentTime + 0.1);
      o.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
      o.frequency.setValueAtTime(1047, ctx.currentTime + 0.32);
      g.gain.setValueAtTime(0.28, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.75);
      o.start(); o.stop(ctx.currentTime + 0.75);
    } else if (type === "allset") {
      [523, 659, 784, 1047, 1319].forEach((f, i) => {
        const o2 = ctx.createOscillator(), g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.value = f;
        g2.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.09);
        g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.4);
        o2.start(ctx.currentTime + i * 0.09); o2.stop(ctx.currentTime + i * 0.09 + 0.4);
      });
    } else if (type === "miss") {
      o.type = "sawtooth";
      o.frequency.setValueAtTime(220, ctx.currentTime);
      o.frequency.setValueAtTime(160, ctx.currentTime + 0.18);
      g.gain.setValueAtTime(0.13, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      o.start(); o.stop(ctx.currentTime + 0.35);
    } else if (type === "restart") {
      [1047, 784, 523].forEach((f, i) => {
        const o2 = ctx.createOscillator(), g2 = ctx.createGain();
        o2.connect(g2); g2.connect(ctx.destination);
        o2.frequency.value = f;
        g2.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1);
        g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.3);
        o2.start(ctx.currentTime + i * 0.1); o2.stop(ctx.currentTime + i * 0.1 + 0.3);
      });
    }
  } catch (_) { }
}

// ─── Tree SVG renderer ───────────────────────────────────────────────────────

function drawTree(svgEl: SVGSVGElement, stage: number, animate: boolean) {
  svgEl.innerHTML = "";
  const cx = 95, g = 185;
  const T = "#8b5e3c", TD = "#6b3f1f";
  const L1 = "#5a8a2f", L2 = "#3b6d11", L3 = "#7db544", GL = "#97c459";
  const NS = "http://www.w3.org/2000/svg";

  function mk(tag: string, attrs: Record<string, string | number>) {
    const e = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v)));
    svgEl.appendChild(e);
    return e;
  }
  function an(el: Element, attr: string, f: number, t: number, dur: number, del: number) {
    const a = document.createElementNS(NS, "animate");
    a.setAttribute("attributeName", attr); a.setAttribute("from", String(f)); a.setAttribute("to", String(t));
    a.setAttribute("dur", dur + "s"); a.setAttribute("begin", (del || 0) + "s"); a.setAttribute("fill", "freeze");
    el.appendChild(a);
  }
  function sw(el: Element, dur: number) {
    const a = document.createElementNS(NS, "animateTransform");
    a.setAttribute("attributeName", "transform"); a.setAttribute("type", "rotate");
    a.setAttribute("values", `0 ${cx} ${g};2 ${cx} ${g};-2 ${cx} ${g};0 ${cx} ${g}`);
    a.setAttribute("dur", dur + "s"); a.setAttribute("repeatCount", "indefinite");
    el.appendChild(a);
  }

  if (stage === 0) {
    mk("ellipse", { cx, cy: g, rx: 22, ry: 6, fill: "#a0784a", opacity: 0.35 });
    const sd = mk("ellipse", { cx, cy: g - 10, rx: 8, ry: 11, fill: "#a0784a" });
    mk("line", { x1: cx, y1: g - 20, x2: cx + 3, y2: g - 27, stroke: L2, "stroke-width": 2, "stroke-linecap": "round" });
    if (animate) { an(sd, "ry", 0, 11, 0.4, 0); an(sd, "cy", g, g - 10, 0.4, 0); }
  } else if (stage === 1) {
    const h = 50;
    const tr = mk("rect", { x: cx - 4, y: g - h, width: 8, height: h, fill: T, rx: 4 });
    if (animate) { an(tr, "height", 0, h, 0.45, 0); an(tr, "y", g, g - h, 0.45, 0); }
    const ll = mk("ellipse", { cx: cx - 12, cy: g - h + 4, rx: 12, ry: 8, fill: L1, transform: `rotate(-30 ${cx - 12} ${g - h + 4})` });
    const rl = mk("ellipse", { cx: cx + 12, cy: g - h + 4, rx: 12, ry: 8, fill: L2, transform: `rotate(30 ${cx + 12} ${g - h + 4})` });
    if (animate) { an(ll, "rx", 0, 12, 0.38, 0.42); an(rl, "rx", 0, 12, 0.38, 0.5); }
    sw(tr, 4.5);
  } else if (stage === 2) {
    const h = 85;
    const tr = mk("rect", { x: cx - 5, y: g - h, width: 10, height: h, fill: T, rx: 5 });
    if (animate) { an(tr, "height", 30, h, 0.55, 0); an(tr, "y", g - 30, g - h, 0.55, 0); }
    ([[cx, g - h - 16, 26, L1], [cx - 12, g - h - 5, 18, L2], [cx + 12, g - h - 4, 18, L3]] as [number, number, number, string][])
      .forEach(([lx, ly, r, f], i) => {
        const c = mk("circle", { cx: lx, cy: ly, r, fill: f });
        if (animate) an(c, "r", 0, r, 0.38, 0.48 + i * 0.09);
      });
    sw(tr, 5);
  } else if (stage === 3) {
    const h = 108;
    mk("path", { d: `M${cx - 6},${g}L${cx - 4},${g - h}L${cx + 4},${g - h}L${cx + 6},${g}Z`, fill: T });
    ([[cx, g - h - 28, 38, L1], [cx - 18, g - h - 8, 27, L2], [cx + 18, g - h - 10, 25, L3], [cx - 7, g - h - 50, 23, L1], [cx + 7, g - h - 48, 22, L2]] as [number, number, number, string][])
      .forEach(([lx, ly, r, f], i) => {
        const c = mk("circle", { cx: lx, cy: ly, r, fill: f });
        if (animate) an(c, "r", 0, r, 0.38, 0.38 + i * 0.07);
      });
  } else if (stage === 4) {
    const h = 135;
    mk("path", { d: `M${cx - 8},${g}L${cx - 5},${g - h}L${cx + 5},${g - h}L${cx + 8},${g}Z`, fill: TD });
    mk("line", { x1: cx, y1: g - h + 28, x2: cx - 35, y2: g - h + 11, stroke: T, "stroke-width": 5, "stroke-linecap": "round" });
    mk("line", { x1: cx, y1: g - h + 45, x2: cx + 35, y2: g - h + 27, stroke: T, "stroke-width": 5, "stroke-linecap": "round" });
    ([[cx, g - h - 35, 44, L1], [cx - 25, g - h - 12, 30, L2], [cx + 25, g - h - 14, 28, L3], [cx - 11, g - h - 62, 30, L1], [cx + 11, g - h - 59, 27, L2], [cx, g - h - 84, 23, L3], [cx - 35, g - h + 8, 22, L1], [cx + 35, g - h + 8, 20, L2]] as [number, number, number, string][])
      .forEach(([lx, ly, r, f], i) => {
        const c = mk("circle", { cx: lx, cy: ly, r, fill: f });
        if (animate) an(c, "r", 0, r, 0.38, 0.32 + i * 0.055);
      });
  } else if (stage === 5) {
    const h = 150;
    mk("path", { d: `M${cx - 10},${g}Q${cx - 8},${g - 70}${cx - 5},${g - h}L${cx + 5},${g - h}Q${cx + 8},${g - 70}${cx + 10},${g}Z`, fill: TD });
    ([[cx - 10, cx - 30, g, g + 4], [cx + 10, cx + 30, g, g + 4]] as number[][]).forEach(([x1, x2, y1, y2]) => {
      mk("path", { d: `M${x1},${y1}Q${(x1 + x2) / 2},${y1 + 8}${x2},${y2}`, stroke: T, "stroke-width": 3.5, fill: "none", "stroke-linecap": "round" });
    });
    ([[cx, g - h + 10, cx - 46, g - h - 1, 5], [cx, g - h + 28, cx + 46, g - h + 11, 5], [cx, g - h + 10, cx - 26, g - h - 24, 3.5], [cx, g - h + 10, cx + 26, g - h - 22, 3.5]] as number[][])
      .forEach(([x1, y1, x2, y2, w]) => mk("line", { x1, y1, x2, y2, stroke: T, "stroke-width": w, "stroke-linecap": "round" }));
    ([[cx, g - h - 38, 46, L1], [cx - 32, g - h - 15, 31, L2], [cx + 32, g - h - 17, 29, L3], [cx - 13, g - h - 68, 32, L1], [cx + 13, g - h - 65, 30, L2], [cx, g - h - 92, 26, L3], [cx - 46, g - h + 1, 26, L1], [cx + 46, g - h + 1, 24, L2], [cx - 22, g - h - 94, 20, L1], [cx + 22, g - h - 92, 20, L2]] as [number, number, number, string][])
      .forEach(([lx, ly, r, f], i) => {
        const c = mk("circle", { cx: lx, cy: ly, r, fill: f });
        if (animate) an(c, "r", 0, r, 0.38, 0.26 + i * 0.05);
      });
  } else {
    const h = 155;
    mk("path", { d: `M${cx - 10},${g}Q${cx - 8},${g - 72}${cx - 5},${g - h}L${cx + 5},${g - h}Q${cx + 8},${g - 72}${cx + 10},${g}Z`, fill: TD });
    ([[cx - 10, cx - 30, g, g + 4], [cx + 10, cx + 30, g, g + 4]] as number[][]).forEach(([x1, x2, y1, y2]) => {
      mk("path", { d: `M${x1},${y1}Q${(x1 + x2) / 2},${y1 + 8}${x2},${y2}`, stroke: T, "stroke-width": 3.5, fill: "none", "stroke-linecap": "round" });
    });
    ([[cx, g - h + 10, cx - 46, g - h - 1, 5], [cx, g - h + 28, cx + 46, g - h + 11, 5], [cx, g - h + 10, cx - 26, g - h - 24, 3.5], [cx, g - h + 10, cx + 26, g - h - 22, 3.5]] as number[][])
      .forEach(([x1, y1, x2, y2, w]) => mk("line", { x1, y1, x2, y2, stroke: T, "stroke-width": w, "stroke-linecap": "round" }));
    ([[cx, g - h - 38, 46], [cx - 32, g - h - 15, 31], [cx + 32, g - h - 17, 29], [cx - 13, g - h - 68, 32], [cx + 13, g - h - 65, 30], [cx, g - h - 92, 26], [cx - 46, g - h + 1, 26], [cx + 46, g - h + 1, 24]] as number[][])
      .forEach(([lx, ly, r], i) => {
        const cols = [GL, "#5a8a2f", "#97c459"];
        const c = mk("circle", { cx: lx, cy: ly, r, fill: cols[i % 3] });
        if (animate) an(c, "r", 0, r, 0.38, 0.26 + i * 0.05);
      });
    for (let i = 0; i < 3; i++) {
      const rn = mk("circle", { cx, cy: g - h - 38, r: 46 + i * 13, fill: "none", stroke: GL, "stroke-width": 1.2, opacity: 0.28 - i * 0.07 });
      const ar = document.createElementNS(NS, "animate");
      ar.setAttribute("attributeName", "opacity"); ar.setAttribute("values", ".28;.05;.28");
      ar.setAttribute("dur", (2 + i * 0.55) + "s"); ar.setAttribute("begin", (i * 0.38) + "s"); ar.setAttribute("repeatCount", "indefinite");
      rn.appendChild(ar);
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const r2 = 40 + Math.random() * 14;
      const sp = mk("circle", { cx: cx + Math.cos(a) * r2, cy: g - h - 38 + Math.sin(a) * r2, r: 2.2, fill: GL });
      const as = document.createElementNS(NS, "animate");
      as.setAttribute("attributeName", "opacity"); as.setAttribute("values", "0;1;0");
      as.setAttribute("dur", (1.3 + i * 0.22) + "s"); as.setAttribute("begin", (i * 0.2) + "s"); as.setAttribute("repeatCount", "indefinite");
      sp.appendChild(as);
    }
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Todo { t: string; xp: number; done: boolean; }
interface FlashState { msg: string; variant: "default" | "success" | "error" | "warning" | "legendary"; }
interface Particle { id: number; color: string; left: number; top: number; dx: number; dy: number; delay: number; }

const flashVariantStyles: Record<FlashState["variant"], string> = {
  default: "border-border text-muted-foreground",
  success: "border-emerald-500/40 text-emerald-500 dark:border-emerald-400/40 dark:text-emerald-400",
  error: "border-red-500/40 text-red-500 dark:border-red-400/40 dark:text-red-400",
  warning: "border-amber-500/40 text-amber-500 dark:border-amber-400/40 dark:text-amber-400",
  legendary: "border-indigo-500/40 text-indigo-600 dark:border-indigo-400/40 dark:text-indigo-400",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function HabitPlayground() {
  const { theme, setTheme } = useTheme();
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [shields, setShields] = useState(1);
  const [setIdx, setSetIdx] = useState(0);
  const [completedSets, setCompletedSets] = useState(0);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [currentStage, setCurrentStage] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [flash, setFlashState] = useState<FlashState>({ msg: "Complete a todo to start growing", variant: "default" });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [shakeTree, setShakeTree] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particleIdRef = useRef(0);

  const buildTodos = useCallback((idx: number): Todo[] => {
    const src = TODO_SETS[idx % TODO_SETS.length];
    return src.map((t) => ({ ...t, done: false }));
  }, []);

  useEffect(() => {
    setTodos(buildTodos(0));
    setSetIdx(1);
  }, [buildTodos]);
  useEffect(() => {
    const unlock = () => {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("click", unlock);
    };

    document.addEventListener("touchstart", unlock, { once: true });
    document.addEventListener("click", unlock, { once: true });

    return () => {
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("click", unlock);
    };
  }, []);

  useEffect(() => {
    if (svgRef.current) drawTree(svgRef.current, currentStage, false);
  }, [currentStage]);

  const triggerFlash = useCallback((msg: string, variant: FlashState["variant"]) => {
    setFlashState({ msg, variant });
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setFlashState({ msg, variant: "default" }), 2200);
  }, []);

  const spawnParticles = useCallback((n: number, color: string) => {
    const newParticles: Particle[] = Array.from({ length: n }, () => {
      const angle = Math.random() * Math.PI * 2;
      const d = 35 + Math.random() * 65;
      return {
        id: particleIdRef.current++,
        color,
        left: 70 + Math.random() * 50,
        top: 60 + Math.random() * 60,
        dx: Math.cos(angle) * d,
        dy: -(Math.abs(Math.sin(angle) * d) + 8),
        delay: Math.random() * 0.2,
      };
    });
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1100);
  }, []);

  const completeTodo = useCallback((i: number) => {
    if (todos[i].done || celebrating) return;
    const oldStage = currentStage;
    const newXp = Math.min(xp + todos[i].xp, 999);
    const newStage = getStage(newXp);
    const levelUp = newStage > oldStage;

    setTodos((prev) => prev.map((t, idx) => idx === i ? { ...t, done: true } : t));
    setXp(newXp);
    setCurrentStage(newStage);

    playSound(levelUp ? "level" : "done");
    spawnParticles(levelUp ? 20 : 9, levelUp ? "#818cf8" : "#10b981");

    if (levelUp) {
      triggerFlash(`Stage up — ${STAGES[newStage].name}!`, "legendary");
      if (svgRef.current) drawTree(svgRef.current, newStage, true);
    } else {
      triggerFlash(`+${todos[i].xp} XP  ${todos[i].t}`, "success");
    }

    const updatedTodos = todos.map((t, idx) => idx === i ? { ...t, done: true } : t);
    const allDone = updatedTodos.every((t) => t.done);

    if (allDone) {
      setCelebrating(true);
      const bonusXp = Math.min(newXp + 25, 999);
      const bonusStage = getStage(bonusXp);
      setXp(bonusXp);
      setCurrentStage(bonusStage);
      setStreak((s) => s + 1);
      playSound("allset");
      spawnParticles(32, "#fbbf24");

      if (bonusStage === 6) {
        triggerFlash("Legendary! Tree fully grown. Restarting...", "legendary");
        playSound("level");
        setTimeout(() => {
          playSound("restart");
          const nextIdx = setIdx;
          setXp(0); setCurrentStage(0);
          setStreak((s) => s + 1);
          setCompletedSets((cs) => cs + 1);
          setSetIdx((si) => si + 1);
          setTodos(buildTodos(nextIdx));
          setIsNew(true);
          if (svgRef.current) drawTree(svgRef.current, 0, true);
          triggerFlash("New day, new habits. Keep growing!", "legendary");
          setCelebrating(false);
          setTimeout(() => setIsNew(false), 600);
        }, 2200);
      } else {
        triggerFlash("All done! +25 bonus XP. New habits incoming...", "warning");
        setTimeout(() => {
          const nextIdx = setIdx;
          setCompletedSets((cs) => cs + 1);
          setSetIdx((si) => si + 1);
          setTodos(buildTodos(nextIdx));
          setIsNew(true);
          triggerFlash("Fresh set — keep the streak alive!", "success");
          setCelebrating(false);
          setTimeout(() => setIsNew(false), 600);
        }, 1600);
      }
    }
  }, [todos, celebrating, currentStage, xp, setIdx, buildTodos, spawnParticles, triggerFlash]);

  const missDay = useCallback(() => {
    if (celebrating) return;
    if (shields > 0) {
      triggerFlash("Shield blocked the miss! Streak safe.", "legendary");
      playSound("done");
      return;
    }
    const newXp = Math.max(0, xp - 20);
    const newStage = getStage(newXp);
    playSound("miss");
    setShakeTree(true); setTimeout(() => setShakeTree(false), 360);
    setXp(newXp); setCurrentStage(newStage);
    triggerFlash(newStage < currentStage ? "Tree lost a stage..." : "-20 XP. Stay consistent.", "error");
    if (svgRef.current) drawTree(svgRef.current, newStage, false);
  }, [celebrating, shields, xp, currentStage, triggerFlash]);

  const useShield = useCallback(() => {
    if (shields <= 0) { triggerFlash("No shields left!", "error"); return; }
    const newXp = Math.max(0, xp - 30);
    const newStage = getStage(newXp);
    setShields((s) => s - 1); setXp(newXp); setCurrentStage(newStage);
    playSound("done");
    triggerFlash("Shield used. Streak protected. -30 XP.", "legendary");
    if (svgRef.current) drawTree(svgRef.current, newStage, false);
  }, [shields, xp, triggerFlash]);

  const resetAll = useCallback(() => {
    setXp(0); setStreak(0); setShields(1); setSetIdx(1); setCompletedSets(0); setCurrentStage(0); setCelebrating(false);
    setTodos(buildTodos(0));
    if (svgRef.current) drawTree(svgRef.current, 0, true);
    triggerFlash("Demo reset. Start fresh!", "legendary");
  }, [buildTodos, triggerFlash]);

  const stage = STAGES[currentStage];
  const cur = stage.xp;
  const nxt = currentStage < 6 ? STAGES[currentStage + 1].xp : STAGES[6].xp;
  const xpPct = currentStage === 6 ? 100 : Math.min(100, ((xp - cur) / (nxt - cur)) * 100);

  return (
    <>
      <style>{`
        @keyframes ping { 0%{opacity:.8;transform:scale(1)} 70%{opacity:0;transform:scale(2.2)} 100%{opacity:0} }
        @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fup { 0%{opacity:1;transform:translate(0,0) scale(1)} 100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(0)} }
        @keyframes shk { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
        @keyframes glowPulse { 0%,100%{opacity:.5} 50%{opacity:.1} }
        .habit-todo-new { animation: slideIn .35s ease forwards; }
        .habit-shake { animation: shk .32s ease; }
      `}</style>

      <div className="w-full min-h-screen bg-background text-foreground transition-colors duration-300">
        <div className="w-full px-5 py-14">

          {/* Header */}
          <div className="text-center mb-10 relative">


            <div className="flex justify-center mb-4">
              <Badge
                variant="outline"
                className="gap-2 px-3 py-1 text-[10px] font-bold tracking-widest uppercase border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
                Live demo
              </Badge>
            </div>

            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-none mb-3 text-foreground">
              Build habits.<br />
              <span className="text-indigo-600 dark:text-indigo-400">Watch them grow.</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed font-medium">
              Complete your daily todos and watch your tree evolve — this is your actual dashboard experience.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl mx-auto">

            {/* ── Tree Card ─────────────────────────────── */}
            <Card className={cn(
              "relative overflow-hidden transition-all duration-300 rounded-[2.5rem] border border-emerald-200/60 dark:border-zinc-800 bg-green-50/30 dark:bg-zinc-900/40 px-4 py-2 ease-out hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-indigo-500/5",
              shakeTree && "habit-shake"
            )}>
              <CardHeader className=" pt-5 px-6">
                <p className="text-[9px] font-extrabold tracking-[.16em] uppercase text-muted-foreground/60 mb-1">
                  Your habit tree
                </p>
                <div className="flex items-end gap-2">
                  <h3 className="text-2xl font-black tracking-tight uppercase text-foreground leading-none">
                    {stage.name}
                  </h3>
                  <Badge variant="secondary" className="mb-0.5 text-[10px] font-bold tracking-wide uppercase">
                    {stage.sub}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="px-6 ">
                {/* Tree area */}
                <div className="relative w-full h-40 md:h-48 flex items-end justify-center mb-4">
                  {currentStage === 6 && (
                    <>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/5 w-24 h-24 rounded-full border border-indigo-400/25"
                        style={{ animation: "glowPulse 2.2s ease infinite" }} />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/5 w-36 h-36 rounded-full border border-indigo-400/12"
                        style={{ animation: "glowPulse 2.2s ease infinite", animationDelay: ".7s" }} />
                    </>
                  )}
                  <svg ref={svgRef} width="190" height="195" viewBox="0 0 190 195" className="overflow-visible" />
                  {particles.map((p) => (
                    <div
                      key={p.id}
                      className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                      style={{
                        background: p.color,
                        left: p.left, top: p.top,
                        // @ts-ignore CSS custom props
                        "--dx": p.dx + "px", "--dy": p.dy + "px",
                        animation: `fup .85s ease-out forwards`,
                        animationDelay: p.delay + "s",
                      }}
                    />
                  ))}
                </div>

                {/* XP bar */}
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                    XP Progress
                  </span>
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                    {xp} XP
                  </span>
                </div>
                <Progress
                  value={Math.round(xpPct)}
                  className="h-1.5 mb-4 bg-muted [&>div]:bg-indigo-500 dark:[&>div]:bg-indigo-400"
                />

                {/* Stage dots */}
                <div className="flex gap-1.5 justify-center mb-4">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full border transition-all duration-300",
                        i < currentStage
                          ? "bg-emerald-600 border-emerald-500"
                          : i === currentStage
                            ? "bg-indigo-500 border-indigo-400 scale-125"
                            : "bg-transparent border-border"
                      )}
                    />
                  ))}
                </div>

                {/* Flash message */}
                <div className={cn(
                  "px-3.5 py-2.5 rounded-xl border text-[11px] font-bold tracking-wide uppercase text-center min-h-9 flex items-center justify-center transition-all duration-300 bg-background",
                  flashVariantStyles[flash.variant]
                )}>
                  {flash.msg}
                </div>
              </CardContent>
            </Card>

            {/* ── Todos Card ────────────────────────────── */}
            <Card className="rounded-[2.5rem] border border-indigo-200/60 dark:border-zinc-800 bg-green-50/30 dark:bg-zinc-900/40 px-4 py-2 ease-out hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5">
              <CardHeader className=" pt-5 px-6">
                <p className="text-[9px] font-extrabold tracking-[.16em] uppercase text-muted-foreground/60">
                  Today's habits — day {completedSets + 1}
                </p>
              </CardHeader>

              <CardContent className="px-6 pb-6 space-y-3">
                {/* Todo list */}
                <div className="flex flex-col gap-2">
                  {todos.map((todo, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer select-none transition-all duration-200",
                        isNew && "habit-todo-new",
                        todo.done
                          ? "bg-emerald-500/5 border-emerald-500/20 cursor-default"
                          : "bg-muted/50 border-border hover:border-muted-foreground/30 hover:bg-muted"
                      )}
                      style={{ animationDelay: isNew ? `${i * 0.07}s` : "0s" }}
                      onClick={() => !todo.done && completeTodo(i)}
                    >
                      {/* Checkbox */}
                      <div className={cn(
                        "w-4 h-4 rounded shrink-0 border flex items-center justify-center transition-all duration-200",
                        todo.done
                          ? "bg-emerald-500 border-emerald-500"
                          : "bg-transparent border-muted-foreground/40"
                      )}>
                        {todo.done && (
                          <svg width="9" height="9" viewBox="0 0 12 12">
                            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className={cn(
                        "text-xs font-semibold flex-1 leading-snug transition-all",
                        todo.done ? "line-through text-muted-foreground/50" : "text-foreground/80"
                      )}>
                        {todo.t}
                      </span>
                      <span className={cn(
                        "text-[10px] font-extrabold shrink-0 tracking-wide",
                        todo.done ? "text-emerald-500 dark:text-emerald-400" : "text-indigo-600 dark:text-indigo-400"
                      )}>
                        +{todo.xp}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="my-2" />

                {/* Streak */}
                <div className="flex items-center gap-3 px-3 py-2.5 bg-muted/50 border border-border rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-black text-foreground leading-none">{streak}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">day streak</div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    streak > 0 ? "text-amber-500" : "text-muted-foreground/50"
                  )}>
                    {streak > 0 ? "On fire!" : "Start now"}
                  </span>
                </div>

                {/* Shields */}
                <div>
                  <p className="text-[9px] font-extrabold tracking-[.16em] uppercase text-muted-foreground/60 mb-2">
                    Shields
                  </p>
                  <div className="flex gap-2">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-200",
                          i < shields
                            ? "bg-indigo-500/10 border-indigo-500/30"
                            : "bg-muted/30 border-border opacity-30"
                        )}
                      >
                        <Shield className={cn(
                          "w-4 h-4",
                          i < shields ? "text-indigo-500 dark:text-indigo-400" : "text-muted-foreground"
                        )} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    variant="outline"
                    onClick={missDay}
                    className="w-full h-10 text-[11px] font-extrabold tracking-widest uppercase border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                    Simulate miss day −20 XP
                  </Button>
                  <Button
                    variant="outline"
                    onClick={useShield}
                    className="w-full h-10 text-[11px] font-extrabold tracking-widest uppercase"
                  >
                    <Shield className="w-3.5 h-3.5 mr-1.5" />
                    Use streak shield
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reset */}
          <div className="flex justify-center mt-5">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAll}
              className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              Reset demo
            </Button>
          </div>

        </div>
      </div>
    </>
  );
}