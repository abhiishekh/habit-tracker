"use client"

import React from "react"
import { BlueprintTaskView } from "@/components/blueprint/BlueprintTaskView"
import { ArrowLeft, Scale } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function RelationshipsPlanDetailPage() {
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
                <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 text-sm font-black border border-teal-500/20 shadow-sm">
                    <Scale className="w-5 h-5" />
                    RELATIONSHIP SPECIALIST
                </div>
            </div>
            <BlueprintTaskView planId={id} />
        </div>
    )
}
