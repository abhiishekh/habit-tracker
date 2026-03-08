"use client"

import { BlueprintForm } from "@/components/blueprint/BlueprintForm";
import { Brain } from "lucide-react";

const fields = [
    {
        name: "limitingBeliefs",
        label: "Limiting Beliefs",
        placeholder: "What's holding you back? e.g. I am not good enough",
        type: "textarea" as const,
    },
    {
        name: "habits",
        label: "Current Habits",
        placeholder: "What habits do you want to change?",
        type: "textarea" as const,
    }
];

export default function NewMindsetBlueprint() {
    return (
        <div className="py-12">
            <BlueprintForm
                domain="Mindset"
                title="Mindset Coach"
                description="Psychological re-engineering. Building mental resilience and confidence."
                icon={Brain}
                colorClass="text-pink-600"
                fields={fields}
            />
        </div>
    );
}
