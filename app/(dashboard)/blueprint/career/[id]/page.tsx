import { CareerPlanView } from "@/components/blueprint/CareerPlanView"
import { ArrowLeft, BriefcaseBusiness } from "lucide-react"
import Link from "next/link"

export default async function CareerPlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return (
        <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Link
                    href="/blueprint"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Blueprint Hub
                </Link>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-semibold border border-amber-500/20">
                    <BriefcaseBusiness className="w-4 h-4" />
                    Career Mentor
                </div>
            </div>

            {/* Plan View */}
            <CareerPlanView planId={id} />
        </div>
    )
}
