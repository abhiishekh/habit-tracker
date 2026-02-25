"use client"

import { Code2, Dumbbell, InfoIcon, LayoutDashboard, List, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import clsx from 'clsx'
import NavItem from '@/components/shared/navItems';
import Link from 'next/link';

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Habits", href: "/habits", icon: Dumbbell },
    { name: "Todos", href: "/todos", icon: List },
    { name: "Insights", href: "/insights", icon: InfoIcon },
    { name: "Coding & Work", href: "/coding", icon: Code2 },
];

const DashboardSidebar = () => {
    const pathname = usePathname()
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <aside className={clsx(
            "fixed left-0 top-0 z-40 h-full border-r border-slate-200 bg-white transition-all duration-300 dark:border-zinc-800 dark:bg-zinc-950 flex flex-col",
            // Mobile width vs Desktop width
            isExpanded ? "w-64 px-4 py-6" : "w-16 px-2 py-6 md:w-64 md:px-4"
        )}>

            {/* 1. UFL Logo - Locked at the very top, always visible */}
            <div className="flex items-center px-2 h-8">
                <div className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">
                    <Link href="/" className={clsx(
                        "flex items-center gap-1",
                        isExpanded ? "justify-start" : "justify-center"
                    )}>
                        UFL<span className="text-indigo-500">.</span>
                    </Link>
                </div>
            </div>

            {/* 2. Mobile Toggle Button - Pushed down */}
            <div className={clsx(
                "mt-8 mb-2 flex md:hidden items-center",
                isExpanded ? "justify-end px-2" : "justify-center"
            )}>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white transition-all"
                >
                    {isExpanded ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* 3. Navigation Links - Pushed down to align nicely */}
            {/* On desktop (where the menu toggle is hidden), we add mt-8 to maintain the same spacing */}
            <nav className="space-y-2 flex-1 md:mt-10">
                {navItems.map((item) => (
                    <NavItem
                        key={item.href}
                        href={item.href}
                        label={item.name}
                        icon={item.icon}
                        active={pathname === item.href}
                        isExpanded={isExpanded}
                        onClick={() => setIsExpanded(false)}
                    />
                ))}
            </nav>
        </aside>
    )
}

export default DashboardSidebar