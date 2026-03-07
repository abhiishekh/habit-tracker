"use client"

import { Code2, Dumbbell, Flame, InfoIcon, LayoutDashboard, List, Bot } from 'lucide-react';
import { usePathname } from 'next/navigation'
import React from 'react'
import clsx from 'clsx'
import Link from 'next/link';

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Workouts", href: "/workouts", icon: Dumbbell },
    { name: "Habits", href: "/habits", icon: Flame },
    { name: "Todos", href: "/todos", icon: List },
    { name: "Insights", href: "/insights", icon: InfoIcon },
    { name: "Coding", href: "/coding", icon: Code2 },
    { name: "Blueprint", href: "/blueprint", icon: Bot },
];

const DashboardSidebar = () => {
    const pathname = usePathname()

    return (
        <>
            {/* ── DESKTOP SIDEBAR (lg+) ─────────────────────────────────────── */}
            <aside className="hidden lg:flex fixed left-0 h-[calc(100vh-64px)] w-64 border-r border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 flex-col overflow-y-auto overflow-x-hidden custom-scrollbar px-4 py-6">
                <nav className="space-y-1 flex-1 mt-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                                    active
                                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                                        : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-900"
                                )}
                            >
                                <Icon size={20} className="shrink-0" />
                                <span>{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* ── MOBILE / TABLET BOTTOM NAV (< lg) ────────────────────────── */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex items-stretch h-16 safe-bottom">
                {navItems.slice(0, 6).map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex flex-col items-center justify-center flex-1 gap-0.5 py-2 text-[10px] font-medium transition-all",
                                active
                                    ? "text-indigo-600 dark:text-indigo-400"
                                    : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            <div className={clsx(
                                "w-8 h-6 rounded-xl flex items-center justify-center transition-all",
                                active ? "bg-indigo-50 dark:bg-indigo-500/10" : ""
                            )}>
                                <Icon size={18} className="shrink-0" />
                            </div>
                            <span className="leading-none">{item.name === "Coding" ? "Code" : item.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </>
    )
}

export default DashboardSidebar