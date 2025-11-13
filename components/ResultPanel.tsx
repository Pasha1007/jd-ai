import React from "react";
import { Copy, AlertCircle } from "lucide-react";
import { SkillMatrix } from "@/lib/schemas/skillMatrix.schema";

interface ResultPanelProps {
  result: SkillMatrix | null;
  onCopyJSON: () => void;
}

export function ResultPanel({ result, onCopyJSON }: ResultPanelProps) {
  if (!result) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <label className="block text-sm font-semibold text-slate-700 mb-4">
          Result
        </label>
        <div className="h-96 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Paste a job description and click Analyze</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <label className="block text-sm font-semibold text-slate-700">
          Result
        </label>
        <button
          onClick={onCopyJSON}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <Copy className="w-4 h-4" />
          Copy JSON
        </button>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Summary</h3>
          <p className="text-sm text-blue-800">{result.summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="text-xs text-slate-600 mb-1">Seniority</div>
            <div className="text-sm font-semibold text-slate-900 capitalize">
              {result.seniority}
            </div>
          </div>
          {result.salary && (
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="text-xs text-slate-600 mb-1">Salary</div>
              <div className="text-sm font-semibold text-slate-900">
                {result.salary.currency} {result.salary.min?.toLocaleString()}-
                {result.salary.max?.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          {Object.entries(result.skills).map(
            ([category, items]) =>
              items.length > 0 && (
                <div key={category} className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs font-semibold text-slate-600 mb-2 capitalize">
                    {category}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {items.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>

        <div>
          <h3 className="text-xs font-semibold text-slate-600 mb-2">
            Full JSON
          </h3>
          <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs overflow-x-auto max-h-64 overflow-y-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
