"use client"

import { BlueprintForm } from "@/components/blueprint/BlueprintForm";
import { LifeBuoy } from "lucide-react";

const fields = [
    {
        name: "currentStatus",
        label: "Current Life Status",
        placeholder: "Describe your current situation (Career, Health, Relationships)...",
        type: "textarea" as const,
    },
    {
        name: "priority",
        label: "Top Priority for Change",
        placeholder: "e.g. Work-life balance, health transition",
        type: "text" as const,
    },
    {
        name: "timeframe",
        label: "Review Frequency",
        placeholder: "e.g. Monthly, Quarterly",
        type: "text" as const,
    }
];

export default function NewLifeBlueprint() {
    return (
        <div className="py-12">
            <BlueprintForm
                domain="Life"
                title="Life Architect"
                description="The ultimate holistic planning engine. Designing every dimension of your future."
                icon={LifeBuoy}
                colorClass="text-indigo-600"
                fields={fields}
            />
        </div>
    );
}
