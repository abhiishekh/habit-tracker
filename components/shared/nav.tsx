"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'


const Nav = () => {
    const pathname = usePathname()
    return (
        <nav className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                <Link href="/" className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">
                    UFL<span className="text-indigo-500">.</span>
                </Link>
                <div className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <Link href="/habits" className={`hover:text-indigo-500 transition-colors ${pathname === '/habits' ? 'text-indigo-500' : ''}`}>Habits</Link>
                     <Link href="/dashboard" className={`hover:text-indigo-500 transition-colors ${pathname === '/dashboard' ? 'text-indigo-500' : ''}`}>Dashboard</Link>
                    <Link href="/todos" className={`text-slate-900 dark:text-white underline underline-offset-4 ${pathname === '/todos' ? 'text-indigo-500' : ''}`}>Todos</Link>
                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-zinc-800" /> {/* User Profile placeholder */}
                </div>
            </div>
        </nav>
    )
}

export default Nav
