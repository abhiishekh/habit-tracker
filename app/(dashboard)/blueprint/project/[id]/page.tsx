import { ProjectPlanView } from "@/components/blueprint/ProjectPlanView"
import { ArrowLeft, Code } from "lucide-react"
import Link from "next/link"

export default async function ProjectPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link
                    href="/blueprint"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Blueprint Hub
                </Link>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-sm font-semibold border border-violet-500/20 font-mono">
                    <Code className="w-4 h-4" />
                    Project Architect
                </div>
            </div>

            {/* Plan View */}
            <ProjectPlanView planId={id} />
        </div>
    )
}
