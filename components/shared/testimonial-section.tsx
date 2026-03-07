"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
    {
        name: "Alex Rivera",
        role: "Full-Stack Dev",
        avatar: "AR",
        text: "UFL replaced three different tracking apps. The WhatsApp integration is a game-changer—I actually look forward to logging my stats every evening.",
        rating: 5
    },
    {
        name: "Sarah Chen",
        role: "SaaS Founder",
        avatar: "SC",
        text: "The Project Architect agent basically wrote my MVP roadmap. Syncing my GitHub commits directly to my life goals feels like I'm playing an RPG with my career.",
        rating: 5
    },
    {
        name: "Jordan Smith",
        role: "Indie Hacker",
        avatar: "JS",
        text: "Finally, a tracker that understands developers. Seeing my gym intensity and coding output on the same graph revealed patterns I never noticed before.",
        rating: 5
    },
    {
        name: "Elena Gomez",
        role: "Junior Architect",
        avatar: "EG",
        text: "The Career Mentor agent helped me transition roles in 60 days. The daily accountability via WhatsApp is impossible to ignore.",
        rating: 5
    }
];

export function TestimonialSection() {
    return (
        <section className="w-full bg-slate-50 dark:bg-zinc-950/50 py-24 px-6 border-y border-slate-200/60 dark:border-zinc-800/60 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                        Built for <span className="text-indigo-500 italic">Builders.</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                        Join 2,400+ developers, founders, and high-performers who are architecting their 90-day reset.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={t.name}
                            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Card className="relative overflow-hidden border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl shadow-indigo-500/5 rounded-[2rem]">
                                <CardContent className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/20">
                                                {t.avatar}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white">{t.name}</h4>
                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">{t.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[...Array(t.rating)].map((_, i) => (
                                                <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Quote className="absolute -top-2 -left-2 w-8 h-8 text-slate-100 dark:text-zinc-800 -z-0" />
                                        <p className="relative z-10 text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                            "{t.text}"
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
