"use client";

import { Check } from "lucide-react";
import { useState } from "react";

interface HabitProps {
  name: string;
  streak: number;
  completed: boolean;
  color: string;
}

export function HabitCard({ name, streak, completed: initialCompleted, color }: HabitProps) {
  const [completed, setCompleted] = useState(initialCompleted);

  return (
    <div className={`group relative p-6 rounded-[2rem] border transition-all duration-300 ${
      completed 
        ? "bg-white dark:bg-zinc-900 border-indigo-500/50 shadow-lg shadow-indigo-500/5" 
        : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700"
    }`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-slate-50">{name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {streak} day streak 🔥
          </p>
        </div>
        
        {/* The Interaction Button */}
        <button 
          onClick={() => setCompleted(!completed)}
          className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all ${
            completed 
              ? "bg-indigo-500 text-white scale-95" 
              : "bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:scale-105"
          }`}
        >
          <Check size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Progress Mini-Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
          <span>Progress</span>
          <span>{completed ? "100%" : "0%"}</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-700 ease-out ${
              completed ? "w-full bg-indigo-500" : "w-0"
            }`}
          />
        </div>
      </div>
    </div>
  );
}