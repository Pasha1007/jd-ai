import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "error";
}

export function Toast({ message, type }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 animate-in slide-in-from-bottom-5">
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
          type === "success"
            ? "bg-green-600 text-white"
            : "bg-red-600 text-white"
        }`}
      >
        {type === "success" ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}
