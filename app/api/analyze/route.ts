import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  analyzeRequestSchema,
  skillMatrixSchema,
} from "@/lib/schemas/skillMatrix.schema";
import { fallbackParser } from "@/lib/parsers/fallback";
import { geminiParser } from "@/lib/parsers/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = analyzeRequestSchema.parse(body);
    const { jd, useAI } = validatedData;

    let result;
    let actualMethod: "ai" | "fallback" = "fallback";

    if (useAI) {
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return NextResponse.json(
          { error: "Gemini API key is not configured on the server" },
          { status: 500 }
        );
      }

      try {
        console.log("Attempting AI parsing with Gemini");
        result = await geminiParser(jd, apiKey);
        actualMethod = "ai";
        console.log("AI parsing successful!");
      } catch (error) {
        console.error(
          "Gemini parsing failed, falling back to basic parser:",
          error
        );
        result = fallbackParser(jd);
        actualMethod = "fallback";
      }
    } else {
      console.log("Using fallback parser (AI disabled)");
      result = fallbackParser(jd);
    }

    const validatedResult = skillMatrixSchema.parse(result);

    return NextResponse.json({
      success: true,
      data: validatedResult,
      method: actualMethod,
    });
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.issues.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
