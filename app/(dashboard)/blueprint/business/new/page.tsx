"use client"

import { BlueprintForm } from "@/components/blueprint/BlueprintForm";
import { BriefcaseBusiness } from "lucide-react";

const fields = [
    {
        name: "idea",
        label: "The Business Idea",
        placeholder: "Describe your product or service...",
        type: "textarea" as const,
    },
    {
        name: "targetMarket",
        label: "Target Market",
        placeholder: "e.g. Gen Z, Small Businesses, Devs",
        type: "text" as const,
    },
    {
        name: "revenueModel",
        label: "Revenue Model",
        placeholder: "e.g. SaaS, Subscription, Ads",
        type: "text" as const,
    }
];

export default function NewBusinessBlueprint() {
    return (
        <div className="py-12">
            <BlueprintForm
                domain="Business"
                title="Business Architect"
                description="Engineered to turn ideas into profitable realities. Validating and scaling your venture."
                icon={BriefcaseBusiness}
                colorClass="text-slate-800"
                fields={fields}
            />
        </div>
    );
}
