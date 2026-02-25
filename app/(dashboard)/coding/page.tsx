"use client";

import { useEffect, useState } from "react";
import { Github, ExternalLink, Star, GitFork, Loader2, FolderCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Separator } from "@/components/ui/separator";

export default function CodingPage() {
    const [repos, setRepos] = useState<any[]>([]);
    const [loadingRepos, setLoadingRepos] = useState(true);
    const [loadingStats, setLoadingStats] = useState(true);
    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        // In a real app, we'd fetch from /api/coding which would use the user's GitHub token
        // For now, we'll use mock data or a public fetch if available
        const fetchRepos = async () => {
            try {
                // Mock data representing GitHub repos
                const mockRepos = [
                    {
                        id: 1,
                        name: "habit-tracker",
                        description: "A premium 90-day challenge habit tracking platform built with Next.js and Prisma.",
                        stars: 12,
                        forks: 4,
                        language: "TypeScript",
                        url: "#"
                    },
                    {
                        id: 2,
                        name: "unfuck-your-life-bot",
                        description: "WhatsApp bot for automated daily logging and productivity reminders.",
                        stars: 8,
                        forks: 2,
                        language: "JavaScript",
                        url: "#"
                    },
                    {
                        id: 3,
                        name: "productivity-dashboard",
                        description: "Clean, minimal dashboard for visualizing personal growth metrics.",
                        stars: 15,
                        forks: 5,
                        language: "React",
                        url: "#"
                    }
                ];
                setRepos(mockRepos);
            } catch (error) {
                console.error("Failed to fetch repos:", error);
            } finally {
                setLoadingRepos(false)
            }
        };
        const loadStats = async () => {
            try {
                const res = await fetch("/api/wakatime");
                const data = await res.json();
                setStats(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingStats(false);
            }
        };

        loadStats();
        fetchRepos();
    }, []);

    function toMinutes(seconds: number) {
        return Math.round(seconds / 60);
    }
    const projectChartData = [
        stats?.projects?.reduce((acc: any, p: any) => {
            acc[p.name] = toMinutes(p.total_seconds);
            return acc;
        }, {})
    ];

    const languageChartData = [
        stats?.languages?.reduce((acc: any, l: any) => {
            acc[l.name] = toMinutes(l.total_seconds);
            return acc;
        }, {})
    ];

    return (
        <div className="max-w-5xl mx-auto pb-20 px-6">
            <div className="mb-10">
                <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Project Terminal</h1>
                <p className="text-slate-500 text-lg">Your GitHub ecosystem, synced in real-time.</p>
            </div>

            {loadingRepos ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-indigo-500">
                    <Loader2 size={40} className="animate-spin" />
                    <p className="font-medium">Fetching your repositories...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {repos.map((repo) => (
                        <Card key={repo.id} className="group overflow-hidden border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-indigo-500/50 transition-all duration-300 rounded-3xl hover:shadow-xl hover:shadow-indigo-500/5">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start mb-2 text-slate-400 group-hover:text-indigo-500 transition-colors">
                                    <FolderCode size={24} />
                                    <a href={repo.url} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink size={18} className="hover:text-slate-900 dark:hover:text-white transition-colors" />
                                    </a>
                                </div>
                                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                                    {repo.name}
                                </CardTitle>
                                <CardDescription className="line-clamp-2 mt-2 leading-relaxed">
                                    {repo.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                            <Star size={14} className="text-amber-500" />
                                            <span>{repo.stars}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                                            <GitFork size={14} className="text-blue-500" />
                                            <span>{repo.forks}</span>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                                        {repo.language}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Add Project CTA */}
                    <button className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/20 hover:border-indigo-500 group transition-all">
                        <div className="h-12 w-12 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                            <Github className="text-slate-400 group-hover:text-indigo-500" size={24} />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">Source More Repos</h3>
                        <p className="text-xs text-slate-500 text-center">Sync another organization</p>
                    </button>
                </div>

            )}

            <Separator className="my-10 bg-red-600"/>
            <div >
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-8">
                    Discipline Architect: Dev Stats
                </h1>

                {loadingStats ? (
                    <div className="flex justify-center py-20 text-indigo-500">
                        <Loader2 size={40} className="animate-spin" />
                    </div>
                ) : stats ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* multi project card */}
                        <Card className="group overflow-hidden border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-indigo-500/50 transition-all duration-300 rounded-3xl hover:shadow-xl hover:shadow-indigo-500/5">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                                    Projects — Time Spent (Minutes)
                                </CardTitle>
                                <CardDescription>
                                    Today’s active projects
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="h-65">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={projectChartData}>
                                        <XAxis hide />
                                        <YAxis />
                                        <Tooltip formatter={(v: number | undefined) => v !== undefined ? `${v} min` : ''} />

                                        {stats.projects.map((p: any, i: number) => (
                                            <Area
                                                key={p.name}
                                                type="monotone"
                                                dataKey={p.name}
                                                strokeWidth={2}
                                                fillOpacity={0.15}
                                            />
                                        ))}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        {/* multi language card */}
                        <Card className="group overflow-hidden border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-indigo-500/50 transition-all duration-300 rounded-3xl hover:shadow-xl hover:shadow-indigo-500/5">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                                    Language — Time Spent (Minutes)
                                </CardTitle>
                                <CardDescription>
                                    Today’s active Languages
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="h-65">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={languageChartData}>
                                        <XAxis hide />
                                        <YAxis />
                                        <Tooltip formatter={(v: number | undefined) => v !== undefined ? `${v} min` : ''} />

                                        {stats.languages.map((p: any, i: number) => (
                                            <Area
                                                key={p.name}
                                                type="monotone"
                                                dataKey={p.name}
                                                strokeWidth={2}
                                                fillOpacity={0.15}
                                            />
                                        ))}
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                        {/* Projects Card */}
                        <Card className="group overflow-hidden border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-indigo-500/50 transition-all duration-300 rounded-3xl hover:shadow-xl hover:shadow-indigo-500/5">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                                    Projects — Time Spent
                                </CardTitle>
                                <CardDescription>
                                    Time invested across active projects
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="h-65">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.projects}>
                                        <XAxis dataKey="name" hide />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar
                                            dataKey="total_seconds"
                                            radius={[6, 6, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Languages Card */}
                        <Card className="group overflow-hidden border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-indigo-500/50 transition-all duration-300 rounded-3xl hover:shadow-xl hover:shadow-indigo-500/5">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                                    Languages Usage
                                </CardTitle>
                                <CardDescription>
                                    Coding time by language
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="h-65">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.languages}>
                                        <XAxis dataKey="name" hide />
                                        <YAxis />
                                        <Tooltip />
                                        <Area
                                            type="monotone"
                                            dataKey="total_seconds"
                                            strokeWidth={2}
                                            fillOpacity={0.15}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                    </div>
                ) : (
                    <p className="text-slate-500">No stats available</p>
                )}
            </div>
        </div>
    );
}
