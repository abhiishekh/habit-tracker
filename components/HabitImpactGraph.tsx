'use client'

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
    return (
        <div className="h-64 w-full rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden ">
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
                        contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.85)',
                            borderRadius: '8px',
                            border: 'none',
                            color: 'white',
                        }}
                    />

                    <Area
                        type="monotone"
                        dataKey="predictable"
                        stroke="#6366f1"
                        fill="url(#predictable)"
                        strokeWidth={2}
                    />

                    <Area
                        type="monotone"
                        dataKey="actual"
                        stroke="#22c55e"
                        fill="url(#actual)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export default HabitAreaGraph
