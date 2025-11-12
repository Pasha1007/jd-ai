import React from 'react';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface InputPanelProps {
  jd: string;
  onJdChange: (value: string) => void;
  useAI: boolean;
  onUseAIToggle: () => void;
  onAnalyze: () => void;
  loading: boolean;
  error: string | null;
}

export function InputPanel({
  jd,
  onJdChange,
  useAI,
  onUseAIToggle,
  onAnalyze,
  loading,
  error
}: InputPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        Job Description
      </label>
      <textarea
        value={jd}
        onChange={(e) => onJdChange(e.target.value)}
        placeholder="Paste the full job description here..."
        className="w-full h-80 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-slate-700 text-sm"
      />
      
      <div className="mt-4 flex items-center justify-between p-3 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-medium text-slate-700">
            Use AI (Gemini)
          </span>
        </div>
        <button
          onClick={onUseAIToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            useAI ? 'bg-purple-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              useAI ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <button
        onClick={onAnalyze}
        disabled={loading || !jd.trim()}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing...
          </>
        ) : (
          'Analyze'
        )}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
