import React from 'react'

const Footer = () => {
    return (
        <footer className="relative flex flex-col items-center justify-end overflow-hidden bg-slate-50  pb-0 dark:bg-[#09090B] border-t border-slate-200 dark:border-zinc-800">
            
            {/* 1. Standard Footer Content */}
            {/* <div className="relative z-10 flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-6 md:flex-row pb-12">
                <p className="text-sm text-slate-500 font-medium">
                    Building habits. Tracking progress. Unfucking life.
                </p>
                <div className="flex gap-6 text-sm text-slate-500 font-medium">
                    <a href="/dashboard" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Dashboard</a>
                    <a href="/stats" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Insights</a>
                    <a href="#" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">Twitter</a>
                </div>
            </div> */}

            {/* 2. Giant Animated UFL Text */}
            <div className="pointer-events-none w-full flex justify-center select-none relative">
                <h1 
                    className="text-[40vw] md:text-[25vw] font-black leading-none  bg-clip-text text-transparent pb-4"
                    style={{
                        // This creates the Indigo -> Emerald -> Indigo gradient
                        backgroundImage: 'linear-gradient(to right, #6366f1, #10b981, #6366f1)',
                        backgroundSize: '200% auto',
                        animation: 'gradient-pan 6s linear infinite',
                        // This fades the bottom of the text into the background
                        WebkitMaskImage: 'linear-gradient(to bottom, black 10%, transparent 100%)',
                        maskImage: 'linear-gradient(to bottom, black 10%, transparent 100%)'
                    }}
                >
                    UFL.
                </h1>
            </div>

            {/* 3. The Custom Animation */}
            <style>{`
                @keyframes gradient-pan {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
            
        </footer>
    )
}

export default Footer