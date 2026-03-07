"use client";

import React, { useEffect, useState } from 'react';
import { getJourneyData } from '@/app/actions/journey';
import { Flame, CheckCircle, Target, Calendar } from 'lucide-react';
import { UflLoaderInline } from '@/components/ui/ufl-loader';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const iconMap: any = {
  Flame: <Flame className="text-orange-500" size={20} />,
  CheckCircle: <CheckCircle className="text-emerald-500" size={20} />,
  Target: <Target className="text-indigo-500" size={20} />,
};

export default function JourneyPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    async function loadJourney() {
      try {
        const data = await getJourneyData();
        setEvents(data);
      } catch (error) {
        console.error("Failed to load journey:", error);
      } finally {
        setLoading(false);
      }
    }
    loadJourney();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <UflLoaderInline style="flip" text="Loading your journey..." />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-6 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-zinc-900 mb-6">
          <Calendar className="text-slate-400" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Your journey is just beginning!</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
          This timeline will automatically fill up as you complete your habits, todos, and tasks. Done something today? Mark it as complete to see it appear here!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <Flame className="text-orange-500 mx-auto mb-2" size={24} />
            <p className="text-xs font-bold uppercase tracking-tighter">Complete Habits</p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <CheckCircle className="text-emerald-500 mx-auto mb-2" size={24} />
            <p className="text-xs font-bold uppercase tracking-tighter">Finish Todos</p>
          </div>
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
            <Target className="text-indigo-500 mx-auto mb-2" size={24} />
            <p className="text-xs font-bold uppercase tracking-tighter">Close Tasks</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 px-6">
      <header className="mb-12">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Your Journey</h1>
        <p className="text-slate-500 text-lg mt-1">A timeline of your progress and achievements.</p>
      </header>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-2 bottom-0 w-0.5 bg-slate-200 dark:bg-zinc-800" />

        <div className="space-y-12">
          {events.map((event, index) => (
            <motion.div
              key={event.id + index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-16"
            >
              {/* Icon Circle */}
              <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-white dark:bg-zinc-950 border-2 border-slate-200 dark:border-zinc-800 flex items-center justify-center z-10 shadow-sm">
                {iconMap[event.icon] || <CheckCircle size={20} />}
              </div>

              <div className="bg-white dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:border-indigo-500/50 group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-500">
                    {event.type}
                  </span>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
                    {format(new Date(event.date), 'MMM d, yyyy • h:mm a')}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
