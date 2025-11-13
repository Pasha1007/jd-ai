import { z } from "zod";

export const SENIORITY_LEVELS = [
  "junior",
  "mid",
  "senior",
  "lead",
  "unknown",
] as const;
export const CURRENCIES = ["USD", "EUR", "PLN", "GBP"] as const;

const salarySchema = z
  .object({
    currency: z.enum(CURRENCIES),
    min: z.number().positive().optional(),
    max: z.number().positive().optional(),
  })
  .optional();

const skillsSchema = z.object({
  frontend: z.array(z.string()),
  backend: z.array(z.string()),
  devops: z.array(z.string()),
  web3: z.array(z.string()),
  other: z.array(z.string()),
});

export const skillMatrixSchema = z.object({
  title: z.string().min(1, "Title cannot be empty"),
  seniority: z.enum(SENIORITY_LEVELS),
  skills: skillsSchema,
  mustHave: z.array(z.string()),
  niceToHave: z.array(z.string()),
  salary: salarySchema,
  summary: z.string().min(1, "Summary cannot be empty"),
});

export const analyzeRequestSchema = z.object({
  jd: z.string().min(10, "Job description must be at least 10 characters long"),
  useAI: z.boolean(),
});

export type SkillMatrix = z.infer<typeof skillMatrixSchema>;
export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type Seniority = (typeof SENIORITY_LEVELS)[number];
export type Currency = (typeof CURRENCIES)[number];
