"use client"
import { AddTodoModal } from "@/features/todos/add-todo-modal";
import { TodoItem } from "@/features/todos/todo-item";
import { Plus, Loader2, ClipboardList, Smartphone, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { toggleWhatsapp, sendTestWhatsapp } from "@/app/action";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function TodosPage() {
    const { data: session } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isWhatsappEnabled, setIsWhatsappEnabled] = useState(false);
    const [toggleLoading, setToggleLoading] = useState(false);
    const [testLoading, setTestLoading] = useState(false);

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

    return (
        <div className="max-w-4xl mx-auto pb-20 px-6">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Daily Focus</h1>
                    <p className="text-slate-500">Don't let the clock beat you.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSendTest}
                        disabled={testLoading}
                        title="Send test WhatsApp message"
                        className="h-12 px-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-slate-400 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {testLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={20} className="mr-2" />}
                        <span className="hidden sm:inline font-medium text-sm">Test WA</span>
                    </button>
                    <button
                        onClick={handleToggleWhatsapp}
                        disabled={toggleLoading}
                        title={isWhatsappEnabled ? "Disable WhatsApp" : "Enable WhatsApp"}
                        className={`h-12 w-12 rounded-2xl border flex items-center justify-center transition-all active:scale-95 shadow-sm ${isWhatsappEnabled
                            ? "bg-green-500/10 border-green-500/50 text-green-600"
                            : "bg-slate-100 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-400"
                            }`}
                    >
                        {toggleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Smartphone size={24} />}
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-95">
                        <Plus size={24} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <p className="text-slate-500 font-medium tracking-wide">Loading your focus...</p>
                </div>
            ) : tasks.length > 0 ? (
                <div className="space-y-4">
                    {tasks.map((task) => (
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
            ) : (
                <div className="flex flex-col items-center justify-center py-20 px-4 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                    <div className="h-20 w-20 rounded-3xl bg-white dark:bg-zinc-800 flex items-center justify-center mb-8 shadow-sm">
                        <ClipboardList className="text-indigo-500" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No tasks found</h3>
                    <p className="text-slate-500 text-center max-w-sm mb-10 text-lg">
                        Stay ahead of the game. Create your first task for your 90-day challenge.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/25 active:scale-[0.98]"
                    >
                        Create Your First Task
                    </button>
                </div>
            )}

            <AddTodoModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    fetchTasks(); // Refresh list after closing
                }}
            />
        </div>
    );
}