import Link from 'next/link'
import HabitImpactGraph from '../HabitImpactGraph'

const HeroSection = () => {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 dark:bg-zinc-950 px-6">
            {/* Subtle Background Glow */}
            <div className="absolute top-0 -z-10 h-full w-full bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent" />

            <div className="text-center max-w-3xl">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 dark:text-white mb-6">
                    Level up your <span className="text-indigo-500">habits.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed flex flex-col items-center gap-1">
                    <div>
                        The minimal <span className='underline underline-offset-4 decoration-emerald-500'>X-day</span> challenge tracker designed for developers.
                        Monitor your code, life progress, and growth in one premium space.
                    </div>
                    <em className="text-sm text-slate-500 dark:text-slate-600">
                        (Because your habits deserve a better dashboard than a spreadsheet.)
                    </em>
                    <p className='text-md md:text-lg text-slate-500 dark:text-slate-600 mt-4'>
                        Powered by <span className="text-emerald-500">WhatsApp Sync</span> — progress updates happen automatically.
                    </p>
                </p>
                <p>
                </p>

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
        </div>
    )
}

export default HeroSection
