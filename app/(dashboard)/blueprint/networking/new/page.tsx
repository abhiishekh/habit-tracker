"use client"

import { BlueprintForm } from "@/components/blueprint/BlueprintForm";
import { Users } from "lucide-react";

const fields = [
    {
        name: "targetIndustry",
        label: "Target Industry",
        placeholder: "e.g. Fintech, SaaS, Open Source",
        type: "text" as const,
    },
    {
        name: "preferredPlatforms",
        label: "Primary Platforms",
        placeholder: "e.g. LinkedIn, Twitter, GitHub",
        type: "text" as const,
        description: "Where do you want to build your network?"
    },
    {
        name: "currentNetwork",
        label: "Current Network Status",
        placeholder: "e.g. 100 connections, mostly students",
        type: "textarea" as const,
    }
];

export default function NewNetworkingBlueprint() {
    return (
        <div className="py-12">
            <BlueprintForm
                domain="Networking"
                title="Networking Strategist"
                description="Engineered to help you break into any industry by building a powerful circle of influence."
                icon={Users}
                colorClass="text-blue-600"
                fields={fields}
            />
        </div>
    );
}
