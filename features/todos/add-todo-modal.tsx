"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Tag, Bell } from "lucide-react";
import { useState } from "react";

export function AddTodoModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm dark:bg-black/40"
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white p-8 shadow-2xl dark:bg-zinc-950 border-l border-slate-200 dark:border-zinc-800"
          >
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">New Task</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <form className="space-y-6">
              {/* Task Input */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Task Name</label>
                <input 
                  autoFocus
                  placeholder="e.g. 2 hours of Deep Work"
                  className="w-full bg-transparent text-xl font-medium outline-none placeholder:text-slate-300 dark:placeholder:text-zinc-700"
                />
              </div>

              {/* Time Picker Logic */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
                  <Bell size={18} className="text-indigo-500" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Set Reminder</p>
                    <input 
                      type="datetime-local" 
                      className="bg-transparent text-sm text-slate-500 outline-none w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
                  <Tag size={18} className="text-indigo-500" />
                  <select className="bg-transparent text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none w-full appearance-none">
                    <option>Code</option>
                    <option>Fitness</option>
                    <option>Freelance</option>
                    <option>Growth</option>
                  </select>
                </div>
              </div>

              <button className="w-full py-4 mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
                Create Task
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}