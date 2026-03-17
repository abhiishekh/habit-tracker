"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Bell, Clock, Check, Plus, Play, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";
import Link from "next/link";
import { toast } from "sonner";

interface TodoProps {
  id?: string;
  task: string;
  reminderTime: Date;
  category: string;
  status: string;
  completed?: boolean;
  onToggleComplete?: (id: string, completed: boolean) => void;
}

export function TodoItem({ id, task, reminderTime, category, status, completed, onToggleComplete }: TodoProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const hasNotified = useRef(false);
  const [isCompleted, setIsCompleted] = useState(completed || status === "completed");
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date(reminderTime));

  const playSuccessSound = useCallback(() => {
    const audio = new Audio("/audio/UFL_NOTIFICATION.mp3");
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Audio play blocked by browser policies"));
  }, []);

  const triggerCelebration = useCallback(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#a855f7", "#ec4899"]
    });
    playSuccessSound();
  }, [playSuccessSound]);

  useEffect(() => {
    const wasCompleted = isCompleted;
    const nowCompleted = completed || status === "completed";
    setIsCompleted(nowCompleted);

    // Trigger celebration only if it transition from false to true
    if (!wasCompleted && nowCompleted) {
      // This handles server-side state sync or parent updates
    }
  }, [completed, status, isCompleted]);

  // const toggleComplete = async () => {
  //   if (!id) return;
  //   setLoading(true);
  //   try {
  //     const nextState = !isCompleted;
  //     setIsCompleted(nextState);
  //     if (nextState) {
  //       triggerCelebration();
  //     }
  //     const res = await fetch(`/api/todos/${id}`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ completed: nextState }),
  //     });
  //     if (res.ok) {
  //       setIsCompleted(nextState);
  //       if (nextState) {
  //         triggerCelebration();
  //       }
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        hasNotified.current = false; // reset when user comes back
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const showNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/icon.png", // optional
      });
    }
  };
  const toggleComplete = async () => {
    if (!id) return;

    const nextState = !isCompleted;

    setIsCompleted(nextState);
    onToggleComplete?.(id, nextState);
    if (nextState) {
      triggerCelebration();
      toast.success("Task completed 🎉", {
        description: task,
      });
    }

    try {
      await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextState }),
      });
    } catch (error) {
      setIsCompleted(!nextState);
      toast.error("Failed to update task");
    }
  };
  const extendTime = async (minutes: number) => {
    if (!id) return;
    setLoading(true);

    // Calculate new time: if expired, start from now. If not expired, add to existing.
    const now = new Date();
    const baseDate = currentTime > now ? currentTime : now;
    const newDate = new Date(baseDate.getTime() + minutes * 60000);

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reminderTime: newDate.toISOString(),
          extraTime: minutes
        }),
      });
      if (res.ok) {
        setCurrentTime(newDate);
        setTimeLeft(""); // Reset so effect recalculates
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCompleted) {
      setTimeLeft("Done!");
      return;
    }

    const calculateTime = () => {
      const difference = currentTime.getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft("Time's up!");

        if (!hasNotified.current) {
          hasNotified.current = true;

          showNotification("⏰ Task Reminder", `${task} is due now!`);
          playSuccessSound();
          toast.error("Time's up! ⏰", {
            description: task,
          });
        }

        return;
      }

      const hrs = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((difference / 1000 / 60) % 60);
      const secs = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
    };

    const timer = setInterval(() => {
      requestAnimationFrame(calculateTime);
    }, 1000);
    calculateTime(); // Initial call

    return () => clearInterval(timer);
  }, [currentTime, isCompleted]);

  return (
    <div className={`group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 ${isCompleted ? 'scale-[0.98] opacity-70' : 'scale-100'}`}>
      <div className="flex items-center gap-5 mb-5 md:mb-0">
        <button
          onClick={toggleComplete}
          disabled={loading}
          className={`h-9 w-9 rounded-xl border-2 transition-all flex items-center justify-center shrink-0 disabled:opacity-50 ${isCompleted
            ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20"
            : "border-slate-200 dark:border-zinc-800 hover:border-indigo-500 bg-slate-50 dark:bg-zinc-800/50"
            }`}>
          {loading ? (
            <Loader2 size={16} className="animate-spin text-indigo-500" />
          ) : isCompleted ? (
            <Check size={18} className="text-white animate-in zoom-in duration-300" strokeWidth={4} />
          ) : (
            <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-zinc-700 group-hover:bg-indigo-400 transition-colors" />
          )}
        </button>
        <div>
          <h3 className={`text-lg font-black tracking-tight transition-all duration-500 ${isCompleted ? "text-slate-400 line-through decoration-emerald-500/50" : "text-slate-900 dark:text-slate-100"
            }`}>{task}</h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-md">{category}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {timeLeft === "Time's up!" && !isCompleted && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-700">
            <button
              onClick={() => extendTime(10)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold hover:bg-orange-100 transition-all active:scale-95 border border-orange-100 dark:border-orange-500/20"
            >
              <Plus size={14} /> 10m
            </button>
            <button
              onClick={() => extendTime(15)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold hover:bg-amber-100 transition-all active:scale-95 border border-amber-100 dark:border-amber-500/20"
            >
              <Plus size={14} /> 15m
            </button>
          </div>
        )}

        {/* Sessions Button */}
        {!isCompleted && id && (
          <Link
            href={`/todos/${id}/sessions`}
            onClick={() => {
              toast("Entering focus mode 🧠", {
                description: task,
              });
            }}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-500/25"
          >
            <Play size={14} fill="currentColor" />
            START FOCUS
          </Link>
        )}

        {/* The Live Timer Display */}
        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-500 ${timeLeft === "Time's up!" ? "bg-red-50 border-red-100 dark:bg-red-500/10 dark:border-red-500/20" :
          isCompleted ? "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20" :
            "bg-slate-50 dark:bg-zinc-800/50 border-slate-100 dark:border-zinc-800/50"
          } w-full sm:w-auto justify-center`}>
          <Clock size={16} className={timeLeft === "Time's up!" ? "text-red-500" : isCompleted ? "text-emerald-500" : "text-slate-400"} />
          <span className={`text-sm font-mono font-black ${timeLeft === "Time's up!" ? "text-red-500 animate-pulse" :
            isCompleted ? "text-emerald-500" :
              "text-slate-600 dark:text-slate-200"
            }`}>
            {timeLeft}
          </span>
        </div>
      </div>
    </div>
  );
}
