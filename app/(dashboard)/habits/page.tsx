"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, Sparkles, Activity } from "lucide-react";
import { AddHabitModal } from "@/features/habits/add-habit-modal";

export default function HabitsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHabits = async () => {
    try {
      const res = await fetch("/api/habits");
      if (res.ok) {
        const data = await res.json();
        setHabits(data);
      }
    } catch (error) {
      console.error("Failed to fetch habits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4">
      <div className="flex justify-between items-end mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-indigo-500" size={18} />
            <span className="text-sm font-bold uppercase tracking-widest text-indigo-500">Atomic Habits</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Daily Rituals</h1>
          <p className="text-slate-500 text-lg mt-1">Small wins lead to massive transformations.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="h-14 px-6 rounded-2xl bg-indigo-600 text-white flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 font-bold"
        >
          <Plus size={20} />
          <span>New Ritual</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-slate-500 font-medium text-lg">Loading your rituals...</p>
        </div>
      ) : habits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {habits.map((habit) => (
            <div key={habit.id} className="p-6 rounded-[2rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors uppercase tracking-tight">{habit.name}</h3>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/60">{habit.category}</span>
                </div>
                <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <Activity size={20} />
                </div>
              </div>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2">{habit.description || "No description provided."}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{habit.frequency}</span>
                </div>
                <button className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 text-xs font-bold hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                  Log Session
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 px-6 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/10">
          <div className="h-24 w-24 rounded-[2rem] bg-white dark:bg-zinc-900 flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/5">
            <Activity className="text-indigo-500" size={48} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No rituals yet</h3>
          <p className="text-slate-500 text-center max-w-sm mb-10 text-lg">
            Consistency is the secret sauce. Start your first daily ritual now.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-10 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/30 active:scale-[0.98]"
          >
            Create Your First Habit
          </button>
        </div>
      )}

      <AddHabitModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchHabits();
        }}
      />
    </div>
  );
}