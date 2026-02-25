"use client";

import { useState, useRef } from "react";
import { joinWaitlist } from "@/app/actions/waitlist";
import { ArrowRight, Sparkles, Users, Lock, Zap } from "lucide-react";
import { getColorFromEmail, getInitialsFromEmail } from "@/lib/getInitialsOfEmails";

const stats = [
    { value: "2,400+", label: "builders signed up" },
    { value: "90 days", label: "transformation window" },
    { value: "3 mins", label: "avg daily logging time" },
];

const perks = [
    {
        icon: <Zap size={16} />,
        text: "Early access — before public launch",
    },
    {
        icon: <Users size={16} />,
        text: "Founding member pricing (locked forever)",
    },
    {
        icon: <Lock size={16} />,
        text: "Private beta community & weekly standups",
    },
];

interface WaitlistSectionProps {
    users: { email: string }[];
}

export function WaitlistSection({ users }: WaitlistSectionProps) {
    const [message, setMessage] = useState<{
        text: string;
        type: "success" | "error";
    } | null>(null);
    const [isPending, setIsPending] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    stats[0].value = `${users.length}+`;

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        setMessage(null);
        const result = await joinWaitlist(formData);
        if (result?.error) {
            setMessage({ text: result.error, type: "error" });
        } else {
            setMessage({
                text: "🎉 You're in! Check your inbox for next steps.",
                type: "success",
            });
            formRef.current?.reset();
        }
        setIsPending(false);
    }

    return (
        <section className="relative w-full overflow-hidden py-32 px-4">
            <div className="absolute top-0 -z-10 h-full w-full pointer-events-none
  bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))]
  from-indigo-500/10 via-transparent to-transparent" />

            {/* Radial overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle at center, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0.12) 30%, rgba(99,102,241,0.04) 50%, transparent 75%)",
                }}
            />

            {/* Grid lines */}
            <div
                className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
                style={{
                    backgroundImage:
                        "linear-gradient(#6366f1 1px,transparent 1px),linear-gradient(to right,#6366f1 1px,transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            <div className="relative z-10 mx-auto max-w-3xl text-center">
                {/* Badge */}
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 shadow-sm">
                    <Sparkles size={14} className="shrink-0" />
                    Limited early access — spots filling fast
                </div>

                {/* Headline */}
                <h2 className="mb-5 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-5xl lg:text-6xl leading-tight">
                    Be first to{" "}
                    <span className="relative inline-block">
                        <span className="relative z-10 text-indigo-500">
                            Unfuck Your Life.
                        </span>
                        <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-indigo-500/30" />
                    </span>
                </h2>

                <p className="mb-10 text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                    Join the waitlist. Get early access when we launch — plus founding
                    member pricing that never goes up.
                </p>

                {/* Stats row */}
                <div className="mb-10 flex items-center justify-center gap-8 md:gap-14">
                    {stats.map((s) => (
                        <div key={s.label} className="text-center">
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {s.value}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Form */}
                <form
                    ref={formRef}
                    action={handleSubmit}
                    className="relative mx-auto flex max-w-lg flex-col sm:flex-row gap-3"
                >
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder="you@example.com"
                        className="flex-1 rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-4 text-slate-900 dark:text-white text-base outline-none transition-all
              placeholder:text-slate-400 dark:placeholder:text-zinc-500
              focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10
              shadow-sm"
                    />
                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all
              hover:bg-indigo-700 hover:shadow-indigo-500/40 hover:-translate-y-0.5
              active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                    >
                        {isPending ? (
                            <span className="flex items-center gap-2">
                                <svg
                                    className="h-4 w-4 animate-spin"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8H4z"
                                    />
                                </svg>
                                Joining...
                            </span>
                        ) : (
                            <>
                                Join the Waitlist
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>

                {/* Feedback message */}
                {message && (
                    <p
                        className={`mt-4 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-300 ${message.type === "success"
                            ? "text-emerald-500"
                            : "text-rose-500"
                            }`}
                    >
                        {message.text}
                    </p>
                )}

                {/* Perks list */}
                <ul className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                    {perks.map((perk) => (
                        <li
                            key={perk.text}
                            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"
                        >
                            <span className="text-indigo-500">{perk.icon}</span>
                            {perk.text}
                        </li>
                    ))}
                </ul>

                {/* Social proof avatars */}
                <div className="mt-10 flex items-center justify-center gap-3">
                    <div className="flex -space-x-2">
                        {users.slice(0, 5).map((user) => (
                            <div
                                key={user.email}
                                className="h-8 w-8 rounded-full border-2 border-white dark:border-zinc-950 flex items-center justify-center text-[10px] font-bold text-white"
                                style={{ background: getColorFromEmail(user.email) }}
                                title={user.email}
                            >
                                {getInitialsFromEmail(user.email)}
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-900 dark:text-white">
                            {users.length}+ builders
                        </span>{" "}
                        already waiting
                    </p>
                </div>
            </div>
        </section>
    );
}
