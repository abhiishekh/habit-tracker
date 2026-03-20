import DailyGoalsArchitect from "@/components/DailyGoals";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daily Goal Architect | Habit Tracker",
  description: "AI-powered daily scheduling based on your progress and goals."
};

export default function DailyGoalsPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Daily Goal Architect</h1>
        <p className="text-muted-foreground">
          Let AI architect your perfect daily schedule based on your habits, challenges, and goals.
        </p>
      </div>

      <DailyGoalsArchitect />
    </div>
  );
}
