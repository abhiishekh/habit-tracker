"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Terminal, Rocket, CheckCircle2, Clock, Code2, PenTool, Database, Server, Bug } from "lucide-react"

const typeConfig: Record<string, { color: string; icon: any }> = {
    frontend: { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: Code2 },
    backend: { color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: Server },
    database: { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: Database },
    design: { color: "bg-pink-500/10 text-pink-500 border-pink-500/20", icon: PenTool },
    testing: { color: "bg-red-500/10 text-red-500 border-red-500/20", icon: Bug },
    deployment: { color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20", icon: Rocket },
    research: { color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Terminal },
}

export function ProjectPlanView({ planId }: { planId: string }) {
    const [plan, setPlan] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await fetch(`/api/project-plans/${planId}`)
                const data = await res.json()
                if (data.success) {
                    setPlan(data.plan)
                }
            } catch (err) {
                console.error("Failed to fetch plan:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPlan()
    }, [planId])

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in duration-500">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-violet-500" />
                <p className="font-mono text-sm">Compiling architecture roadmap...</p>
            </div>
        )
    }

    if (!plan) return <div className="text-center py-10 text-red-500 font-mono text-sm">Error: segmentation fault (plan not found)</div>

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 mt-8">
            {/* Tech Specs Hub */}
            <div className="grid grid-cols-1 gap-6">
                <Card className="bg-gradient-to-br from-violet-500/10 to-transparent border-violet-500/20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <Terminal className="w-48 h-48" />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-violet-600 dark:text-violet-400 font-mono">
                            <Terminal className="w-5 h-5" />
                            {plan.projectName}
                        </CardTitle>
                        <CardDescription className="text-foreground/80 font-medium">
                            {plan.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 relative z-10">
                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                            <div className="flex-1 bg-background/50 p-4 rounded-xl border border-border/50">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">Tech Stack</p>
                                <div className="flex flex-wrap gap-2">
                                    {plan.techStack.split(',').map((stack: string, i: number) => (
                                        <Badge key={i} variant="outline" className="font-mono bg-violet-500/5 text-violet-600 dark:text-violet-400 border-violet-500/20">{stack.trim()}</Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-background/50 p-4 rounded-xl border border-border/50 sm:w-48 text-center shrink-0">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Time to MVP</p>
                                <p className="text-3xl font-black text-violet-600 dark:text-violet-400 font-mono">{plan.totalDays} <span className="text-sm font-medium text-muted-foreground">days</span></p>
                            </div>
                        </div>

                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl text-yellow-700 dark:text-yellow-400/90 text-sm">
                            <div className="flex items-start gap-2">
                                <Rocket className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold block uppercase tracking-wide text-xs mb-1 opacity-80">MVP Requirements</span>
                                    <p className="font-medium leading-relaxed">{plan.mvpDescription}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Development Phases */}
            <div className="space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-2 px-1 font-mono">
                    <Code2 className="w-6 h-6 text-violet-500" />
                    Sprint Backlog
                </h3>

                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-violet-500/20 before:to-transparent">
                    {plan.phases.map((phase: any, index: number) => (
                        <div key={phase.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">

                            {/* Marker */}
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 font-bold font-mono text-sm">
                                P{phase.phaseNumber}
                            </div>

                            {/* Card */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border rounded-2xl p-4 sm:p-6 shadow-sm hover:border-violet-500/30 transition-colors">
                                <div className="flex flex-col gap-2 mb-4">
                                    <h4 className="font-bold text-lg font-mono tracking-tight">{phase.phaseName}</h4>
                                    <Badge variant="secondary" className="w-fit text-xs font-mono">Day {phase.startDay} - {phase.endDay}</Badge>
                                </div>

                                <div className="space-y-3 mt-4">
                                    {phase.tasks.map((task: any) => {
                                        const tConfig = typeConfig[task.type] || { color: "bg-muted text-muted-foreground border-border", icon: Code2 };
                                        const TIcon = tConfig.icon;

                                        return (
                                            <div key={task.id} className="p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted transition-colors text-sm">
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <p className="font-semibold text-foreground leading-snug">{task.title}</p>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0 flex items-center gap-1 ${tConfig.color}`}>
                                                        <TIcon className="w-3 h-3" />
                                                        {task.type}
                                                    </span>
                                                </div>
                                                <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                                                    {task.description}
                                                </p>
                                                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                                                    <span className="text-xs font-mono font-medium text-foreground/60 flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 text-violet-500" /> {task.estimatedHours}h
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-[10px] bg-background">Day {task.dayNumber}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
