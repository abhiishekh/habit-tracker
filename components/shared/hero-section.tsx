import Link from 'next/link'
import HabitImpactGraph from '../HabitImpactGraph'

const HeroSection = () => {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 dark:bg-zinc-950 px-4">
            {/* Subtle Background Glow */}
            <div className="absolute top-0 -z-10 h-full w-full bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />
            {/* // animated grid lines */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(circle at center, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.12) 30%, rgba(99,102,241,0.04) 50%, transparent 75%)",
                }}
            />
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
                style={{
                    backgroundImage:
                        "linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(to right,#6366f1 1px,transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            <div className="text-center max-w-3xl">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 dark:text-white mb-6">
                    Level up your <span className="text-indigo-500">habits.</span>
                </h1>

                <div className="flex flex-col items-center gap-5 mb-10 text-center px-4">

                    {/* 1. The Killer Feature Badge - Instantly catches the eye */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm font-semibold shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Automated via WhatsApp Sync
                    </div>

                    {/* 2. The Core Promise - Short, scannable, high contrast */}
                    <h2 className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                        The minimal <span className="font-semibold text-slate-900 dark:text-white underline underline-offset-4 decoration-indigo-500">X-day challenge</span> tracker for developers.
                        <br className="hidden md:block" /> Log your code, gym progress, and financial growth in one premium space.
                    </h2>

                    {/* 3. The Joke - Hidden on mobile to keep the screen clean */}
                    <p className="hidden sm:block text-sm text-slate-400 dark:text-slate-500 italic mt-2">
                        (Because your life reset deserves a better dashboard than a spreadsheet.)
                    </p>

                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/todos"
                        className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        Start Tracking
                    </Link>
                    <Link
                        href="/journey"
                        className="px-8 py-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white font-semibold rounded-2xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all"
                    >
                        View My Progress
                    </Link>
                </div>
            </div>

            {/* Preview of the App (Decorative) */}
            <div className="mt-20 w-full max-w-5xl rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 p-4 backdrop-blur-sm">
                <HabitImpactGraph />
            </div>
            <em className='text-slate-600 dark:text-slate-400'>
                track your code, gym progress, and financial growth in one premium space.
            </em>
        </div>
    )
}

export default HeroSection
