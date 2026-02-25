import React from 'react';
import Link from 'next/link';
import { MessageSquare, Github, Dumbbell, Wallet, Terminal, Zap } from 'lucide-react';
import { WaitlistSection } from './waitlist-section';
import { prisma } from '@/lib/prisma';

const LandingPageContent = async () => {
    const users = await prisma.waitlist.findMany({
        orderBy: { email: "desc" },
    });
    return (
        <div className="w-full bg-slate-50 dark:bg-zinc-950 flex flex-col items-center ">

            {/* --- 1. THE BENTO GRID FEATURES --- */}
            <section className="w-full max-w-5xl px-6 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Everything you care about. <span className="text-indigo-500">Zero friction.</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Stop context switching between five different apps to track your life.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Feature 1: WhatsApp (Spans 2 columns) */}
                    <div className="md:col-span-2 group rounded-3xl border border-emerald-200/60 dark:border-emerald-900/40 
bg-emerald-50/50 dark:bg-emerald-950/30 p-8 flex flex-col justify-between
transition-all duration-300 ease-out hover:border-emerald-500 hover:shadow-emerald-500/10 hover:shadow-xl">
                        <div>
                            <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-6">
                                <MessageSquare className="text-emerald-600 dark:text-emerald-400" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Log via WhatsApp</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                                No app to open. Just reply to your daily automated text with your gym stats or financial updates, and the dashboard updates instantly.
                            </p>
                        </div>
                    </div>

                    {/* Feature 2: GitHub Automation */}
                    <div className="group rounded-3xl border border-indigo-200/60 dark:border-indigo-900/40 
bg-indigo-50/50 dark:bg-indigo-950/30 p-8
transition-all duration-300 ease-out hover:border-indigo-500 hover:shadow-indigo-500/10 hover:shadow-xl">
                        <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center mb-6">
                            <Github className="text-indigo-600 dark:text-indigo-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Auto-Sync Code</h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            Connect your GitHub. Your commits and freelance pushes are tracked automatically without manual entry.
                        </p>
                    </div>

                    {/* Feature 3: Gym & Health */}
                    <div className="group rounded-3xl border border-orange-200/60 dark:border-orange-900/40 
bg-orange-50/50 dark:bg-orange-950/30 p-8
transition-all duration-300 ease-out hover:border-orange-500 hover:shadow-orange-500/10 hover:shadow-xl">
                        <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mb-6">
                            <Dumbbell className="text-orange-600 dark:text-orange-400" size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Iron & Energy</h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            Track calories, gym intensity, and daily energy levels to see how your health impacts your coding output.
                        </p>
                    </div>

                    {/* Feature 4: Finance (Spans 2 columns) */}
                    <div className="md:col-span-2 group rounded-3xl border border-blue-200/60 dark:border-blue-900/40 
bg-blue-50/50 dark:bg-blue-950/30 p-8 flex flex-col justify-between
transition-all duration-300 ease-out hover:border-blue-500 hover:shadow-blue-500/10 hover:shadow-xl">
                        <div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-6">
                                <Wallet className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Financial Growth</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                                Watch your salary and freelance income scale alongside your skills. Track your monetary milestones over the 90 days.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 2. THE ANTI-SPREADSHEET MANIFESTO --- */}
            <div className='px-6 w-full'>
                <section className="w-full bg-emerald-950 py-24 px-6 my-12 relative overflow-hidden rounded-xl">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                    <div className="max-w-3xl mx-auto text-center relative z-10">
                        <Terminal className="text-emerald-400 mx-auto mb-6" size={40} />
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                            Spreadsheets are where habits go to die.
                        </h2>
                        <p className="text-lg md:text-xl text-slate-400 leading-relaxed">
                            You've built Notion templates. You've made Google Sheets. And you abandoned them by day 4 because manual data entry is a chore. UFL is opinionated: automate what you can (code), and make the rest as easy as sending a text.
                        </p>
                    </div>
                </section>
            </div>

            {/* --- 3. HOW IT WORKS --- */}
            <section className="w-full max-w-5xl px-6 py-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">How the system works</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-xl font-black text-slate-900 dark:text-white">
                            1
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Connect the APIs</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Link your GitHub and authorize the WhatsApp bot to your phone number.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-xl font-black text-slate-900 dark:text-white">
                            2
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Do the Work</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Push your code, hit the gym, and focus on your daily tasks.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="h-16 w-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 text-xl font-black">
                            <Zap size={24} />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Reply & Review</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Reply to the evening text to log your manual stats, then check the dashboard.</p>
                    </div>
                </div>
            </section>

            {/* --- 4. WAITLIST CTA --- */}
            <WaitlistSection users={users} />


        </div>
    );
};

export default LandingPageContent;