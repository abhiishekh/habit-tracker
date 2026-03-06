// lib/agents/shared/types.ts

export type Domain = "gym" | "income" | "career" | "project" | "unknown";

export type AgentResponse = {
  success: boolean;
  domain?: Domain;
  planId?: string;
  message?: string;
  requiresContext?: boolean;
  neededFields?: string[];
  [key: string]: any;
};

export type UserContext = {
  userId: string;
  profession?: string;
  skills?: string[];
  weight?: number;
  height?: number;
  experience?: string;
  currentIncome?: number;
  hoursPerDay?: number;
};