"use client";

import { useEffect, useState } from "react";
import { Bell, Clock } from "lucide-react";

interface TodoProps {
  task: string;
  reminderTime: Date;
  category: string;
}

export function TodoItem({ task, reminderTime, category }: TodoProps) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTime = () => {
      const difference = reminderTime.getTime() - new Date().getTime();
      
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
  }, [reminderTime]);

  return (
    <div className="group flex items-center justify-between p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className="h-6 w-6 rounded-full border-2 border-slate-300 dark:border-zinc-700 group-hover:border-indigo-500 cursor-pointer transition-colors" />
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{task}</h3>
          <span className="text-[10px] uppercase tracking-widest font-bold text-indigo-500">{category}</span>
        </div>
      </div>

      {/* The Live Timer Display */}
      <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-zinc-800/50">
        <Clock size={14} className={timeLeft === "Time's up!" ? "text-red-500" : "text-slate-400"} />
        <span className={`text-sm font-mono font-medium ${
          timeLeft === "Time's up!" ? "text-red-500 animate-pulse" : "text-slate-600 dark:text-slate-300"
        }`}>
          {timeLeft}
        </span>
      </div>
    </div>
  );
}