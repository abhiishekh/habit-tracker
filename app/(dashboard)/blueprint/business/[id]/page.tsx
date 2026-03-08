"use client"

import { PlanView } from "@/components/blueprint/PlanView"
import { ArrowLeft, BriefcaseBusiness } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function BusinessPlanDetailPage() {
    const params = useParams()
    const id = params.id as string

    return (
        <div className="max-w-5xl mx-auto py-12 px-6 space-y-10 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <Link
                    href="/blueprint"
                    className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    BACK TO HUB
                </Link>
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-500/10 text-slate-800 dark:text-slate-300 text-sm font-black border border-slate-500/20 shadow-sm">
                    <BriefcaseBusiness className="w-5 h-5" />
                    BUSINESS ARCHITECT
                </div>
            </div>
            <PlanView planId={id} domain="business" accentColor="slate" icon={BriefcaseBusiness} title="Business Architect" />
        </div>
    )
}
