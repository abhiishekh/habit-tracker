"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, Calendar, CheckCircle2, Clock, CheckSquare } from "lucide-react"
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from "recharts"

export function IncomePlanView({ planId }: { planId: string }) {
    const [plan, setPlan] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const res = await fetch(`/api/income-plans/${planId}`)
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
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-500" />
                <p>Retrieving your classified financial blueprint...</p>
            </div>
        )
    }

    if (!plan) return <div className="text-center py-10 text-red-500">Failed to load plan.</div>

    // Formatting for the pie chart
    const chartData = [
        { name: "Target Amount", value: plan.targetAmount, color: "#10b981" }, // emerald-500
        { name: "Remaining", value: 0, color: "#10b98133" }, // transparent emerald
    ]

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 mt-8">
            {/* Strategy Hub */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                            <TrendingUp className="w-5 h-5" />
                            Strategic Overview
                        </CardTitle>
                        <CardDescription>Goal: {plan.goal}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-foreground/80 leading-relaxed font-medium">
                            "{plan.strategy}"
                        </p>
                    </CardContent>
                </Card>

                <Card className="flex flex-col items-center justify-center p-6 text-center shadow-inner pt-10">
                    <div className="h-32 w-full relative -mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="100%"
                                    startAngle={180}
                                    endAngle={0}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute bottom-0 left-0 right-0 text-center">
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                ₹{plan.targetAmount.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground uppercase font-semibold">Target</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Weekly Sprints */}
            <div className="space-y-6">
                <h3 className="text-2xl font-bold flex items-center gap-2 px-1">
                    <Calendar className="w-6 h-6 text-emerald-500" />
                    30-Day Execution Sprints
                </h3>

                <div className="space-y-6">
                    {plan.weeks.map((week: any, index: number) => (
                        <div key={week.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                            <div className="bg-emerald-500/5 border-b p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold px-3 py-1">
                                        W{week.weekNumber}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg">{week.focus}</h4>
                                        <p className="text-sm text-muted-foreground font-medium text-emerald-600/70 dark:text-emerald-400/70">
                                            Target: ₹{week.targetEarnings.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6 space-y-3">
                                {week.tasks.map((task: any) => (
                                    <div key={task.id} className="flex gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted transition-colors group">
                                        <div className="pt-1">
                                            <CheckSquare className="w-5 h-5 text-muted-foreground opacity-40 cursor-pointer group-hover:opacity-100 group-hover:text-emerald-500 transition-all" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                                                <p className="font-medium text-foreground leading-snug">{task.action}</p>
                                                <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
                                                    {task.priority >= 4 ? (
                                                        <Badge variant="destructive" className="h-5 text-[10px] shadow-sm">High Priority</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="h-5 text-[10px] shadow-sm">P{task.priority}</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-3">
                                                <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-background shadow-sm border border-border/50 font-medium">
                                                    <Clock className="w-3.5 h-3.5 text-emerald-500" /> {task.timeRequired} hr
                                                </span>
                                                {task.platform && (
                                                    <span className="font-mono px-2 py-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">{task.platform}</span>
                                                )}
                                            </div>
                                            <div className="text-xs bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 p-2.5 rounded-lg mt-3 border border-emerald-500/20 flex items-start gap-2 shadow-inner">
                                                <CheckCircle2 className="w-4 h-4 mt-0 shrink-0 opacity-80" />
                                                <span className="font-medium">Goal: {task.expectedOutcome}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
