"use client"
import NavItem from '@/lib/navItems'
import { usePathname } from 'next/navigation'
import React from 'react'

const DashboardSidebar = () => {
    const pathname = usePathname()
    return (
        <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950 lg:block">
            <div className="mb-10 text-2xl font-bold tracking-tighter text-slate-900 dark:text-white">
                UFL<span className="text-indigo-500">.</span>
            </div>

            <nav className="space-y-2">
                <NavItem href="/dashboard" label="Dashboard" active={pathname === '/dashboard'} />
                <NavItem href="/habits" label="Habits" active={pathname === '/habits'} />
                <NavItem href="/todos" label="Todos" active={pathname === '/todos'} />
                <NavItem href="/stats" label="Insights" active={pathname === '/stats'} />
            </nav>
        </aside>
    )
}

export default DashboardSidebar
