"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, BriefcaseBusiness, Route, CheckCircle2, Link as LinkIcon, Target } from "lucide-react"

export function CareerPlanView({ planId }: { planId: string }) {
    const [plan, setPlan] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await fetch(`/api/career-plans/${planId}`)
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
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                <p>Generating your career transition roadmap...</p>
            </div>
        )
    }

    if (!plan) return <div className="text-center py-10 text-destructive">Failed to load career plan.</div>

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 mt-8">
            {/* The Journey Map */}
            <div className="grid grid-cols-1 gap-6">
                <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative shadow-lg">
                    <div className="absolute opacity-10 -right-10 -bottom-10 pointer-events-none">
                        <Route className="w-64 h-64" />
                    </div>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-100 mb-1">
                            <BriefcaseBusiness className="w-5 h-5" />
                            Career Transition Plan
                        </CardTitle>
                        <CardDescription className="text-blue-100/80 font-medium text-base leading-relaxed max-w-2xl">
                            {plan.strategy}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 relative z-10 pt-4">

                        {/* A-to-B Visualizer */}
                        <div className="flex flex-col md:flex-row items-center gap-4 bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/20">
                            <div className="flex-1 text-center md:text-right space-y-1">
                                <p className="text-blue-200 text-sm font-bold uppercase tracking-wider">Current State</p>
                                <p className="text-xl font-bold">{plan.currentRole}</p>
                            </div>

                            <div className="flex items-center justify-center shrink-0 w-full md:w-32 px-4 py-2">
                                <div className="h-0.5 w-full bg-blue-300 relative flex items-center justify-center">
                                    <div className="absolute bg-indigo-500/80 text-white text-xs font-bold px-3 py-1 rounded-full border border-blue-400">
                                        {plan.timelineWeeks} Weeks
                                    </div>
                                    <div className="absolute right-0 w-3 h-3 rotate-45 border-t-2 border-r-2 border-blue-300 translate-x-[4px]" />
                                </div>
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-1 mt-6 md:mt-0">
                                <p className="text-yellow-300 text-sm font-bold uppercase tracking-wider">Target State</p>
                                <p className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                                    {plan.targetRole}
                                    {plan.targetCompany && (
                                        <Badge variant="secondary" className="bg-yellow-400 text-yellow-900 border-none hover:bg-yellow-400 ml-2">
                                            @ {plan.targetCompany}
                                        </Badge>
                                    )}
                                </p>
                            </div>
                        </div>

                    </CardContent>
                </Card>
            </div>

            {/* Weekly Milestones Timeline */}
            <div className="space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-2 px-1 text-foreground">
                    <Target className="w-6 h-6 text-indigo-500" />
                    Weekly Milestones
                </h3>

                <div className="grid gap-6">
                    {plan.milestones.map((milestone: any, index: number) => {
                        // The tasks array is a mix of regular tasks, resources, and success metrics. 
                        // So we filter them out to render them beautifully.
                        const rawTasks = milestone.tasks || [];
                        const actionTasks = rawTasks.filter((t: string) => !t.startsWith("RESOURCE:") && !t.startsWith("SUCCESS_METRIC:"));
                        const resources = rawTasks.filter((t: string) => t.startsWith("RESOURCE:")).map((r: string) => r.replace("RESOURCE:", "").trim());
                        const metrics = rawTasks.filter((t: string) => t.startsWith("SUCCESS_METRIC:")).map((m: string) => m.replace("SUCCESS_METRIC:", "").trim());

                        return (
                            <div key={milestone.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col md:flex-row group transition-all hover:border-indigo-500/40 hover:shadow-md">

                                {/* Week Number Side Panel */}
                                <div className="bg-indigo-50 dark:bg-indigo-950/30 p-6 md:w-32 flex flex-row md:flex-col items-center md:items-start md:justify-start gap-4 border-b md:border-b-0 md:border-r border-border/50 shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white font-bold shadow-indigo-500/30 shadow-lg text-lg">
                                        W{milestone.weekNumber}
                                    </div>
                                    <div className="md:hidden font-bold text-lg text-indigo-900 dark:text-indigo-300">
                                        Week {milestone.weekNumber}
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-5 md:p-6 sm:p-8 flex-1 space-y-5">
                                    <div>
                                        <h4 className="font-bold text-xl text-foreground mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{milestone.title}</h4>
                                        <p className="text-muted-foreground leading-relaxed">{milestone.description}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Action Items</p>
                                        <div className="grid gap-2">
                                            {actionTasks.map((task: string, i: number) => (
                                                <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/40 border border-border/50 text-sm hover:bg-muted transition-colors">
                                                    <div className="mt-0.5 shrink-0">
                                                        <div className="w-4 h-4 rounded-full border border-indigo-500/50 bg-indigo-500/10 flex items-center justify-center">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                    <span className="text-foreground/90 font-medium">{task}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {(metrics.length > 0 || resources.length > 0) && (
                                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/50 mt-6">
                                            {metrics.length > 0 && (
                                                <div className="flex-1 bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-start gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-xs font-bold uppercase text-green-700 dark:text-green-400 mb-1">Success Metric</p>
                                                        <p className="text-sm font-medium text-green-800 dark:text-green-300">{metrics[0]}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {resources.length > 0 && (
                                                <div className="flex-1 bg-blue-500/5 border border-blue-500/20 p-3 rounded-xl flex items-start gap-2">
                                                    <LinkIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                                    <div className="w-full">
                                                        <p className="text-xs font-bold uppercase text-blue-600 dark:text-blue-400 mb-1">Resources</p>
                                                        <div className="flex flex-wrap gap-1.5 mt-1.5 w-full">
                                                            {resources.map((res: string, i: number) => (
                                                                <Badge key={i} variant="outline" className="bg-background text-[10px] text-blue-600 dark:text-blue-400 border-blue-500/30 whitespace-nowrap">{res}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
