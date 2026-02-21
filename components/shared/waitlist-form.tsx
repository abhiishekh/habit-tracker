"use client";

import { useState, useRef } from "react";
import { joinWaitlist } from "@/app/actions/waitlist";

export function WaitlistForm() {
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setMessage(null);

    const result = await joinWaitlist(formData);

    if (result?.error) {
      setMessage({ text: result.error, type: "error" });
    } else {
      setMessage({ text: "Success! You're on the list.", type: "success" });
      formRef.current?.reset();
    }
    setIsPending(false);
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form ref={formRef} action={handleSubmit} className="relative group mt-8">
        <input
          type="email"
          name="email"
          required
          placeholder="Enter your developer email"
          className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
        />
        <button
          disabled={isPending}
          type="submit"
          className="absolute right-2 top-2 px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95"
        >
          {isPending ? "..." : "Join"}
        </button>
      </form>

      {message && (
        <p className={`mt-4 text-sm font-medium animate-in fade-in slide-in-from-top-1 ${
          message.type === "success" ? "text-emerald-500" : "text-rose-500"
        }`}>
          {message.text}
        </p>
      )}
    </div>
  );
}