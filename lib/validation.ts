import { SENIORITY_LEVELS, CURRENCIES, SkillMatrix, ValidationResult } from '../types';

export function validateSkillMatrix(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data.title || typeof data.title !== 'string') {
    errors.push('Title must be a non-empty string');
  }

  if (!SENIORITY_LEVELS.includes(data.seniority)) {
    errors.push(`Seniority must be one of: ${SENIORITY_LEVELS.join(', ')}`);
  }

  if (!data.skills || typeof data.skills !== 'object') {
    errors.push('Skills must be an object');
  } else {
    ['frontend', 'backend', 'devops', 'web3', 'other'].forEach(key => {
      if (!Array.isArray(data.skills[key])) {
        errors.push(`skills.${key} must be an array`);
      }
    });
  }

  if (!Array.isArray(data.mustHave)) {
    errors.push('mustHave must be an array');
  }

  if (!Array.isArray(data.niceToHave)) {
    errors.push('niceToHave must be an array');
  }

  if (data.salary !== undefined) {
    if (typeof data.salary !== 'object' || data.salary === null) {
      errors.push('salary must be an object');
    } else {
      if (!CURRENCIES.includes(data.salary.currency)) {
        errors.push(`salary.currency must be one of: ${CURRENCIES.join(', ')}`);
      }
      if (data.salary.min !== undefined && typeof data.salary.min !== 'number') {
        errors.push('salary.min must be a number');
      }
      if (data.salary.max !== undefined && typeof data.salary.max !== 'number') {
        errors.push('salary.max must be a number');
      }
    }
  }

  if (!data.summary || typeof data.summary !== 'string') {
    errors.push('Summary must be a non-empty string');
  }

  return { valid: errors.length === 0, errors };
}