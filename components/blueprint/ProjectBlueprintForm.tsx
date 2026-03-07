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
import { Loader2, Code } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
    projectDescription: z.string().min(20, "Please describe the project in at least 20 characters."),
    techStack: z.string().min(2, "List your preferred stack or 'Any'"),
    experience: z.enum(["Beginner", "Intermediate", "Advanced"]),
    hoursPerDay: z.coerce.number().min(1, "Must commit at least 1 hour").max(16),
})

type FormValues = z.infer<typeof formSchema>

export function ProjectBlueprintForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [planData, setPlanData] = useState<any>(null)
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            projectDescription: "",
            techStack: "",
            experience: "Intermediate",
            hoursPerDay: 4,
        },
    })

    async function onSubmit(values: FormValues) {
        setIsLoading(true)
        try {
            const payload = {
                userGoal: values.projectDescription,
                context: {
                    techStack: values.techStack,
                    experience: values.experience,
                    hoursPerDay: values.hoursPerDay
                }
            };

            const response = await fetch("/api/agents/project", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            if (data.success && data.projectId) {
                router.push(`/blueprint/project/${data.projectId}`)
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
                    <Code className="text-violet-500 w-6 h-6" />
                    Project Architect AI
                </h2>
                <p className="text-muted-foreground">Transform your app idea into a structured technical roadmap with daily coding deliverables.</p>
            </div>

            {!planData ? (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="projectDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>App/Project Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g. A SaaS app for dog walkers to manage schedules, track payments, and send photos to owners."
                                            className="min-h-[120px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>The more detailed your description, the more granular the resulting daily tasks will be.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="techStack"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Preferred Tech Stack</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Next.js, Tailwind, Prisma, PostgreSQL" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="experience"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Experience Level</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Beginner">Beginner</SelectItem>
                                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                <SelectItem value="Advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="hoursPerDay"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Hours Available Per Day</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>


                        <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white" disabled={isLoading}>
                            {isLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Architecting Project...</>
                            ) : (
                                "Generate Project Roadmap"
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
