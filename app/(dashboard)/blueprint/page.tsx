import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Bot, BriefcaseBusiness, Code, Dumbbell, Sparkles, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import React from "react";

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

export default function BlueprintHubPage() {
    return (
        <div className="max-w-5xl mx-auto py-10 px-6 space-y-12">
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

            {/* Placeholder for "Active Blueprints" section at the bottom */}
            <div className="pt-16 border-t border-border/50">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                    <TrendingUp className="w-6 h-6 text-muted-foreground" />
                    Your Active Blueprints
                </h3>
                <div className="text-center p-12 bg-primary/5 rounded-2xl border border-primary/10 border-dashed">
                    <p className="text-muted-foreground">You don't have any active blueprints yet. Generate one above to get started!</p>
                </div>
            </div>
        </div>
    );
}
