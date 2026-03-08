export type GoalDomain =
    | "gym"
    | "health"
    | "income"
    | "career"
    | "project"
    | "business"
    | "learning"
    | "productivity"
    | "mindset"
    | "relationships"
    | "networking"
    | "life"
    | "unknown";

export function classifyGoal(goal: string): { domain: GoalDomain; confidence: number } {
    const g = goal.toLowerCase();

    if (/weight|fat|gym|fitness|muscle|diet|workout|belly|abs/.test(g)) {
        return { domain: "gym", confidence: 0.9 };
    }
    if (/sleep|nutrition|diet|mental health/.test(g)) {
        return { domain: "health", confidence: 0.8 };
    }

    if (/earn|money|income|rich|million|lakh|passive income|side hustle|financial/.test(g)) {
        return { domain: "income", confidence: 0.85 };
    }

    if (/job|career|interview|promotion|resume|linkedin|switch job|company/.test(g)) {
        return { domain: "career", confidence: 0.85 };
    }

    if (/build|app|website|startup|product|saas|platform|project/.test(g)) {
        return { domain: "project", confidence: 0.85 };
    }

    if (/startup|business|company/.test(g)) {
        return { domain: "business", confidence: 0.85 };
    }

    if (/learn|study|course|skill/.test(g)) {
        return { domain: "learning", confidence: 0.8 };
    }

    if (/focus|discipline|habit|productivity/.test(g)) {
        return { domain: "productivity", confidence: 0.8 };
    }

    if (/confidence|mindset|motivation/.test(g)) {
        return { domain: "mindset", confidence: 0.8 };
    }

    if (/relationship|friends|dating|family/.test(g)) {
        return { domain: "relationships", confidence: 0.8 };
    }

    if (/network|meet|connect|outreach|social|community/.test(g)) {
        return { domain: "networking", confidence: 0.85 };
    }

    if (/life|360|holistic|everything|transformation|future|architect/.test(g)) {
        return { domain: "life", confidence: 0.8 };
    }

    return { domain: "unknown", confidence: 0.3 };
}