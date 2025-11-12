import { SkillMatrix } from '../../types';
import { validateSkillMatrix } from '../validation';

const GEMINI_PROMPT_TEMPLATE = (jd: string) => `You are a job description parser. Extract structured information from the following job description and return ONLY a valid JSON object with NO additional text, markdown formatting, or code blocks.

Required JSON schema:
{
  "title": "string - job title",
  "seniority": "junior" | "mid" | "senior" | "lead" | "unknown",
  "skills": {
    "frontend": ["array of frontend technologies"],
    "backend": ["array of backend technologies"],
    "devops": ["array of devops/infrastructure tools"],
    "web3": ["array of blockchain/web3 technologies like solidity, wagmi, viem, merkle, staking"],
    "other": ["array of other relevant skills"]
  },
  "mustHave": ["array of required qualifications"],
  "niceToHave": ["array of preferred/bonus qualifications"],
  "salary": {
    "currency": "USD" | "EUR" | "PLN" | "GBP",
    "min": number,
    "max": number
  }
  "summary": "string - max 60 words summarizing the role"
}

Job Description:
${jd}

Return ONLY the JSON object, nothing else:`;

const RETRY_PROMPT_TEMPLATE = (jd: string, errors: string[]) => `The previous JSON was invalid: ${errors.join(', ')}

Please fix and return ONLY a valid JSON object matching this exact schema:
{
  "title": "string",
  "seniority": "junior" | "mid" | "senior" | "lead" | "unknown",
  "skills": {
    "frontend": [],
    "backend": [],
    "devops": [],
    "web3": [],
    "other": []
  },
  "mustHave": [],
  "niceToHave": [],
  "salary": { "currency": "USD"|"EUR"|"PLN"|"GBP", "min": number, "max": number } or omit,
  "summary": "string max 60 words"
}

Original data to parse:
${jd}`;

async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return text.trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
}

export async function geminiParser(jd: string, apiKey: string): Promise<SkillMatrix> {
  try {
    const cleanText = await callGeminiAPI(GEMINI_PROMPT_TEMPLATE(jd), apiKey);
    let parsed = JSON.parse(cleanText);
    let validation = validateSkillMatrix(parsed);
    
    if (!validation.valid) {
      const retryText = await callGeminiAPI(RETRY_PROMPT_TEMPLATE(jd, validation.errors), apiKey);
      parsed = JSON.parse(retryText);
      validation = validateSkillMatrix(parsed);
    }

    if (!validation.valid) {
      throw new Error(`Schema validation failed: ${validation.errors.join(', ')}`);
    }

    return parsed;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Gemini API call failed');
  }
}