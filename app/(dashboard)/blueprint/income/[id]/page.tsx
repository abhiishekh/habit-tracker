import { IncomePlanView } from "@/components/blueprint/IncomePlanView"
import { ArrowLeft, Wallet } from "lucide-react"
import Link from "next/link"

export default async function IncomePlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-semibold border border-emerald-500/20">
                    <Wallet className="w-4 h-4" />
                    Financial Strategist
                </div>
            </div>

            {/* Plan View */}
            <IncomePlanView planId={id} />
        </div>
    )
}
