'use client'

import React, { useMemo } from 'react'
import { habitAreaData } from '@/lib/demoHabitData'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'

const HabitAreaGraph = () => {
    // 1. Calculate the trend from your data
    const status = useMemo(() => {
        const last = habitAreaData[habitAreaData.length - 1];
        const winning = last.actual >= last.predictable;
        return {
            winning,
            emoji: winning ? "😊" : "😔",
            msg: winning ? "On Track" : "Small wins are adding up",
            color: winning ? "text-emerald-500" : "text-rose-500",
        };
    }, []);

    return (
        <div className="group relative h-64 w-full rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden border border-slate-200 dark:border-zinc-800">

            {/* 2. Your New Dynamic Indicator */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-200 dark:border-zinc-800 shadow-sm">
                <span className="text-base">{status.emoji}</span>
                <span className={`text-[10px] font-black uppercase tracking-tighter ${status.winning ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {status.msg}
                </span>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={habitAreaData}>
                    <defs>
                        <linearGradient id="predictable" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="actual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.08} />
                        </linearGradient>
                    </defs>

                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis hide />

                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 p-3 shadow-xl backdrop-blur-md">
                                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">
                                            Dayy {payload[0].payload.day}
                                        </p>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-bold text-indigo-500">Target: {payload[0].value}%</p>
                                            <p className={`text-sm font-bold ${status.color}`}>Actual: {payload[1].value}%</p>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />

                    {/* Original Area 1 */}
                    <Area
                        type="monotone"
                        dataKey="predictable"
                        stroke="#6366f1"
                        fill="url(#predictable)"
                        strokeWidth={1}
                    />

                    {/* Original Area 2 */}
                    <Area
                        type="monotone"
                        dataKey="actual"
                        stroke="#22c55e"
                        fill="url(#actual)"
                        strokeWidth={1}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export default HabitAreaGraph