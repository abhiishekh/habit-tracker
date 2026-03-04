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
import { Loader2, Sparkles } from "lucide-react"

const formSchema = z.object({
    goal: z.string().min(10, "Tell us a bit more about what you want to achieve."),
    currentSituation: z.string().min(10, "Understanding your current state is key."),
    timeline: z.coerce.number().min(1, "Timeline must be at least 1 day").max(365),
})

type FormValues = z.infer<typeof formSchema>

export function BlueprintForm() {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            goal: "",
            currentSituation: "",
            timeline: 90,
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        try {
            // This calls your /api/generate-plan route
            const response = await fetch("/api/generate-plan", {
                method: "POST",
                body: JSON.stringify(values),
            })
            const data = await response.json()
            console.log("Agent Response:", data)
            // Redirect to dashboard or show success
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
                    <Sparkles className="text-yellow-500 w-6 h-6" />
                    AI Life Architect
                </h2>
                <p className="text-muted-foreground">Define your 90-day blueprint. Our agents will handle the expert planning.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="goal"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>What is your ultimate goal?</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="e.g. Lose 10kg belly fat, gain muscle, and run a 5k."
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>Be as specific as possible.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="currentSituation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>What is your current situation?</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="e.g. I haven't exercised in 2 years, I have a desk job, and my diet is high-carb."
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>Mention injuries, equipment access, or habits.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="timeline"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Timeline (Days)</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormDescription>Standard challenges are 90 days.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Architecting Plan...</>
                        ) : (
                            "Generate My 90-Day Blueprint"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    )
}