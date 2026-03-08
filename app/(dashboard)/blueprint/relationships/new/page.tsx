"use client"

import { BlueprintForm } from "@/components/blueprint/BlueprintForm";
import { Scale } from "lucide-react";

const fields = [
    {
        name: "activities",
        label: "Preferred Activities",
        placeholder: "What do you enjoy doing with others?",
        type: "text" as const,
    },
    {
        name: "conflictResolution",
        label: "Current Social Challenges",
        placeholder: "e.g. Social anxiety, difficult conversations",
        type: "textarea" as const,
    }
];

export default function NewRelationshipBlueprint() {
    return (
        <div className="py-12">
            <BlueprintForm
                domain="Relationships"
                title="Relationship Specialist"
                description="Social intelligence engine. Improving every connection in your life."
                icon={Scale}
                colorClass="text-teal-600"
                fields={fields}
            />
        </div>
    );
}
