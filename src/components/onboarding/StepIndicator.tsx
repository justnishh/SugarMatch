"use client";

import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 rounded-full flex-1 transition-all duration-300",
            i < currentStep
              ? "bg-rose-500"
              : i === currentStep
              ? "bg-rose-300"
              : "bg-rose-100"
          )}
        />
      ))}
    </div>
  );
}
