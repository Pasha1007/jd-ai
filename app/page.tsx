"use client";

import React, { useState } from "react";
import { InputPanel } from "../components/InputPanel";
import { ResultPanel } from "../components/ResultPanel";
import { Toast } from "../components/Toast";
import { SkillMatrix } from "@/lib/schemas/skillMatrix.schema";

export default function JDSkillMatrix() {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<SkillMatrix | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useAI, setUseAI] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAnalyze = async () => {
    if (!jd.trim()) {
      setError("Please paste a job description");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jd, useAI }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze job description");
      }

      setResult(data.data);
      showToast(
        `Analysis complete! ${
          data.method === "ai" ? "(AI-powered)" : "(Fallback parser)"
        }`,
        "success"
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to analyze job description";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJSON = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      showToast("JSON copied to clipboard!", "success");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            AI JD → Skill Matrix
          </h1>
          <p className="text-slate-600">
            Paste a job description and get a structured skill analysis
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <InputPanel
            jd={jd}
            onJdChange={setJd}
            useAI={useAI}
            onUseAIToggle={() => setUseAI(!useAI)}
            onAnalyze={handleAnalyze}
            loading={loading}
            error={error}
          />
          <ResultPanel result={result} onCopyJSON={handleCopyJSON} />
        </div>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  );
}
