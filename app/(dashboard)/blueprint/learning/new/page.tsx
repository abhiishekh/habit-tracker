"use client"

import { BlueprintForm } from "@/components/blueprint/BlueprintForm";
import { GraduationCap } from "lucide-react";

const fields = [
    {
        name: "skills",
        label: "Skills to Master",
        placeholder: "e.g. Next.js, Piano, Spanish",
        type: "text" as const,
    },
    {
        name: "totalWeeks",
        label: "Desired Duration (Weeks)",
        type: "number" as const,
    },
    {
        name: "dailyTimeCommitment",
        label: "Daily Effort (Hours)",
        type: "text" as const,
        placeholder: "e.g. 2 hours"
    },
    {
        name: "resources",
        label: "Available Resources",
        placeholder: "e.g. Laptop, Books, Courses",
        type: "textarea" as const,
    }
];

export default function NewLearningBlueprint() {
    return (
        <div className="py-12">
            <BlueprintForm
                domain="Learning"
                title="Learning Mentor"
                description="Expert skill acquisition logic. Accelerated learning paths for any domain."
                icon={GraduationCap}
                colorClass="text-orange-600"
                fields={fields}
            />
        </div>
    );
}
