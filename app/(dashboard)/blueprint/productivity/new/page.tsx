"use client"

import { BlueprintForm } from "@/components/blueprint/BlueprintForm";
import { Zap } from "lucide-react";

const fields = [
    {
        name: "dailySchedule",
        label: "Current Schedule",
        placeholder: "When do you wake up? Work? Sleep?",
        type: "textarea" as const,
    },
    {
        name: "productivityKillers",
        label: "Biggest Distractions",
        placeholder: "e.g. Phone, Meetings, Procrastination",
        type: "text" as const,
    }
];

export default function NewProductivityBlueprint() {
    return (
        <div className="py-12">
            <BlueprintForm
                domain="Productivity"
                title="Productivity Expert"
                description="High-performance task systems. Reclaiming your time for what matters."
                icon={Zap}
                colorClass="text-amber-600"
                fields={fields}
            />
        </div>
    );
}
