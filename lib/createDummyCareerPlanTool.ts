import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const createDummyCareerPlanTool = (userId: string) =>
  new DynamicStructuredTool({
    name: "create_dummy_career_plan",
    description: "Creates a dummy career roadmap and saves it to database",
    schema: z.object({
      currentRole: z.string(),
      targetRole: z.string(),
      targetCompany: z.string().optional()
    }),

    func: async ({ currentRole, targetRole, targetCompany }) => {
      try {

        const timelineWeeks = 6;

        const milestones = [
          {
            weekNumber: 1,
            title: "Skill Gap Analysis",
            description: "Identify missing skills for the target role",
            tasks: [
              "Research job descriptions",
              "List required skills",
              "Compare with current skills"
            ],
            successMetric: "List of skill gaps created",
            resources: ["LinkedIn Jobs", "Naukri.com"]
          },
          {
            weekNumber: 2,
            title: "Learning Core Skills",
            description: "Start learning the most important technologies",
            tasks: [
              "Complete 1 online course",
              "Build small practice project"
            ],
            successMetric: "1 project completed",
            resources: ["YouTube", "Udemy"]
          },
          {
            weekNumber: 3,
            title: "Build Portfolio",
            description: "Create projects that demonstrate your skills",
            tasks: [
              "Build portfolio project",
              "Push code to GitHub"
            ],
            successMetric: "Project deployed",
            resources: ["GitHub", "Vercel"]
          },
          {
            weekNumber: 4,
            title: "Resume Improvement",
            description: "Optimize resume for target role",
            tasks: [
              "Update resume",
              "Highlight projects",
              "Add measurable achievements"
            ],
            successMetric: "Resume ready",
            resources: ["Canva Resume Builder"]
          },
          {
            weekNumber: 5,
            title: "Networking",
            description: "Connect with professionals in the field",
            tasks: [
              "Send 20 LinkedIn connections",
              "Join community groups"
            ],
            successMetric: "10 connections accepted",
            resources: ["LinkedIn", "Discord"]
          },
          {
            weekNumber: 6,
            title: "Job Applications",
            description: "Start applying for jobs",
            tasks: [
              "Apply to 20 jobs",
              "Prepare for interviews"
            ],
            successMetric: "At least 3 interview calls",
            resources: ["LinkedIn Jobs", "Wellfound"]
          }
        ];

        const plan = await prisma.careerPlan.create({
          data: {
            userId,
            currentRole,
            targetRole,
            targetCompany: targetCompany || "",
            strategy: `Switch from ${currentRole} to ${targetRole} in ${timelineWeeks} weeks.`,
            timelineWeeks,
            startDate: new Date(),
            endDate: new Date(Date.now() + timelineWeeks * 7 * 24 * 60 * 60 * 1000),

            milestones: {
              create: milestones.map(m => ({
                weekNumber: m.weekNumber,
                title: m.title,
                description: m.description,
                tasks: [
                  ...m.tasks,
                  `SUCCESS_METRIC: ${m.successMetric}`,
                  ...m.resources.map(r => `RESOURCE: ${r}`)
                ],
                isCompleted: false
              }))
            }
          }
        });

        return JSON.stringify({
          success: true,
          planId: plan.id,
          message: "Dummy career roadmap created successfully"
        });

      } catch (error) {
        console.error(error);

        return JSON.stringify({
          success: false,
          message: "Failed to create career plan"
        });
      }
    }
  });