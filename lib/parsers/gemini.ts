import { SkillMatrix, skillMatrixSchema } from "../schemas/skillMatrix.schema";

const GEMINI_PROMPT_TEMPLATE = (
  jd: string
) => `You are a job description parser. Extract structured information from the following job description and return ONLY a valid JSON object with NO additional text, markdown formatting, or code blocks.

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

const RETRY_PROMPT_TEMPLATE = (
  jd: string,
  errors: string[]
) => `The previous JSON was invalid: ${errors.join(", ")}

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
  console.log("Calling Gemini API...");

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gemini API HTTP error ${response.status}:`, errorText);
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("Gemini API response received");

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!text) {
    console.error(
      "❌ No text in Gemini response:",
      JSON.stringify(data, null, 2)
    );
    throw new Error("Gemini API returned empty response");
  }

  console.log("Gemini API text extracted, length:", text.length);
  return text
    .trim()
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "");
}

export async function geminiParser(
  jd: string,
  apiKey: string
): Promise<SkillMatrix> {
  try {
    console.log("Starting Gemini parser...");
    const cleanText = await callGeminiAPI(GEMINI_PROMPT_TEMPLATE(jd), apiKey);
    console.log("Parsing JSON response...");
    let parsed = JSON.parse(cleanText);

    console.log("Validating with Zod schema...");
    let validationResult = skillMatrixSchema.safeParse(parsed);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(
        (e) => `${e.path.join(".")}: ${e.message}`
      );
      console.log("Validation failed, retrying with errors:", errors);
      const retryText = await callGeminiAPI(
        RETRY_PROMPT_TEMPLATE(jd, errors),
        apiKey
      );
      parsed = JSON.parse(retryText);
      validationResult = skillMatrixSchema.safeParse(parsed);
    }

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map(
        (e) => `${e.path.join(".")}: ${e.message}`
      );
      console.error("Final validation failed:", errors);
      throw new Error(`Schema validation failed: ${errors.join(", ")}`);
    }

    console.log("Gemini parser completed successfully!");
    return validationResult.data;
  } catch (error) {
    console.error("Gemini parser error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Gemini API call failed"
    );
  }
}
