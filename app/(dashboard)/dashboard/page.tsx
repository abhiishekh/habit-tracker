"use client"

import React from 'react'
import { Activity, Flame, Zap, Trophy, Github, Users } from 'lucide-react'
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts'

// --- MOCK DATA FOR 90-DAY CHALLENGE ---
const githubActivityData = [
  { day: 'Mon', commits: 4, freelance: 2 },
  { day: 'Tue', commits: 7, freelance: 3 },
  { day: 'Wed', commits: 5, freelance: 1 },
  { day: 'Thu', commits: 12, freelance: 4 },
  { day: 'Fri', commits: 8, freelance: 2 },
  { day: 'Sat', commits: 2, freelance: 6 },
  { day: 'Sun', commits: 1, freelance: 5 },
]

const energyGymData = [
  { day: 'Mon', energy: 80, workoutIntensity: 75 },
  { day: 'Tue', energy: 90, workoutIntensity: 85 },
  { day: 'Wed', energy: 60, workoutIntensity: 40 }, // Rest day
  { day: 'Thu', energy: 85, workoutIntensity: 90 },
  { day: 'Fri', energy: 70, workoutIntensity: 65 },
  { day: 'Sat', energy: 95, workoutIntensity: 100 },
  { day: 'Sun', energy: 100, workoutIntensity: 20 }, // Active recovery
]

const networkingData = [
  { week: 'Week 1', connections: 5, posts: 2 },
  { week: 'Week 2', connections: 12, posts: 4 },
  { week: 'Week 3', connections: 8, posts: 3 },
  { week: 'Week 4', connections: 20, posts: 7 },
]

const Dashboard = () => {
    return (
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">UFL Day 14 of 90 • Let's get to work.</p>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Score Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Habit Score</h3>
                        <Trophy className="h-4 w-4 text-indigo-500" />
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">92%</span>
                        <span className="text-sm text-green-500 font-medium">+4% from last week</span>
                    </div>
                </div>

                {/* Streak Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Daily Streak</h3>
                        <Flame className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">14</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">days</span>
                    </div>
                </div>

                {/* Energy Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg Energy</h3>
                        <Zap className="h-4 w-4 text-yellow-500" />
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">82</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">/ 100</span>
                    </div>
                </div>

                {/* GitHub Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Commits</h3>
                        <Github className="h-4 w-4 text-slate-900 dark:text-white" />
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white">39</span>
                        <span className="text-sm text-green-500 font-medium">This week</span>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                
                {/* Coding & GitHub Activity */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 dark:text-white">Coding & Freelance Output</h3>
                        <Activity className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={githubActivityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="commits" name="GitHub Commits" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="freelance" name="Freelance Hours" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Energy & Gym Progress */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 dark:text-white">Energy vs Gym Intensity</h3>
                        <Activity className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={energyGymData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="energy" name="Energy Level" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorEnergy)" />
                                <Area type="monotone" dataKey="workoutIntensity" name="Gym Intensity" stroke="#ef4444" strokeWidth={3} fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Networking & Social Growth */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-2">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 dark:text-white">Networking & Content Creation</h3>
                        <Users className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={networkingData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="connections" name="New Connections" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                                <Line type="monotone" dataKey="posts" name="Social Posts" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Dashboard