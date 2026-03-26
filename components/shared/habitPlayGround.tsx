"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const STAGES = [
  { name: "Seed",       xp: 0,   next: 40,  sub: "Stage 1 of 7" },
  { name: "Sprout",     xp: 40,  next: 100, sub: "Stage 2 of 7" },
  { name: "Sapling",    xp: 100, next: 180, sub: "Stage 3 of 7" },
  { name: "Young Tree", xp: 180, next: 290, sub: "Stage 4 of 7" },
  { name: "Full Tree",  xp: 290, next: 420, sub: "Stage 5 of 7" },
  { name: "Ancient",    xp: 420, next: 570, sub: "Stage 6 of 7" },
  { name: "Glowing",    xp: 570, next: 570, sub: "Stage 7 — Legendary" },
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
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
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
  } catch (_) {}
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
interface FlashState { msg: string; color: string; }
interface Particle { id: number; color: string; left: number; top: number; dx: number; dy: number; delay: number; }

// ─── Component ────────────────────────────────────────────────────────────────

export default function HabitPlayground() {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [shields, setShields] = useState(1);
  const [setIdx, setSetIdx] = useState(0);
  const [completedSets, setCompletedSets] = useState(0);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [currentStage, setCurrentStage] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [flash, setFlashState] = useState<FlashState>({ msg: "Complete a todo to start growing", color: "#52525b" });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isNew, setIsNew] = useState(false);
  const [shakeTree, setShakeTree] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const particleIdRef = useRef(0);

  // Init todos from set index
  const buildTodos = useCallback((idx: number): Todo[] => {
    const src = TODO_SETS[idx % TODO_SETS.length];
    return src.map((t) => ({ ...t, done: false }));
  }, []);

  useEffect(() => {
    setTodos(buildTodos(0));
    setSetIdx(1);
  }, [buildTodos]);

  // Redraw tree whenever stage changes
  useEffect(() => {
    if (svgRef.current) drawTree(svgRef.current, currentStage, false);
  }, [currentStage]);

  const triggerFlash = useCallback((msg: string, color: string) => {
    setFlashState({ msg, color });
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setFlashState({ msg, color: "#52525b" }), 2200);
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
      triggerFlash(`Stage up — ${STAGES[newStage].name}!`, "#6366f1");
      if (svgRef.current) drawTree(svgRef.current, newStage, true);
    } else {
      triggerFlash(`+${todos[i].xp} XP  ${todos[i].t}`, "#10b981");
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
        triggerFlash("Legendary! Tree fully grown. Restarting...", "#6366f1");
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
          triggerFlash("New day, new habits. Keep growing!", "#6366f1");
          setCelebrating(false);
          setTimeout(() => setIsNew(false), 600);
        }, 2200);
      } else {
        triggerFlash("All done! +25 bonus XP. New habits incoming...", "#fbbf24");
        setTimeout(() => {
          const nextIdx = setIdx;
          setCompletedSets((cs) => cs + 1);
          setSetIdx((si) => si + 1);
          setTodos(buildTodos(nextIdx));
          setIsNew(true);
          triggerFlash("Fresh set — keep the streak alive!", "#10b981");
          setCelebrating(false);
          setTimeout(() => setIsNew(false), 600);
        }, 1600);
      }
    }
  }, [todos, celebrating, currentStage, xp, setIdx, buildTodos, spawnParticles, triggerFlash]);

  const missDay = useCallback(() => {
    if (celebrating) return;
    if (shields > 0) { triggerFlash("Shield blocked the miss! Streak safe.", "#818cf8"); playSound("done"); return; }
    const newXp = Math.max(0, xp - 20);
    const newStage = getStage(newXp);
    const down = newStage < currentStage;
    playSound("miss");
    setShakeTree(true); setTimeout(() => setShakeTree(false), 360);
    setXp(newXp); setCurrentStage(newStage);
    triggerFlash(down ? "Tree lost a stage..." : "-20 XP. Stay consistent.", "#f87171");
    if (svgRef.current) drawTree(svgRef.current, newStage, false);
  }, [celebrating, shields, xp, currentStage, triggerFlash]);

  const useShield = useCallback(() => {
    if (shields <= 0) { triggerFlash("No shields left!", "#f87171"); return; }
    const newXp = Math.max(0, xp - 30);
    const newStage = getStage(newXp);
    setShields((s) => s - 1); setXp(newXp); setCurrentStage(newStage);
    playSound("done");
    triggerFlash("Shield used. Streak protected. -30 XP.", "#818cf8");
    if (svgRef.current) drawTree(svgRef.current, newStage, false);
  }, [shields, xp, triggerFlash]);

  const resetAll = useCallback(() => {
    setXp(0); setStreak(0); setShields(1); setSetIdx(1); setCompletedSets(0); setCurrentStage(0); setCelebrating(false);
    setTodos(buildTodos(0));
    if (svgRef.current) drawTree(svgRef.current, 0, true);
    triggerFlash("Demo reset. Start fresh!", "#6366f1");
  }, [buildTodos, triggerFlash]);

  // Derived display values
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
        @keyframes gp { 0%,100%{opacity:.5} 50%{opacity:.1} }
        .habit-todo-new { animation: slideIn .35s ease forwards; }
        .habit-shake { animation: shk .32s ease; }
      `}</style>

      <div style={{ width: "100%", padding: "56px 20px 72px", background: "#09090b", boxSizing: "border-box" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 14px",
              borderRadius: 9999, border: "1px solid rgba(99,102,241,.3)", background: "rgba(99,102,241,.08)",
              color: "#818cf8", fontSize: 10, fontWeight: 800, letterSpacing: ".13em", textTransform: "uppercase",
            }}>
              <span style={{ position: "relative", width: 7, height: 7, borderRadius: "50%", background: "#6366f1", flexShrink: 0, display: "block" }}>
                <span style={{
                  position: "absolute", inset: 0, borderRadius: "50%", background: "#6366f1",
                  animation: "ping 1.5s ease infinite",
                }} />
              </span>
              Live demo
            </div>
          </div>
          <h2 style={{
            fontSize: "clamp(26px,4.5vw,48px)", fontWeight: 900, letterSpacing: "-.03em",
            textTransform: "uppercase", lineHeight: .95, marginBottom: 12, color: "#fff",
            fontFamily: "system-ui,-apple-system,sans-serif",
          }}>
            Build habits.<br /><span style={{ color: "#6366f1" }}>Watch them grow.</span>
          </h2>
          <p style={{ fontSize: 14, color: "#52525b", maxWidth: 440, lineHeight: 1.6, fontWeight: 500, margin: "0 auto" }}>
            Complete your daily todos and watch your tree evolve — this is your actual dashboard experience.
          </p>
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
          gap: 16, maxWidth: 860, margin: "0 auto",
        }}>

          {/* Tree Card */}
          <div
            className={shakeTree ? "habit-shake" : ""}
            style={{
              background: "#18181b", border: "1px solid #27272a", borderRadius: 24,
              padding: 24, position: "relative", overflow: "hidden",
              fontFamily: "system-ui,-apple-system,sans-serif",
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: "#3f3f46", marginBottom: 12 }}>
              Your habit tree
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-.02em", textTransform: "uppercase", color: "#fff", lineHeight: 1, marginBottom: 2 }}>
              {stage.name}
            </div>
            <div style={{ fontSize: 11, color: "#3f3f46", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 16 }}>
              {stage.sub}
            </div>

            {/* Tree area */}
            <div style={{ position: "relative", width: "100%", height: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", marginBottom: 12 }}>
              {currentStage === 6 && (
                <>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-60%)", width: 100, height: 100, borderRadius: "50%", border: "1.5px solid rgba(99,102,241,.25)", animation: "gp 2.2s ease infinite" }} />
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-60%)", width: 140, height: 140, borderRadius: "50%", border: "1.5px solid rgba(99,102,241,.12)", animation: "gp 2.2s ease infinite", animationDelay: ".7s" }} />
                </>
              )}
              <svg ref={svgRef} width="190" height="195" viewBox="0 0 190 195" style={{ overflow: "visible" }} />
              {/* Particles */}
              {particles.map((p) => (
                <div key={p.id} style={{
                  position: "absolute", width: 5, height: 5, borderRadius: "50%",
                  background: p.color, left: p.left, top: p.top,
                  // @ts-ignore CSS custom props
                  "--dx": p.dx + "px", "--dy": p.dy + "px",
                  animation: `fup .85s ease-out forwards`,
                  animationDelay: p.delay + "s",
                  pointerEvents: "none",
                }} />
              ))}
            </div>

            {/* XP bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: "#3f3f46", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase" }}>XP Progress</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#6366f1" }}>{xp} XP</span>
            </div>
            <div style={{ height: 6, background: "#27272a", borderRadius: 3, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ height: "100%", borderRadius: 3, background: "#6366f1", width: `${Math.round(xpPct)}%`, transition: "width .55s cubic-bezier(.22,1,.36,1)" }} />
            </div>

            {/* Stage dots */}
            <div style={{ display: "flex", gap: 5, justifyContent: "center", marginBottom: 12 }}>
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} style={{
                  width: 9, height: 9, borderRadius: "50%",
                  background: i < currentStage ? "#3b6d11" : i === currentStage ? "#6366f1" : "#27272a",
                  border: `1px solid ${i < currentStage ? "#5a8a2f" : i === currentStage ? "#818cf8" : "#3f3f46"}`,
                  transform: i === currentStage ? "scale(1.35)" : "none",
                  transition: "all .35s",
                }} />
              ))}
            </div>

            {/* Flash */}
            <div style={{
              padding: "10px 14px", borderRadius: 11, background: "#09090b",
              border: `1px solid ${flash.color === "#52525b" ? "#27272a" : flash.color}`,
              fontSize: 11, fontWeight: 700, color: flash.color, textAlign: "center",
              letterSpacing: ".05em", textTransform: "uppercase", minHeight: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "border-color .3s,color .3s",
            }}>
              {flash.msg}
            </div>
          </div>

          {/* Todos Card */}
          <div style={{
            background: "#18181b", border: "1px solid #27272a", borderRadius: 24,
            padding: 24, fontFamily: "system-ui,-apple-system,sans-serif",
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: "#3f3f46", marginBottom: 12 }}>
              Today&apos;s habits — day {completedSets + 1}
            </div>

            {/* Todo list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
              {todos.map((todo, i) => (
                <div
                  key={i}
                  className={isNew ? "habit-todo-new" : ""}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 13px",
                    background: todo.done ? "rgba(16,185,129,.04)" : "#09090b",
                    border: `1px solid ${todo.done ? "rgba(16,185,129,.18)" : "#27272a"}`,
                    borderRadius: 11, cursor: todo.done ? "default" : "pointer",
                    animationDelay: isNew ? `${i * 0.07}s` : "0s",
                    userSelect: "none",
                  }}
                  onClick={() => !todo.done && completeTodo(i)}
                >
                  <div style={{
                    width: 17, height: 17, borderRadius: 5,
                    border: `1.5px solid ${todo.done ? "#10b981" : "#3f3f46"}`,
                    background: todo.done ? "#10b981" : "transparent",
                    flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {todo.done && (
                      <svg width="9" height="9" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: todo.done ? "#3f3f46" : "#a1a1aa", flex: 1, textDecoration: todo.done ? "line-through" : "none", lineHeight: 1.3 }}>
                    {todo.t}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: todo.done ? "#10b981" : "#4f46e5", letterSpacing: ".04em", flexShrink: 0 }}>
                    +{todo.xp}
                  </span>
                </div>
              ))}
            </div>

            {/* Streak */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 13px", background: "#09090b", border: "1px solid #27272a", borderRadius: 12, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(251,191,36,.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path d="M12 2C12 2 7 8 7 13a5 5 0 0010 0c0-3-2-6-2-6s-1 3-3 3c0-3 0-8 0-8z" fill="#fbbf24" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{streak}</div>
                <div style={{ fontSize: 10, color: "#3f3f46", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>day streak</div>
              </div>
              <div style={{ fontSize: 10, color: "#3f3f46", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>
                {streak > 0 ? "On fire!" : "Start now"}
              </div>
            </div>

            {/* Shields */}
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: "#3f3f46", marginBottom: 8 }}>Shields</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: i < shields ? "#1a1a2e" : "#18181b",
                  border: `1px solid ${i < shields ? "rgba(99,102,241,.25)" : "#27272a"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  opacity: i >= shields ? 0.3 : 1,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path d="M12 2L4 5v6c0 5.25 3.5 10 8 11 4.5-1 8-5.75 8-11V5l-8-3z" fill={i < shields ? "#818cf8" : "#3f3f46"} />
                  </svg>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <button
                onClick={missDay}
                style={{
                  width: "100%", padding: 11, borderRadius: 13, fontSize: 11, fontWeight: 800,
                  letterSpacing: ".06em", textTransform: "uppercase", border: "1px solid rgba(239,68,68,.18)",
                  cursor: "pointer", background: "rgba(239,68,68,.1)", color: "#f87171",
                }}
              >
                Simulate miss day −20 XP
              </button>
              <button
                onClick={useShield}
                style={{
                  width: "100%", padding: 11, borderRadius: 13, fontSize: 11, fontWeight: 800,
                  letterSpacing: ".06em", textTransform: "uppercase", border: "1px solid #3f3f46",
                  cursor: "pointer", background: "#27272a", color: "#71717a",
                }}
              >
                Use streak shield
              </button>
            </div>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={resetAll}
          style={{
            display: "block", margin: "20px auto 0", padding: "8px 22px", borderRadius: 10,
            background: "transparent", border: "1px solid #27272a", color: "#3f3f46",
            fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em",
            cursor: "pointer", fontFamily: "system-ui,-apple-system,sans-serif",
          }}
        >
          Reset demo
        </button>
      </div>
    </>
  );
}