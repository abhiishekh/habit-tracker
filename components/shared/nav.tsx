"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { LogIn, LogOut, User as UserIcon } from 'lucide-react'
import { AuthModal } from '../auth/auth-modal'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const Nav = () => {
    const pathname = usePathname()
    const [isAuthOpen, setIsAuthOpen] = useState(false)
    const { data: session, status } = useSession()

    const isLoggedIn = status === "authenticated"
    const userInitials = session?.user?.name
        ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
        : session?.user?.email?.[0].toUpperCase() || "U"

    return (
        <>
            <nav className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-6">
                    <Link href="/" className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">
                        UFL<span className="text-indigo-500">.</span>
                    </Link>

                    <div className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">


                        {isLoggedIn ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center cursor-pointer hover:bg-indigo-500/20 transition-all text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                                        {session?.user?.image ? (
                                            <img src={session.user.image} alt="Profile" className="h-full w-full rounded-full object-cover" />
                                        ) : (
                                            userInitials
                                        )}
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none text-slate-900 dark:text-white">{session?.user?.name}</p>
                                            <p className="text-xs leading-none text-slate-500 dark:text-slate-400">{session?.user?.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Link
                                            href="/dashboard"
                                            className={`hover:text-indigo-500 transition-colors ${pathname === '/dashboard' ? 'text-indigo-500' : ''}`}
                                        >
                                            Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-red-600 dark:text-red-400 cursor-pointer">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <button
                                onClick={() => setIsAuthOpen(true)}
                                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
                            >
                                <LogIn size={16} />
                                <span>Login</span>
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Auth Modal remains hidden until state is true */}
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </>
    )
}

export default Nav