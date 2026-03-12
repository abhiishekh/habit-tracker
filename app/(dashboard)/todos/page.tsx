"use client"
import { AddTodoModal } from "@/features/todos/add-todo-modal";
import { TodoItem } from "@/features/todos/todo-item";
import { Plus, ClipboardList, Smartphone, Send, Sparkles, Loader2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { UflLoaderInline } from "@/components/ui/ufl-loader";
import { AiGoalAssistant } from "@/features/ai-goals/ai-goal-assistant";

import { useState, useEffect, useMemo } from "react";
import { toggleWhatsapp, sendTestWhatsapp } from "@/app/action";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function TodosPage() {
    const { data: session } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [tasks, setTasks] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [isWhatsappEnabled, setIsWhatsappEnabled] = useState(false);
    const [toggleLoading, setToggleLoading] = useState(false);
    const [testLoading, setTestLoading] = useState(false);

    // Pagination states
    const [visibleCounts, setVisibleCounts] = useState({
        today: 10,
        timeUp: 10,
        completed: 10
    });

    useEffect(() => {
        if (session?.user) {
            // @ts-ignore
            setIsWhatsappEnabled(session.user.whatsappEnabled || false);
        }
    }, [session]);

    const handleToggleWhatsapp = async () => {
        setToggleLoading(true);
        try {
            const newState = !isWhatsappEnabled;
            await toggleWhatsapp(newState);
            setIsWhatsappEnabled(newState);
            toast.success(newState ? "WhatsApp reminders enabled!" : "WhatsApp reminders disabled.");
        } catch (error) {
            toast.error("Failed to update WhatsApp settings.");
        } finally {
            setToggleLoading(false);
        }
    };

    const handleSendTest = async () => {
        setTestLoading(true);
        try {
            await sendTestWhatsapp();
            toast.success("Test WhatsApp message sent!");
        } catch (error: any) {
            toast.error(error.message || "Failed to send test message.");
        } finally {
            setTestLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await fetch("/api/todos");
            if (res.ok) {
                const data = await res.json();
                setTasks(data);
            }
        } catch (error) {
            console.error("Failed to fetch todos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Categorization logic
    const categorizedTasks = useMemo(() => {
        const now = new Date();
        return {
            today: tasks.filter(t => !t.completed && new Date(t.reminderTime) > now),
            timeUp: tasks.filter(t => !t.completed && new Date(t.reminderTime) <= now),
            completed: tasks.filter(t => t.completed)
        };
    }, [tasks]);

    const handleLoadMore = (category: 'today' | 'timeUp' | 'completed') => {
        setVisibleCounts(prev => ({
            ...prev,
            [category]: prev[category] + 10
        }));
    };

    const renderTodoSection = (title: string, icon: any, taskList: any[], category: 'today' | 'timeUp' | 'completed') => {
        const visibleTasks = taskList.slice(0, visibleCounts[category]);
        const hasMore = taskList.length > visibleCounts[category];

        if (taskList.length === 0) return null;

        return (
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-6 px-1">
                    <div className={`p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 ${category === 'timeUp' ? 'text-red-500' : category === 'completed' ? 'text-emerald-500' : 'text-indigo-500'}`}>
                        {icon}
                    </div>
                    <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-zinc-200">
                        {title}
                        <span className="ml-3 text-sm font-bold text-slate-400">{taskList.length}</span>
                    </h2>
                </div>
                <div className="space-y-4">
                    {visibleTasks.map((task) => (
                        <TodoItem
                            key={task.id}
                            id={task.id}
                            task={task.task}
                            reminderTime={new Date(task.reminderTime)}
                            category={task.category || "General"}
                            status={task.status}
                            completed={task.completed}
                        />
                    ))}
                </div>
                {hasMore && (
                    <button
                        onClick={() => handleLoadMore(category)}
                        className="mt-6 w-full py-4 rounded-[1.5rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-all active:scale-[0.99]"
                    >
                        Load More {title}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Daily Focus</h1>
                    <p className="text-slate-500 font-medium">Synchronize your reality with your intentions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSendTest}
                        disabled={testLoading}
                        className="h-12 px-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 font-bold text-sm shadow-sm"
                    >
                        {testLoading ? <Loader2 size={18} className="animate-spin text-indigo-500" /> : <Send size={18} className="mr-2" />}
                        <span className="hidden sm:inline">Test WA</span>
                    </button>

                    <button
                        onClick={handleToggleWhatsapp}
                        disabled={toggleLoading}
                        className={`h-12 w-12 rounded-2xl border flex items-center justify-center transition-all active:scale-95 shadow-sm ${isWhatsappEnabled
                            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-600"
                            : "bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400"
                            }`}
                    >
                        {toggleLoading ? <Loader2 size={24} className="animate-spin" /> : <Smartphone size={24} />}
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="h-12 px-6 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 font-bold gap-2"
                    >
                        <Plus size={20} />
                        <span>Add Task</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-6">
                    <UflLoaderInline style="flip" />
                    <p className="text-slate-500 font-bold tracking-widest uppercase text-xs animate-pulse">Syncing consciousness...</p>
                </div>
            ) : tasks.length > 0 ? (
                <div className="pb-20">
                    {renderTodoSection("Time Up", <AlertCircle size={20} />, categorizedTasks.timeUp, 'timeUp')}
                    {renderTodoSection("Today's Missions", <Clock size={20} />, categorizedTasks.today, 'today')}
                    {renderTodoSection("Completed", <CheckCircle2 size={20} />, categorizedTasks.completed, 'completed')}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 px-8 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/30">
                    <div className="h-24 w-24 rounded-[2.5rem] bg-white dark:bg-zinc-800 flex items-center justify-center mb-8 shadow-indigo-100 dark:shadow-none shadow-xl">
                        <ClipboardList className="text-indigo-500" size={48} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">Empty Workspace</h3>
                    <p className="text-slate-500 text-center max-w-sm mb-12 text-lg font-medium leading-relaxed">
                        The future is unwritten. Define your next victory and start the countdown.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-10 py-5 rounded-[2rem] bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/40 active:scale-[0.97]"
                    >
                        Create First Task
                    </button>
                </div>
            )}

            <AddTodoModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    fetchTasks();
                }}
            />

            <AiGoalAssistant
                isOpen={isAiModalOpen}
                onClose={() => {
                    setIsAiModalOpen(false);
                    fetchTasks();
                }}
            />
        </div>
    );
}
