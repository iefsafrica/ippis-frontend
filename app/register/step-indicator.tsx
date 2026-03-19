"use client"

import { CheckCircle2 } from "lucide-react"

interface StepIndicatorProps {
  currentStep: number
  maxVisitedStep: number
  onStepSelect?: (step: number) => void
}

export function StepIndicator({
  currentStep,
  maxVisitedStep,
  onStepSelect,
}: StepIndicatorProps) {
  const steps = [
    { number: 1, title: "Verification" },
    { number: 2, title: "Personal Information" },
    { number: 3, title: "Employment Information" },
    { number: 4, title: "Review & Submit" },
  ]

  const handleStepClick = (stepNumber: number) => {
    if (!onStepSelect) return
    onStepSelect(stepNumber)
  }

  return (
    <div className="w-full py-4">
      <div className="flex justify-between items-center">
        {steps.map((step) => {
          const isActive = currentStep === step.number
          const isComplete = currentStep > step.number
          const isClickable =
            step.number <= Math.max(currentStep, maxVisitedStep) &&
            typeof onStepSelect === "function"

          const circleClasses = isActive || isComplete
            ? "bg-green-600 shadow-[0_10px_20px_rgba(16,185,129,0.35)] border border-green-700 text-white"
            : "border border-gray-300 bg-white text-gray-400"

          return (
            <button
              type="button"
              key={step.number}
              className={`flex flex-col items-center gap-1 transition-colors duration-200 focus:outline-none ${
                isClickable ? "cursor-pointer" : "cursor-default opacity-80"
              }`}
              onClick={() => isClickable && handleStepClick(step.number)}
              aria-current={isActive ? "step" : undefined}
              disabled={!isClickable}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold ${circleClasses}`}
              >
                {isComplete ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </span>
              <span
                className={`text-xs transition-colors duration-200 ${
                  isActive || isComplete ? "text-green-700 font-medium" : "text-gray-500"
                }`}
              >
                {step.title}
              </span>
            </button>
          )
        })}
      </div>
      <div className="relative mt-4 h-0.5 bg-gray-200">
        <div
          className="absolute left-0 top-0 h-0.5 bg-green-700 transition-all duration-300"
          style={{
            width: `${((Math.min(currentStep, steps.length) - 1) / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>
    </div>
  )
}
