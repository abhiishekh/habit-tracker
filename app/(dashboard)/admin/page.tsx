"use client"

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Shield, Smartphone, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { UflLoaderInline } from '@/components/ui/ufl-loader'
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { getGlobalWhatsappStatus, toggleGlobalWhatsapp } from '@/app/action'
import { toast } from "sonner"

const AdminDashboard = () => {
    const { data: session, status } = useSession()
    const [isGlobalEnabled, setIsGlobalEnabled] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

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
                const status = await getGlobalWhatsappStatus()
                setIsGlobalEnabled(status)
            } catch (error) {
                toast.error("Failed to fetch system status")
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
            setIsSaving(false)
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

                    <div className="mt-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-900/50">
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
        </div>
    )
}

export default AdminDashboard
