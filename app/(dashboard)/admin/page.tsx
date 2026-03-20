"use client"

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Shield, Smartphone, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { UflLoaderInline } from '@/components/ui/ufl-loader'
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { getGlobalWhatsappStatus, toggleGlobalWhatsapp, getSubscriptionConfig, updateSubscriptionConfig, getAdminDashboardStats } from '@/app/action'
import { DEFAULT_SUBSCRIPTION_CONFIG } from '@/lib/constants'
import { toast } from "sonner"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const AdminDashboard = () => {
    const { data: session, status } = useSession()
    const [isGlobalEnabled, setIsGlobalEnabled] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [subConfig, setSubConfig] = useState(DEFAULT_SUBSCRIPTION_CONFIG as any)
    const [isSavingConfig, setIsSavingConfig] = useState(false)
    const [stats, setStats] = useState<{ totalUsers: number, proUsers: number, freeUsers: number, chartData: any[] } | null>(null)

    const adminEmail = "abhisheaurya@gmail.com"

    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/")
        }

        if (status === "authenticated" && session?.user?.email !== adminEmail) {
            redirect("/dashboard")
        }

        const fetchStatus = async () => {
            try {
                const [status, config, dashboardStats] = await Promise.all([
                    getGlobalWhatsappStatus(),
                    getSubscriptionConfig(),
                    getAdminDashboardStats()
                ])
                setIsGlobalEnabled(status)
                setSubConfig(config)
                setStats(dashboardStats)
            } catch (error) {
                toast.error("Failed to fetch system status or config")
            } finally {
                setIsLoading(false)
            }
        }

        if (status === "authenticated" && session?.user?.email === adminEmail) {
            fetchStatus()
        }
    }, [status, session])

    const handleToggle = async (checked: boolean) => {
        setIsSaving(true)
        try {
            await toggleGlobalWhatsapp(checked)
            setIsGlobalEnabled(checked)
            toast.success(`Global WhatsApp messaging is now ${checked ? 'ENABLED' : 'DISABLED'}`)
        } catch (error) {
            toast.error("Failed to update status")
        } finally {
        }
    }

    const handleConfigSave = async () => {
        setIsSavingConfig(true)
        try {
            await updateSubscriptionConfig(subConfig)
            toast.success("Subscription configuration updated successfully")
        } catch (error) {
            toast.error("Failed to update subscription configuration")
        } finally {
            setIsSavingConfig(false)
        }
    }

    if (status === "loading" || isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <UflLoaderInline style="flip" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-8 px-6 pt-10">
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <Shield size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Control Center</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage global system configurations and service status.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Global WhatsApp Toggle */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden relative">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-indigo-500" />
                                <h3 className="font-bold text-slate-900 dark:text-white">WhatsApp Messaging</h3>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                This is a global master switch. When disabled, no WhatsApp reminders or webhooks will be processed for any user.
                            </p>
                        </div>
                        <Switch
                            checked={isGlobalEnabled}
                            onCheckedChange={handleToggle}
                            disabled={isSaving}
                        />
                    </div>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-900/50">
                            {isGlobalEnabled ? (
                                <>
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400 italic">Systems are active and reminders are sending.</span>
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm font-medium text-orange-600 dark:text-orange-400 italic">reminders are currently suspended globally.</span>
                                </>
                            )}
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-3 uppercase tracking-wider">Default Messaging Provider</label>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { id: 'twilio', label: 'Twilio' },
                                    { id: 'meta', label: 'Meta (Cloud API)' },
                                    { id: 'local', label: 'Local (WhatsApp Web)' }
                                ].map((provider) => (
                                    <label 
                                        key={provider.id}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all ${
                                            subConfig.whatsapp_provider === provider.id
                                                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                                                : "border-slate-100 bg-slate-50 text-slate-500 dark:border-zinc-800 dark:bg-zinc-900"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="whatsapp_provider"
                                            value={provider.id}
                                            checked={subConfig.whatsapp_provider === provider.id}
                                            onChange={(e) => setSubConfig({ ...subConfig, whatsapp_provider: e.target.value })}
                                            className="hidden"
                                        />
                                        <span className="text-xs font-bold uppercase tracking-tight">{provider.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Service Status</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Twilio API</span>
                            <span className="flex items-center gap-1.5 font-medium text-green-500">
                                <span className="h-2 w-2 rounded-full bg-green-500" /> Operational
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Meta API</span>
                            <span className="flex items-center gap-1.5 font-medium text-green-500">
                                <span className="h-2 w-2 rounded-full bg-green-500" /> Operational
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Cron Jobs</span>
                            <span className="flex items-center gap-1.5 font-medium text-green-500">
                                <span className="h-2 w-2 rounded-full bg-green-500" /> Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Dashboard */}
            {stats && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-center items-center">
                            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 capitalize mb-1">Total Users</h3>
                            <div className="text-4xl font-black text-slate-900 dark:text-white">{stats.totalUsers}</div>
                        </div>
                        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm dark:border-indigo-900/40 dark:bg-indigo-950/20 flex flex-col justify-center items-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                            <h3 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 capitalize mb-1 relative z-10">Pro Users</h3>
                            <div className="text-4xl font-black text-indigo-700 dark:text-indigo-300 relative z-10">{stats.proUsers}</div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-center items-center">
                            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 capitalize mb-1">Free Tier Users</h3>
                            <div className="text-4xl font-black text-slate-900 dark:text-white">{stats.freeUsers}</div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 h-96">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">User Signups (Last 30 Days)</h3>
                        <ResponsiveContainer width="100%" height="85%">
                            <AreaChart data={stats.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorFree" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontWeight: 600 }}
                                />
                                <Area type="monotone" dataKey="free" name="Free Signups" stroke="#94a3b8" fillOpacity={1} fill="url(#colorFree)" strokeWidth={2} />
                                <Area type="monotone" dataKey="paid" name="Pro Access" stroke="#6366f1" fillOpacity={1} fill="url(#colorPaid)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/50 dark:border-orange-900/30 dark:bg-orange-950/20">
                <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-bold text-orange-800 dark:text-orange-300">Caution: Admin Actions</h4>
                        <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                            Disabling WhatsApp reminders is a high-impact operation. This will prevent all users from receiving their scheduled notifications until re-enabled.
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    Subscription Pricing & Feature Limits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">Pricing (Pro Tier)</h4>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Price (USD)</label>
                            <input
                                type="text"
                                className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-700 dark:text-white dark:focus:ring-indigo-400"
                                value={subConfig.pro_monthly_price_usd}
                                onChange={(e) => setSubConfig({ ...subConfig, pro_monthly_price_usd: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Monthly Price (INR)</label>
                            <input
                                type="text"
                                className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-700 dark:text-white dark:focus:ring-indigo-400"
                                value={subConfig.pro_monthly_price_inr}
                                onChange={(e) => setSubConfig({ ...subConfig, pro_monthly_price_inr: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Yearly Price (USD)</label>
                            <input
                                type="text"
                                className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-700 dark:text-white dark:focus:ring-indigo-400"
                                value={subConfig.pro_yearly_price_usd}
                                onChange={(e) => setSubConfig({ ...subConfig, pro_yearly_price_usd: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Yearly Price (INR)</label>
                            <input
                                type="text"
                                className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-700 dark:text-white dark:focus:ring-indigo-400"
                                value={subConfig.pro_yearly_price_inr}
                                onChange={(e) => setSubConfig({ ...subConfig, pro_yearly_price_inr: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200">Feature Limits (Free Tier)</h4>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Active Habits</label>
                            <input
                                type="text"
                                className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-700 dark:text-white dark:focus:ring-indigo-400"
                                value={subConfig.free_habit_limit}
                                onChange={(e) => setSubConfig({ ...subConfig, free_habit_limit: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max AI Blueprint Generations</label>
                            <input
                                type="text"
                                className="mt-1 flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:border-zinc-700 dark:text-white dark:focus:ring-indigo-400"
                                value={subConfig.free_blueprint_limit}
                                onChange={(e) => setSubConfig({ ...subConfig, free_blueprint_limit: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Active Payment Gateway</label>
                            <div className="flex items-center gap-4 bg-slate-50 dark:bg-zinc-900/50 p-2 rounded-xl border border-slate-200 dark:border-zinc-800">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gateway"
                                        value="both"
                                        checked={subConfig.active_payment_gateway === "both"}
                                        onChange={(e) => setSubConfig({ ...subConfig, active_payment_gateway: e.target.value })}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Both</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gateway"
                                        value="stripe"
                                        checked={subConfig.active_payment_gateway === "stripe"}
                                        onChange={(e) => setSubConfig({ ...subConfig, active_payment_gateway: e.target.value })}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Stripe Only</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="gateway"
                                        value="razorpay"
                                        checked={subConfig.active_payment_gateway === "razorpay"}
                                        onChange={(e) => setSubConfig({ ...subConfig, active_payment_gateway: e.target.value })}
                                        className="text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Razorpay Only</span>
                                </label>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Setting to &quot;Both&quot; lets international users pay with Stripe and Indian users with Razorpay.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-100 dark:border-zinc-800">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-indigo-500" />
                        Feature Gating (Global Access Control)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { id: 'feature_dashboard', label: 'Dashboard Tab' },
                            { id: 'feature_insights', label: 'Insights Tab' },
                            { id: 'feature_habits', label: 'Habits Tab' },
                            { id: 'feature_todos', label: 'Todos Tab' },
                            { id: 'feature_challenges', label: 'Challenges Tab' },
                            { id: 'feature_workouts', label: 'Workouts Tab' },
                        ].map((feature) => (
                            <div key={feature.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{feature.label}</span>
                                <Switch
                                    checked={subConfig[feature.id] === 'true'}
                                    onCheckedChange={(checked) => setSubConfig({ ...subConfig, [feature.id]: String(checked) })}
                                />
                            </div>
                        ))}
                    </div>
                    <p className="mt-4 text-xs text-slate-500 italic">Disabling a feature will hide it from the sidebar and navigation for ALL users.</p>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button onClick={handleConfigSave} disabled={isSavingConfig}>
                        {isSavingConfig ? "Saving..." : "Save Configuration"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
