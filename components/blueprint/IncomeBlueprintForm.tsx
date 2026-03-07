"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Wallet } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"

const formSchema = z.object({
    goal: z.string().min(10, "Tell us more about your income goal."),
    profession: z.string().min(2, "Profession is required."),
    skills: z.string().min(2, "List at least one skill."),
    currentIncome: z.coerce.number().min(0),
})

type FormValues = z.infer<typeof formSchema>

export function IncomeBlueprintForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [planData, setPlanData] = useState<any>(null)
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            goal: "",
            profession: "",
            skills: "",
            currentIncome: 0,
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        try {
            const payload = {
                userGoal: values.goal,
                context: {
                    profession: values.profession,
                    skills: values.skills.split(',').map(s => s.trim()),
                    currentIncome: values.currentIncome
                }
            };

            const response = await fetch("/api/agents/income", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            if (data.success && data.planId) {
                router.push(`/blueprint/income/${data.planId}`)
            } else {
                console.error("Failed to generate:", data);
                setPlanData(data)
            }
        } catch (error) {
            console.error("Agent failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-card rounded-xl border shadow-sm">
            <div className="mb-8 space-y-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Wallet className="text-emerald-500 w-6 h-6" />
                    Financial Strategist AI
                </h2>
                <p className="text-muted-foreground">Expert 30-day income generation programming based on your skills and profession.</p>
            </div>

            {!planData ? (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="profession"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Profession / Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Software Engineer" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="currentIncome"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Monthly Income</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="skills"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Core Skills (comma separated)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. React, Node.js, Writing" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="goal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>What is your specific income goal?</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g. Make an extra $2,000 this month through freelance web development."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>Be as specific as possible about timelines and targets.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
                            {isLoading ? (
                                <><UflLoaderInline style="flip" compact={true} className="mr-2" /> Architecting Plan...</>
                            ) : (
                                "Generate My Income Plan"
                            )}
                        </Button>
                    </form>
                </Form>
            ) : (
                // planData only set on error (success redirects away)
                <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-xl text-center space-y-4">
                    <p className="text-destructive font-semibold">Something went wrong generating your plan.</p>
                    <pre className="text-left text-xs overflow-auto max-h-64 p-4 bg-muted rounded-md border">
                        {JSON.stringify(planData, null, 2)}
                    </pre>
                    <button
                        onClick={() => setPlanData(null)}
                        className="text-sm underline text-muted-foreground hover:text-foreground"
                    >
                        Try again
                    </button>
                </div>
            )}
        </div>
    )
}
