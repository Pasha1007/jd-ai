import { SkillMatrix } from "../schemas/skillMatrix.schema";
import { fallbackParser } from "../parsers/fallback";
import { geminiParser } from "../parsers/gemini";

export async function extractSkillMatrix(
  jd: string,
  useAI: boolean,
  apiKey?: string
): Promise<SkillMatrix> {
  if (!useAI || !apiKey) {
    return fallbackParser(jd);
  }

  try {
    return await geminiParser(jd, apiKey);
  } catch (error) {
    console.error("AI parsing failed, using fallback:", error);
    return fallbackParser(jd);
  }
}
