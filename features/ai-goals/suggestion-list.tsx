"use client"

import { Check, Edit2, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TaskSuggestion {
    task: string;
    category: string;
    selected: boolean;
}

export function SuggestionList({
    suggestions,
    onAddSelected
}: {
    suggestions: any[],
    onAddSelected: (tasks: any[]) => void
}) {
    const [localSuggestions, setLocalSuggestions] = useState<TaskSuggestion[]>(
        suggestions.map(s => ({ ...s, selected: true }))
    );

    const toggleSelect = (index: number) => {
        setLocalSuggestions(prev => prev.map((s, i) =>
            i === index ? { ...s, selected: !s.selected } : s
        ));
    };

    const handleTaskChange = (index: number, newValue: string) => {
        setLocalSuggestions(prev => prev.map((s, i) =>
            i === index ? { ...s, task: newValue } : s
        ));
    };

    const removeTask = (index: number) => {
        setLocalSuggestions(prev => prev.filter((_, i) => i !== index));
    };

    const selectedCount = localSuggestions.filter(s => s.selected).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI Roadmap</h3>
                    <p className="text-sm text-slate-500 font-medium">Refine your AI-generated tasks</p>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{selectedCount} SELECTED</span>
                </div>
            </div>

            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {localSuggestions.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${item.selected
                                    ? "bg-white dark:bg-zinc-900 border-indigo-500 shadow-md shadow-indigo-500/5 ring-1 ring-indigo-500/20"
                                    : "bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 opacity-60"
                                }`}
                        >
                            <button
                                onClick={() => toggleSelect(idx)}
                                type="button"
                                className={`h-6 w-6 rounded-lg border flex items-center justify-center transition-all ${item.selected
                                        ? "bg-indigo-600 border-indigo-600 text-white"
                                        : "bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
                                    }`}
                            >
                                {item.selected && <Check size={14} strokeWidth={3} />}
                            </button>

                            <div className="flex-1 min-w-0">
                                <input
                                    value={item.task}
                                    onChange={(e) => handleTaskChange(idx, e.target.value)}
                                    className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-semibold p-0 placeholder:text-slate-400"
                                />
                                <div className="text-[10px] text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                    {item.category}
                                </div>
                            </div>

                            <button
                                onClick={() => removeTask(idx)}
                                type="button"
                                className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10"
                            >
                                <Trash2 size={18} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <button
                onClick={() => onAddSelected(localSuggestions.filter(s => s.selected))}
                disabled={selectedCount === 0}
                className="w-full py-5 rounded-3xl bg-indigo-600 text-white font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/25 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] flex items-center justify-center gap-3"
            >
                <PlusCircle size={22} />
                ADD TO MY FOCUS
            </button>
        </div>
    );
}
