"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { AuthModal } from '../auth/auth-modal'

const Nav = () => {
    const pathname = usePathname()
    const [isAuthOpen, setIsAuthOpen] = useState(false)

    // In the future, we will use useSession() from next-auth here
    const isLoggedIn = false 

    return (
        <>
            <nav className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-6">
                    <Link href="/" className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white">
                        UFL<span className="text-indigo-500">.</span>
                    </Link>

                    <div className="flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <Link 
                            href="/dashboard" 
                            className={`hover:text-indigo-500 transition-colors ${pathname === '/dashboard' ? 'text-indigo-500' : ''}`}
                        >
                            Dashboard
                        </Link>

                        {isLoggedIn ? (
                            <div className="h-8 w-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 cursor-pointer hover:opacity-80 transition-opacity" />
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