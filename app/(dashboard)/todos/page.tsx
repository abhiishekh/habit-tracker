"use client"
import { AddTodoModal } from "@/features/todos/add-todo-modal";
import { TodoItem } from "@/features/todos/todo-item";
import { Plus } from "lucide-react";
import { useState } from "react";

const MOCK_TODOS = [
    {
        id: "1",
        task: "Finish Landing Page UI",
        reminderTime: new Date(Date.now() + 1000 * 60 * 60 * 2), // 2 hours from now
        category: "Code"
    },
    {
        id: "2",
        task: "Leg Day at Gym",
        reminderTime: new Date(Date.now() + 1000 * 60 * 15), // 15 mins from now
        category: "Fitness"
    },
];

export default function TodosPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Daily Focus</h1>
                    <p className="text-slate-500">Don't let the clock beat you.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="h-12 w-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20">
                    <Plus size={24} />
                </button>
            </div>

            <div className="space-y-4">
                {MOCK_TODOS.map((todo) => (
                    <TodoItem key={todo.id} {...todo} />
                ))}
            </div>
            <AddTodoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}