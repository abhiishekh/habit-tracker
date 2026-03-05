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
import { WorkoutPlanView } from "./WorkoutPlanView"
import { Label } from "@/components/ui/label"
import ReactMarkdown from "react-markdown"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const formSchema = z.object({
    goal: z.string().min(10, "Tell us a bit more about what you want to achieve."),
    currentSituation: z.string().min(10, "Understanding your current state is key."),
    timeline: z.coerce.number().min(1, "Timeline must be at least 1 day").max(365),
    height: z.coerce.number().min(50).max(250),
    weight: z.coerce.number().min(20).max(300),
    experience: z.enum(["Beginner", "Intermediate", "Advanced"]),
})

type FormValues = z.infer<typeof formSchema>

export function BlueprintForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [planData, setPlanData] = useState<any>(null)
    const [refinement, setRefinement] = useState("")

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            goal: "",
            currentSituation: "",
            timeline: 90,
            height: 170,
            weight: 70,
            experience: "Beginner",
        },
    })

    async function onSubmit(values: FormValues | any, isRefining = false) {
        setIsLoading(true)
        try {
            const payload = isRefining
                ? { ...form.getValues(), refinement }
                : values;

            const response = await fetch("/api/generate-plan", {
                method: "POST",
                body: JSON.stringify(payload),
            })
            const data = await response.json()
            if (data.success) {
                setPlanData(data.plan)
            }
        } catch (error) {
            console.error("Agent failed:", error)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleFinalize() {
        if (!planData || planData.success === true) return;
        setIsLoading(true)
        try {
            const response = await fetch("/api/finalize-plan", {
                method: "POST",
                body: JSON.stringify({
                    content: planData.message,
                    goal: form.getValues().goal
                })
            });
            const data = await response.json();
            if (data.success) {
                setPlanData({
                    ...planData,
                    success: true,
                    planId: data.planId
                });
            }
        } catch (error) {
            console.error("Finalization failed:", error);
        } finally {
            setIsLoading(false)
        }
    }



    return (
        <div className="max-w-2xl mx-auto p-6 bg-card rounded-xl border shadow-sm">
            <div className="mb-8 space-y-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="text-indigo-500 w-6 h-6 fill-indigo-500/20" />
                    Senior Gym Trainer AI
                </h2>
                <p className="text-muted-foreground">Expert 7-day programming based on your physiology and experience. Our coach will build your specialized routine.</p>
            </div>


            {!planData ? (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((v) => onSubmit(v))} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="height"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Height (cm)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="weight"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Weight (kg)</FormLabel>
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
                                            placeholder="e.g. I haven't exercised in 2 years, I have a desk job."
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Architecting Plan...</>
                            ) : (
                                "Generate My Expert Plan"
                            )}
                        </Button>
                    </form>
                </Form>
            ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {planData.success === false && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-lg text-sm space-y-3">
                            <div className="flex items-start gap-2">
                                <span className="font-bold block mt-0.5 whitespace-nowrap">Coach Note:</span>
                                <div className="prose prose-sm dark:prose-invert max-w-none text-yellow-600">
                                    <ReactMarkdown>{planData.message || "I couldn't quite finalize the full database plan yet. Here's my analysis below. You can try to regenerate or provide more specific feedback."}</ReactMarkdown>
                                </div>
                            </div>
                            <Button
                                onClick={handleFinalize}
                                size="sm"
                                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white border-0"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                Save & Finalize Plan to Database
                            </Button>
                        </div>
                    )}


                    <div className="p-6 bg-primary/5 rounded-xl border-2 border-primary/20 space-y-4">
                        <div className="flex items-center gap-2 text-primary font-semibold">
                            <Sparkles className="w-5 h-5" />
                            AI Coach Justification
                        </div>
                        <div className="space-y-4 text-sm leading-relaxed">
                            <div>
                                <span className="font-bold block text-foreground">What you want:</span>
                                <div className="text-muted-foreground">
                                    <ReactMarkdown>{planData.justifications?.userWant || "No summary available"}</ReactMarkdown>
                                </div>
                            </div>
                            <div>
                                <span className="font-bold block text-foreground">What we understand:</span>
                                <div className="text-muted-foreground">
                                    <ReactMarkdown>{planData.justifications?.ourUnderstanding || "No summary available"}</ReactMarkdown>
                                </div>
                            </div>
                            <div>
                                <span className="font-bold block text-foreground">What and why we are giving:</span>
                                <div className="text-muted-foreground">
                                    <ReactMarkdown>{planData.justifications?.whatWhyGiving || "No summary available"}</ReactMarkdown>
                                </div>
                            </div>
                            <div>
                                <span className="font-bold block text-foreground">Why it's best for your goal:</span>
                                <div className="text-muted-foreground">
                                    <ReactMarkdown>{planData.justifications?.whyBestForGoal || "No summary available"}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>

                    {planData.success && <WorkoutPlanView planId={planData.planId} />}


                    <div className="pt-8 border-t space-y-4">
                        <Label>Want to change something?</Label>
                        <Textarea
                            placeholder="e.g. Replace Bench Press with Push-ups, or make it more intense."
                            value={refinement}
                            onChange={(e) => setRefinement(e.target.value)}
                        />
                        <Button
                            className="w-full"
                            variant="secondary"
                            disabled={isLoading || !refinement}
                            onClick={() => onSubmit({}, true)}
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Regenerate Plan"}
                        </Button>
                    </div>
                </div>
            )}

        </div>
    )
}