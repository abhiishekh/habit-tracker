// lib/agents/career/tools.ts

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// ── Tool 1: Job Market Researcher ─────────────────────────────────────────────
export const researchJobMarketTool = new DynamicStructuredTool({
  name: "research_job_market",
  description: "Researches the job market for a target role — required skills, salary range, top companies, and certifications needed.",
  schema: z.object({
    currentRole: z.string().describe("User's current job title e.g., 'Junior Frontend Developer'"),
    targetRole: z.string().describe("Desired job title e.g., 'Senior Full Stack Engineer'"),
    targetCompany: z.string().optional().describe("Specific company if user has one in mind"),
    currentSkills: z.array(z.string()).describe("Skills the user already has"),
    yearsOfExperience: z.number().describe("Years of total work experience"),
  }),
  func: async ({ currentRole, targetRole, targetCompany, currentSkills, yearsOfExperience }) => {
    // In production: call Serper/Tavily web search API here for live job market data
    // For now returns structured analysis the AI can reason over

    const analysis = {
      targetRole,
      marketDemand: "High",
      averageSalaryRange: {
        india: "₹12L - ₹35L per annum",
        remote: "$40k - $90k per annum"
      },
      topHiringPlatforms: [
        "LinkedIn",
        "Naukri.com",
        "Wellfound (AngelList)",
        "Instahyre",
        "Cutshort"
      ],
      mustHaveSkills: [
        "Based on target role — AI will fill from its knowledge",
        targetRole.toLowerCase().includes("full stack") ? "Node.js, React, PostgreSQL, Docker" : "",
        targetRole.toLowerCase().includes("data") ? "Python, SQL, Pandas, ML basics" : "",
        targetRole.toLowerCase().includes("devops") ? "AWS/GCP, Kubernetes, CI/CD, Terraform" : "",
      ].filter(Boolean),
      skillGaps: currentSkills.length > 0
        ? `Based on your current skills (${currentSkills.join(", ")}), focus on filling gaps for ${targetRole}`
        : `Research required skills for ${targetRole} and compare with your profile`,
      certifications: [
        targetRole.toLowerCase().includes("cloud") ? "AWS Solutions Architect / GCP Associate" : null,
        targetRole.toLowerCase().includes("data") ? "Google Data Analytics / IBM Data Science" : null,
        targetRole.toLowerCase().includes("product") ? "AIPMM CPM / Google PM Certificate" : null,
        "LinkedIn Learning paths for " + targetRole
      ].filter(Boolean),
      targetCompanyInsights: targetCompany
        ? {
            company: targetCompany,
            hiringProcess: "Research on LinkedIn + Glassdoor reviews",
            tipToGetIn: `Follow ${targetCompany} employees on LinkedIn, engage with their posts, apply via referral`,
            glassdoorRating: "Check glassdoor.com for current reviews"
          }
        : null,
      estimatedTimeToSwitch:
        yearsOfExperience < 2 ? "4-6 months" :
        yearsOfExperience < 5 ? "2-4 months" : "6-10 weeks",
      networkingStrategy: {
        linkedin: `Search '${targetRole}' on LinkedIn, connect with 5 people per day with personalized notes`,
        communities: ["Slack groups", "Discord servers", "Meetup.com events for " + targetRole],
        coldOutreach: `Message hiring managers at target companies with a 3-line value pitch`
      }
    };

    return JSON.stringify(analysis);
  }
});

// dummy researchjob
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


// ── Tool 2: Save Career Plan ───────────────────────────────────────────────────
export const saveCareerPlanTool = (userId: string) => new DynamicStructuredTool({
  name: "save_career_plan",
  description: "Saves a complete career switch roadmap with weekly milestones and actionable tasks.",
  schema: z.object({
    currentRole: z.string(),
    targetRole: z.string(),
    targetCompany: z.string().optional(),
    strategy: z.string().describe("Overall career switch strategy summary in 2-3 sentences"),
    timelineWeeks: z.number().describe("Total weeks to achieve the career switch"),
    resumeTips: z.array(z.string()).describe("3-5 specific resume improvement tips"),
    linkedinTips: z.array(z.string()).describe("3-5 specific LinkedIn profile tips"),
    milestones: z.array(z.object({
      weekNumber: z.number(),
      title: z.string().describe("e.g., 'Gap Analysis & Resume Audit'"),
      description: z.string().describe("What this week focuses on and why"),
      tasks: z.array(z.string()).describe("3-6 specific daily/weekly tasks"),
      successMetric: z.string().describe("How to know this milestone is done e.g., '5 applications sent'"),
      resources: z.array(z.string()).describe("Specific links, platforms, or tools to use this week")
    }))
  }),
  func: async ({
    currentRole,
    targetRole,
    targetCompany,
    strategy,
    timelineWeeks,
    resumeTips,
    linkedinTips,
    milestones
  }) => {
    try {
      const plan = await prisma.careerPlan.create({
        data: {
          userId,
          currentRole,
          targetRole,
          targetCompany: targetCompany || "",
          strategy,
          timelineWeeks,
          startDate: new Date(),
          endDate: new Date(Date.now() + timelineWeeks * 7 * 24 * 60 * 60 * 1000),
          milestones: {
            create: milestones.map(m => ({
              weekNumber: m.weekNumber,
              title: m.title,
              description: m.description,
              // Store tasks + resources + successMetric as JSON string array
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
        targetRole,
        timelineWeeks,
        totalMilestones: milestones.length,
        strategy,
        resumeTips,
        linkedinTips,
        message: `Career roadmap created! ${timelineWeeks}-week plan to become a ${targetRole}.`
      });

    } catch (error) {
      console.error("Career Plan Save Error:", error);
      return JSON.stringify({
        success: false,
        error: String(error),
        message: "Failed to save career plan. Please try again."
      });
    }
  }
});