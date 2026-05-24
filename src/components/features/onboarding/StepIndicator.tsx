"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

const stepNames = ["Account", "Personal", "Location", "Profile", "Photos"];

export function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  const progressPercentage = (currentStep / (totalSteps - 1)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-foreground">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-xs text-muted-foreground">
          {stepNames[currentStep] || ""}
        </span>
      </div>
      <div className="relative h-1.5 bg-rose-100 rounded-full overflow-hidden">
        <motion.div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <motion.div
            key={i}
            className={cn(
              "h-1.5 rounded-full flex-1 transition-all duration-300",
              i < currentStep
                ? "bg-rose-500"
                : i === currentStep
                ? "bg-rose-300"
                : "bg-rose-100"
            )}
            animate={i === currentStep ? { scaleX: 1.2 } : { scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}
