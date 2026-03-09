"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Tag } from "lucide-react";
import { UflLoaderInline } from "@/components/ui/ufl-loader";
import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function AddHabitModal({ isOpen, onClose, limits }: { isOpen: boolean; onClose: () => void; limits?: any }) {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Growth");
    const [frequency, setFrequency] = useState("daily");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        setLoading(true);
        try {
            const res = await fetch("/api/habits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    description,
                    category,
                    frequency,
                }),
            });

            if (res.ok) {
                setName("");
                setDescription("");
                setCategory("Growth");
                setFrequency("daily");
                onClose();
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || "Something went wrong");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to create habit");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-slate-900/10 backdrop-blur-sm dark:bg-black/40"
                    />

                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white p-8 shadow-2xl dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">New Ritual</h2>
                                <p className="text-sm text-slate-500">Define a habit to track daily.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        {limits?.habits?.hasReachedLimit ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="h-16 w-16 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mb-4">
                                    <Target size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Habit Limit Reached</h3>
                                <p className="text-slate-500 mb-6">You've reached the maximum number of active habits ({limits.habits.max}) for the Free plan.</p>
                                <button
                                    onClick={() => router.push('/billing')}
                                    className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all focus:scale-95"
                                >
                                    Upgrade to Pro
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Habit Name</label>
                                    <input
                                        autoFocus
                                        placeholder="e.g. Read 20 pages"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 text-lg font-medium outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Description (Optional)</label>
                                    <textarea
                                        placeholder="Why is this important?"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-4 text-sm outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-700 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all h-24 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Category</label>
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger className="h-12 rounded-2xl border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 focus:ring-indigo-500/5">
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                                <SelectItem value="Growth">Growth</SelectItem>
                                                <SelectItem value="Fitness">Fitness</SelectItem>
                                                <SelectItem value="Code">Code</SelectItem>
                                                <SelectItem value="Freelance">Freelance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400 block">Frequency</label>
                                        <Select value={frequency} onValueChange={setFrequency}>
                                            <SelectTrigger className="h-12 rounded-2xl border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 focus:ring-indigo-500/5">
                                                <SelectValue placeholder="Frequency" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                                <SelectItem value="daily">Daily</SelectItem>
                                                <SelectItem value="weekly">Weekly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading && <UflLoaderInline style="flip" compact={true} className="mr-2" />}
                                    {loading ? "Creating..." : "Set Ritual"}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
