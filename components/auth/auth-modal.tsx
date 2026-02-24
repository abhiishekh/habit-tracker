"use client";

import { signIn } from "next-auth/react";
import { X, Mail, ArrowRight } from "lucide-react"; // Replaced Github with ArrowRight
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // This triggers the magic link flow in NextAuth
    await signIn("email", { email, callbackUrl: "/dashboard" });
    setIsLoading(false);
  };

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
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white dark:bg-zinc-950 p-10 border-l border-slate-200 dark:border-zinc-800 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors">
              <X size={20} className="text-slate-500" />
            </button>

            <div className="mt-20">
              <h2 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-white">Welcome back.</h2>
              <p className="mt-2 text-slate-500">Sign in to track your 90-day progress.</p>

              <div className="mt-10 space-y-6">
                {/* Google Login - Primary OAuth */}
                <button
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg"
                >
                  <img src="https://authjs.dev/img/providers/google.svg" className="w-5 h-5" alt="Google" />
                  Continue with Google
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-zinc-800"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-zinc-950 px-2 text-slate-400">Or use email</span></div>
                </div>

                {/* Email Login Form */}
                <form onSubmit={handleEmailLogin} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="email"
                      placeholder="name@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                  <button
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-4 border border-slate-200 dark:border-zinc-800 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all text-slate-900 dark:text-white"
                  >
                    {isLoading ? "Sending..." : "Send Magic Link"}
                    {!isLoading && <ArrowRight size={18} />}
                  </button>
                </form>
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