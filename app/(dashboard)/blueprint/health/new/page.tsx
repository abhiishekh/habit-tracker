"use client"

import { BlueprintForm } from "@/components/blueprint/BlueprintForm";
import { Heart } from "lucide-react";

const fields = [
    {
        name: "age",
        label: "Age",
        type: "number" as const,
    },
    {
        name: "currentWeight",
        label: "Current Weight (kg)",
        type: "number" as const,
    },
    {
        name: "dietPreference",
        label: "Diet Preference",
        placeholder: "e.g. Veg, Non-Veg, Keto, Vegan",
        type: "text" as const,
    },
    {
        name: "sleepHours",
        label: "Current Sleep Hours",
        type: "number" as const,
    },
    {
        name: "existingIssues",
        label: "Health Issues / Focus Areas",
        placeholder: "e.g. Back pain, low energy, high stress",
        type: "textarea" as const,
    }
];

export default function NewHealthBlueprint() {
    return (
        <div className="py-12">
            <BlueprintForm
                domain="Health"
                title="Health Coach"
                description="Your personal wellness architect. Optimizing your physiology for long-term health and peak performance."
                icon={Heart}
                colorClass="text-rose-500"
                fields={fields}
            />
        </div>
    );
}
