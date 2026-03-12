"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Sparkles, Trophy, TreeDeciduous, Zap } from 'lucide-react'

interface LifeArchitectOverviewProps {
    data: {
        roleTitle: string;
        roleLevel: number;
        streakShields: number;
        streakShieldContinuity: number;
        forestGrowth: number;
        totalStreakDays: number;
    }
}

export const LifeArchitectOverview = ({ data }: LifeArchitectOverviewProps) => {
    // Generate trees based on growth level
    const trees = Array.from({ length: Math.min(10, Math.floor(data.forestGrowth / 10) + 1) })

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* User Role Card */}
            <motion.div
                whileHover={{ y: -5 }}
                className="rounded-[2.5rem] p-8 bg-linear-to-br from-indigo-950 to-violet-950 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md">
                            <Trophy size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-indigo-100">Current Role</p>
                            <h3 className="text-2xl font-black tracking-tight">{data.roleTitle}</h3>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                            <span>Level {data.roleLevel} Progression</span>
                            <span>{data.totalStreakDays % 5}/5 Days</span>
                        </div>
                        <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${((data.totalStreakDays % 5) / 5) * 100}%` }}
                                className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Streak Shield Card */}
            <motion.div
                whileHover={{ y: -5 }}
                className="rounded-[2.5rem] p-8 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden"
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-1">Streak Shields</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-2">
                            {data.streakShields} <Shield className="text-indigo-500 fill-indigo-500/20" size={28} />
                        </h3>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-900">
                        <Zap className="text-yellow-500" size={24} />
                    </div>
                </div>
                <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shield Continuity Progress</p>
                    <div className="flex gap-2">
                        {[1, 2, 3].map((step) => (
                            <div 
                                key={step}
                                className={`h-2 flex-1 rounded-full ${
                                    step <= data.streakShieldContinuity 
                                    ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                                    : "bg-slate-100 dark:bg-zinc-800"
                                }`}
                            />
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium italic">Complete 60% of daily todos to protect your streak.</p>
                </div>
            </motion.div>

            {/* Forest Growth Card */}
            <motion.div
                whileHover={{ y: -5 }}
                className="rounded-[2.5rem] p-8 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group"
            >
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 mb-1">Soul Forest</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Level {Math.floor(data.forestGrowth / 20) + 1}</h3>
                    </div>
                    <TreeDeciduous className="text-emerald-500 group-hover:scale-110 transition-transform" size={32} />
                </div>
                
                <div className="h-24 w-full flex items-end justify-center gap-2 px-2 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent rounded-2xl pointer-events-none" />
                    {trees.map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative"
                        >
                            <TreeDeciduous 
                                size={20 + (i % 3) * 4} 
                                className={`${data.totalStreakDays > 0 ? "text-emerald-500" : "text-amber-700/50"} drop-shadow-sm`} 
                            />
                        </motion.div>
                    ))}
                    {trees.length === 0 && (
                        <div className="flex flex-col items-center gap-1 opacity-40">
                            <Sparkles size={20} className="text-slate-300" />
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Planting soon...</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
