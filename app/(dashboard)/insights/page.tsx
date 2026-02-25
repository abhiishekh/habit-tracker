"use client";

import { useEffect, useState } from "react";
import { Brain, TrendingUp, Target, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const COLORS = ['#6366f1', '#f97316', '#3b82f6', '#10b981'];

export default function InsightsPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const focusData = [
        { name: 'Code', value: 45 },
        { name: 'Fitness', value: 25 },
        { name: 'Growth', value: 20 },
        { name: 'Freelance', value: 10 },
    ];

    const timelineData = [
        { day: 'Day 1', score: 40 },
        { day: 'Day 5', score: 55 },
        { day: 'Day 10', score: 45 },
        { day: 'Day 15', score: 70 },
        { day: 'Day 20', score: 85 },
        { day: 'Day 25', score: 75 },
        { day: 'Day 30', score: 90 },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6 gap-4 text-indigo-500">
                <Loader2 size={40} className="animate-spin" />
                <p className="font-medium">Crunching your 90-day data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 px-6 sm:px-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="text-indigo-500" size={20} />
                        <span className="text-sm font-bold uppercase tracking-widest text-indigo-500">AI Analysis</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Growth Insights</h1>
                    <p className="text-slate-500 text-lg mt-1">Deep analysis of your 90-day transformation.</p>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    Day 32 / 90
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Priority Analysis */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none pb-24 xl:pb-16">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="text-indigo-500" />
                                Focus Distribution
                            </CardTitle>
                            <CardDescription>Where your energy spent this month.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-75 w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={focusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={8}
                                        dataKey="value"
                                        cornerRadius={8}
                                    >
                                        {focusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#09090b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center flex-wrap gap-6 mt-4">
                                {focusData.map((entry, index) => (
                                    <div key={entry.name} className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{entry.name}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 overflow-hidden">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="text-emerald-500" />
                                Efficiency Tracker
                            </CardTitle>
                            <CardDescription>Overall productivity score over the challenge.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[250px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timelineData}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                    <XAxis dataKey="day" hide />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#09090b', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Critical Recommendations */}
                <div className="space-y-6">
                    <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-500/20">
                        <Target className="mb-4" size={32} />
                        <h3 className="text-xl font-bold mb-2">Next Target</h3>
                        <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                            Based on your frequency, you're 12% behind in your Fitness category. Prioritize Leg Day tomorrow to stay on track.
                        </p>
                        <button className="w-full py-3 rounded-xl bg-white text-indigo-600 font-bold hover:bg-indigo-50 transition-all text-sm">
                            Adjust My Schedule
                        </button>
                    </div>

                    <Card className="rounded-[2rem] border-rose-100 dark:border-rose-900/20 bg-rose-50/30 dark:bg-rose-950/20">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center shrink-0">
                                    <AlertCircle className="text-rose-600 dark:text-rose-400" size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-rose-900 dark:text-rose-100 mb-1">Focus Drain Alert</h4>
                                    <p className="text-sm text-rose-700 dark:text-rose-400 leading-relaxed">
                                        You've missed 3 consecutive "Freelance" todos this week. Re-evaluate if this category is still a priority.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
