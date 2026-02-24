"use client";

import { useEffect, useState } from "react";
import { Bell, Clock, Check, Loader2, Plus } from "lucide-react";

interface TodoProps {
  id?: string;
  task: string;
  reminderTime: Date;
  category: string;
  status: string;
  completed?: boolean;
}

export function TodoItem({ id, task, reminderTime, category, status, completed }: TodoProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isCompleted, setIsCompleted] = useState(completed || status === "completed");
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date(reminderTime));

  useEffect(() => {
    setIsCompleted(completed || status === "completed");
  }, [completed, status]);

  const toggleComplete = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !isCompleted }),
      });
      if (res.ok) {
        setIsCompleted(!isCompleted);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
        body: JSON.stringify({ reminderTime: newDate.toISOString() }),
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
        return;
      }

      const hrs = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((difference / 1000 / 60) % 60);
      const secs = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
    };

    const timer = setInterval(calculateTime, 1000);
    calculateTime(); // Initial call

    return () => clearInterval(timer);
  }, [currentTime, isCompleted]);

  return (
    <div className={`group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:shadow-md transition-all ${isCompleted ? 'opacity-70' : ''}`}>
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <div
          onClick={toggleComplete}
          className={`h-7 w-7 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center shrink-0 ${isCompleted
              ? "bg-indigo-500 border-indigo-500"
              : "border-slate-300 dark:border-zinc-700 group-hover:border-indigo-500 shadow-sm"
            }`}>
          {loading ? (
            <Loader2 size={12} className="animate-spin text-white" />
          ) : isCompleted ? (
            <Check size={14} className="text-white" strokeWidth={4} />
          ) : null}
        </div>
        <div>
          <h3 className={`font-bold transition-all ${isCompleted ? "text-slate-400 line-through" : "text-slate-900 dark:text-slate-100"
            }`}>{task}</h3>
          <span className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-500/80">{category}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {timeLeft === "Time's up!" && !isCompleted && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
            <button
              onClick={() => extendTime(10)}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all active:scale-95"
            >
              <Plus size={12} /> 10m
            </button>
            <button
              onClick={() => extendTime(15)}
              disabled={loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
            >
              <Plus size={12} /> 15m
            </button>
          </div>
        )}

        {/* The Live Timer Display */}
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100/50 dark:border-zinc-800/50 w-full sm:w-auto justify-center">
          <Clock size={14} className={timeLeft === "Time's up!" ? "text-red-500" : isCompleted ? "text-indigo-500" : "text-slate-400"} />
          <span className={`text-sm font-mono font-bold ${timeLeft === "Time's up!" ? "text-red-500 animate-pulse" : isCompleted ? "text-indigo-500" : "text-slate-600 dark:text-slate-300"
            }`}>
            {timeLeft}
          </span>
        </div>
      </div>
    </div>
  );
}
