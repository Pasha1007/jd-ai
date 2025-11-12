export const SENIORITY_LEVELS = ['junior', 'mid', 'senior', 'lead', 'unknown'] as const;
export const CURRENCIES = ['USD', 'EUR', 'PLN', 'GBP'] as const;

export type Seniority = typeof SENIORITY_LEVELS[number];
export type Currency = typeof CURRENCIES[number];

export interface SkillMatrix {
  title: string;
  seniority: Seniority;
  skills: {
    frontend: string[];
    backend: string[];
    devops: string[];
    web3: string[];
    other: string[];
  };
  mustHave: string[];
  niceToHave: string[];
  salary?: {
    currency: Currency;
    min?: number;
    max?: number;
  };
  summary: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}