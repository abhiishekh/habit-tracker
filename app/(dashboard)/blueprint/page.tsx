"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    Bot,
    BriefcaseBusiness,
    Code,
    Dumbbell,
    Loader2,
    Sparkles,
    TrendingUp,
    Wallet,
    PlusCircle,
    CalendarDays,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const agents = [
    {
        title: "Senior Gym Trainer",
        description: "Expert 7-day programming based on your physiology and experience. Build your ultimate physique.",
        icon: Dumbbell,
        href: "/blueprint/gym/new",
        color: "from-blue-500/20 to-cyan-500/20",
        iconColor: "text-cyan-500",
        badge: "Active",
    },
    {
        title: "Financial Strategist",
        description: "Generate a bulletproof 30-day plan to hit your income targets through freelance, business, or career growth.",
        icon: Wallet,
        href: "/blueprint/income/new",
        color: "from-emerald-500/20 to-green-500/20",
        iconColor: "text-emerald-500",
        badge: "New",
    },
    {
        title: "Project Architect",
        description: "Turn your app idea into a technical roadmap. Get daily coding tasks to build your MVP flawlessly.",
        icon: Code,
        href: "/blueprint/project/new",
        color: "from-violet-500/20 to-purple-500/20",
        iconColor: "text-violet-500",
        badge: "New",
    },
    {
        title: "Career Mentor",
        description: "Navigate your career transition from your current role to your dream job with step-by-step milestones.",
        icon: BriefcaseBusiness,
        href: "/blueprint/career/new",
        color: "from-orange-500/20 to-amber-500/20",
        iconColor: "text-amber-500",
        badge: "New",
    },
];

const blueprintTypeConfig: Record<string, { icon: any; color: string; badgeColor: string; label: string }> = {
    Income: { icon: Wallet, color: "text-emerald-500", badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", label: "Financial" },
    Project: { icon: Code, color: "text-violet-500", badgeColor: "bg-violet-500/10 text-violet-600 border-violet-500/20", label: "Project" },
    Career: { icon: BriefcaseBusiness, color: "text-amber-500", badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20", label: "Career" },
    Gym: { icon: Dumbbell, color: "text-cyan-500", badgeColor: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20", label: "Fitness" },
};

export default function BlueprintHubPage() {
    const [activeBlueprints, setActiveBlueprints] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetch_ = async () => {
            try {
                const res = await fetch('/api/dashboard/active-blueprints')
                const data = await res.json()
                if (data.success) setActiveBlueprints(data.blueprints)
            } catch (err) {
                console.error("Failed to fetch active blueprints:", err)
            } finally {
                setIsLoading(false)
            }
        }
        fetch_()
    }, [])

    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight flex items-center justify-center gap-3">
                    <Bot className="w-12 h-12 text-primary animate-pulse" />
                    The AI Blueprint Hub
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Delegate your goals to specialized AI agents. Select a coach below to architect a highly-personalized, step-by-step master plan.
                </p>
            </div>

            {/* Grid of Agents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {agents.map((agent) => {
                    const Icon = agent.icon;
                    return (
                        <Link key={agent.title} href={agent.href}>
                            <Card className="group relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-border/50 bg-card cursor-pointer h-full">
                                {/* Background Gradient */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${agent.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                <CardContent className="p-8 relative z-10 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className={`p-4 rounded-2xl bg-background shadow-sm border ${agent.iconColor}`}>
                                            <Icon className="w-8 h-8" />
                                        </div>
                                        {agent.badge && (
                                            <Badge variant={agent.badge === "New" ? "default" : "secondary"} className="shadow-sm">
                                                {agent.badge}
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-bold font-heading tracking-tight group-hover:text-primary transition-colors">
                                            {agent.title}
                                        </h2>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {agent.description}
                                        </p>
                                    </div>

                                    <div className="pt-4 flex items-center text-sm font-semibold text-primary/80 group-hover:text-primary transition-colors">
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Start generating
                                        <ArrowRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* Active Blueprints Section */}
            <div className="pt-8 border-t border-border/50">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <TrendingUp className="w-6 h-6 text-muted-foreground" />
                    Your Active Blueprints
                </h3>

                {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : activeBlueprints.length === 0 ? (
                    <div className="text-center p-12 bg-primary/5 rounded-2xl border border-primary/10 border-dashed">
                        <p className="text-muted-foreground">You don't have any active blueprints yet. Generate one above to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {activeBlueprints.map((bp, i) => {
                            const config = blueprintTypeConfig[bp.type] || blueprintTypeConfig["Gym"];
                            const Icon = config.icon;
                            return (
                                <motion.div
                                    key={bp.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                >
                                    <Link href={bp.link}>
                                        <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border-border/50 h-full">
                                            <CardContent className="p-5 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className={`p-2 rounded-xl border ${config.badgeColor}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <Badge variant="outline" className={`text-[10px] border ${config.badgeColor}`}>
                                                        {config.label}
                                                    </Badge>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm leading-tight line-clamp-2">{bp.title}</p>
                                                </div>
                                                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <CalendarDays className="w-3 h-3" />
                                                        View plan
                                                    </span>
                                                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            )
                        })}

                        {/* Add new blueprint button */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: activeBlueprints.length * 0.08 }}
                        >
                            <Link href="#agents">
                                <Card className="group hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer border-dashed border-border h-full">
                                    <CardContent className="p-5 flex flex-col items-center justify-center h-full min-h-[120px] gap-3 text-muted-foreground">
                                        <PlusCircle className="w-6 h-6 group-hover:text-primary transition-colors" />
                                        <p className="text-xs font-medium text-center group-hover:text-primary transition-colors">New Blueprint</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
