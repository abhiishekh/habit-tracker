import { HabitCard } from "@/features/habits/habit-card";
import { Plus } from "lucide-react"; // install lucide-react if you haven't

const MOCK_HABITS = [
  { id: "1", name: "Gym & Fitness", streak: 12, completed: true, color: "emerald" },
  { id: "2", name: "Deep Work (Coding)", streak: 5, completed: false, color: "indigo" },
  { id: "3", name: "Freelance Outreach", streak: 0, completed: false, color: "amber" },
];

export default function HabitsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Daily Habits
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Day 14 of your 90-day challenge. Keep going.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all text-sm font-medium">
          <Plus size={18} />
          New Habit
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_HABITS.map((habit) => (
          <HabitCard key={habit.id} {...habit} />
        ))}
      </div>
    </div>
  );
}