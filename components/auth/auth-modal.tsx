"use client";

import { signIn } from "next-auth/react";
import { X, Github, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white dark:bg-zinc-950 p-10 border-l border-slate-200 dark:border-zinc-800"
          >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900">
              <X size={20} />
            </button>

            <div className="mt-20">
              <h2 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-white">Welcome back.</h2>
              <p className="mt-2 text-slate-500">Sign in to track your 90-day progress.</p>

              <div className="mt-10 space-y-4">
                <button 
                  onClick={() => signIn("github", { callbackUrl: "/habits" })}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:opacity-90 transition-all"
                >
                  <Github size={20} /> Continue with GitHub
                </button>
                
                <button 
                  onClick={() => signIn("google", { callbackUrl: "/habits" })}
                  className="w-full flex items-center justify-center gap-3 py-4 border border-slate-200 dark:border-zinc-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all"
                >
                  <Mail size={20} /> Continue with Google
                </button>
              </div>

              <p className="mt-8 text-center text-xs text-slate-400 leading-relaxed px-6">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}