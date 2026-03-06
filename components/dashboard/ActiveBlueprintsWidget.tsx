"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, ArrowRight, Dumbbell, Wallet, Code, BriefcaseBusiness } from "lucide-react"
import Link from 'next/link'

const iconMap: Record<string, any> = {
    Dumbbell: Dumbbell,
    Wallet: Wallet,
    Code: Code,
    BriefcaseBusiness: BriefcaseBusiness
}

export function ActiveBlueprintsWidget() {
    const [blueprints, setBlueprints] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchBlueprints = async () => {
            try {
                const res = await fetch('/api/dashboard/active-blueprints')
                const data = await res.json()
                if (data.success) {
                    setBlueprints(data.blueprints)
                }
            } catch (err) {
                console.error("Failed to load active blueprints", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchBlueprints()
    }, [])

    if (isLoading) {
        return (
            <Card className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground mt-4">Loading your AI Blueprints...</p>
            </Card>
        )
    }

    if (blueprints.length === 0) {
        return (
            <Card className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        Active AI Blueprints
                    </CardTitle>
                    <CardDescription>You don't have any specialized AI plans currently active.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0 flex flex-col items-center justify-center py-8 text-center bg-muted/40 rounded-xl border border-dashed border-border/50">
                    <p className="text-sm text-muted-foreground mb-4 max-w-xs">Delegate your life goals to an expert AI agent to get daily actionable steps.</p>
                    <Link href="/blueprint">
                        <Badge className="bg-indigo-500 hover:bg-indigo-600 px-4 py-1.5 cursor-pointer">
                            Browse AI Coaches
                        </Badge>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <CardHeader className="px-0 pt-0 flex flex-row items-center justify-between mb-4 space-y-0">
                <div className="space-y-1 block">
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        Active AI Blueprints
                    </CardTitle>
                    <CardDescription>Your running autonomous strategy plans.</CardDescription>
                </div>
                <Link href="/blueprint" className="text-sm font-medium text-indigo-500 hover:text-indigo-600 transition-colors hidden sm:block">
                    View Hub
                </Link>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-3">
                {blueprints.map((bp: any, i: number) => {
                    const Icon = iconMap[bp.icon] || Sparkles;
                    return (
                        <Link key={i} href={bp.link} className="block group">
                            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/60 transition-colors">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-8 h-8 rounded bg-background shadow-sm border flex items-center justify-center shrink-0 ${bp.color}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-bold truncate leading-tight">{bp.title}</p>
                                        <p className="text-xs text-muted-foreground font-medium">{bp.type} Plan</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                            </div>
                        </Link>
                    )
                })}
            </CardContent>
        </Card>
    )
}
