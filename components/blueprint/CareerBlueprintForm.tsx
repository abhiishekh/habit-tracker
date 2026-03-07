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
import { BriefcaseBusiness } from "lucide-react"
import { UflLoaderInline } from "@/components/ui/ufl-loader"

const formSchema = z.object({
    goal: z.string().min(10, "Describe your career goal briefly."),
    currentRole: z.string().min(2, "Current role is required."),
    targetRole: z.string().min(2, "Target role is required."),
    targetCompany: z.string().optional(),
    currentSkills: z.string().min(2, "List some skills."),
    yearsOfExperience: z.coerce.number().min(0),
    hoursPerWeek: z.coerce.number().min(1).max(100),
})

type FormValues = z.infer<typeof formSchema>

export function CareerBlueprintForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [planData, setPlanData] = useState<any>(null)
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            goal: "",
            currentRole: "",
            targetRole: "",
            targetCompany: "",
            currentSkills: "",
            yearsOfExperience: 0,
            hoursPerWeek: 10,
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        try {
            const payload = {
                userGoal: values.goal,
                context: {
                    currentRole: values.currentRole,
                    targetRole: values.targetRole,
                    targetCompany: values.targetCompany,
                    currentSkills: values.currentSkills.split(',').map(s => s.trim()),
                    yearsOfExperience: values.yearsOfExperience,
                    hoursPerWeek: values.hoursPerWeek
                }
            };

            const response = await fetch("/api/agents/career", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            if (data.success && data.planId) {
                router.push(`/blueprint/career/${data.planId}`)
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
        <div className="max-w-3xl mx-auto p-6 bg-card rounded-xl border shadow-sm">
            <div className="mb-8 space-y-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <BriefcaseBusiness className="text-amber-500 w-6 h-6" />
                    Career Mentor AI
                </h2>
                <p className="text-muted-foreground">Architect a step-by-step roadmap to transition from your current position to your dream role.</p>
            </div>

            {!planData ? (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="currentRole"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Role</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Graphic Designer" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="targetRole"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Target Role</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. UI/UX Product Designer" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="targetCompany"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dream Company (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Google, Stripe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="yearsOfExperience"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Years Exp.</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hoursPerWeek"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hours/Week to Commit</FormLabel>
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
                            name="currentSkills"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Hard & Soft Skills</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Adobe Suite, Figma basics, Sketch, Communication" {...field} />
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
                                    <FormLabel>What is your specific career goal?</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g. I want to transition from print design to digital product design and land a junior role at a fintech startup within 6 months."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={isLoading}>
                            {isLoading ? (
                                <><UflLoaderInline style="flip" compact={true} className="mr-2" /> Analyzing Job Market & Mapping Plan...</>
                            ) : (
                                "Generate Career Roadmap"
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
            )
            }
        </div >
    )
}
